import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface pour la création d'un enseignement
 */
interface EnseignementAnneeCreateData {
  staffId: number;
  matiereId: number;
  classeId: number;
  anneeId: number;
  volumeHoraire?: number;
}

/**
 * Interface pour la mise à jour d'un enseignement
 */
interface EnseignementAnneeUpdateData {
  staffId?: number;
  matiereId?: number;
  classeId?: number;
  anneeId?: number;
  volumeHoraire?: number;
}

/**
 * Récupérer tous les enseignements d'une année scolaire
 */
const getAllEnseignements = async (anneeId?: number) => {
  const where = anneeId ? { anneeId } : {};

  return await prisma.enseignementAnnee.findMany({
    where,
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
      matiere: true,
      classe: {
        include: {
          niveau: true,
        },
      },
      annee: true,
    },
    orderBy: [
      { annee: { dateDebut: 'desc' } },
      { classe: { nom: 'asc' } },
      { matiere: { libelle: 'asc' } },
    ],
  });
};

/**
 * Récupérer un enseignement par son ID
 */
const getEnseignementById = async (id: number) => {
  return await prisma.enseignementAnnee.findUnique({
    where: { id },
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
      matiere: true,
      classe: {
        include: {
          niveau: true,
        },
      },
      annee: true,
    },
  });
};

/**
 * Récupérer les enseignements d'un professeur pour une année
 */
const getEnseignementsByStaff = async (staffId: number, anneeId?: number) => {
  const where: any = { staffId };
  if (anneeId) {
    where.anneeId = anneeId;
  }

  return await prisma.enseignementAnnee.findMany({
    where,
    include: {
      matiere: true,
      classe: {
        include: {
          niveau: true,
        },
      },
      annee: true,
    },
    orderBy: [
      { annee: { dateDebut: 'desc' } },
      { classe: { nom: 'asc' } },
      { matiere: { libelle: 'asc' } },
    ],
  });
};

/**
 * Récupérer l'enseignant d'une matière dans une classe pour une année donnée
 */
const getEnseignantByMatiereClasse = async (
  matiereId: number,
  classeId: number,
  anneeId: number
) => {
  return await prisma.enseignementAnnee.findFirst({
    where: {
      matiereId,
      classeId,
      anneeId,
    },
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      },
      matiere: true,
      classe: true,
      annee: true,
    },
  });
};

/**
 * Récupérer tous les enseignements d'une classe pour une année
 */
const getEnseignementsByClasse = async (classeId: number, anneeId: number) => {
  return await prisma.enseignementAnnee.findMany({
    where: {
      classeId,
      anneeId,
    },
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
      },
      matiere: {
        include: {
          typeMatiere: true,
        },
      },
      annee: true,
    },
    orderBy: {
      matiere: {
        libelle: 'asc',
      },
    },
  });
};

/**
 * Créer un nouvel enseignement
 */
const createEnseignement = async (data: EnseignementAnneeCreateData) => {
  // Vérifier si l'enseignement existe déjà
  const existing = await prisma.enseignementAnnee.findUnique({
    where: {
      staffId_matiereId_classeId_anneeId: {
        staffId: data.staffId,
        matiereId: data.matiereId,
        classeId: data.classeId,
        anneeId: data.anneeId,
      },
    },
  });

  if (existing) {
    throw new Error(
      'Cet enseignement existe déjà pour cette matière, classe et année'
    );
  }

  return await prisma.enseignementAnnee.create({
    data: {
      staffId: data.staffId,
      matiereId: data.matiereId,
      classeId: data.classeId,
      anneeId: data.anneeId,
      volumeHoraire: data.volumeHoraire,
    },
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
      },
      matiere: true,
      classe: {
        include: {
          niveau: true,
        },
      },
      annee: true,
    },
  });
};

/**
 * Mettre à jour un enseignement
 */
const updateEnseignement = async (
  id: number,
  data: EnseignementAnneeUpdateData
) => {
  const updateData: any = {};

  if (data.staffId !== undefined) updateData.staffId = data.staffId;
  if (data.matiereId !== undefined) updateData.matiereId = data.matiereId;
  if (data.classeId !== undefined) updateData.classeId = data.classeId;
  if (data.anneeId !== undefined) updateData.anneeId = data.anneeId;
  if (data.volumeHoraire !== undefined) updateData.volumeHoraire = data.volumeHoraire;

  if (
    updateData.staffId !== undefined &&
    updateData.matiereId !== undefined &&
    updateData.classeId !== undefined &&
    updateData.anneeId !== undefined
  ) {
    const existing = await prisma.enseignementAnnee.findUnique({
      where: {
        staffId_matiereId_classeId_anneeId: {
          staffId: updateData.staffId,
          matiereId: updateData.matiereId,
          classeId: updateData.classeId,
          anneeId: updateData.anneeId,
        },
      },
    });

    if (existing && existing.id !== id) {
      throw new Error(
        'Un enseignement existe déjà pour ce professeur, cette matière, cette classe et cette année',
      );
    }
  }

  return await prisma.enseignementAnnee.update({
    where: { id },
    data: updateData,
    include: {
      staff: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
            },
          },
        },
      },
      matiere: true,
      classe: {
        include: {
          niveau: true,
        },
      },
      annee: true,
    },
  });
};

/**
 * Supprimer un enseignement
 */
const deleteEnseignement = async (id: number) => {
  return await prisma.enseignementAnnee.delete({
    where: { id },
  });
};

/**
 * Récupérer le volume horaire total d'un enseignant pour une année
 */
const getVolumeHoraireTotal = async (staffId: number, anneeId: number) => {
  const enseignements = await prisma.enseignementAnnee.findMany({
    where: {
      staffId,
      anneeId,
    },
    select: {
      volumeHoraire: true,
    },
  });

  return enseignements.reduce(
    (total, e) => total + (e.volumeHoraire || 0),
    0
  );
};

export default {
  getAllEnseignements,
  getEnseignementById,
  getEnseignementsByStaff,
  getEnseignantByMatiereClasse,
  getEnseignementsByClasse,
  createEnseignement,
  updateEnseignement,
  deleteEnseignement,
  getVolumeHoraireTotal,
};
