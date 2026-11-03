import { PrismaClient, CoeficientNiveau } from '@prisma/client';
import { CoeficientNiveauCreateData, CoeficientNiveauUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllCoeficientNiveaux = async () => {
  return await prisma.coeficientNiveau.findMany({
    include: {
      niveau: true,
      matiere: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getCoeficientNiveauById = async (id: number) => {
  return await prisma.coeficientNiveau.findUnique({
    where: { id },
    include: {
      niveau: true,
      matiere: true,
    },
  });
};

const createCoeficientNiveau = async (data: CoeficientNiveauCreateData) => {
  return await prisma.coeficientNiveau.create({
    data,
    include: {
      niveau: true,
      matiere: true,
    },
  });
};

const updateCoeficientNiveau = async (id: number, data: CoeficientNiveauUpdateData) => {
  return await prisma.coeficientNiveau.update({
    where: { id },
    data,
    include: {
      niveau: true,
      matiere: true,
    },
  });
};

const deleteCoeficientNiveau = async (id: number) => {
  // Vérifier si le coefficient niveau existe
  const coeficient = await prisma.coeficientNiveau.findUnique({
    where: { id },
  });

  if (!coeficient) {
    throw new Error('Coefficient niveau introuvable');
  }

  // Vérifier hasAssociation
  if (coeficient.hasAssociation) {
    throw new Error(`Impossible de supprimer ce coefficient niveau car il est associé.`);
  }

  return await prisma.coeficientNiveau.delete({
    where: { id },
  });
};

export default {
  getAllCoeficientNiveaux,
  getCoeficientNiveauById,
  createCoeficientNiveau,
  updateCoeficientNiveau,
  deleteCoeficientNiveau,
};
