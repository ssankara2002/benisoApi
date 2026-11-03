import { PrismaClient, TypeTransaction, StatutTransaction } from '@prisma/client';

const prisma = new PrismaClient();

// Créer un budget
export const createBudget = async (data: {
  libelle: string;
  montantPrevu: number;
  type: TypeTransaction;
  anneeId?: number;
  categorieId?: number;
}) => {
  return await prisma.budget.create({
    data: {
      libelle: data.libelle,
      montantPrevu: data.montantPrevu,
      type: data.type,
      anneeId: data.anneeId,
      categorieId: data.categorieId,
      updatedAt: new Date(),
    },
    include: {
      annee: true,
      categorieComptable: true,
    },
  });
};

// Récupérer tous les budgets avec suivi de réalisation
export const getAllBudgets = async (filters?: {
  type?: TypeTransaction;
  anneeId?: number;
  categorieId?: number;
}) => {
  const where: any = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.anneeId) where.anneeId = filters.anneeId;
  if (filters?.categorieId) where.categorieId = filters.categorieId;

  const budgets = await prisma.budget.findMany({
    where,
    include: {
      annee: true,
      categorieComptable: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculer le montant réalisé pour chaque budget
  const budgetsAvecRealisation = await Promise.all(
    budgets.map(async (budget) => {
      const whereTransaction: any = {
        type: budget.type,
        statut: StatutTransaction.VALIDE,
      };

      if (budget.anneeId) whereTransaction.anneeId = budget.anneeId;
      if (budget.categorieId) whereTransaction.categorieId = budget.categorieId;

      const transactions = await prisma.transaction.aggregate({
        where: whereTransaction,
        _sum: {
          montant: true,
        },
      });

      const montantRealise = transactions._sum.montant || 0;
      const tauxRealisation = (montantRealise / budget.montantPrevu) * 100;
      const ecart = montantRealise - budget.montantPrevu;

      return {
        ...budget,
        montantRealise,
        tauxRealisation: Number(tauxRealisation.toFixed(2)),
        ecart,
      };
    })
  );

  return budgetsAvecRealisation;
};

// Récupérer un budget par ID
export const getBudgetById = async (id: number) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: {
      annee: true,
      categorieComptable: true,
    },
  });

  if (!budget) {
    throw new Error('Budget non trouvé');
  }

  // Calculer le montant réalisé
  const whereTransaction: any = {
    type: budget.type,
    statut: StatutTransaction.VALIDE,
  };

  if (budget.anneeId) whereTransaction.anneeId = budget.anneeId;
  if (budget.categorieId) whereTransaction.categorieId = budget.categorieId;

  const transactions = await prisma.transaction.findMany({
    where: whereTransaction,
    select: {
      id: true,
      reference: true,
      libelle: true,
      montant: true,
      date: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  const montantRealise = transactions.reduce(
    (sum, transaction) => sum + transaction.montant,
    0
  );
  const tauxRealisation = (montantRealise / budget.montantPrevu) * 100;
  const ecart = montantRealise - budget.montantPrevu;

  return {
    ...budget,
    montantRealise,
    tauxRealisation: Number(tauxRealisation.toFixed(2)),
    ecart,
    transactions,
  };
};

// Mettre à jour un budget
export const updateBudget = async (
  id: number,
  data: {
    libelle?: string;
    montantPrevu?: number;
    type?: TypeTransaction;
    anneeId?: number;
    categorieId?: number;
  }
) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    throw new Error('Budget non trouvé');
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: {
      libelle: data.libelle,
      montantPrevu: data.montantPrevu,
      type: data.type,
      anneeId: data.anneeId,
      categorieId: data.categorieId,
      updatedAt: new Date(),
    },
    include: {
      annee: true,
      categorieComptable: true,
    },
  });

  // Calculer le montant réalisé
  const whereTransaction: any = {
    type: updatedBudget.type,
    statut: StatutTransaction.VALIDE,
  };

  if (updatedBudget.anneeId) whereTransaction.anneeId = updatedBudget.anneeId;
  if (updatedBudget.categorieId)
    whereTransaction.categorieId = updatedBudget.categorieId;

  const transactions = await prisma.transaction.aggregate({
    where: whereTransaction,
    _sum: {
      montant: true,
    },
  });

  const montantRealise = transactions._sum.montant || 0;
  const tauxRealisation = (montantRealise / updatedBudget.montantPrevu) * 100;
  const ecart = montantRealise - updatedBudget.montantPrevu;

  return {
    ...updatedBudget,
    montantRealise,
    tauxRealisation: Number(tauxRealisation.toFixed(2)),
    ecart,
  };
};

// Supprimer un budget
export const deleteBudget = async (id: number) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    throw new Error('Budget non trouvé');
  }

  return await prisma.budget.delete({
    where: { id },
  });
};

// Obtenir un tableau de bord budgétaire
export const getTableauDeBord = async (anneeId?: number) => {
  const where: any = {};
  if (anneeId) where.anneeId = anneeId;

  const budgets = await getAllBudgets({ anneeId });

  const recettes = budgets.filter((b) => b.type === TypeTransaction.RECETTE);
  const depenses = budgets.filter((b) => b.type === TypeTransaction.DEPENSE);

  const totalRecettesPrevues = recettes.reduce((sum, b) => sum + b.montantPrevu, 0);
  const totalRecettesRealisees = recettes.reduce(
    (sum, b) => sum + b.montantRealise,
    0
  );

  const totalDepensesPrevues = depenses.reduce((sum, b) => sum + b.montantPrevu, 0);
  const totalDepensesRealisees = depenses.reduce(
    (sum, b) => sum + b.montantRealise,
    0
  );

  return {
    recettes: {
      prevues: totalRecettesPrevues,
      realisees: totalRecettesRealisees,
      ecart: totalRecettesRealisees - totalRecettesPrevues,
      tauxRealisation:
        totalRecettesPrevues > 0
          ? Number(((totalRecettesRealisees / totalRecettesPrevues) * 100).toFixed(2))
          : 0,
    },
    depenses: {
      prevues: totalDepensesPrevues,
      realisees: totalDepensesRealisees,
      ecart: totalDepensesRealisees - totalDepensesPrevues,
      tauxRealisation:
        totalDepensesPrevues > 0
          ? Number(((totalDepensesRealisees / totalDepensesPrevues) * 100).toFixed(2))
          : 0,
    },
    solde: {
      prevu: totalRecettesPrevues - totalDepensesPrevues,
      realise: totalRecettesRealisees - totalDepensesRealisees,
    },
  };
};

export default {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getTableauDeBord,
};
