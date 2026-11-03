import { PrismaClient, Filiere } from '@prisma/client';
import { FiliereCreateData, FiliereUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllFilieres = async () => {
  return await prisma.filiere.findMany({
    include: {
      specialites: {
        include: {
          matieres: true,
        },
      },
      eleves: {
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
    orderBy: { createdAt: 'desc' }
  });
};

const getFiliereById = async (id: number) => {
  return await prisma.filiere.findUnique({
    where: { id },
    include: {
      specialites: {
        include: {
          matieres: {
            include: {
              eleves: {
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
          },
        },
      },
      eleves: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
          inscriptions: {
            include: {
              annee: true,
            },
          },
        },
      },
    },
  });
};

const createFiliere = async (data: FiliereCreateData) => {
  return await prisma.filiere.create({
    data,
    include: {
      specialites: true,
    },
  });
};

const updateFiliere = async (id: number, data: FiliereUpdateData) => {
  return await prisma.filiere.update({
    where: { id },
    data,
    include: {
      specialites: {
        include: {
          matieres: true,
        },
      },
      eleves: {
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
};

const deleteFiliere = async (id: number) => {
  // Vérifier si la filière a des associations
  const filiere = await prisma.filiere.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          specialites: true,
          eleves: true,
        },
      },
    },
  });

  if (!filiere) {
    throw new Error('Filière introuvable');
  }

  // Vérifier hasAssociation
  if (filiere.hasAssociation) {
    const errors: string[] = [];

    if (filiere._count.specialites > 0) {
      errors.push(`${filiere._count.specialites} spécialité(s)`);
    }
    if (filiere._count.eleves > 0) {
      errors.push(`${filiere._count.eleves} élève(s)`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer cette filière. Elle est associée à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.filiere.delete({
    where: { id },
  });
};

export default {
  getAllFilieres,
  getFiliereById,
  createFiliere,
  updateFiliere,
  deleteFiliere,
};