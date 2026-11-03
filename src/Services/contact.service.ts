import { PrismaClient, Contact } from '@prisma/client';
import { ContactCreateData, ContactUpdateData } from '../interface/allInterface';

const prisma = new PrismaClient();

const getAllContacts = async () => {
  return await prisma.contact.findMany({
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getContactById = async (id: number) => {
  return await prisma.contact.findUnique({
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

const createContact = async (data: ContactCreateData) => {
  const { userId, ...contactData } = data;

  return await prisma.contact.create({
    data: {
      ...contactData,
      ...(userId && { userId })
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

const updateContact = async (id: number, data: ContactUpdateData) => {
  const { userId, ...contactData } = data;

  return await prisma.contact.update({
    where: { id },
    data: {
      ...contactData,
      ...(userId && { userId })
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

const deleteContact = async (id: number) => {
  return await prisma.contact.delete({
    where: { id },
  });
};

const getContactsByType = async (typeSujet: string) => {
  return await prisma.contact.findMany({
    where: { typeSujet },
    include: {
      user: {
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
    orderBy: { id: 'desc' }
  });
};

export default {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactsByType,
};