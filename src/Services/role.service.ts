import { PrismaClient, Role } from '@prisma/client';
import { RoleCreateData, RoleUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllRoles = async () => {
  return await prisma.role.findMany({
    include: {
      permissions: true,
      users: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getRoleById = async (id: number) => {
  return await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
      users: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
};

const createRole = async (data: RoleCreateData) => {
  return await prisma.role.create({
    data,
    include: {
      permissions: true,
    },
  });
};

const updateRole = async (id: number, data: RoleUpdateData) => {
  return await prisma.role.update({
    where: { id },
    data,
    include: {
      permissions: true,
      users: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
};

const deleteRole = async (id: number) => {
  // Vérifier si le rôle a des associations
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          permissions: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error('Rôle introuvable');
  }

  // Vérifier hasAssociation
  if (role.hasAssociation) {
    if (role._count.users > 0) {
      throw new Error(`Impossible de supprimer ce rôle. ${role._count.users} utilisateur(s) y sont associé(s).`);
    }
    if (role._count.permissions > 0) {
      throw new Error(`Impossible de supprimer ce rôle. ${role._count.permissions} permission(s) y sont associée(s).`);
    }
  }

  return await prisma.role.delete({
    where: { id },
  });
};

const assignPermissionsToRole = async (roleId: number, permissionIds: number[]) => {
  return await prisma.role.update({
    where: { id: roleId },
    data: {
      permissions: {
        set: permissionIds.map(id => ({ id })),
      },
    },
    include: {
      permissions: true,
    },
  });
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
};