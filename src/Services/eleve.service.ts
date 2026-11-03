import { PrismaClient, Eleve, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserForEleveCreateData, EleveCreateData, EleveUpdateData } from '../interface/allInterface';
import { validatePassword } from '../utils/passwordValidator';

const prisma = new PrismaClient();

const getAllEleves = async () => {
  const eleves = await prisma.eleve.findMany({
    select: {
      id: true,
      matricule: true,
      userId: true,
      hasAssociation: true,
      dateNaissance: true,
      acteNaissance: true,
      bulletin: true,
      attestation: true,
      filiereId: true,
      statut: true,
      motifRejet: true,
      dateValidation: true,
      createdAt: true,
      updatedAt: true,
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
      filiere: true,
      parents: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              phone: true,
            },
          },
        },
      },
      inscriptions: {
        include: {
          annee: true,
          niveau: true,
          classe: true,
        },
      },
    },
    orderBy: { user: { createdAt: 'desc' } }
  });

  // Calculer l'effectif total automatiquement
  const effectifTotal = eleves.length;

  return {
    eleves,
    effectifTotal
  };
};

const getEleveById = async (id: number) => {
  return await prisma.eleve.findUnique({
    where: { id },
    select: {
      id: true,
      matricule: true,
      userId: true,
      hasAssociation: true,
      dateNaissance: true,
      acteNaissance: true,
      bulletin: true,
      attestation: true,
      filiereId: true,
      statut: true,
      motifRejet: true,
      dateValidation: true,
      createdAt: true,
      updatedAt: true,
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
      filiere: true,
      matieres: true,
      inscriptions: {
        include: {
          annee: true,
          niveau: true,
          classe: true,
          paiements: true,
        },
      },
      paiements: true,
      retards: {
        include: {
          matiere: true,
        },
      },
      absences: {
        include: {
          matiere: true,
        },
      },
      notes: {
        include: {
          evaluation: true,
        },
      },
      parents: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

const createEleve = async (data: EleveCreateData) => {
  // Créer l'élève sans matricule d'abord
  const eleve = await prisma.eleve.create({
    data: {
      userId: data.userId,
      filiereId: data.filiereId,
      dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : new Date(),
      acteNaissance: data.acteNaissance || '',
      bulletin: Array.isArray(data.bulletin) ? data.bulletin : (data.bulletin ? [data.bulletin] : []),
      attestation: data.attestation,
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
      filiere: true,
    },
  });

  // Générer le matricule: première lettre nom + première lettre prénom + id + année
  const anneeInscription = new Date().getFullYear();
  const premiereLettreNom = eleve.user.nom.charAt(0).toUpperCase();
  const premiereLettrePrenom = eleve.user.prenom.charAt(0).toUpperCase();
  const matricule = `${premiereLettreNom}${premiereLettrePrenom}${eleve.id}${anneeInscription}`;

  // Mettre à jour l'élève avec le matricule
  const eleveWithMatricule = await prisma.eleve.update({
    where: { id: eleve.id },
    data: { matricule },
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
      filiere: true,
    },
  });

  return eleveWithMatricule;
};

// Obtenir les places disponibles par niveau
const getPlacesDisponiblesByNiveau = async (niveauId: number, anneeId?: number) => {
  const classes = await prisma.classe.findMany({
    where: {
      niveauId,
      ...(anneeId && { anneeId })
    },
    include: {
      inscriptions: {
        where: anneeId ? { anneeId } : undefined
      }
    },
  });

  let capaciteTotale = 0;
  let effectifTotal = 0;

  for (const classe of classes) {
    capaciteTotale += classe.capacite || 0;
    effectifTotal += classe.inscriptions.length;
  }

  const placesDisponibles = capaciteTotale - effectifTotal;

  return {
    niveauId,
    capaciteTotale,
    effectifTotal,
    placesDisponibles,
    classes: classes.map(classe => ({
      id: classe.id,
      nom: classe.nom,
      capacite: classe.capacite || 0,
      effectif: classe.inscriptions.length,
      placesDisponibles: (classe.capacite || 0) - classe.inscriptions.length,
    })),
  };
};

const createUserForEleve = async (data: UserForEleveCreateData): Promise<User> => {
  const { nom, prenom, email, password, adresse, phone } = data;

  // 1. Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { code: 'P2002', message: 'Un utilisateur avec cet email existe déjà.' };
  }

  // 2. Hasher le mot de passe
  validatePassword(password);
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Trouver le rôle "USER" (rôle par défaut avant validation du dossier)
  const userRole = await prisma.role.findUnique({
    where: { name: 'USER' },
  });

  if (!userRole) {
    throw new Error("Le rôle 'USER' est introuvable. Veuillez exécuter le seeder.");
  }

  // 4. Créer l'utilisateur avec le rôle USER (sera promu ELEVE après validation du dossier)
  const newUser = await prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      password: hashedPassword,
      adresse,
      phone,
      roleId: userRole.id,
    },
  });
  return newUser;
};

const updateEleve = async (id: number, data: EleveUpdateData) => {
  const { nom, prenom, email, adresse, phone, filiereId } = data;

  // 1. Trouver l'élève pour obtenir son userId
  const eleveToUpdate = await prisma.eleve.findUnique({
    where: { id },
  });

  if (!eleveToUpdate) {
    throw { code: 'P2025', message: 'Élève introuvable' };
  }

  // 2. Mettre à jour les informations de l'utilisateur si elles sont fournies
  if (nom || prenom || email || adresse || phone) {
    await prisma.user.update({
      where: { id: eleveToUpdate.userId },
      data: {
        nom,
        prenom,
        email,
        adresse,
        phone,
      },
    });
  }

  // 3. Mettre à jour les informations de l'élève
  return await prisma.eleve.update({
    where: { id },
    data: {
      filiereId,
      dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
      acteNaissance: data.acteNaissance,
      bulletin: data.bulletin ? (Array.isArray(data.bulletin) ? data.bulletin : [data.bulletin]) : undefined,
      attestation: data.attestation,
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
      filiere: true,
      parents: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};

const deleteEleve = async (id: number) => {
  // Vérifier si l'élève a des associations
  const eleve = await prisma.eleve.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          matieres: true,
          inscriptions: true,
          paiements: true,
          retards: true,
          absences: true,
          notes: true,
          parents: true,
          cours: true,
        },
      },
    },
  });

  if (!eleve) {
    throw new Error('Élève introuvable');
  }

  // Vérifier hasAssociation
  if (eleve.hasAssociation) {
    const errors: string[] = [];

    if (eleve._count.matieres > 0) {
      errors.push(`${eleve._count.matieres} matière(s)`);
    }
    if (eleve._count.inscriptions > 0) {
      errors.push(`${eleve._count.inscriptions} inscription(s)`);
    }
    if (eleve._count.paiements > 0) {
      errors.push(`${eleve._count.paiements} paiement(s)`);
    }
    if (eleve._count.retards > 0) {
      errors.push(`${eleve._count.retards} retard(s)`);
    }
    if (eleve._count.absences > 0) {
      errors.push(`${eleve._count.absences} absence(s)`);
    }
    if (eleve._count.notes > 0) {
      errors.push(`${eleve._count.notes} note(s)`);
    }
    if (eleve._count.parents > 0) {
      errors.push(`${eleve._count.parents} parent(s)`);
    }
    if (eleve._count.cours > 0) {
      errors.push(`${eleve._count.cours} cours`);
    }

    if (errors.length > 0) {
      throw new Error(`Impossible de supprimer cet élève. Il est associé à : ${errors.join(', ')}.`);
    }
  }

  return await prisma.eleve.delete({
    where: { id },
  });
};

const addMatiereToEleve = async (eleveId: number, matiereId: number) => {
  return await prisma.eleve.update({
    where: { id: eleveId },
    data: {
      matieres: {
        connect: { id: matiereId },
      },
    },
    include: {
      matieres: true,
    },
  });
};

const removeMatiereFromEleve = async (eleveId: number, matiereId: number) => {
  return await prisma.eleve.update({
    where: { id: eleveId },
    data: {
      matieres: {
        disconnect: { id: matiereId },
      },
    },
    include: {
      matieres: true,
    },
  });
};

const getElevesByClasse = async (classeId: number) => {
  // Récupérer les inscriptions pour cette classe
  const inscriptions = await prisma.inscription.findMany({
    where: { classeId },
    include: {
      eleve: {
        include: {
          user: {
            select: {
              nom: true,
              prenom: true,
              email: true,
              phone: true,
              adresse: true,
            },
          },
          filiere: true,
        },
      },
    },
  });

  // Extraire les élèves des inscriptions
  const eleves = inscriptions.map(inscription => inscription.eleve);

  // Calculer l'effectif de la classe automatiquement
  const effectifClasse = eleves.length;

  return {
    eleves,
    effectifClasse
  };
};

// Nouvelle fonction pour obtenir l'effectif total des élèves
const getTotalEffectif = async () => {
  const count = await prisma.eleve.count();
  return count;
};

// Fonction pour valider les données d'un élève
const validateEleveData = async (data: { userId?: number, classeId?: number, anneeId?: number, filiereId?: number }) => {
  const errors: string[] = [];

  // Vérifier si l'utilisateur existe
  if (data.userId) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      errors.push(`Utilisateur avec l'ID ${data.userId} introuvable`);
    }
  }

  // Vérifier si la classe existe
  if (data.classeId) {
    const classe = await prisma.classe.findUnique({ where: { id: data.classeId } });
    if (!classe) {
      errors.push(`Classe avec l'ID ${data.classeId} introuvable`);
    }
  }

  // Vérifier si l'année existe
  if (data.anneeId) {
    const annee = await prisma.annee.findUnique({ where: { id: data.anneeId } });
    if (!annee) {
      errors.push(`Année avec l'ID ${data.anneeId} introuvable`);
    }
  }

  // Vérifier si la filière existe
  if (data.filiereId) {
    const filiere = await prisma.filiere.findUnique({ where: { id: data.filiereId } });
    if (!filiere) {
      errors.push(`Filière avec l'ID ${data.filiereId} introuvable`);
    }
  }

  if (errors.length > 0) {
    return errors.join(', ');
  }

  return null;
};

// Nouvelle fonction pour obtenir les parents d'un élève
const getParentsByEleve = async (eleveId: number) => {
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      parents: {
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
        },
      },
    },
  });

  if (!eleve) {
    throw new Error('Élève introuvable');
  }

  return eleve.parents;
};

/**
 * Valider une candidature d'élève
 * - Met dossierValide à true
 * - Change le rôle de l'utilisateur de USER à ELEVE
 */
const validerCandidature = async (eleveId: number) => {
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: { user: true },
  });

  if (!eleve) {
    throw new Error('Élève introuvable');
  }

  if (eleve.statut !== 'EN_ATTENTE') {
    throw new Error('Cette candidature a déjà été traitée');
  }

  // Récupérer le rôle ELEVE pour le promouvoir
  const eleveRole = await prisma.role.findUnique({ where: { name: 'ELEVE' } });
  if (!eleveRole) {
    throw new Error("Le rôle 'ELEVE' est introuvable. Veuillez exécuter le seeder.");
  }

  // Générer un matricule si pas encore fait
  let matricule = eleve.matricule;
  if (!matricule) {
    const year = new Date().getFullYear();
    const count = await prisma.eleve.count({ where: { statut: 'VALIDE' } });
    matricule = `EL${year}${String(count + 1).padStart(4, '0')}`;
  }

  // Promouvoir l'utilisateur au rôle ELEVE
  await prisma.user.update({
    where: { id: eleve.userId },
    data: { roleId: eleveRole.id },
  });

  return await prisma.eleve.update({
    where: { id: eleveId },
    data: {
      statut: 'VALIDE',
      dateValidation: new Date(),
      matricule,
      motifRejet: null,
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
          role: { select: { name: true } },
        },
      },
      filiere: true,
    },
  });
};

/**
 * Rejeter une candidature d'élève
 * - Conserve le rôle USER (dossier non validé)
 * - Enregistre le motif de rejet obligatoire
 */
const rejeterCandidature = async (eleveId: number, motifRejet: string) => {
  if (!motifRejet || motifRejet.trim() === '') {
    throw new Error('Le motif de rejet est obligatoire');
  }

  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
  });

  if (!eleve) {
    throw new Error('Élève introuvable');
  }

  if (eleve.statut !== 'EN_ATTENTE') {
    throw new Error('Cette candidature a déjà été traitée');
  }

  return await prisma.eleve.update({
    where: { id: eleveId },
    data: {
      statut: 'REJETE',
      motifRejet: motifRejet.trim(),
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
          role: { select: { name: true } },
        },
      },
      filiere: true,
    },
  });
};

export default {
  getAllEleves,
  getEleveById,
  createUserForEleve,
  createEleve,
  updateEleve,
  deleteEleve,
  addMatiereToEleve,
  removeMatiereFromEleve,
  getElevesByClasse,
  getTotalEffectif,
  validateEleveData,
  getPlacesDisponiblesByNiveau,
  getParentsByEleve,
  validerCandidature,
  rejeterCandidature,

  /**
   * Met à jour la photo d'un élève
   */
  updateElevePhoto: async (eleveId: number, photoPath: string) => {
    const eleve = await prisma.eleve.findUnique({
      where: { id: eleveId }
    });

    if (!eleve) {
      throw new Error('Élève introuvable');
    }

    return await prisma.eleve.update({
      where: { id: eleveId },
      data: { photo: photoPath },
      include: {
        user: true,
        filiere: true
      }
    });
  },
};