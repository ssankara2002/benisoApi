import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardEleve = async (userId: number) => {
  // ── Résolution de l'élève depuis userId ──
  const eleve = await prisma.eleve.findUnique({
    where: { userId },
    select: {
      id: true, matricule: true, photo: true, statut: true, dateNaissance: true,
      estHandicape: true,
      user: { select: { nom: true, prenom: true, email: true, phone: true } },
      filiere: { select: { id: true, nom: true } },
    },
  });

  if (!eleve) throw new Error('Profil élève introuvable');

  // ── Inscription courante (la plus récente) ──
  const inscription = await prisma.inscription.findFirst({
    where: { eleveId: eleve.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, modePaiement: true, estRedoublant: true,
      decision: true, moyenneGenerale: true,
      annee:   { select: { id: true, dateDebut: true, dateFin: true } },
      classe:  { select: { id: true, nom: true } },
      niveau:  { select: { id: true, nomNiveau: true, cycle: true, scolarite: true } },
      paiements: {
        orderBy: { numeroTranche: 'asc' },
        select: {
          id: true, date: true, montant: true, montantAttendu: true,
          modePaiement: true, libelleTranche: true, numeroTranche: true,
          totalTranches: true, dateEcheance: true, recu: true,
        },
      },
    },
  });

  const anneeId  = inscription?.annee?.id;
  const classeId = inscription?.classe?.id;

  // ── Requêtes parallèles ──
  const [notes, absences, retards, evaluations, trimestres] = await Promise.all([
    // Notes avec évaluation
    prisma.note.findMany({
      where: {
        eleveId: eleve.id,
        evaluation: {
          ...(anneeId  ? { anneeId }  : {}),
          ...(classeId ? { classeId } : {}),
        },
      },
      select: {
        id: true, valeur: true,
        evaluation: {
          select: {
            id: true, type: true, date: true, bareme: true,
            matiere:   { select: { id: true, libelle: true } },
            trimestre: { select: { id: true, nom: true } },
            staff: { select: { user: { select: { nom: true, prenom: true } } } },
          },
        },
      },
      orderBy: { evaluation: { date: 'desc' } },
    }),

    // Absences
    prisma.absence.findMany({
      where: {
        eleveId: eleve.id,
        ...(classeId ? { classeId } : {}),
      },
      select: {
        id: true, dateDebut: true, dateFin: true, motif: true, justification: true,
        matiere: { select: { id: true, libelle: true } },
        classe:  { select: { id: true, nom: true } },
      },
      orderBy: { dateDebut: 'desc' },
    }),

    // Retards
    prisma.retard.findMany({
      where: {
        eleveId: eleve.id,
        ...(classeId ? { classeId } : {}),
      },
      select: {
        id: true, date: true, justification: true, autorisation: true, confProf: true,
        matiere: { select: { id: true, libelle: true } },
        classe:  { select: { id: true, nom: true } },
      },
      orderBy: { date: 'desc' },
    }),

    // Évaluations à venir (date >= aujourd'hui)
    classeId
      ? prisma.evaluation.findMany({
          where: {
            classeId,
            ...(anneeId ? { anneeId } : {}),
            date: { gte: new Date() },
          },
          select: {
            id: true, type: true, date: true, bareme: true,
            matiere:   { select: { id: true, libelle: true } },
            trimestre: { select: { id: true, nom: true } },
            notes: { where: { eleveId: eleve.id }, select: { valeur: true } },
          },
          orderBy: { date: 'asc' },
          take: 10,
        })
      : Promise.resolve([]),

    // Trimestres de l'année courante
    anneeId
      ? prisma.trimestre.findMany({
          where: { anneeId, invalide: false },
          select: { id: true, nom: true, dateDebut: true, dateFin: true },
          orderBy: { dateDebut: 'asc' },
        })
      : Promise.resolve([]),
  ]);

  // ── Calcul notes par matière ──
  const matiereMap: Record<number, {
    matiere: { id: number; libelle: string };
    professeur: string;
    notes: { valeur: number; type: string; bareme: number | null; date: Date }[];
    moyenne: number;
  }> = {};

  notes.forEach(n => {
    const ev = n.evaluation;
    if (!ev?.matiere) return;
    const mid = ev.matiere.id;
    if (!matiereMap[mid]) {
      const prof = ev.staff?.user ? `${ev.staff.user.prenom} ${ev.staff.user.nom}` : '—';
      matiereMap[mid] = { matiere: ev.matiere, professeur: prof, notes: [], moyenne: 0 };
    }
    matiereMap[mid].notes.push({ valeur: n.valeur, type: ev.type, bareme: ev.bareme, date: ev.date });
  });

  const notesParMatiere = Object.values(matiereMap).map(m => {
    const moy = m.notes.length > 0 ? m.notes.reduce((s, n) => s + n.valeur, 0) / m.notes.length : 0;
    return { ...m, moyenne: Number(moy.toFixed(2)) };
  });

  // ── Évolution par trimestre ──
  const evolutionParTrimestre = trimestres.map(t => {
    const notesTrimestre = notes.filter(n => n.evaluation?.trimestre?.id === t.id);
    const moy = notesTrimestre.length > 0
      ? notesTrimestre.reduce((s, n) => s + n.valeur, 0) / notesTrimestre.length : null;
    return { trimestre: t.nom, trimestreId: t.id, moyenne: moy !== null ? Number(moy.toFixed(2)) : null };
  });

  // ── Moyenne générale calculée ──
  const moyenneCalculee = notes.length > 0
    ? Number((notes.reduce((s, n) => s + n.valeur, 0) / notes.length).toFixed(2)) : null;

  // ── Absences résumé ──
  const absencesJustifiees    = absences.filter(a => a.justification).length;
  const absencesNonJustifiees = absences.filter(a => !a.justification).length;

  // ── Retards résumé ──
  const retardsAutorises    = retards.filter(r => r.autorisation).length;
  const retardsNonAutorises = retards.filter(r => !r.autorisation).length;

  // ── Paiements / scolarité ──
  let paiements = null;
  if (inscription) {
    const scolarite  = inscription.niveau?.scolarite ?? 0;
    const totalPaye  = inscription.paiements.reduce((s, p) => s + p.montant, 0);
    const resteAPayer = scolarite - totalPaye;

    if (inscription.modePaiement === 'COMPLET') {
      const p = inscription.paiements[0] ?? null;
      paiements = {
        modePaiement: 'COMPLET',
        scolarite, totalPaye, resteAPayer,
        estSolde: totalPaye >= scolarite,
        paiement: p ? {
          id: p.id, date: p.date, montant: p.montant,
          montantAttendu: p.montantAttendu, modePaiement: p.modePaiement, recu: p.recu,
          statut: p.montant >= (p.montantAttendu ?? scolarite) ? 'PAYE' : 'EN_ATTENTE',
        } : null,
      };
    } else {
      const tranches = inscription.paiements.map(p => ({
        id: p.id, numeroTranche: p.numeroTranche, totalTranches: p.totalTranches,
        libelleTranche: p.libelleTranche, montantAttendu: p.montantAttendu,
        montantPaye: p.montant, modePaiement: p.modePaiement,
        dateEcheance: p.dateEcheance, datePaiement: p.montant > 0 ? p.date : null,
        recu: p.recu,
        statut: p.montant >= (p.montantAttendu ?? 0) ? 'PAYE' : p.montant > 0 ? 'PARTIEL' : 'EN_ATTENTE',
      }));
      paiements = {
        modePaiement: 'TRANCHES',
        scolarite, totalPaye, resteAPayer,
        estSolde: totalPaye >= scolarite,
        tranches,
      };
    }
  }

  return {
    profil: {
      id: eleve.id,
      nom: eleve.user.nom,
      prenom: eleve.user.prenom,
      email: eleve.user.email,
      phone: eleve.user.phone,
      matricule: eleve.matricule,
      photo: eleve.photo,
      statut: eleve.statut,
      dateNaissance: eleve.dateNaissance,
      estHandicape: eleve.estHandicape,
      filiere: eleve.filiere,
    },
    inscription: inscription
      ? {
          id: inscription.id,
          annee: inscription.annee,
          classe: inscription.classe,
          niveau: inscription.niveau,
          estRedoublant: inscription.estRedoublant,
          decision: inscription.decision,
          moyenneGenerale: inscription.moyenneGenerale,
        }
      : null,
    kpi: {
      moyenneGenerale: moyenneCalculee,
      nombreNotes: notes.length,
      nombreAbsences: absences.length,
      absencesJustifiees,
      absencesNonJustifiees,
      nombreRetards: retards.length,
      retardsAutorises,
      retardsNonAutorises,
      evaluationsAVenir: evaluations.length,
    },
    notesParMatiere,
    evolutionParTrimestre,
    absences: {
      total: absences.length,
      justifiees: absencesJustifiees,
      nonJustifiees: absencesNonJustifiees,
      liste: absences.slice(0, 20),
    },
    retards: {
      total: retards.length,
      autorises: retardsAutorises,
      nonAutorises: retardsNonAutorises,
      liste: retards.slice(0, 20),
    },
    evaluationsAVenir: evaluations,
    paiements,
  };
};
