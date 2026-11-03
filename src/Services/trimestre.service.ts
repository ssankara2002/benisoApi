import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer un trimestre
export const createTrimestre = async (data: {
  nom: string;
  dateDebut?: Date;
  dateFin?: Date;
  anneeId: number;
}) => {
  // Vérifier le chevauchement des dates si dateDebut et dateFin sont définis
  if (data.dateDebut && data.dateFin) {
    const existingTrimestres = await prisma.trimestre.findMany({
      where: {
        AND: [
          { anneeId: data.anneeId }, // Vérifier uniquement les trimestres de la même année
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

    if (existingTrimestres.length > 0) {
      throw new Error(
        `L'intervalle de dates se chevauche avec le trimestre "${existingTrimestres[0].nom}" (${new Date(existingTrimestres[0].dateDebut!).toLocaleDateString()} - ${new Date(existingTrimestres[0].dateFin!).toLocaleDateString()})`
      );
    }
  }

  return await prisma.trimestre.create({
    data: {
      nom: data.nom,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      anneeId: data.anneeId,
    },
    include: {
      annee: true,
    },
  });
};

// Récupérer tous les trimestres
export const getAllTrimestres = async () => {
  return await prisma.trimestre.findMany({
    include: {
      annee: true,
      _count: {
        select: {
          evaluations: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Récupérer les trimestres par année
export const getTrimestresByAnnee = async (anneeId: number) => {
  return await prisma.trimestre.findMany({
    where: {
      anneeId: anneeId,
    },
    include: {
      annee: true,
      _count: {
        select: {
          evaluations: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });
};

// Récupérer un trimestre par ID
export const getTrimestreById = async (id: number) => {
  const trimestre = await prisma.trimestre.findUnique({
    where: { id },
    include: {
      annee: true,
      _count: {
        select: {
          evaluations: true,
        },
      },
    },
  });

  if (!trimestre) {
    throw new Error('Trimestre non trouvé');
  }

  return trimestre;
};

// Mettre à jour un trimestre
export const updateTrimestre = async (
  id: number,
  data: {
    nom?: string;
    dateDebut?: Date;
    dateFin?: Date;
    anneeId?: number;
  }
) => {
  const trimestre = await prisma.trimestre.findUnique({
    where: { id },
  });

  if (!trimestre) {
    throw new Error('Trimestre non trouvé');
  }

  // Déterminer les valeurs finales après la mise à jour
  const finalDateDebut = data.dateDebut !== undefined ? data.dateDebut : trimestre.dateDebut;
  const finalDateFin = data.dateFin !== undefined ? data.dateFin : trimestre.dateFin;
  const finalAnneeId = data.anneeId !== undefined ? data.anneeId : trimestre.anneeId;

  // Vérifier le chevauchement des dates si dateDebut et dateFin sont définis
  if (finalDateDebut && finalDateFin) {
    const existingTrimestres = await prisma.trimestre.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclure le trimestre en cours de modification
          { anneeId: finalAnneeId }, // Vérifier uniquement les trimestres de la même année
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

    if (existingTrimestres.length > 0) {
      throw new Error(
        `L'intervalle de dates se chevauche avec le trimestre "${existingTrimestres[0].nom}" (${new Date(existingTrimestres[0].dateDebut!).toLocaleDateString()} - ${new Date(existingTrimestres[0].dateFin!).toLocaleDateString()})`
      );
    }
  }

  return await prisma.trimestre.update({
    where: { id },
    data: {
      nom: data.nom,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      anneeId: data.anneeId,
    },
    include: {
      annee: true,
    },
  });
};

// Supprimer un trimestre
export const deleteTrimestre = async (id: number) => {
  const trimestre = await prisma.trimestre.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          evaluations: true,
        },
      },
    },
  });

  if (!trimestre) {
    throw new Error('Trimestre non trouvé');
  }

  // Vérifier s'il y a des évaluations associées
  if (trimestre._count.evaluations > 0) {
    throw new Error(
      `Impossible de supprimer ce trimestre car il contient ${trimestre._count.evaluations} évaluation(s)`
    );
  }

  return await prisma.trimestre.delete({
    where: { id },
  });
};

export default {
  createTrimestre,
  getAllTrimestres,
  getTrimestresByAnnee,
  getTrimestreById,
  updateTrimestre,
  deleteTrimestre,
};
