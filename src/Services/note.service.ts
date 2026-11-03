import { PrismaClient, Note } from '@prisma/client';
import { NoteCreateData, NoteUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllNotes = async () => {
  return await prisma.note.findMany({
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
      evaluation: {
        include: {
          matiere: true,
          classe: true,
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
    },
    orderBy: {
      evaluation: {
        date: 'desc',
      },
    },
  });
};

const getNoteById = async (id: number) => {
  return await prisma.note.findUnique({
    where: { id },
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
          parents: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      evaluation: {
        include: {
          matiere: true,
          classe: true,
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
    },
  });
};

const createNote = async (data: NoteCreateData) => {
  return await prisma.note.create({
    data: {
      valeur: data.valeur,
      eleveId: data.eleveId,
      evaluationId: data.evaluationId,
    },
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
      evaluation: {
        include: {
          matiere: true,
          classe: true,
        },
      },
    },
  });
};

const updateNote = async (id: number, data: NoteUpdateData) => {
  const updateData: any = {};
  if (data.valeur !== undefined) updateData.valeur = data.valeur;
  if (data.eleveId !== undefined) updateData.eleveId = data.eleveId;
  if (data.evaluationId !== undefined) updateData.evaluationId = data.evaluationId;

  return await prisma.note.update({
    where: { id },
    data: updateData,
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
      evaluation: {
        include: {
          matiere: true,
          classe: true,
        },
      },
    },
  });
};

const deleteNote = async (id: number) => {
  return await prisma.note.delete({
    where: { id },
  });
};

const getNotesByEleve = async (eleveId: number) => {
  return await prisma.note.findMany({
    where: { eleveId },
    include: {
      evaluation: {
        include: {
          matiere: true,
          classe: true,
        },
      },
    },
    orderBy: {
      evaluation: {
        date: 'desc',
      },
    },
  });
};

const getNotesByEvaluation = async (evaluationId: number) => {
  return await prisma.note.findMany({
    where: { evaluationId },
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
      evaluation: {
        include: {
          matiere: true,
          classe: true,
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
  });
};

const getNotesByMatiere = async (matiereId: number) => {
  return await prisma.note.findMany({
    where: {
      evaluation: {
        matiereId: matiereId,
      },
    },
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
      evaluation: {
        include: {
          matiere: true,
          classe: true,
        },
      },
    },
    orderBy: {
      evaluation: {
        date: 'desc',
      },
    },
  });
};

const getStatistiquesNotes = async (evaluationId: number) => {
  const stats = await prisma.note.aggregate({
    where: { evaluationId },
    _avg: {
      valeur: true,
    },
    _max: {
      valeur: true,
    },
    _min: {
      valeur: true,
    },
    _count: true,
  });

  return stats;
};

/**
 * Récupère toutes les notes d'un élève groupées par matière
 */
const getNotesByEleveGroupedByMatiere = async (eleveId: number, anneeId?: number) => {
  // Construire la condition where
  const whereCondition: any = {
    eleveId,
  };

  // Si une année est spécifiée, filtrer par année
  if (anneeId) {
    whereCondition.evaluation = {
      anneeId,
    };
  }

  const notes = await prisma.note.findMany({
    where: whereCondition,
    include: {
      evaluation: {
        include: {
          matiere: true,
          classe: true,
          annee: true,
        },
      },
    },
    orderBy: [
      {
        evaluation: {
          matiere: {
            libelle: 'asc',
          },
        },
      },
      {
        evaluation: {
          date: 'desc',
        },
      },
    ],
  });

  // Grouper les notes par matière
  interface NoteParMatiere {
    matiereId: number;
    matiere: string;
    notes: Array<{
      id: number;
      valeur: number;
      typeEvaluation: string;
      date: Date;
      evaluationId: number;
    }>;
    nombreNotes: number;
    moyenne: number | null;
  }

  const notesGroupees: { [matiereId: number]: NoteParMatiere } = {};

  notes.forEach((note) => {
    const matiere = note.evaluation?.matiere;
    if (!matiere) return;

    const matiereId = matiere.id;

    if (!notesGroupees[matiereId]) {
      notesGroupees[matiereId] = {
        matiereId,
        matiere: matiere.libelle,
        notes: [],
        nombreNotes: 0,
        moyenne: null,
      };
    }

    notesGroupees[matiereId].notes.push({
      id: note.id,
      valeur: note.valeur,
      typeEvaluation: note.evaluation?.type || 'Non spécifié',
      date: note.evaluation?.date || new Date(),
      evaluationId: note.evaluation?.id || 0,
    });
  });

  // Calculer la moyenne pour chaque matière
  Object.values(notesGroupees).forEach((groupe) => {
    groupe.nombreNotes = groupe.notes.length;
    if (groupe.nombreNotes > 0) {
      const somme = groupe.notes.reduce((acc, note) => acc + note.valeur, 0);
      groupe.moyenne = somme / groupe.nombreNotes;
    }
  });

  // Convertir en tableau et trier par nom de matière
  return Object.values(notesGroupees).sort((a, b) =>
    a.matiere.localeCompare(b.matiere)
  );
};

export default {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNotesByEleve,
  getNotesByEvaluation,
  getNotesByMatiere,
  getStatistiquesNotes,
  getNotesByEleveGroupedByMatiere,
};