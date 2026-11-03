import { PrismaClient } from '@prisma/client';
import { EvaluationCreateData, EvaluationUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllEvaluations = async () => {
  return await prisma.evaluation.findMany({
    include: {
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
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: {
        include: {
          annee: true,
        },
      },
      annee: true,
      notes: {
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
        orderBy: {
          eleve: {
            user: {
              nom: 'asc',
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });
};

const getEvaluationById = async (id: number) => {
  return await prisma.evaluation.findUnique({
    where: { id },
    include: {
      staff: {
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
            },
          },
        },
      },
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: true,
      notes: {
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
        orderBy: {
          eleve: {
            user: {
              nom: 'asc',
            },
          },
        },
      },
    },
  });
};

const createEvaluation = async (data: EvaluationCreateData) => {
  return await prisma.evaluation.create({
    data: {
      date: data.date,
      type: data.type || '',
      staffId: data.staffId,
      matiereId: data.matiereId,
      classeId: data.classeId,
      trimestreId: data.trimestreId,
      anneeId: data.anneeId,
    },
    include: {
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
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: {
        include: {
          annee: true,
        },
      },
      annee: true,
    },
  });
};

const updateEvaluation = async (id: number, data: EvaluationUpdateData) => {
  const prismaData: any = {};

  if (data.date !== undefined) prismaData.date = data.date;
  if (data.type !== undefined) prismaData.type = data.type;
  if (data.matiereId !== undefined) prismaData.matiereId = data.matiereId;
  if (data.classeId !== undefined) prismaData.classeId = data.classeId;
  if (data.trimestreId !== undefined) prismaData.trimestreId = data.trimestreId;
  if (data.staffId !== undefined) prismaData.staffId = data.staffId;
  if (data.anneeId !== undefined) prismaData.anneeId = data.anneeId;

  return await prisma.evaluation.update({
    where: { id },
    data: prismaData,
    include: {
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
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: {
        include: {
          annee: true,
        },
      },
      annee: true,
      notes: {
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
        orderBy: {
          eleve: {
            user: {
              nom: 'asc',
            },
          },
        },
      },
    },
  });
};

const deleteEvaluation = async (id: number) => {
  // Vérifier si l'évaluation a des associations
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          notes: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error('Évaluation introuvable');
  }

  // Vérifier hasAssociation
  if (evaluation.hasAssociation && evaluation._count.notes > 0) {
    throw new Error(`Impossible de supprimer cette évaluation. ${evaluation._count.notes} note(s) y sont associée(s).`);
  }

  return await prisma.evaluation.delete({
    where: { id },
  });
};

const getEvaluationsByMatiere = async (matiereId: number) => {
  return await prisma.evaluation.findMany({
    where: {
      matiereId: matiereId,
    },
    include: {
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
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: {
        include: {
          annee: true,
        },
      },
      annee: true,
      notes: {
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
    },
    orderBy: { date: 'desc' },
  });
};

const getEvaluationsByClasse = async (classeId: number) => {
  return await prisma.evaluation.findMany({
    where: {
      classeId: classeId,
    },
    include: {
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
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: {
        include: {
          annee: true,
        },
      },
      annee: true,
      notes: {
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
    },
    orderBy: { date: 'desc' },
  });
};

const getEvaluationsByAnnee = async (anneeId: number) => {
  return await prisma.evaluation.findMany({
    where: {
      trimestre: {
        anneeId: anneeId,
      },
    },
    include: {
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
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      classe: {
        include: {
          niveau: true,
        },
      },
      trimestre: {
        include: {
          annee: true,
        },
      },
      notes: {
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
    },
    orderBy: { date: 'desc' },
  });
};

export default {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationsByMatiere,
  getEvaluationsByClasse,
  getEvaluationsByAnnee,
};