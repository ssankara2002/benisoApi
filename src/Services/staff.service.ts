import { PrismaClient, Staff, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { StaffCreateData, UserForStaffCreateData, StaffUpdateData } from '../interface/allInterface';
import { validatePassword } from '../utils/passwordValidator';

const prisma = new PrismaClient();


const getAllStaff = async () => {
  return await prisma.staff.findMany({
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          phone: true,
          adresse: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      absences: true,
    },
    orderBy: { user: { createdAt: 'desc' } }
  });
};

const getStaffById = async (id: number) => {
  return await prisma.staff.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          phone: true,
          adresse: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      absences: true,
    },
  });
};

const createStaff = async (data: StaffCreateData) => {
  return await prisma.staff.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          phone: true,
          adresse: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

const updateStaff = async (id: number, data: StaffUpdateData) => {
  const { nom, prenom, email, adresse, phone, roleId } = data;

  // 1. Trouver le staff pour obtenir son userId
  const staffToUpdate = await prisma.staff.findUnique({
    where: { id },
  });

  if (!staffToUpdate) {
    throw { code: 'P2025', message: 'Membre du personnel introuvable' };
  }

  // 2. Mettre à jour les informations de l'utilisateur si elles sont fournies
  if (nom || prenom || email || adresse || phone || roleId) {
    // Construire l'objet de mise à jour avec seulement les champs définis
    const updateData: any = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (adresse !== undefined) updateData.adresse = adresse;
    if (phone !== undefined) updateData.phone = phone;
    if (roleId !== undefined) updateData.roleId = roleId;

    await prisma.user.update({
      where: { id: staffToUpdate.userId },
      data: updateData,
    });
  }

  // 3. Mettre à jour le staff (même si pour l'instant il n'y a rien à y changer)
  return await prisma.staff.update({
    where: { id },
    data: {}, // Pas de champs spécifiques au staff à mettre à jour pour le moment
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          phone: true,
          adresse: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      absences: true,
    },
  });
};

const deleteStaff = async (id: number) => {
  // Vérifier si le staff a des associations
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          absences: true,
        },
      },
    },
  });

  if (!staff) {
    throw new Error('Membre du personnel introuvable');
  }

  // Vérifier hasAssociation
  if (staff.hasAssociation && staff._count.absences > 0) {
    throw new Error(`Impossible de supprimer ce membre du personnel. ${staff._count.absences} absence(s) y sont associée(s).`);
  }

  return await prisma.staff.delete({
    where: { id },
  });
};

const createUserForStaff = async (data: UserForStaffCreateData): Promise<User> => {
  const { nom, prenom, email, password, adresse, phone, roleId } = data;

  // 1. Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { code: 'P2002', message: 'Un utilisateur avec cet email existe déjà.' };
  }

  // 2. Hasher le mot de passe
  validatePassword(password);
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. S'assurer que le rôle existe
  if (!roleId) {
    throw new Error("Le champ 'roleId' est obligatoire pour créer un membre du personnel.");
  }
  const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
  if (!roleExists) {
    throw new Error(`Le rôle avec l'ID ${roleId} est introuvable.`);
  }

  // 4. Créer l'utilisateur
  const newUser = await prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      password: hashedPassword,
      adresse,
      phone,
      roleId: roleId,
    },
  });
  return newUser;
};


export default {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  createUserForStaff,
};