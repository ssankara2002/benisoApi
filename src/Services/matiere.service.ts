import { PrismaClient, Matiere } from '@prisma/client';
import { MatiereCreateData, MatiereUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllMatieres = async () => {
  return await prisma.matiere.findMany({
    include: {
      typeMatiere: true,
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
      evaluations: {
        include: {
          classe: true,
          trimestre: true,
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
      },
      retards: true,
      absences: true,
      specialites: true,
      videos: true,
      cours: true,
      _count: {
        select: {
          eleves: true,
          evaluations: true,
          retards: true,
          absences: true,
          specialites: true,
          videos: true,
          cours: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getMatiereById = async (id: number) => {
  return await prisma.matiere.findUnique({
    where: { id },
    include: {
      typeMatiere: true,
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
      evaluations: {
        include: {
          classe: {
            include: {
              niveau: true,
            },
          },
          trimestre: true,
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
          notes: true,
        },
        orderBy: { date: 'desc' },
      },
      retards: {
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
          classe: true,
        },
        orderBy: { date: 'desc' },
      },
      absences: {
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
          classe: true,
        },
        orderBy: { dateDebut: 'desc' },
      },
      specialites: {
        include: {
          filiere: true,
        },
      },
      videos: true,
      cours: true,
    },
  });
};

const createMatiere = async (data: MatiereCreateData) => {
  return await prisma.matiere.create({
    data,
    include: {
      typeMatiere: true,
      specialites: true,
    },
  });
};

const updateMatiere = async (id: number, data: MatiereUpdateData) => {
  return await prisma.matiere.update({
    where: { id },
    data,
    include: {
      typeMatiere: true,
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
      specialites: {
        include: {
          filiere: true,
        },
      },
    },
  });
};

const deleteMatiere = async (id: number) => {
  // Vérifier si la matière a des associations
  const matiere = await prisma.matiere.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          eleves: true,
          evaluations: true,
          retards: true,
          absences: true,
          specialites: true,
          videos: true,
          cours: true,
          coeficientsNiveau: true,
          coefficientsSerie: true,
        },
      },
    },
  });

  if (!matiere) {
    throw new Error('Matière introuvable');
  }

  // Vérifier hasAssociation
  if (matiere.hasAssociation) {
    const errors: string[] = [];

    if (matiere._count.eleves > 0) {
      errors.push(`${matiere._count.eleves} élève(s)`);
    }
    if (matiere._count.evaluations > 0) {
      errors.push(`${matiere._count.evaluations} évaluation(s)`);
    }
    if (matiere._count.retards > 0) {
      errors.push(`${matiere._count.retards} retard(s)`);
    }
    if (matiere._count.absences > 0) {
      errors.push(`${matiere._count.absences} absence(s)`);
    }
    if (matiere._count.specialites > 0) {
      errors.push(`${matiere._count.specialites} spécialité(s)`);
    }
    if (matiere._count.videos > 0) {
      errors.push(`${matiere._count.videos} vidéo(s)`);
    }
    if (matiere._count.cours > 0) {
      errors.push(`${matiere._count.cours} cours`);
    }
    if (matiere._count.coeficientsNiveau > 0) {
      errors.push(`${matiere._count.coeficientsNiveau} coefficient(s) de niveau`);
    }
    if (matiere._count.coefficientsSerie > 0) {
      errors.push(`${matiere._count.coefficientsSerie} coefficient(s) de série`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer cette matière. Elle est associée à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.matiere.delete({
    where: { id },
  });
};

const addEleveToMatiere = async (matiereId: number, eleveId: number) => {
  return await prisma.matiere.update({
    where: { id: matiereId },
    data: {
      eleves: {
        connect: { id: eleveId },
      },
    },
    include: {
      typeMatiere: true,
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

const removeEleveFromMatiere = async (matiereId: number, eleveId: number) => {
  return await prisma.matiere.update({
    where: { id: matiereId },
    data: {
      eleves: {
        disconnect: { id: eleveId },
      },
    },
    include: {
      typeMatiere: true,
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

const getMatieresBySerie = async (serieId: number) => {
  return await prisma.matiere.findMany({
    include: {
      typeMatiere: true,
      _count: {
        select: {
          eleves: true,
          evaluations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export default {
  getAllMatieres,
  getMatiereById,
  createMatiere,
  updateMatiere,
  deleteMatiere,
  addEleveToMatiere,
  removeEleveFromMatiere,
  getMatieresBySerie,
};
