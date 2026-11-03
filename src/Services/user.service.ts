import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserCreateData, UserUpdateData } from '../interface/allInterface';
import { validatePassword } from '../utils/passwordValidator';

const prisma = new PrismaClient();

const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: {
      role: true,
      staff: true,
      eleve: true,
      parent: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      staff: true,
      eleve: true,
      parent: true,
    },
  });
};

const createUser = async (data: UserCreateData) => {
  const { password, roleId, ...userData } = data;
  validatePassword(password);
  const hashedPassword = await bcrypt.hash(password, 10);

  // Si aucun roleId n'est fourni, attribuer le rôle 'user' par défaut
  let assignedRoleId = roleId;
  if (!assignedRoleId) {
    let userRole = await prisma.role.findFirst({
      where: { name: 'user' }
    });

    if (!userRole) {
      // Créer le rôle 'user' s'il n'existe pas
      userRole = await prisma.role.create({
        data: {
          name: 'user',
          description: 'Utilisateur standard'
        }
      });
    }
    assignedRoleId = userRole.id;
  }

  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      roleId: assignedRoleId,
    },
    include: {
      role: true,
    },
  });
};

const updateUser = async (id: number, data: UserUpdateData) => {
  const updateData = { ...data };

  if (data.password) {
    validatePassword(data.password);
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      role: true,
      staff: true,
      eleve: true,
      parent: true,
    },
  });
};

const deleteUser = async (id: number) => {
  // Vérifier si l'utilisateur a des associations
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      staff: true,
      eleve: true,
      parent: true,
    },
  });

  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  // Vérifier hasAssociation
  if (user.hasAssociation) {
    const associations: string[] = [];

    if (user.staff) {
      associations.push('profil staff');
    }
    if (user.eleve) {
      associations.push('profil élève');
    }
    if (user.parent) {
      associations.push('profil parent');
    }

    if (associations.length > 0) {
      throw new Error(`Impossible de supprimer cet utilisateur. Il possède les profils suivants : ${associations.join(', ')}. Veuillez d'abord supprimer ces profils.`);
    }
  }

  return await prisma.user.delete({
    where: { id },
  });
};

const assignRoleTo = async (userId: number, roleId: number) => {
  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  // Vérifier que le rôle existe
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error('Rôle introuvable');
  }

  // Assigner le rôle à l'utilisateur
  return await prisma.user.update({
    where: { id: userId },
    data: { roleId },
    include: {
      role: true,
      staff: true,
      eleve: true,
      parent: true,
    },
  });
};

const toggleUserStatus = async (userId: number, isActive: boolean) => {
  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      staff: true,
    },
  });

  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  // Vérifier que l'utilisateur est un staff
  if (!user.staff) {
    throw new Error('Seuls les membres du staff peuvent être activés/désactivés');
  }

  // Mettre à jour le statut isActive du staff
  await prisma.staff.update({
    where: { id: user.staff.id },
    data: { isActive },
  });

  // Retourner l'utilisateur mis à jour
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      staff: true,
      eleve: true,
      parent: true,
    },
  });
};


export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRoleTo,
  toggleUserStatus,
};