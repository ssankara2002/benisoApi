import { PrismaClient, Permission } from '@prisma/client';
import { PermissionCreateData, PermissionUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllPermissions = async () => {
  return await prisma.permission.findMany({
    include: {
      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getPermissionById = async (id: number) => {
  return await prisma.permission.findUnique({
    where: { id },
    include: {
      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const createPermission = async (data: PermissionCreateData) => {
  return await prisma.permission.create({
    data,
    include: {
      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const updatePermission = async (id: number, data: PermissionUpdateData) => {
  return await prisma.permission.update({
    where: { id },
    data,
    include: {
      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const deletePermission = async (id: number) => {
  // Vérifier si la permission a des associations
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          roles: true,
        },
      },
    },
  });

  if (!permission) {
    throw new Error('Permission introuvable');
  }

  // Vérifier hasAssociation
  if (permission.hasAssociation && permission._count.roles > 0) {
    throw new Error(`Impossible de supprimer cette permission. ${permission._count.roles} rôle(s) y sont associé(s).`);
  }

  return await prisma.permission.delete({
    where: { id },
  });
};

export default {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
};