import { PrismaClient, Type } from '@prisma/client';
import { TypeCreateData, TypeUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

/**
 * Récupère tous les types
 */
const getAllTypes = async (): Promise<Type[]> => {
  return await prisma.type.findMany({
    include: {
      galleries: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Récupère un type par son ID
 */
const getTypeById = async (id: number): Promise<Type | null> => {
  return await prisma.type.findUnique({
    where: { id },
    include: {
      galleries: true,
    },
  });
};

/**
 * Crée un nouveau type
 */
const createType = async (data: TypeCreateData): Promise<Type> => {
  return await prisma.type.create({
    data,
    include: {
      galleries: true,
    },
  });
};

/**
 * Met à jour un type existant
 */
const updateType = async (id: number, data: TypeUpdateData): Promise<Type> => {
  return await prisma.type.update({
    where: { id },
    data,
    include: {
      galleries: true,
    },
  });
};

/**
 * Supprime un type
 */
const deleteType = async (id: number): Promise<Type> => {
  // Vérifier si le type a des associations
  const type = await prisma.type.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          galleries: true,
          actualites: true,
        },
      },
    },
  });

  if (!type) {
    throw new Error('Type introuvable');
  }

  // Vérifier hasAssociation
  if (type.hasAssociation) {
    const errors: string[] = [];

    if (type._count.galleries > 0) {
      errors.push(`${type._count.galleries} galerie(s)`);
    }
    if (type._count.actualites > 0) {
      errors.push(`${type._count.actualites} actualité(s)`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer ce type. Il est associé à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.type.delete({
    where: { id },
  });
};

export default {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
};
