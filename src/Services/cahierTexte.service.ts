import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const includeComplet = {
  seance: {
    include: {
      emploiDuTemps: {
        include: {
          classe: { select: { id: true, nom: true } },
          matiere: { select: { id: true, libelle: true } },
        },
      },
    },
  },
  staff: { include: { user: { select: { nom: true, prenom: true } } } },
};

const getAllCahiersTexte = async () => {
  return await prisma.cahierTexte.findMany({
    include: includeComplet,
    orderBy: { createdAt: 'desc' },
  });
};

const getCahierTexteById = async (id: number) => {
  return await prisma.cahierTexte.findUnique({ where: { id }, include: includeComplet });
};

const getCahierTexteBySeance = async (seanceId: number) => {
  return await prisma.cahierTexte.findUnique({ where: { seanceId }, include: includeComplet });
};

const getCahiersTexteByClasse = async (classeId: number, dateDebut?: Date, dateFin?: Date) => {
  return await prisma.cahierTexte.findMany({
    where: {
      seance: {
        emploiDuTemps: { classeId },
        ...(dateDebut && dateFin ? { date: { gte: dateDebut, lte: dateFin } } : {}),
      },
    },
    include: includeComplet,
    orderBy: { createdAt: 'desc' },
  });
};

const getCahiersTexteByStaff = async (staffId: number) => {
  return await prisma.cahierTexte.findMany({
    where: { staffId },
    include: includeComplet,
    orderBy: { createdAt: 'desc' },
  });
};

const createCahierTexte = async (data: any) => {
  return await prisma.cahierTexte.create({ data, include: includeComplet });
};

const updateCahierTexte = async (id: number, data: any) => {
  return await prisma.cahierTexte.update({ where: { id }, data, include: includeComplet });
};

const deleteCahierTexte = async (id: number) => {
  return await prisma.cahierTexte.delete({ where: { id } });
};

const validerCahierTexte = async (id: number) => {
  return await prisma.cahierTexte.update({
    where: { id },
    data: { valide: true },
    include: includeComplet,
  });
};

export default {
  getAllCahiersTexte,
  getCahierTexteById,
  getCahierTexteBySeance,
  getCahiersTexteByClasse,
  getCahiersTexteByStaff,
  createCahierTexte,
  updateCahierTexte,
  deleteCahierTexte,
  validerCahierTexte,
};
