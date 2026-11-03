import { PrismaClient, Annee } from '@prisma/client';
import { AnneeCreateData, AnneeUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllAnnees = async () => {
  return await prisma.annee.findMany({
    include: {
      inscriptions: {
        include: {
          eleve: {
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
    orderBy: { createdAt: 'desc' }
  });
};

const getAnneeById = async (id: number) => {
  return await prisma.annee.findUnique({
    where: { id },
    include: {
      inscriptions: {
        include: {
          eleve: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
          paiements: true,
        },
      },
    },
  });
};

const createAnnee = async (data: AnneeCreateData) => {
  // Vérifier le chevauchement des dates si dateDebut et dateFin sont définis
  if (data.dateDebut && data.dateFin) {
    const existingAnnees = await prisma.annee.findMany({
      where: {
        AND: [
          { dateDebut: { not: null } },
          { dateFin: { not: null } },
          {
            OR: [
              {
                AND: [
                  { dateDebut: { lte: data.dateFin } },
                  { dateFin: { gte: data.dateDebut } },
                ],
              },
            ],
          },
        ],
      },
    });

    if (existingAnnees.length > 0) {
      throw new Error(
        `L'intervalle de dates se chevauche avec une année existante (${new Date(existingAnnees[0].dateDebut!).toLocaleDateString()} - ${new Date(existingAnnees[0].dateFin!).toLocaleDateString()})`
      );
    }
  }

  return await prisma.annee.create({
    data,
    include: {
      inscriptions: true,
    },
  });
};

const updateAnnee = async (id: number, data: AnneeUpdateData) => {
  // Récupérer l'année actuelle
  const currentAnnee = await prisma.annee.findUnique({
    where: { id },
  });

  if (!currentAnnee) {
    throw new Error('Année introuvable');
  }

  // Déterminer les dates finales après la mise à jour
  const finalDateDebut = data.dateDebut !== undefined ? data.dateDebut : currentAnnee.dateDebut;
  const finalDateFin = data.dateFin !== undefined ? data.dateFin : currentAnnee.dateFin;

  // Vérifier le chevauchement des dates si dateDebut et dateFin sont définis
  if (finalDateDebut && finalDateFin) {
    const existingAnnees = await prisma.annee.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclure l'année en cours de modification
          { dateDebut: { not: null } },
          { dateFin: { not: null } },
          {
            OR: [
              {
                AND: [
                  { dateDebut: { lte: finalDateFin } },
                  { dateFin: { gte: finalDateDebut } },
                ],
              },
            ],
          },
        ],
      },
    });

    if (existingAnnees.length > 0) {
      throw new Error(
        `L'intervalle de dates se chevauche avec une année existante (${new Date(existingAnnees[0].dateDebut!).toLocaleDateString()} - ${new Date(existingAnnees[0].dateFin!).toLocaleDateString()})`
      );
    }
  }

  return await prisma.annee.update({
    where: { id },
    data,
    include: {
      inscriptions: {
        include: {
          eleve: {
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

const deleteAnnee = async (id: number) => {
  // Vérifier si l'année a des associations
  const annee = await prisma.annee.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          inscriptions: true,
        },
      },
    },
  });

  if (!annee) {
    throw new Error('Année introuvable');
  }

  // Vérifier hasAssociation
  if (annee.hasAssociation) {
    const errors: string[] = [];

    if (annee._count.inscriptions > 0) {
      errors.push(`${annee._count.inscriptions} inscription(s)`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer cette année. Elle est associée à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.annee.delete({
    where: { id },
  });
};

const getCurrentAnnee = async () => {
  const now = new Date();
  return await prisma.annee.findFirst({
    where: {
      AND: [
        { dateDebut: { lte: now } },
        { dateFin: { gte: now } },
      ],
    },
    include: {
      inscriptions: true,
    },
  });
};

export default {
  getAllAnnees,
  getAnneeById,
  createAnnee,
  updateAnnee,
  deleteAnnee,
  getCurrentAnnee,
};