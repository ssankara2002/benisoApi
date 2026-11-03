import { PrismaClient, TypeCompte, TypeTransaction } from '@prisma/client';

const prisma = new PrismaClient();

// Calculer le solde actuel d'un compte
const calculerSolde = async (compteId: number, soldeInitial: number) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      compteId,
      statut: 'VALIDE',
    },
  });

  let solde = soldeInitial;

  for (const transaction of transactions) {
    if (transaction.type === TypeTransaction.RECETTE) {
      solde += transaction.montant;
    } else {
      solde -= transaction.montant;
    }
  }

  return solde;
};

// Créer un compte bancaire
export const createCompteBancaire = async (data: {
  libelle: string;
  type: TypeCompte;
  soldeInitial?: number;
}) => {
  const compte = await prisma.compteBancaire.create({
    data: {
      libelle: data.libelle,
      type: data.type,
      soldeInitial: data.soldeInitial || 0,
      updatedAt: new Date(),
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const soldeActuel = await calculerSolde(compte.id, compte.soldeInitial);

  return {
    ...compte,
    soldeActuel,
  };
};

// Récupérer tous les comptes bancaires
export const getAllComptesBancaires = async (type?: TypeCompte) => {
  const comptes = await prisma.compteBancaire.findMany({
    where: type ? { type } : undefined,
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Ajouter le solde actuel pour chaque compte
  const comptesAvecSolde = await Promise.all(
    comptes.map(async (compte) => {
      const soldeActuel = await calculerSolde(compte.id, compte.soldeInitial);
      return {
        ...compte,
        soldeActuel,
      };
    })
  );

  return comptesAvecSolde;
};

// Récupérer un compte par ID
export const getCompteBancaireById = async (id: number) => {
  const compte = await prisma.compteBancaire.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
      transactions: {
        where: {
          statut: 'VALIDE',
        },
        orderBy: {
          date: 'desc',
        },
        take: 10, // Dernières 10 transactions
      },
    },
  });

  if (!compte) {
    throw new Error('Compte bancaire non trouvé');
  }

  const soldeActuel = await calculerSolde(compte.id, compte.soldeInitial);

  return {
    ...compte,
    soldeActuel,
  };
};

// Mettre à jour un compte
export const updateCompteBancaire = async (
  id: number,
  data: {
    libelle?: string;
    type?: TypeCompte;
    soldeInitial?: number;
  }
) => {
  const compte = await prisma.compteBancaire.findUnique({
    where: { id },
  });

  if (!compte) {
    throw new Error('Compte bancaire non trouvé');
  }

  const compteUpdated = await prisma.compteBancaire.update({
    where: { id },
    data: {
      libelle: data.libelle,
      type: data.type,
      soldeInitial: data.soldeInitial,
      updatedAt: new Date(),
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const soldeActuel = await calculerSolde(
    compteUpdated.id,
    compteUpdated.soldeInitial
  );

  return {
    ...compteUpdated,
    soldeActuel,
  };
};

// Supprimer un compte
export const deleteCompteBancaire = async (id: number) => {
  const compte = await prisma.compteBancaire.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!compte) {
    throw new Error('Compte bancaire non trouvé');
  }

  // Vérifier s'il y a des transactions associées
  if (compte._count.transactions > 0) {
    throw new Error(
      `Impossible de supprimer ce compte car il contient ${compte._count.transactions} transaction(s)`
    );
  }

  return await prisma.compteBancaire.delete({
    where: { id },
  });
};

// Obtenir le solde d'un compte à une date donnée
export const getSoldeAtDate = async (compteId: number, date: Date) => {
  const compte = await prisma.compteBancaire.findUnique({
    where: { id: compteId },
  });

  if (!compte) {
    throw new Error('Compte bancaire non trouvé');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      compteId,
      statut: 'VALIDE',
      date: {
        lte: date,
      },
    },
  });

  let solde = compte.soldeInitial;

  for (const transaction of transactions) {
    if (transaction.type === TypeTransaction.RECETTE) {
      solde += transaction.montant;
    } else {
      solde -= transaction.montant;
    }
  }

  return solde;
};

export default {
  createCompteBancaire,
  getAllComptesBancaires,
  getCompteBancaireById,
  updateCompteBancaire,
  deleteCompteBancaire,
  getSoldeAtDate,
};
