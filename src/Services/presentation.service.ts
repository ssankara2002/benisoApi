import { PrismaClient, Presentation } from '@prisma/client';
import { PresentationCreateData, PresentationUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllPresentations = async () => {
  return await prisma.presentation.findMany({
    orderBy: { createdAt: 'desc' },
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

const getPresentationById = async (id: number) => {
  return await prisma.presentation.findUnique({
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

const createPresentation = async (data: PresentationCreateData) => {
  // Vérifier s'il existe déjà une présentation
  const existingPresentation = await prisma.presentation.findFirst();

  if (existingPresentation) {
    throw new Error('Une présentation existe déjà. Veuillez mettre à jour la présentation existante au lieu d\'en créer une nouvelle.');
  }

  return await prisma.presentation.create({
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

const updatePresentation = async (id: number, data: PresentationUpdateData) => {
  return await prisma.presentation.update({
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

const deletePresentation = async (id: number) => {
  return await prisma.presentation.delete({
    where: { id },
  });
};

export default {
  getAllPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation,
};