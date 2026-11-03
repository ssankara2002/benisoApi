import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getParentIdFromUserId = async (userId: number): Promise<number> => {
  const parent = await prisma.parent.findUnique({ where: { userId } });
  if (!parent) throw new Error('Profil parent introuvable pour cet utilisateur');
  return parent.id;
};

const assertEleveOwnership = async (parentId: number, eleveId: number): Promise<void> => {
  const parent = await prisma.parent.findFirst({
    where: { id: parentId, eleves: { some: { id: eleveId } } },
  });
  if (!parent) throw new Error('Accès refusé : cet élève ne vous appartient pas');
};

// GET /mes-enfants
const getMesEnfants = async (userId: number) => {
  const parentId = await getParentIdFromUserId(userId);

  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: {
      eleves: {
        select: {
          id: true,
          matricule: true,
          statut: true,
          photo: true,
          dateNaissance: true,
          filiere: { select: { id: true, nom: true } },
          user: { select: { nom: true, prenom: true, email: true, phone: true } },
          inscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              annee: { select: { id: true, dateDebut: true, dateFin: true } },
              classe: { select: { id: true, nom: true, capacite: true } },
              niveau: { select: { id: true, nomNiveau: true, cycle: true } },
              estRedoublant: true,
              decision: true,
              moyenneGenerale: true,
            },
          },
        },
      },
    },
  });

  return parent?.eleves.map(eleve => {
    const ins = eleve.inscriptions[0] ?? null;
    return {
      ...eleve,
      classe: ins?.classe ?? null,
      annee: ins?.annee ?? null,
      niveau: ins?.niveau ?? null,
      inscriptions: undefined,
    };
  });
};

// GET /enfants/:eleveId/notes?anneeId=&classeId=&trimestreId=
const getNotesDEnfant = async (
  userId: number,
  eleveId: number,
  filters: { anneeId?: number; classeId?: number; trimestreId?: number }
) => {
  const parentId = await getParentIdFromUserId(userId);
  await assertEleveOwnership(parentId, eleveId);

  const notes = await prisma.note.findMany({
    where: {
      eleveId,
      evaluation: {
        ...(filters.anneeId ? { anneeId: filters.anneeId } : {}),
        ...(filters.classeId ? { classeId: filters.classeId } : {}),
        ...(filters.trimestreId ? { trimestreId: filters.trimestreId } : {}),
      },
    },
    include: {
      evaluation: {
        select: {
          id: true,
          type: true,
          date: true,
          bareme: true,
          trimestre: { select: { id: true, nom: true } },
          annee: { select: { id: true, dateDebut: true, dateFin: true } },
          matiere: { select: { id: true, libelle: true } },
          classe: { select: { id: true, nom: true } },
        },
      },
    },
    orderBy: { evaluation: { date: 'desc' } },
  });

  const byMatiere: Record<string, { matiere: any; notes: any[] }> = {};
  for (const note of notes) {
    const matiere = note.evaluation?.matiere;
    if (!matiere) continue;
    if (!byMatiere[matiere.id]) {
      byMatiere[matiere.id] = { matiere, notes: [] };
    }
    byMatiere[matiere.id].notes.push({
      id: note.id,
      valeur: note.valeur,
      bareme: note.evaluation?.bareme,
      type: note.evaluation?.type,
      date: note.evaluation?.date,
      trimestre: note.evaluation?.trimestre,
    });
  }

  return Object.values(byMatiere);
};

// GET /enfants/:eleveId/absences?anneeId=&classeId=
const getAbsencesDEnfant = async (
  userId: number,
  eleveId: number,
  filters: { anneeId?: number; classeId?: number }
) => {
  const parentId = await getParentIdFromUserId(userId);
  await assertEleveOwnership(parentId, eleveId);

  return await prisma.absence.findMany({
    where: {
      eleveId,
      ...(filters.classeId ? { classeId: filters.classeId } : {}),
      ...(filters.anneeId && !filters.classeId
        ? {
            classe: {
              inscriptions: { some: { eleveId, anneeId: filters.anneeId } },
            },
          }
        : {}),
    },
    include: {
      matiere: { select: { id: true, libelle: true } },
      classe: { select: { id: true, nom: true } },
    },
    orderBy: { dateDebut: 'desc' },
  });
};

// GET /enfants/:eleveId/retards?anneeId=&classeId=
const getRetardsDEnfant = async (
  userId: number,
  eleveId: number,
  filters: { anneeId?: number; classeId?: number }
) => {
  const parentId = await getParentIdFromUserId(userId);
  await assertEleveOwnership(parentId, eleveId);

  return await prisma.retard.findMany({
    where: {
      eleveId,
      ...(filters.classeId ? { classeId: filters.classeId } : {}),
      ...(filters.anneeId && !filters.classeId
        ? {
            classe: {
              inscriptions: { some: { eleveId, anneeId: filters.anneeId } },
            },
          }
        : {}),
    },
    include: {
      matiere: { select: { id: true, libelle: true } },
      classe: { select: { id: true, nom: true } },
    },
    orderBy: { date: 'desc' },
  });
};

// GET /enfants/:eleveId/evaluations?anneeId=&classeId=&trimestreId=
const getEvaluationsDEnfant = async (
  userId: number,
  eleveId: number,
  filters: { anneeId?: number; classeId?: number; trimestreId?: number }
) => {
  const parentId = await getParentIdFromUserId(userId);
  await assertEleveOwnership(parentId, eleveId);

  // Si classeId non fourni, on le résout depuis l'inscription
  let classeId = filters.classeId;
  let anneeId = filters.anneeId;

  if (!classeId) {
    const inscription = await prisma.inscription.findFirst({
      where: {
        eleveId,
        ...(anneeId ? { anneeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: { classeId: true, anneeId: true },
    });
    if (!inscription?.classeId) return [];
    classeId = inscription.classeId;
    anneeId = anneeId ?? inscription.anneeId;
  }

  return await prisma.evaluation.findMany({
    where: {
      classeId,
      ...(anneeId ? { anneeId } : {}),
      ...(filters.trimestreId ? { trimestreId: filters.trimestreId } : {}),
    },
    include: {
      matiere: { select: { id: true, libelle: true } },
      classe: { select: { id: true, nom: true } },
      trimestre: { select: { id: true, nom: true } },
      annee: { select: { id: true, dateDebut: true, dateFin: true } },
      staff: { include: { user: { select: { nom: true, prenom: true } } } },
      notes: {
        where: { eleveId },
        select: { id: true, valeur: true },
      },
    },
    orderBy: { date: 'desc' },
  });
};

// GET /enfants/:eleveId/situation?anneeId=&classeId=
const getSituationDEnfant = async (
  userId: number,
  eleveId: number,
  filters: { anneeId?: number; classeId?: number }
) => {
  const parentId = await getParentIdFromUserId(userId);
  await assertEleveOwnership(parentId, eleveId);

  return await prisma.inscription.findFirst({
    where: {
      eleveId,
      ...(filters.anneeId ? { anneeId: filters.anneeId } : {}),
      ...(filters.classeId ? { classeId: filters.classeId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      annee: { select: { id: true, dateDebut: true, dateFin: true } },
      classe: { select: { id: true, nom: true } },
      niveau: { select: { id: true, nomNiveau: true } },
    },
  });
};

// GET /enfants/:eleveId/paiements?anneeId=
const getPaiementsDEnfant = async (
  userId: number,
  eleveId: number,
  filters: { anneeId?: number }
) => {
  const parentId = await getParentIdFromUserId(userId);
  await assertEleveOwnership(parentId, eleveId);

  const inscription = await prisma.inscription.findFirst({
    where: {
      eleveId,
      ...(filters.anneeId ? { anneeId: filters.anneeId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      annee: { select: { id: true, dateDebut: true, dateFin: true } },
      classe: { select: { id: true, nom: true } },
      niveau: { select: { id: true, nomNiveau: true, scolarite: true } },
      paiements: {
        orderBy: { numeroTranche: 'asc' },
        select: {
          id: true,
          date: true,
          montant: true,
          montantAttendu: true,
          modePaiement: true,
          libelleTranche: true,
          numeroTranche: true,
          totalTranches: true,
          dateEcheance: true,
          recu: true,
        },
      },
    },
  });

  if (!inscription) {
    return null;
  }

  const scolarite = inscription.niveau?.scolarite ?? 0;
  const totalPaye = inscription.paiements.reduce((sum, p) => sum + p.montant, 0);

  const base = {
    modePaiement: inscription.modePaiement,
    annee: inscription.annee,
    classe: inscription.classe,
    niveau: inscription.niveau,
    recapitulatif: {
      scolarite,
      totalPaye,
      resteAPayer: scolarite - totalPaye,
      estSolde: totalPaye >= scolarite,
    },
  };

  if (inscription.modePaiement === 'COMPLET') {
    const p = inscription.paiements[0] ?? null;
    return {
      ...base,
      paiement: p
        ? {
            id: p.id,
            date: p.date,
            montant: p.montant,
            montantAttendu: p.montantAttendu,
            modePaiement: p.modePaiement,
            recu: p.recu,
            statut: p.montant >= (p.montantAttendu ?? scolarite) ? 'PAYE' : 'EN_ATTENTE',
          }
        : null,
    };
  }

  // TRANCHE
  const tranches = inscription.paiements.map(p => ({
    id: p.id,
    numeroTranche: p.numeroTranche,
    totalTranches: p.totalTranches,
    libelleTranche: p.libelleTranche,
    montantAttendu: p.montantAttendu,
    montantPaye: p.montant,
    modePaiement: p.modePaiement,
    dateEcheance: p.dateEcheance,
    datePaiement: p.montant > 0 ? p.date : null,
    recu: p.recu,
    statut: p.montant >= (p.montantAttendu ?? 0) ? 'PAYE' : p.montant > 0 ? 'PARTIEL' : 'EN_ATTENTE',
  }));

  return { ...base, tranches };
};

export default {
  getMesEnfants,
  getNotesDEnfant,
  getAbsencesDEnfant,
  getRetardsDEnfant,
  getEvaluationsDEnfant,
  getSituationDEnfant,
  getPaiementsDEnfant,
};
