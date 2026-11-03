import { PrismaClient, Parent } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ParentCreateData, ParentUpdateData } from '../interface/allInterface';
import { validatePassword } from '../utils/passwordValidator';

const prisma = new PrismaClient();

const createUserForParent = async (data: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  adresse?: string;
  phone?: string;
}) => {
  validatePassword(data.password);
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  // Get the PARENT role ID
  const parentRole = await prisma.role.findUnique({
    where: { name: 'PARENT' },
  });

  return await prisma.user.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      password: hashedPassword,
      adresse: data.adresse,
      phone: data.phone,
      roleId: parentRole?.id,
    },
    include: { role: true },
  });
};

const getAllParents = async () => {
  return await prisma.parent.findMany({
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
        },
      },
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
    orderBy: { user: { createdAt: 'desc' } }
  });
};

const getParentById = async (id: number) => {
  return await prisma.parent.findUnique({
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
        },
      },
      eleves: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
            },
          },
          filiere: true,
        },
      },
    },
  });
};

const createParent = async (data: ParentCreateData) => {
  // Create the user first
  const newUser = await createUserForParent(data);

  // Create the parent with the new user ID and connect eleves if provided
  return await prisma.parent.create({
    data: {
      userId: newUser.id,
      eleves: data.eleveIds && data.eleveIds.length > 0 ? {
        connect: data.eleveIds.map(id => ({ id }))
      } : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          phone: true,
          adresse: true,
        },
      },
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
  });
};

const updateParent = async (id: number, data: ParentUpdateData) => {
  // Get the parent first
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: { eleves: true },
  });

  if (!parent) {
    throw new Error('Parent introuvable');
  }

  // Update the associated user if needed
  if (data.nom || data.prenom || data.email || data.adresse || data.phone) {
    await prisma.user.update({
      where: { id: parent.userId },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        adresse: data.adresse,
        phone: data.phone,
      },
    });
  }

  // Update eleves if provided
  if (data.eleveIds !== undefined) {
    // Disconnect all existing eleves
    await prisma.parent.update({
      where: { id },
      data: {
        eleves: {
          disconnect: parent.eleves.map(e => ({ id: e.id })),
        },
      },
    });

    // Connect new eleves if any
    if (data.eleveIds.length > 0) {
      await prisma.parent.update({
        where: { id },
        data: {
          eleves: {
            connect: data.eleveIds.map(eleveId => ({ id: eleveId })),
          },
        },
      });
    }
  }

  // Return the updated parent
  return await prisma.parent.findUnique({
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
        },
      },
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
  });
};

const deleteParent = async (id: number) => {
  // Vérifier si le parent a des associations
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          eleves: true,
        },
      },
    },
  });

  if (!parent) {
    throw new Error('Parent introuvable');
  }

  // Vérifier hasAssociation
  if (parent.hasAssociation && parent._count.eleves > 0) {
    throw new Error(`Impossible de supprimer ce parent. ${parent._count.eleves} élève(s) y sont associé(s).`);
  }

  return await prisma.parent.delete({
    where: { id },
  });
};

const addEleveToParent = async (parentId: number, eleveId: number) => {
  return await prisma.parent.update({
    where: { id: parentId },
    data: {
      eleves: {
        connect: { id: eleveId },
      },
    },
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
  });
};

const removeEleveFromParent = async (parentId: number, eleveId: number) => {
  return await prisma.parent.update({
    where: { id: parentId },
    data: {
      eleves: {
        disconnect: { id: eleveId },
      },
    },
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
  });
};

export default {
  getAllParents,
  getParentById,
  createUserForParent,
  createParent,
  updateParent,
  deleteParent,
  addEleveToParent,
  removeEleveFromParent,
};