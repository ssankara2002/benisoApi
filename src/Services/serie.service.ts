import { PrismaClient, Serie } from '@prisma/client';
import { SerieCreateData, SerieUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllSeries = async () => {
  return await prisma.serie.findMany({
    include: {
      niveau: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getSerieById = async (id: number) => {
  return await prisma.serie.findUnique({
    where: { id },
    include: {
      niveau: {
        include: {
          classes: true,
        },
      },
    },
  });
};

const createSerie = async (data: SerieCreateData) => {
  // Vérifier si le nom existe déjà
  const existingSerie = await prisma.serie.findUnique({
    where: { nom: data.nom },
  });

  if (existingSerie) {
    throw new Error('Une série avec ce nom existe déjà');
  }

  return await prisma.serie.create({
    data,
    include: {
      niveau: true,
    },
  });
};

const updateSerie = async (id: number, data: SerieUpdateData) => {
  // Vérifier si le nom existe déjà (sauf pour la série actuelle)
  if (data.nom) {
    const existingSerie = await prisma.serie.findUnique({
      where: { nom: data.nom },
    });

    if (existingSerie && existingSerie.id !== id) {
      throw new Error('Une série avec ce nom existe déjà');
    }
  }

  return await prisma.serie.update({
    where: { id },
    data,
    include: {
      niveau: true,
    },
  });
};

const deleteSerie = async (id: number) => {
  const serie = await prisma.serie.findUnique({
    where: { id },
  });

  if (!serie) {
    throw new Error('Série introuvable');
  }

  return await prisma.serie.delete({
    where: { id },
  });
};

const getSeriesByNiveau = async (niveauId: number) => {
  return await prisma.serie.findMany({
    where: { niveauId },
    include: {
      niveau: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const checkSerieNameExists = async (nom: string, excludeId?: number): Promise<boolean> => {
  const serie = await prisma.serie.findUnique({
    where: { nom },
  });

  if (!serie) return false;
  if (excludeId && serie.id === excludeId) return false;

  return true;
};

export default {
  getAllSeries,
  getSerieById,
  createSerie,
  updateSerie,
  deleteSerie,
  getSeriesByNiveau,
  checkSerieNameExists,
};
