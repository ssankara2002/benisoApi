import { PrismaClient, Cours } from '@prisma/client';
import { CoursCreateData, CoursUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllCours = async () => {
  return await prisma.cours.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
      niveau: true,
      matiere: true,
      eleves: {
        include: {
          user: true
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getCoursById = async (id: number) => {
  return await prisma.cours.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
      niveau: true,
      matiere: true,
      eleves: {
        include: {
          user: true
        },
      },
    },
  });
};

const createCours = async (data: CoursCreateData) => {
  return await prisma.cours.create({
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
      niveau: true,
      matiere: true,
    },
  });
};

const updateCours = async (id: number, data: CoursUpdateData) => {
  return await prisma.cours.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
      niveau: true,
      matiere: true,
      eleves: {
        include: {
          user: true
        },
      },
    },
  });
};

const deleteCours = async (id: number) => {
  return await prisma.cours.delete({
    where: { id },
  });
};

const addEleveToCours = async (coursId: number, eleveId: number) => {
  return await prisma.cours.update({
    where: { id: coursId },
    data: {
      eleves: {
        connect: { id: eleveId },
      },
    },
    include: {
      eleves: {
        include: {
          user: true
        },
      },
    },
  });
};

const removeEleveFromCours = async (coursId: number, eleveId: number) => {
  return await prisma.cours.update({
    where: { id: coursId },
    data: {
      eleves: {
        disconnect: { id: eleveId },
      },
    },
    include: {
      eleves: {
        include: {
          user: true
        },
      },
    },
  });
};

export default {
  getAllCours,
  getCoursById,
  createCours,
  updateCours,
  deleteCours,
  addEleveToCours,
  removeEleveFromCours,
};