import { PrismaClient, Actualite } from '@prisma/client';
import { ActualiteCreateData, ActualiteUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

/**
 * Récupère toutes les actualités avec leurs relations.
 */
const getAllActualites = async (): Promise<Actualite[]> => {
  return prisma.actualite.findMany({
    include: {
      type: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
};

/**
 * Récupère une actualité par son ID.
 */
const getActualiteById = async (id: number): Promise<Actualite | null> => {
  return prisma.actualite.findUnique({
    where: { id },
    include: {
      type: true,
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Crée une nouvelle actualité.
 */
const createActualite = async (data: ActualiteCreateData): Promise<Actualite> => {
  return prisma.actualite.create({
    data: {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });
};

/**
 * Met à jour une actualité existante.
 */
const updateActualite = async (id: number, data: ActualiteUpdateData): Promise<Actualite> => {
  return prisma.actualite.update({
    where: { id },
    data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
    },
  });
};

/**
 * Supprime une actualité.
 */
const deleteActualite = async (id: number): Promise<Actualite> => {
  return prisma.actualite.delete({
    where: { id },
  });
};

export default {
  getAllActualites,
  getActualiteById,
  createActualite,
  updateActualite,
  deleteActualite,
};