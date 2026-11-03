import { PrismaClient, TypeTransaction } from '@prisma/client';

const prisma = new PrismaClient();

// Créer une catégorie comptable
export const createCategorieComptable = async (data: {
  libelle: string;
  type: TypeTransaction;
}) => {
  // Vérifier si la catégorie existe déjà
  const existing = await prisma.categorieComptable.findUnique({
    where: { libelle: data.libelle },
  });

  if (existing) {
    throw new Error('Une catégorie avec ce libellé existe déjà');
  }

  return await prisma.categorieComptable.create({
    data: {
      libelle: data.libelle,
      type: data.type,
      updatedAt: new Date(),
    },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
        },
      },
    },
  });
};

// Récupérer toutes les catégories comptables
export const getAllCategoriesComptables = async (type?: TypeTransaction) => {
  return await prisma.categorieComptable.findMany({
    where: type ? { type } : undefined,
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Récupérer une catégorie par ID
export const getCategorieComptableById = async (id: number) => {
  const categorie = await prisma.categorieComptable.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
        },
      },
    },
  });

  if (!categorie) {
    throw new Error('Catégorie comptable non trouvée');
  }

  return categorie;
};

// Mettre à jour une catégorie
export const updateCategorieComptable = async (
  id: number,
  data: {
    libelle?: string;
    type?: TypeTransaction;
  }
) => {
  const categorie = await prisma.categorieComptable.findUnique({
    where: { id },
  });

  if (!categorie) {
    throw new Error('Catégorie comptable non trouvée');
  }

  // Vérifier si le nouveau libellé existe déjà
  if (data.libelle && data.libelle !== categorie.libelle) {
    const existing = await prisma.categorieComptable.findUnique({
      where: { libelle: data.libelle },
    });

    if (existing) {
      throw new Error('Une catégorie avec ce libellé existe déjà');
    }
  }

  return await prisma.categorieComptable.update({
    where: { id },
    data: {
      libelle: data.libelle,
      type: data.type,
      updatedAt: new Date(),
    },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
        },
      },
    },
  });
};

// Supprimer une catégorie
export const deleteCategorieComptable = async (id: number) => {
  const categorie = await prisma.categorieComptable.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          transactions: true,
          budgets: true,
        },
      },
    },
  });

  if (!categorie) {
    throw new Error('Catégorie comptable non trouvée');
  }

  // Vérifier s'il y a des transactions ou budgets associés
  if (categorie._count.transactions > 0 || categorie._count.budgets > 0) {
    throw new Error(
      `Impossible de supprimer cette catégorie car elle contient ${categorie._count.transactions} transaction(s) et ${categorie._count.budgets} budget(s)`
    );
  }

  return await prisma.categorieComptable.delete({
    where: { id },
  });
};

export default {
  createCategorieComptable,
  getAllCategoriesComptables,
  getCategorieComptableById,
  updateCategorieComptable,
  deleteCategorieComptable,
};
