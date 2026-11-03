import { PrismaClient, StatutPaiementSalaire } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateSalaireData {
  mois: number;
  annee: number;
  heuresNormales: number;
  heuresSupplementaires?: number;
  tauxHoraireSupp?: number;
  deductions?: number;
  staffId: number;
  userId: number;
}

interface UpdateSalaireData {
  mois?: number;
  annee?: number;
  heuresNormales?: number;
  heuresSupplementaires?: number;
  tauxHoraireSupp?: number;
  deductions?: number;
  statut?: StatutPaiementSalaire;
}

interface SalaireFilters {
  staffId?: number;
  mois?: number;
  annee?: number;
  statut?: StatutPaiementSalaire;
}

const staffInclude = {
  include: {
    user: {
      select: { id: true, nom: true, prenom: true, email: true, phone: true },
    },
  },
};

const calculerMontants = (
  heuresNormales: number,
  tauxHoraire: number,
  heuresSupp: number,
  tauxHoraireSupp: number,
  deductions: number,
) => {
  const montantNormal = heuresNormales * tauxHoraire;
  const montantSupp = heuresSupp * tauxHoraireSupp;
  const montantBrut = montantNormal + montantSupp;
  const montantNet = montantBrut - deductions;
  return { montantBrut, montantNet };
};

// ─── Heures depuis cahier de textes ──────────────────────────────────────────

const getHeuresDepuisCahier = async (staffId: number, mois: number, annee: number) => {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) throw new Error('Personnel introuvable');

  // Toutes les séances effectuées par ce prof sur le mois/année demandé
  const debut = new Date(annee, mois - 1, 1);
  const fin   = new Date(annee, mois, 1);   // début du mois suivant (exclusif)

  const cahiers = await prisma.cahierTexte.findMany({
    where: {
      staffId,
      seance: {
        date: { gte: debut, lt: fin },
        statut: 'EFFECTUE',
      },
    },
    include: {
      seance: {
        include: { emploiDuTemps: true },
      },
    },
  });

  // Calcul de la durée de chaque séance depuis heureDebut / heureFin de l'emploi du temps
  const parseDuree = (debut: string, fin: string): number => {
    const [dh, dm] = debut.split(':').map(Number);
    const [fh, fm] = fin.split(':').map(Number);
    return Math.max(0, (fh * 60 + fm - (dh * 60 + dm)) / 60);
  };

  let totalHeures = 0;
  const detail: { date: string; matiere: string; duree: number }[] = [];

  for (const cahier of cahiers) {
    const edt = cahier.seance.emploiDuTemps;
    const duree = parseDuree(edt.heureDebut, edt.heureFin);
    totalHeures += duree;
    detail.push({
      date: cahier.seance.date.toLocaleDateString('fr-FR'),
      matiere: String(edt.matiereId),
      duree,
    });
  }

  return { staffId, mois, annee, totalHeures, nombreSeances: cahiers.length, detail };
};

// ─── Taux horaire du staff ────────────────────────────────────────────────────

const setTauxHoraire = async (staffId: number, tauxHoraire: number) => {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) throw new Error('Personnel introuvable');
  return prisma.staff.update({
    where: { id: staffId },
    data: { tauxHoraire },
    include: { user: { select: { id: true, nom: true, prenom: true } } },
  });
};

// ─── CRUD Salaire ─────────────────────────────────────────────────────────────

const createSalaire = async (data: CreateSalaireData) => {
  const { mois, annee, heuresNormales, heuresSupplementaires = 0, tauxHoraireSupp = 0, deductions = 0, staffId, userId } = data;

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) throw new Error('Personnel introuvable');

  const existingSalaire = await prisma.salaire.findFirst({ where: { staffId, mois, annee } });
  if (existingSalaire) throw new Error(`Un salaire existe déjà pour ce personnel pour ${mois}/${annee}`);

  const { montantBrut, montantNet } = calculerMontants(
    heuresNormales, staff.tauxHoraire, heuresSupplementaires, tauxHoraireSupp, deductions,
  );

  return prisma.salaire.create({
    data: {
      mois, annee,
      heuresNormales,
      heuresSupplementaires,
      tauxHoraire: staff.tauxHoraire,
      tauxHoraireSupp,
      montantBrut, deductions, montantNet,
      staffId, userId,
      updatedAt: new Date(),
    },
    include: {
      staff: staffInclude,
      user: { select: { id: true, nom: true, prenom: true } },
    },
  });
};

const getAllSalaires = async (filters: SalaireFilters = {}) => {
  const { staffId, mois, annee, statut } = filters;
  const where: any = {};
  if (staffId) where.staffId = staffId;
  if (mois) where.mois = mois;
  if (annee) where.annee = annee;
  if (statut) where.statut = statut;

  return prisma.salaire.findMany({
    where,
    include: {
      staff: {
        include: {
          user: { select: { id: true, nom: true, prenom: true, email: true, phone: true, adresse: true } },
        },
      },
      user: { select: { id: true, nom: true, prenom: true } },
    },
    orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
  });
};

const getSalaireById = async (id: number) => {
  const salaire = await prisma.salaire.findUnique({
    where: { id },
    include: {
      staff: {
        include: {
          user: { select: { id: true, nom: true, prenom: true, email: true, phone: true, adresse: true } },
        },
      },
      user: { select: { id: true, nom: true, prenom: true } },
    },
  });
  if (!salaire) throw new Error('Salaire introuvable');
  return salaire;
};

const updateSalaire = async (id: number, data: UpdateSalaireData) => {
  const existing = await prisma.salaire.findUnique({ where: { id }, include: { staff: true } });
  if (!existing) throw new Error('Salaire introuvable');
  if (existing.statut === StatutPaiementSalaire.PAYE) throw new Error('Impossible de modifier un salaire déjà payé');

  const updateData: any = { ...data, updatedAt: new Date() };

  // Recalcul si les heures ou taux changent
  const heuresNormales = data.heuresNormales ?? existing.heuresNormales;
  const heuresSupp = data.heuresSupplementaires ?? existing.heuresSupplementaires;
  const tauxHoraire = existing.tauxHoraire;
  const tauxHoraireSupp = data.tauxHoraireSupp ?? existing.tauxHoraireSupp;
  const deductions = data.deductions ?? existing.deductions;

  const { montantBrut, montantNet } = calculerMontants(heuresNormales, tauxHoraire, heuresSupp, tauxHoraireSupp, deductions);
  updateData.montantBrut = montantBrut;
  updateData.montantNet = montantNet;

  return prisma.salaire.update({
    where: { id },
    data: updateData,
    include: {
      staff: {
        include: { user: { select: { id: true, nom: true, prenom: true, email: true, phone: true } } },
      },
      user: { select: { id: true, nom: true, prenom: true } },
    },
  });
};

const payerSalaire = async (id: number) => {
  const salaire = await prisma.salaire.findUnique({ where: { id } });
  if (!salaire) throw new Error('Salaire introuvable');
  if (salaire.statut === StatutPaiementSalaire.PAYE) throw new Error('Ce salaire a déjà été payé');
  return prisma.salaire.update({
    where: { id },
    data: { statut: StatutPaiementSalaire.PAYE, updatedAt: new Date() },
    include: { staff: staffInclude },
  });
};

const annulerSalaire = async (id: number) => {
  const salaire = await prisma.salaire.findUnique({ where: { id } });
  if (!salaire) throw new Error('Salaire introuvable');
  if (salaire.statut === StatutPaiementSalaire.ANNULE) throw new Error('Ce salaire est déjà annulé');
  return prisma.salaire.update({
    where: { id },
    data: { statut: StatutPaiementSalaire.ANNULE, updatedAt: new Date() },
    include: { staff: staffInclude },
  });
};

const deleteSalaire = async (id: number) => {
  const salaire = await prisma.salaire.findUnique({ where: { id } });
  if (!salaire) throw new Error('Salaire introuvable');
  if (salaire.statut === StatutPaiementSalaire.PAYE) throw new Error('Impossible de supprimer un salaire déjà payé');
  return prisma.salaire.delete({ where: { id } });
};

const getStatistiquesSalaires = async (annee?: number) => {
  const where: any = {};
  if (annee) where.annee = annee;
  const salaires = await prisma.salaire.findMany({ where });

  const totalBrut = salaires.reduce((s, x) => s + x.montantBrut, 0);
  const totalDeductions = salaires.reduce((s, x) => s + x.deductions, 0);
  const totalNet = salaires.reduce((s, x) => s + x.montantNet, 0);
  const payes = salaires.filter(s => s.statut === StatutPaiementSalaire.PAYE);
  const enAttente = salaires.filter(s => s.statut === StatutPaiementSalaire.EN_ATTENTE);
  const annules = salaires.filter(s => s.statut === StatutPaiementSalaire.ANNULE);

  return {
    total: salaires.length,
    totalBrut, totalDeductions, totalNet,
    totalPaye: payes.reduce((s, x) => s + x.montantNet, 0),
    totalEnAttente: enAttente.reduce((s, x) => s + x.montantNet, 0),
    nombrePayes: payes.length,
    nombreEnAttente: enAttente.length,
    nombreAnnules: annules.length,
  };
};

export default {
  getHeuresDepuisCahier,
  setTauxHoraire,
  createSalaire,
  getAllSalaires,
  getSalaireById,
  updateSalaire,
  payerSalaire,
  annulerSalaire,
  deleteSalaire,
  getStatistiquesSalaires,
};
