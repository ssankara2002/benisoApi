import { PrismaClient, TypeTransaction, StatutTransaction } from '@prisma/client';

const prisma = new PrismaClient();

// Générer une référence unique pour la transaction
const genererReference = async (type: TypeTransaction): Promise<string> => {
  const prefix = type === TypeTransaction.RECETTE ? 'REC' : 'DEP';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  // Compter les transactions du même type ce mois
  const count = await prisma.transaction.count({
    where: {
      type,
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), 1),
        lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      },
    },
  });

  const numero = (count + 1).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${numero}`;
};

// Créer une transaction
export const createTransaction = async (data: {
  libelle: string;
  montant: number;
  type: TypeTransaction;
  date: Date;
  dateEcheance?: Date;
  pieceJustificative?: string;
  note?: string;
  categorieId?: number;
  compteId?: number;
  anneeId?: number;
  userId: number;
  paiementId?: number;
  lignes?: Array<{
    libelle: string;
    montant: number;
    quantite?: number;
  }>;
}) => {
  // Générer la référence
  const reference = await genererReference(data.type);

  // Créer la transaction avec ses lignes
  const transaction = await prisma.transaction.create({
    data: {
      reference,
      libelle: data.libelle,
      montant: data.montant,
      type: data.type,
      date: data.date,
      dateEcheance: data.dateEcheance,
      pieceJustificative: data.pieceJustificative,
      note: data.note,
      categorieId: data.categorieId,
      compteId: data.compteId,
      anneeId: data.anneeId,
      userId: data.userId,
      paiementId: data.paiementId,
      updatedAt: new Date(),
      lignesTransaction: data.lignes
        ? {
            create: data.lignes.map((ligne) => ({
              libelle: ligne.libelle,
              montant: ligne.montant,
              quantite: ligne.quantite || 1,
              updatedAt: new Date(),
            })),
          }
        : undefined,
    },
    include: {
      categorieComptable: true,
      compteBancaire: true,
      annee: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      lignesTransaction: true,
      paiement: true,
    },
  });

  return transaction;
};

// Récupérer toutes les transactions avec filtres
export const getAllTransactions = async (filters?: {
  type?: TypeTransaction;
  statut?: StatutTransaction;
  categorieId?: number;
  compteId?: number;
  anneeId?: number;
  dateDebut?: Date;
  dateFin?: Date;
}) => {
  const where: any = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.statut) where.statut = filters.statut;
  if (filters?.categorieId) where.categorieId = filters.categorieId;
  if (filters?.compteId) where.compteId = filters.compteId;
  if (filters?.anneeId) where.anneeId = filters.anneeId;

  if (filters?.dateDebut || filters?.dateFin) {
    where.date = {};
    if (filters.dateDebut) where.date.gte = filters.dateDebut;
    if (filters.dateFin) where.date.lte = filters.dateFin;
  }

  return await prisma.transaction.findMany({
    where,
    include: {
      categorieComptable: true,
      compteBancaire: true,
      annee: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      lignesTransaction: true,
      paiement: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
};

// Récupérer une transaction par ID
export const getTransactionById = async (id: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      categorieComptable: true,
      compteBancaire: true,
      annee: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      lignesTransaction: true,
      paiement: true,
    },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  return transaction;
};

// Mettre à jour une transaction
export const updateTransaction = async (
  id: number,
  data: {
    libelle?: string;
    montant?: number;
    date?: Date;
    dateEcheance?: Date;
    pieceJustificative?: string;
    note?: string;
    categorieId?: number;
    compteId?: number;
    anneeId?: number;
    lignes?: Array<{
      libelle: string;
      montant: number;
      quantite?: number;
    }>;
  }
) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  // Ne pas permettre la modification d'une transaction validée ou annulée
  if (transaction.statut !== StatutTransaction.EN_ATTENTE) {
    throw new Error(
      'Impossible de modifier une transaction validée ou annulée'
    );
  }

  // Si des lignes sont fournies, supprimer les anciennes et créer les nouvelles
  if (data.lignes) {
    // Supprimer les anciennes lignes
    await prisma.ligneTransaction.deleteMany({
      where: { transactionId: id },
    });
  }

  return await prisma.transaction.update({
    where: { id },
    data: {
      libelle: data.libelle,
      montant: data.montant,
      date: data.date,
      dateEcheance: data.dateEcheance,
      pieceJustificative: data.pieceJustificative,
      note: data.note,
      categorieId: data.categorieId,
      compteId: data.compteId,
      anneeId: data.anneeId,
      updatedAt: new Date(),
      lignesTransaction: data.lignes
        ? {
            create: data.lignes.map((ligne) => ({
              libelle: ligne.libelle,
              montant: ligne.montant,
              quantite: ligne.quantite || 1,
              updatedAt: new Date(),
            })),
          }
        : undefined,
    },
    include: {
      categorieComptable: true,
      compteBancaire: true,
      annee: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      lignesTransaction: true,
      paiement: true,
    },
  });
};

// Valider une transaction
export const validerTransaction = async (id: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  if (transaction.statut !== StatutTransaction.EN_ATTENTE) {
    throw new Error('Cette transaction a déjà été traitée');
  }

  return await prisma.transaction.update({
    where: { id },
    data: {
      statut: StatutTransaction.VALIDE,
    },
    include: {
      categorieComptable: true,
      compteBancaire: true,
      annee: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      lignesTransaction: true,
      paiement: true,
    },
  });
};

// Annuler une transaction
export const annulerTransaction = async (id: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  if (transaction.statut === StatutTransaction.ANNULE) {
    throw new Error('Cette transaction est déjà annulée');
  }

  return await prisma.transaction.update({
    where: { id },
    data: {
      statut: StatutTransaction.ANNULE,
    },
    include: {
      categorieComptable: true,
      compteBancaire: true,
      annee: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
      lignesTransaction: true,
      paiement: true,
    },
  });
};

// Supprimer une transaction
export const deleteTransaction = async (id: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      lignesTransaction: true,
    },
  });

  if (!transaction) {
    throw new Error('Transaction non trouvée');
  }

  // Ne permettre la suppression que des transactions en attente
  if (transaction.statut !== StatutTransaction.EN_ATTENTE) {
    throw new Error(
      'Impossible de supprimer une transaction validée ou annulée'
    );
  }

  // Supprimer les lignes d'abord (cascade devrait le faire mais on le fait explicitement)
  await prisma.ligneTransaction.deleteMany({
    where: { transactionId: id },
  });

  return await prisma.transaction.delete({
    where: { id },
  });
};

// Obtenir les statistiques des transactions
export const getStatistiquesTransactions = async (filters?: {
  anneeId?: number;
  dateDebut?: Date;
  dateFin?: Date;
}) => {
  const where: any = {
    statut: StatutTransaction.VALIDE,
  };

  if (filters?.anneeId) where.anneeId = filters.anneeId;

  if (filters?.dateDebut || filters?.dateFin) {
    where.date = {};
    if (filters.dateDebut) where.date.gte = filters.dateDebut;
    if (filters.dateFin) where.date.lte = filters.dateFin;
  }

  const recettes = await prisma.transaction.aggregate({
    where: {
      ...where,
      type: TypeTransaction.RECETTE,
    },
    _sum: {
      montant: true,
    },
    _count: true,
  });

  const depenses = await prisma.transaction.aggregate({
    where: {
      ...where,
      type: TypeTransaction.DEPENSE,
    },
    _sum: {
      montant: true,
    },
    _count: true,
  });

  return {
    recettes: {
      total: recettes._sum.montant || 0,
      nombre: recettes._count,
    },
    depenses: {
      total: depenses._sum.montant || 0,
      nombre: depenses._count,
    },
    solde: (recettes._sum.montant || 0) - (depenses._sum.montant || 0),
  };
};

export default {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  validerTransaction,
  annulerTransaction,
  deleteTransaction,
  getStatistiquesTransactions,
};
