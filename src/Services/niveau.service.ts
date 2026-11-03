import { PrismaClient, Niveau } from '@prisma/client';
import { NiveauCreateData, NiveauUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllNiveaux = async () => {
  return await prisma.niveau.findMany({
    include: {
      typeEnseignement: true,
      series: true,
      _count: {
        select: {
          classes: true,
          inscriptions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getNiveauById = async (id: number) => {
  return await prisma.niveau.findUnique({
    where: { id },
    include: {
      typeEnseignement: true,
      series: true,
      classes: {
        include: {
          inscriptions: {
            include: {
              eleve: {
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
          _count: {
            select: {
              inscriptions: true
            }
          }
        },
      },
      _count: {
        select: {
          classes: true,
          inscriptions: true
        }
      }
    },
  });
};

const createNiveau = async (data: NiveauCreateData) => {
  return await prisma.niveau.create({
    data,
    include: {
      typeEnseignement: true,
      series: true,
      _count: {
        select: {
          classes: true,
          inscriptions: true
        }
      }
    },
  });
};

const updateNiveau = async (id: number, data: NiveauUpdateData) => {
  return await prisma.niveau.update({
    where: { id },
    data,
    include: {
      typeEnseignement: true,
      series: true,
      _count: {
        select: {
          classes: true,
          inscriptions: true
        }
      }
    },
  });
};

const deleteNiveau = async (id: number) => {
  // Vérifier si le niveau a des associations
  const niveau = await prisma.niveau.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          classes: true,
          videos: true,
          cours: true,
          inscriptions: true,
        },
      },
    },
  });

  if (!niveau) {
    throw new Error('Niveau introuvable');
  }

  // Vérifier hasAssociation
  if (niveau.hasAssociation) {
    const errors: string[] = [];

    if (niveau._count.classes > 0) {
      errors.push(`${niveau._count.classes} classe(s)`);
    }
    if (niveau._count.videos > 0) {
      errors.push(`${niveau._count.videos} vidéo(s)`);
    }
    if (niveau._count.cours > 0) {
      errors.push(`${niveau._count.cours} cours`);
    }
    if (niveau._count.inscriptions > 0) {
      errors.push(`${niveau._count.inscriptions} inscription(s)`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer ce niveau. Il est associé à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.niveau.delete({
    where: { id },
  });
};

const getPlacesDisponiblesByNiveau = async (niveauId: number) => {
  const niveau = await prisma.niveau.findUnique({
    where: { id: niveauId },
    include: {
      classes: {
        select: {
          id: true,
          nom: true,
          capacite: true,
          _count: {
            select: {
              inscriptions: true
            }
          }
        }
      },
      _count: {
        select: {
          inscriptions: true
        }
      }
    }
  });

  if (!niveau) {
    throw new Error('Niveau introuvable');
  }

  // Calculer la capacité totale du niveau (somme des capacités des classes)
  const capaciteTotale = niveau.classes.reduce((total, classe) => {
    return total + (classe.capacite || 0);
  }, 0);

  // Effectif total du niveau
  const effectifTotal = niveau._count.inscriptions;

  // Places disponibles
  const placesDisponibles = capaciteTotale - effectifTotal;

  return {
    niveauId,
    nomNiveau: niveau.nomNiveau,
    capaciteTotale,
    effectifTotal,
    placesDisponibles,
    classes: niveau.classes.map(classe => ({
      id: classe.id,
      nom: classe.nom,
      capacite: classe.capacite || 0,
      effectif: classe._count.inscriptions,
      placesDisponibles: (classe.capacite || 0) - classe._count.inscriptions
    }))
  };
};

export default {
  getAllNiveaux,
  getNiveauById,
  createNiveau,
  updateNiveau,
  deleteNiveau,
  getPlacesDisponiblesByNiveau,
};