import { PrismaClient, SiteEleve } from '@prisma/client';
import { SiteEleveCreateData, SiteEleveUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllSiteEleves = async () => {
  return await prisma.siteEleve.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getSiteEleveById = async (id: number) => {
  return await prisma.siteEleve.findUnique({
    where: { id },
    include: {
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

const createSiteEleve = async (data: SiteEleveCreateData) => {
  return await prisma.siteEleve.create({
    data,
    include: {
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

const updateSiteEleve = async (id: number, data: SiteEleveUpdateData) => {
  return await prisma.siteEleve.update({
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
    },
  });
};

const deleteSiteEleve = async (id: number) => {
  return await prisma.siteEleve.delete({
    where: { id },
  });
};

const addCoursToSiteEleve = async (siteEleveId: number, coursId: number) => {
  // SiteEleve n'a pas de relation cours dans le schema
  throw new Error('SiteEleve n\'a pas de relation cours');
};

const removeCoursFromSiteEleve = async (siteEleveId: number, coursId: number) => {
  // SiteEleve n'a pas de relation cours dans le schema
  throw new Error('SiteEleve n\'a pas de relation cours');
};

export default {
  getAllSiteEleves,
  getSiteEleveById,
  createSiteEleve,
  updateSiteEleve,
  deleteSiteEleve,
  addCoursToSiteEleve,
  removeCoursFromSiteEleve,
};