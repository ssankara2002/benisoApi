import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const includeComplet = {
  emploiDuTemps: {
    include: {
      classe: { select: { id: true, nom: true } },
      matiere: { select: { id: true, libelle: true } },
      staff: { include: { user: { select: { nom: true, prenom: true } } } },
    },
  },
  cahierTexte: {
    include: {
      staff: { include: { user: { select: { nom: true, prenom: true } } } },
    },
  },
};

const getAllSeances = async () => {
  return await prisma.seance.findMany({
    include: includeComplet,
    orderBy: { date: 'desc' },
  });
};

const getSeanceById = async (id: number) => {
  return await prisma.seance.findUnique({ where: { id }, include: includeComplet });
};

const getSeancesByEmploiDuTemps = async (emploiDuTempsId: number) => {
  return await prisma.seance.findMany({
    where: { emploiDuTempsId },
    include: includeComplet,
    orderBy: { date: 'desc' },
  });
};

const getSeancesByClasse = async (classeId: number, dateDebut?: Date, dateFin?: Date) => {
  return await prisma.seance.findMany({
    where: {
      emploiDuTemps: { classeId },
      ...(dateDebut && dateFin ? { date: { gte: dateDebut, lte: dateFin } } : {}),
    },
    include: includeComplet,
    orderBy: { date: 'asc' },
  });
};

const getSeancesByStaff = async (staffId: number, dateDebut?: Date, dateFin?: Date) => {
  return await prisma.seance.findMany({
    where: {
      emploiDuTemps: { staffId },
      ...(dateDebut && dateFin ? { date: { gte: dateDebut, lte: dateFin } } : {}),
    },
    include: includeComplet,
    orderBy: { date: 'asc' },
  });
};

const createSeance = async (data: any) => {
  return await prisma.seance.create({ data, include: includeComplet });
};

const updateSeance = async (id: number, data: any) => {
  return await prisma.seance.update({ where: { id }, data, include: includeComplet });
};

const deleteSeance = async (id: number) => {
  return await prisma.seance.delete({ where: { id } });
};

export default {
  getAllSeances,
  getSeanceById,
  getSeancesByEmploiDuTemps,
  getSeancesByClasse,
  getSeancesByStaff,
  createSeance,
  updateSeance,
  deleteSeance,
};
