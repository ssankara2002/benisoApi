import { PrismaClient, Evenement } from '@prisma/client';
import { EvenementCreateData, EvenementUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllEvenements = async () => {
  return await prisma.evenement.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });
};

const getEvenementById = async (id: number) => {
  return await prisma.evenement.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
};

const createEvenement = async (data: EvenementCreateData) => {
  return await prisma.evenement.create({
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
  });
};

const updateEvenement = async (id: number, data: EvenementUpdateData) => {
  return await prisma.evenement.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
  });
};

const deleteEvenement = async (id: number) => {
  // Vérifier si l'événement existe
  const evenement = await prisma.evenement.findUnique({
    where: { id },
  });

  if (!evenement) {
    throw new Error('Événement introuvable');
  }

  // Note: Evenement n'a pas de relations sortantes selon le schéma
  // hasAssociation est présent mais il n'y a pas de relations à vérifier

  return await prisma.evenement.delete({
    where: { id },
  });
};

// getEvenementsByMatiere removed: matiere-based filtering is not exposed in the API

const getEvenementsByPeriod = async (startDate: Date, endDate: Date) => {
  return await prisma.evenement.findMany({
    where: {
      OR: [
        {
          dateDebut: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          dateFin: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });
};

export default {
  getAllEvenements,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement,
  getEvenementsByPeriod,
};
