import { PrismaClient, Classe } from '@prisma/client';
import { ClasseCreateData, ClasseUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllClasses = async () => {
  return await prisma.classe.findMany({
    include: {
      niveau: true,
      _count: {
        select: {
          inscriptions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getClasseById = async (id: number) => {
  return await prisma.classe.findUnique({
    where: { id },
    include: {
      niveau: true,
      inscriptions: {
        include: {
          eleve: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                  email: true,
                },
              },
              notes: {
                include: {
                  evaluation: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          inscriptions: true
        }
      }
    },
  });
};

const createClasse = async (data: ClasseCreateData) => {
  return await prisma.classe.create({
    data,
    include: {
      niveau: true,
      _count: {
        select: {
          inscriptions: true
        }
      }
    },
  });
};

const updateClasse = async (id: number, data: ClasseUpdateData) => {
  return await prisma.classe.update({
    where: { id },
    data,
    include: {
      niveau: true,
      _count: {
        select: {
          inscriptions: true
        }
      }
    },
  });
};

const deleteClasse = async (id: number) => {
  // Vérifier si la classe a des associations
  const classe = await prisma.classe.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          inscriptions: true
        },
      },
    },
  });

  if (!classe) {
    throw new Error('Classe introuvable');
  }

  // Vérifier hasAssociation
  if (classe.hasAssociation) {
    const errors: string[] = [];

    if (classe._count.inscriptions > 0) {
      errors.push(`${classe._count.inscriptions} élève(s)`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer cette classe. Elle est associée à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.classe.delete({
    where: { id },
  });
};

const getClassesByNiveau = async (niveauId: number) => {
  return await prisma.classe.findMany({
    where: { niveauId },
    include: {
      niveau: true,
      _count: {
        select: {
          inscriptions: true
        }
      }
    },
    orderBy: { nom: 'asc' }
  });
};

export default {
  getAllClasses,
  getClasseById,
  createClasse,
  updateClasse,
  deleteClasse,
  getClassesByNiveau,
};