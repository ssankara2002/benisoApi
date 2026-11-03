import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer un type de matière
export const createTypeMatiere = async (data: { libelle: string }) => {
  return await prisma.typeMatiere.create({
    data: {
      libelle: data.libelle,
    },
    include: {
      _count: {
        select: {
          matieres: true,
        },
      },
    },
  });
};

// Récupérer tous les types de matières
export const getAllTypesMatieres = async () => {
  return await prisma.typeMatiere.findMany({
    include: {
      matieres: {
        select: {
          id: true,
          libelle: true,
        },
      },
      _count: {
        select: {
          matieres: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Récupérer un type de matière par ID
export const getTypeMatiereById = async (id: number) => {
  const typeMatiere = await prisma.typeMatiere.findUnique({
    where: { id },
    include: {
      matieres: {
        select: {
          id: true,
          libelle: true,
        },
      },
      _count: {
        select: {
          matieres: true,
        },
      },
    },
  });

  if (!typeMatiere) {
    throw new Error('Type de matière non trouvé');
  }

  return typeMatiere;
};

// Mettre à jour un type de matière
export const updateTypeMatiere = async (
  id: number,
  data: { libelle?: string }
) => {
  const typeMatiere = await prisma.typeMatiere.findUnique({
    where: { id },
  });

  if (!typeMatiere) {
    throw new Error('Type de matière non trouvé');
  }

  return await prisma.typeMatiere.update({
    where: { id },
    data: {
      libelle: data.libelle,
    },
    include: {
      _count: {
        select: {
          matieres: true,
        },
      },
    },
  });
};

// Supprimer un type de matière
export const deleteTypeMatiere = async (id: number) => {
  const typeMatiere = await prisma.typeMatiere.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          matieres: true,
        },
      },
    },
  });

  if (!typeMatiere) {
    throw new Error('Type de matière non trouvé');
  }

  // Vérifier s'il y a des matières associées
  if (typeMatiere._count.matieres > 0) {
    throw new Error(
      `Impossible de supprimer ce type de matière car il contient ${typeMatiere._count.matieres} matière(s)`
    );
  }

  return await prisma.typeMatiere.delete({
    where: { id },
  });
};

export default {
  createTypeMatiere,
  getAllTypesMatieres,
  getTypeMatiereById,
  updateTypeMatiere,
  deleteTypeMatiere,
};
