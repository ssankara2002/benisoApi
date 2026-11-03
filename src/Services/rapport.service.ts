import { PrismaClient, TypeTransaction, StatutTransaction, StatutPaiementSalaire } from '@prisma/client';

const prisma = new PrismaClient();


interface PeriodeFilters {
  dateDebut?: Date;
  dateFin?: Date;
  anneeId?: number;
}

// Rapport financier global
const getRapportFinancier = async (filters: PeriodeFilters = {}) => {
  const { dateDebut, dateFin, anneeId } = filters;

  // Construction des filtres WHERE pour les transactions
  const whereTransaction: any = {
    statut: StatutTransaction.VALIDE, // Seulement les transactions validées
  };

  if (anneeId) {
    whereTransaction.anneeId = anneeId;
  }

  if (dateDebut || dateFin) {
    whereTransaction.date = {};
    if (dateDebut) whereTransaction.date.gte = dateDebut;
    if (dateFin) whereTransaction.date.lte = dateFin;
  }

  // Récupérer toutes les transactions validées
  const transactions = await prisma.transaction.findMany({
    where: whereTransaction,
    include: {
      categorieComptable: true,
      compteBancaire: true,
      lignesTransaction: true,
    },
  });

  // Calculer les recettes et dépenses
  const recettes = transactions
    .filter(t => t.type === TypeTransaction.RECETTE)
    .reduce((sum, t) => sum + t.montant, 0);

  const depenses = transactions
    .filter(t => t.type === TypeTransaction.DEPENSE)
    .reduce((sum, t) => sum + t.montant, 0);

  const solde = recettes - depenses;

  // Grouper par catégorie
  const parCategorie: any = {};
  transactions.forEach(transaction => {
    if (transaction.categorieComptable) {
      const key = transaction.categorieComptable.libelle;
      if (!parCategorie[key]) {
        parCategorie[key] = {
          libelle: key,
          type: transaction.categorieComptable.type,
          montant: 0,
          nombre: 0,
        };
      }
      parCategorie[key].montant += transaction.montant;
      parCategorie[key].nombre += 1;
    }
  });

  // Grouper par compte
  const parCompte: any = {};
  transactions.forEach(transaction => {
    if (transaction.compteBancaire) {
      const key = transaction.compteBancaire.libelle;
      if (!parCompte[key]) {
        parCompte[key] = {
          libelle: key,
          type: transaction.compteBancaire.type,
          recettes: 0,
          depenses: 0,
          solde: 0,
          nombre: 0,
        };
      }

      if (transaction.type === TypeTransaction.RECETTE) {
        parCompte[key].recettes += transaction.montant;
      } else {
        parCompte[key].depenses += transaction.montant;
      }

      parCompte[key].solde = parCompte[key].recettes - parCompte[key].depenses;
      parCompte[key].nombre += 1;
    }
  });

  return {
    periode: {
      dateDebut,
      dateFin,
      anneeId,
    },
    resume: {
      totalRecettes: recettes,
      totalDepenses: depenses,
      solde,
      nombreTransactions: transactions.length,
    },
    parCategorie: Object.values(parCategorie),
    parCompte: Object.values(parCompte),
  };
};

// Bilan comptable (balance sheet)
const getBilanComptable = async (filters: PeriodeFilters = {}) => {
  const { dateDebut, dateFin, anneeId } = filters;

  // Obtenir le rapport financier
  const rapportFinancier = await getRapportFinancier(filters);

  // Récupérer les informations sur les salaires
  const whereSalaire: any = {};

  if (anneeId) {
    // Si anneeId est fourni, on récupère les salaires de cette année
    const annee = await prisma.annee.findUnique({
      where: { id: anneeId },
    });

    if (annee) {
      whereSalaire.annee = new Date(annee.dateDebut || new Date()).getFullYear();
    }
  }

  if (dateDebut || dateFin) {
    // Filtrer par période si dateDebut/dateFin sont fournis
    const anneeDebut = dateDebut ? dateDebut.getFullYear() : undefined;
    const anneeFin = dateFin ? dateFin.getFullYear() : undefined;

    if (anneeDebut && anneeFin && anneeDebut === anneeFin) {
      whereSalaire.annee = anneeDebut;
    }
  }

  const salaires = await prisma.salaire.findMany({
    where: whereSalaire,
  });

  const salairesPayes = salaires.filter(s => s.statut === StatutPaiementSalaire.PAYE);
  const salairesEnAttente = salaires.filter(s => s.statut === StatutPaiementSalaire.EN_ATTENTE);

  const totalSalairesPayes = salairesPayes.reduce((sum, s) => sum + s.montantNet, 0);
  const totalSalairesEnAttente = salairesEnAttente.reduce((sum, s) => sum + s.montantNet, 0);

  // Récupérer les inscriptions avec leur niveau pour calculer la scolarité
  const inscriptions = await prisma.inscription.findMany({
    where: anneeId ? { anneeId } : {},
    include: {
      niveau: true,
      paiements: true,
    }
  });

  // Calculer les montants de scolarité
  let totalScolariteAttendu = 0;
  let totalScolaritePaye = 0;
  let totalScolariteEnAttente = 0;

  inscriptions.forEach(inscription => {
    const paiements = inscription.paiements || [];

    // Calculer le montant attendu (le premier paiement contient montantAttendu)
    const montantAttendu = paiements.length > 0 && paiements[0].montantAttendu
      ? paiements[0].montantAttendu
      : inscription.niveau?.scolarite || 0;

    // Calculer le montant payé (somme de tous les paiements)
    const montantPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);

    totalScolariteAttendu += montantAttendu;
    totalScolaritePaye += montantPaye;
    totalScolariteEnAttente += (montantAttendu - montantPaye);
  });

  // Calculer les actifs et passifs
  const actifs = {
    tresorerie: rapportFinancier.resume.solde,
    creancesScolarite: totalScolariteEnAttente, // Ce qui est dû par les élèves
    total: 0,
  };
  actifs.total = actifs.tresorerie + actifs.creancesScolarite;

  const passifs = {
    salairesDus: totalSalairesEnAttente, // Salaires non encore payés
    total: 0,
  };
  passifs.total = passifs.salairesDus;

  const capitauxPropres = actifs.total - passifs.total;

  return {
    periode: {
      dateDebut,
      dateFin,
      anneeId,
    },
    actifs: {
      tresorerie: actifs.tresorerie,
      creancesScolarite: actifs.creancesScolarite,
      total: actifs.total,
    },
    passifs: {
      salairesDus: passifs.salairesDus,
      total: passifs.total,
    },
    capitauxPropres,
    details: {
      scolarite: {
        totalAttendu: totalScolariteAttendu,
        totalPaye: totalScolaritePaye,
        totalEnAttente: totalScolariteEnAttente,
        nombreInscriptions: inscriptions.length,
      },
      salaires: {
        totalPayes: totalSalairesPayes,
        totalEnAttente: totalSalairesEnAttente,
        nombreSalairesPayes: salairesPayes.length,
        nombreSalairesEnAttente: salairesEnAttente.length,
      },
      transactions: rapportFinancier.resume,
    },
  };
};

// Rapport des salaires détaillé
const getRapportSalaires = async (annee?: number) => {
  const where: any = {};
  if (annee) where.annee = annee;

  const salaires = await prisma.salaire.findMany({
    where,
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [
      { annee: 'desc' },
      { mois: 'desc' },
    ],
  });

  // Grouper par personnel
  const parPersonnel: any = {};
  salaires.forEach(salaire => {
    const staffId = salaire.staffId;
    if (!parPersonnel[staffId]) {
      parPersonnel[staffId] = {
        staffId,
        nom: salaire.staff.user.nom,
        prenom: salaire.staff.user.prenom,
        email: salaire.staff.user.email,
        totalBrut: 0,
        totalDeductions: 0,
        totalNet: 0,
        totalPaye: 0,
        totalEnAttente: 0,
        nombreSalaires: 0,
        salaires: [],
      };
    }

    parPersonnel[staffId].totalBrut += salaire.montantBrut;
    parPersonnel[staffId].totalDeductions += salaire.deductions;
    parPersonnel[staffId].totalNet += salaire.montantNet;

    if (salaire.statut === StatutPaiementSalaire.PAYE) {
      parPersonnel[staffId].totalPaye += salaire.montantNet;
    } else if (salaire.statut === StatutPaiementSalaire.EN_ATTENTE) {
      parPersonnel[staffId].totalEnAttente += salaire.montantNet;
    }

    parPersonnel[staffId].nombreSalaires += 1;
    parPersonnel[staffId].salaires.push({
      id: salaire.id,
      mois: salaire.mois,
      annee: salaire.annee,
      montantBrut: salaire.montantBrut,
      deductions: salaire.deductions,
      montantNet: salaire.montantNet,
      statut: salaire.statut,
    });
  });

  // Résumé global
  const resume = {
    totalBrut: salaires.reduce((sum, s) => sum + s.montantBrut, 0),
    totalDeductions: salaires.reduce((sum, s) => sum + s.deductions, 0),
    totalNet: salaires.reduce((sum, s) => sum + s.montantNet, 0),
    totalPaye: salaires
      .filter(s => s.statut === StatutPaiementSalaire.PAYE)
      .reduce((sum, s) => sum + s.montantNet, 0),
    totalEnAttente: salaires
      .filter(s => s.statut === StatutPaiementSalaire.EN_ATTENTE)
      .reduce((sum, s) => sum + s.montantNet, 0),
    nombreSalaires: salaires.length,
    nombrePersonnels: Object.keys(parPersonnel).length,
  };

  return {
    annee,
    resume,
    parPersonnel: Object.values(parPersonnel),
  };
};

// Rapport mensuel
const getRapportMensuel = async (mois: number, annee: number) => {
  const dateDebut = new Date(annee, mois - 1, 1);
  const dateFin = new Date(annee, mois, 0, 23, 59, 59);

  // Transactions du mois
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: dateDebut,
        lte: dateFin,
      },
      statut: StatutTransaction.VALIDE,
    },
    include: {
      categorieComptable: true,
    },
  });

  const recettes = transactions
    .filter(t => t.type === TypeTransaction.RECETTE)
    .reduce((sum, t) => sum + t.montant, 0);

  const depenses = transactions
    .filter(t => t.type === TypeTransaction.DEPENSE)
    .reduce((sum, t) => sum + t.montant, 0);

  // Salaires du mois
  const salaires = await prisma.salaire.findMany({
    where: { mois, annee },
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
      },
    },
  });

  const totalSalaires = salaires.reduce((sum, s) => sum + s.montantNet, 0);
  const salairesPayes = salaires
    .filter(s => s.statut === StatutPaiementSalaire.PAYE)
    .reduce((sum, s) => sum + s.montantNet, 0);

  return {
    periode: {
      mois,
      annee,
      dateDebut,
      dateFin,
    },
    transactions: {
      recettes,
      depenses,
      solde: recettes - depenses,
      nombre: transactions.length,
    },
    salaires: {
      total: totalSalaires,
      payes: salairesPayes,
      enAttente: totalSalaires - salairesPayes,
      nombre: salaires.length,
      details: salaires.map(s => ({
        personnel: `${s.staff.user.prenom} ${s.staff.user.nom}`,
        montantNet: s.montantNet,
        statut: s.statut,
      })),
    },
    resume: {
      recettes,
      depenses,
      salaires: totalSalaires,
      resultat: recettes - depenses - totalSalaires,
    },
  };
};

export default {
  getRapportFinancier,
  getBilanComptable,
  getRapportSalaires,
  getRapportMensuel,
};
