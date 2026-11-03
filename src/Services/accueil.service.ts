import { PrismaClient } from '@prisma/client';
import { AccueilCreateData, AccueilUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllAccueils = async () => {
  return await prisma.accueil.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getAccueilById = async (id: number) => {
  return await prisma.accueil.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        }
      }
    }
  });
};

const createAccueil = async (data: AccueilCreateData) => {
  // Vérifier s'il existe déjà un accueil
  const existingAccueil = await prisma.accueil.findFirst();

  if (existingAccueil) {
    throw new Error('Un accueil existe déjà. Veuillez mettre à jour l\'accueil existant au lieu d\'en créer un nouveau.');
  }

  return await prisma.accueil.create({
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        }
      }
    }
  });
};

const updateAccueil = async (id: number, data: AccueilUpdateData) => {
  return await prisma.accueil.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
        }
      }
    }
  });
};

const deleteAccueil = async (id: number) => {
  return await prisma.accueil.delete({
    where: { id },
  });
};

const getAccueilsByUser = async (userId: number) => {
  return await prisma.accueil.findMany({
    where: { userId },
    orderBy: { nom: 'asc' }
  });
};

export default {
  getAllAccueils,
  getAccueilById,
  createAccueil,
  updateAccueil,
  deleteAccueil,
  getAccueilsByUser,
};