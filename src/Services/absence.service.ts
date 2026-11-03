import { PrismaClient, Absence } from '@prisma/client';
import { AbsenceCreateData, AbsenceUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllAbsences = async () => {
  return await prisma.absence.findMany({
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
      matiere: true,
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
    orderBy: { createdAt: 'desc' }
  });
};

const getAbsenceById = async (id: number) => {
  return await prisma.absence.findUnique({
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
      matiere: true,
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

const createAbsence = async (data: AbsenceCreateData) => {
  const prismaData: any = {
    motif: data.motif,
    dateDebut: data.dateDebut,
    dateFin: data.dateFin,
    justification: data.justification,
    eleveId: data.eleveId,
    matiereId: data.matiereId,
    classeId: data.classeId,
    ...(data.staffId ? { staffId: data.staffId } : {}),
    ...(data.userId ? { userId: data.userId } : {}),
  };

  return await prisma.absence.create({
    data: prismaData,
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
      matiere: true,
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
  });
};

const updateAbsence = async (id: number, data: AbsenceUpdateData) => {
  return await prisma.absence.update({
    where: { id },
    data,
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
      matiere: true,
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
  });
};

const deleteAbsence = async (id: number) => {
  return await prisma.absence.delete({
    where: { id },
  });
};

const getAbsencesNonJustifieesEnHeures = async (eleveId: number): Promise<number> => {
  const absences = await prisma.absence.findMany({
    where: {
      eleveId,
      justification: false, // seulement les absences non justifiées
    },
    select: {
      dateDebut: true,
      dateFin: true,
    },
  });

  // Calcul du total en heures
  const totalHeures = absences.reduce((acc, absence) => {
    const debut = new Date(absence.dateDebut).getTime();
    const fin = new Date(absence.dateFin).getTime();
    const heures = (fin - debut) / (1000 * 60 * 60); // conversion ms -> heures
    return acc + heures;
  }, 0);

  return totalHeures;
};


const getAbsencesByStaff = async (staffId: number) => {
  return await prisma.absence.findMany({
    where: { staffId },
    include: {
      matiere: true,
    },
    orderBy: { dateDebut: 'desc' }
  });
};

const getAbsencesByMatiere = async (matiereId: number) => {
  return await prisma.absence.findMany({
    where: { matiereId },
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
    },
    orderBy: { dateDebut: 'desc' }
  });
};

const getAbsencesByPeriod = async (startDate: Date, endDate: Date) => {
  return await prisma.absence.findMany({
    where: {
      dateDebut: {
        gte: startDate,
        lte: endDate,
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
      matiere: true,
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
    orderBy: { dateDebut: 'desc' }
  });
};

export default {
  getAllAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence,
  getAbsencesNonJustifieesEnHeures,
  getAbsencesByStaff,
  getAbsencesByMatiere,
  getAbsencesByPeriod,
};