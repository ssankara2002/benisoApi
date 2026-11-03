import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const includeComplet = {
  classe: { select: { id: true, nom: true } },
  matiere: { select: { id: true, libelle: true } },
  staff: { include: { user: { select: { nom: true, prenom: true } } } },
  annee: { select: { id: true, dateDebut: true, dateFin: true } },
  trimestre: { select: { id: true, nom: true } },
};

const getAllEmploisDuTemps = async () => {
  return await prisma.emploiDuTemps.findMany({
    include: includeComplet,
    orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
  });
};

const getEmploiDuTempsById = async (id: number) => {
  return await prisma.emploiDuTemps.findUnique({
    where: { id },
    include: { ...includeComplet, seances: { include: { cahierTexte: true }, orderBy: { date: 'desc' } } },
  });
};

const getEmploiDuTempsByClasse = async (classeId: number, anneeId?: number, trimestreId?: number) => {
  return await prisma.emploiDuTemps.findMany({
    where: {
      classeId,
      ...(anneeId ? { anneeId } : {}),
      ...(trimestreId ? { trimestreId } : {}),
      actif: true,
    },
    include: includeComplet,
    orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
  });
};

const getEmploiDuTempsByStaff = async (staffId: number, anneeId?: number) => {
  return await prisma.emploiDuTemps.findMany({
    where: {
      staffId,
      ...(anneeId ? { anneeId } : {}),
      actif: true,
    },
    include: includeComplet,
    orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
  });
};

const createEmploiDuTemps = async (data: any) => {
  return await prisma.emploiDuTemps.create({
    data,
    include: includeComplet,
  });
};

const updateEmploiDuTemps = async (id: number, data: any) => {
  return await prisma.emploiDuTemps.update({
    where: { id },
    data,
    include: includeComplet,
  });
};

const deleteEmploiDuTemps = async (id: number) => {
  return await prisma.emploiDuTemps.delete({ where: { id } });
};

export default {
  getAllEmploisDuTemps,
  getEmploiDuTempsById,
  getEmploiDuTempsByClasse,
  getEmploiDuTempsByStaff,
  createEmploiDuTemps,
  updateEmploiDuTemps,
  deleteEmploiDuTemps,
};
