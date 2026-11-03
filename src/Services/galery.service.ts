import { PrismaClient, Gallery } from '@prisma/client';
import { GaleryCreateData, GaleryUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllGaleries = async () => {
  return await prisma.gallery.findMany({
    include: {
      type: true,
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getGaleryById = async (id: number) => {
  return await prisma.gallery.findUnique({
    where: { id },
    include: {
      type: true,
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

const createGalery = async (data: GaleryCreateData) => {
  return await prisma.gallery.create({
    data,
    include: {
      type: true,
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
  });
};

const updateGalery = async (id: number, data: GaleryUpdateData) => {
  return await prisma.gallery.update({
    where: { id },
    data,
    include: {
      type: true,
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
  });
};

const deleteGalery = async (id: number) => {
  return await prisma.gallery.delete({
    where: { id },
  });
};

const getGaleriesByType = async (type: string) => {
  return await prisma.gallery.findMany({
    where: {
      type: {
        nom: type,
      },
    },
    include: {
      type: true,
      user: {
        select: {
          nom: true,
          prenom: true,
        },
      },
    },
    orderBy: { id: 'desc' }
  });
};

export default {
  getAllGaleries,
  getGaleryById,
  createGalery,
  updateGalery,
  deleteGalery,
  getGaleriesByType,
};