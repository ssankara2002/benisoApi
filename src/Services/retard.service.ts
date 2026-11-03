import { PrismaClient, Retard } from '@prisma/client';
import { RetardCreateData, RetardUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllRetards = async () => {
  return await prisma.retard.findMany({
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
    },
    orderBy: { date: 'desc' }
  });
};

const getRetardById = async (id: number) => {
  return await prisma.retard.findUnique({
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
    },
  });
};

const createRetard = async (data: RetardCreateData) => {

  const prismaData: any = {
    date: data.date,
    justification: data.justification,
    confProf: data.confProf,
    eleveId: data.eleveId,
    matiereId: data.matiereId,
    classeId: data.classeId,
    autorisation:data.autorisation,
    ...(data.userId ? { userId: data.userId } : {}),
  };


  return await prisma.retard.create({
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
    },
  });
};

const updateRetard = async (id: number, data: RetardUpdateData) => {

  const prismaData: any = {
    ...(data.date !== undefined ? { date: data.date } : {}),
    justification: data.justification,
    confProf: data.confProf,
    eleveId: data.eleveId,
    matiereId: data.matiereId,
    ...(data.classeId !== undefined ? { classeId: data.classeId } : {}),
    autorisation:data.autorisation,
  };


  return await prisma.retard.update({
    where: { id },
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
    },
  });
};

const deleteRetard = async (id: number) => {
  return await prisma.retard.delete({
    where: { id },
  });
};

const getRetardsByEleve = async (eleveId: number) => {
  return await prisma.retard.findMany({
    where: { eleveId },
    include: {
      matiere: true,
    },
    orderBy: { date: 'desc' }
  });
};

const getRetardsByMatiere = async (matiereId: number) => {
  return await prisma.retard.findMany({
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
    },
    orderBy: { date: 'desc' }
  });
};

const getRetardsByPeriod = async (startDate: Date, endDate: Date) => {
  return await prisma.retard.findMany({
    where: {
      date: {
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
    },
    orderBy: { date: 'desc' }
  });
};

export default {
  getAllRetards,
  getRetardById,
  createRetard,
  updateRetard,
  deleteRetard,
  getRetardsByEleve,
  getRetardsByMatiere,
  getRetardsByPeriod,
};