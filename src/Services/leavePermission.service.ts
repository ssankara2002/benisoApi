import { PrismaClient, LeavePermission } from '@prisma/client';
import { LeavePermissionCreateData, LeavePermissionUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllLeavePermissions = async () => {
  return await prisma.leavePermission.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { dateDebut: 'desc' }
  });
};

const getLeavePermissionById = async (id: number) => {
  return await prisma.leavePermission.findUnique({
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

const createLeavePermission = async (data: LeavePermissionCreateData) => {
  return await prisma.leavePermission.create({
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

const updateLeavePermission = async (id: number, data: LeavePermissionUpdateData) => {
  return await prisma.leavePermission.update({
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

const deleteLeavePermission = async (id: number) => {
  return await prisma.leavePermission.delete({
    where: { id },
  });
};

const getLeavePermissionsByUser = async (userId: number) => {
  return await prisma.leavePermission.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { dateDebut: 'desc' }
  });
};

const getLeavePermissionsByPeriod = async (startDate: Date, endDate: Date, userId?: number) => {
  const whereClause: any = {
    OR: [
      {
        dateDebut: {
          gte: startDate,
          lte: endDate,
        },
      },
      {
        dateFin: {
          gte: startDate,
          lte: endDate,
        },
      },
    ],
  };

  // Si userId est fourni (non-admin), filtrer par utilisateur
  if (userId) {
    whereClause.userId = userId;
  }

  return await prisma.leavePermission.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { dateDebut: 'desc' }
  });
};
const approveLeavePermission = async (id: number) => {
  return await prisma.leavePermission.update({
    where: { id },
    data: {
      statut: "APPROUVE", // Ou "ACCEPTE" selon ton enum
    },
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

const rejectLeavePermission = async (id: number, motifRejet?: string) => {
  return await prisma.leavePermission.update({
    where: { id },
    data: {
      statut: "REJETE",
    },
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


export default {
  getAllLeavePermissions,
  getLeavePermissionById,
  createLeavePermission,
  updateLeavePermission,
  deleteLeavePermission,
  getLeavePermissionsByUser,
  getLeavePermissionsByPeriod,
  rejectLeavePermission,
  approveLeavePermission
};