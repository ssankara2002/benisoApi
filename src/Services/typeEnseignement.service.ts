import { PrismaClient, TypeEnseignement } from '@prisma/client';
import { TypeEnseignementCreateData, TypeEnseignementUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllTypeEnseignements = async () => {
  return await prisma.typeEnseignement.findMany({
    include: {
      niveaux: {
        include: {
          classes: {
            include: {
              _count: {
                select: {
                  inscriptions: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              inscriptions: true,
            },
          },
        },
      },
      _count: {
        select: {
          niveaux: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getTypeEnseignementById = async (id: number) => {
  return await prisma.typeEnseignement.findUnique({
    where: { id },
    include: {
      niveaux: {
        include: {
          classes: {
            include: {
              _count: {
                select: {
                  inscriptions: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              inscriptions: true,
            },
          },
        },
      },
      _count: {
        select: {
          niveaux: true,
        },
      },
    },
  });
};

const createTypeEnseignement = async (data: TypeEnseignementCreateData) => {
  return await prisma.typeEnseignement.create({
    data,
    include: {
      niveaux: true,
    },
  });
};

const updateTypeEnseignement = async (id: number, data: TypeEnseignementUpdateData) => {
  return await prisma.typeEnseignement.update({
    where: { id },
    data,
    include: {
      niveaux: true,
    },
  });
};

const deleteTypeEnseignement = async (id: number) => {
  // Vérifier si le type d'enseignement existe et récupérer ses associations
  const typeEnseignement = await prisma.typeEnseignement.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          niveaux: true,
        },
      },
    },
  });

  if (!typeEnseignement) {
    throw new Error('Type d\'enseignement introuvable');
  }

  // Vérifier s'il y a des niveaux associés
  if (typeEnseignement._count.niveaux > 0) {
    throw new Error(`Impossible de supprimer ce type d'enseignement. ${typeEnseignement._count.niveaux} niveau(x) y sont associé(s). Veuillez d'abord supprimer ces niveaux.`);
  }

  return await prisma.typeEnseignement.delete({
    where: { id },
  });
};

export default {
  getAllTypeEnseignements,
  getTypeEnseignementById,
  createTypeEnseignement,
  updateTypeEnseignement,
  deleteTypeEnseignement,
};
