import { PrismaClient, Specialite } from '@prisma/client';
import { SpecialiteCreateData, SpecialiteUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllSpecialites = async () => {
  return await prisma.specialite.findMany({
    include: {
      filiere: true,
      matieres: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getSpecialiteById = async (id: number) => {
  return await prisma.specialite.findUnique({
    where: { id },
    include: {
      filiere: {
        include: {
          eleves: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
        },
      },
      matieres: {
        include: {
          eleves: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const createSpecialite = async (data: SpecialiteCreateData) => {
  return await prisma.specialite.create({
    data,
    include: {
      filiere: true,
      matieres: true,
    },
  });
};

const updateSpecialite = async (id: number, data: SpecialiteUpdateData) => {
  return await prisma.specialite.update({
    where: { id },
    data,
    include: {
      filiere: true,
      matieres: true,
    },
  });
};

const deleteSpecialite = async (id: number) => {
  // Vérifier si la spécialité a des associations
  const specialite = await prisma.specialite.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          matieres: true,
        },
      },
    },
  });

  if (!specialite) {
    throw new Error('Spécialité introuvable');
  }

  // Vérifier hasAssociation
  if (specialite.hasAssociation && specialite._count.matieres > 0) {
    throw new Error(`Impossible de supprimer cette spécialité. ${specialite._count.matieres} matière(s) y sont associée(s).`);
  }

  return await prisma.specialite.delete({
    where: { id },
  });
};

const getSpecialitesByFiliere = async (filiereId: number) => {
  return await prisma.specialite.findMany({
    where: { filiereId },
    include: {
      matieres: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

const addMatiereToSpecialite = async (specialiteId: number, matiereId: number) => {
  return await prisma.specialite.update({
    where: { id: specialiteId },
    data: {
      matieres: {
        connect: { id: matiereId },
      },
    },
    include: {
      matieres: true,
    },
  });
};

const removeMatiereFromSpecialite = async (specialiteId: number, matiereId: number) => {
  return await prisma.specialite.update({
    where: { id: specialiteId },
    data: {
      matieres: {
        disconnect: { id: matiereId },
      },
    },
    include: {
      matieres: true,
    },
  });
};

export default {
  getAllSpecialites,
  getSpecialiteById,
  createSpecialite,
  updateSpecialite,
  deleteSpecialite,
  getSpecialitesByFiliere,
  addMatiereToSpecialite,
  removeMatiereFromSpecialite,
};