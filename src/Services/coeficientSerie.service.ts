import { PrismaClient, CoeficientSerie } from '@prisma/client';
import { CoeficientSerieCreateData, CoeficientSerieUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllCoeficientSeries = async () => {
  return await prisma.coeficientSerie.findMany({
    include: {
      matiere: true,
      serie: true,
      niveau: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getCoeficientSerieById = async (id: number) => {
  return await prisma.coeficientSerie.findUnique({
    where: { id },
    include: {
      matiere: true,
      serie: true,
      niveau: true,
    },
  });
};

const createCoeficientSerie = async (data: CoeficientSerieCreateData) => {
  return await prisma.coeficientSerie.create({
    data,
    include: {
      matiere: true,
      serie: true,
      niveau: true,
    },
  });
};

const updateCoeficientSerie = async (id: number, data: CoeficientSerieUpdateData) => {
  return await prisma.coeficientSerie.update({
    where: { id },
    data,
    include: {
      matiere: true,
      serie: true,
      niveau: true,
    },
  });
};

const deleteCoeficientSerie = async (id: number) => {
  // Vérifier si le coefficient série existe
  const coeficient = await prisma.coeficientSerie.findUnique({
    where: { id },
  });

  if (!coeficient) {
    throw new Error('Coefficient série introuvable');
  }

  // Vérifier hasAssociation
  if (coeficient.hasAssociation) {
    throw new Error(`Impossible de supprimer ce coefficient série car il est associé.`);
  }

  return await prisma.coeficientSerie.delete({
    where: { id },
  });
};

export default {
  getAllCoeficientSeries,
  getCoeficientSerieById,
  createCoeficientSerie,
  updateCoeficientSerie,
  deleteCoeficientSerie,
};
