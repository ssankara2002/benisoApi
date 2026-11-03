import { PrismaClient, Licence } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Génère une clé API unique
 */
const genererCleApi = (): string => {
  return `lic_${crypto.randomBytes(32).toString('hex')}`;
};

/**
 * Crée une nouvelle licence valide pour 1 an
 */
const creerLicence = async (
  nomEcole: string,
  emailContact: string,
  telephoneContact?: string
): Promise<Licence> => {
  const cleApi = genererCleApi();
  const dateActivation = new Date();
  const dateExpiration = new Date();
  dateExpiration.setFullYear(dateExpiration.getFullYear() + 1); // +1 an

  const licence = await prisma.licence.create({
    data: {
      cleApi,
      nomEcole,
      emailContact,
      telephoneContact,
      dateActivation,
      dateExpiration,
      estActif: true,
    },
  });

  return licence;
};

/**
 * Récupère toutes les licences
 */
const recupererLicences = async (): Promise<Licence[]> => {
  return await prisma.licence.findMany({
    orderBy: {
      dateActivation: 'desc',
    },
  });
};

/**
 * Récupère une licence par sa clé API
 */
const recupererLicenceParCle = async (cleApi: string): Promise<Licence | null> => {
  return await prisma.licence.findUnique({
    where: { cleApi },
  });
};

/**
 * Récupère une licence par son ID
 */
const recupererLicenceParId = async (id: number): Promise<Licence | null> => {
  return await prisma.licence.findUnique({
    where: { id },
  });
};

/**
 * Vérifie si une licence est valide (active et non expirée)
 */
const verifierLicence = async (cleApi: string): Promise<{ valide: boolean; message: string; licence?: Licence }> => {
  const licence = await recupererLicenceParCle(cleApi);

  if (!licence) {
    return {
      valide: false,
      message: 'Clé API invalide',
    };
  }

  if (!licence.estActif) {
    return {
      valide: false,
      message: 'Licence désactivée',
      licence,
    };
  }

  const maintenant = new Date();
  if (maintenant > licence.dateExpiration) {
    return {
      valide: false,
      message: 'Licence expirée',
      licence,
    };
  }

  // Mettre à jour la dernière utilisation et le compteur
  await prisma.licence.update({
    where: { id: licence.id },
    data: {
      derniereUtilisation: maintenant,
      nombreAppels: licence.nombreAppels + 1,
    },
  });

  return {
    valide: true,
    message: 'Licence valide',
    licence,
  };
};

/**
 * Renouvelle une licence pour 1 an supplémentaire
 */
const renouvelerLicence = async (id: number): Promise<Licence> => {
  const licence = await recupererLicenceParId(id);

  if (!licence) {
    throw new Error('Licence introuvable');
  }

  const nouvelleExpiration = new Date();
  nouvelleExpiration.setFullYear(nouvelleExpiration.getFullYear() + 1);

  return await prisma.licence.update({
    where: { id },
    data: {
      dateExpiration: nouvelleExpiration,
      estActif: true,
    },
  });
};

/**
 * Désactive une licence
 */
const desactiverLicence = async (id: number): Promise<Licence> => {
  return await prisma.licence.update({
    where: { id },
    data: {
      estActif: false,
    },
  });
};

/**
 * Réactive une licence
 */
const reactiverLicence = async (id: number): Promise<Licence> => {
  return await prisma.licence.update({
    where: { id },
    data: {
      estActif: true,
    },
  });
};

/**
 * Supprime une licence
 */
const supprimerLicence = async (id: number): Promise<void> => {
  await prisma.licence.delete({
    where: { id },
  });
};

/**
 * Met à jour les informations d'une licence
 */
const modifierLicence = async (
  id: number,
  data: {
    nomEcole?: string;
    emailContact?: string;
    telephoneContact?: string;
  }
): Promise<Licence> => {
  return await prisma.licence.update({
    where: { id },
    data,
  });
};

export default {
  creerLicence,
  recupererLicences,
  recupererLicenceParCle,
  recupererLicenceParId,
  verifierLicence,
  renouvelerLicence,
  desactiverLicence,
  reactiverLicence,
  supprimerLicence,
  modifierLicence,
};
