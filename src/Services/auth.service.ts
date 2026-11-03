import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient, User } from '@prisma/client';
import emailService from './email.service';
import { AuthResponse } from '../interface/allInterface';
import { validatePassword } from '../utils/passwordValidator';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';
if (JWT_SECRET === 'votre_clé_secrète') {
  console.warn("");
}

// Login
const login = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: true
        }
      },
      staff: true,
      eleve: true,
      parent: true
    },
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  // Vérifier si l'utilisateur est actif (pour les staff uniquement)
  if (user.staff && !user.staff.isActive) {
    throw new Error('Votre compte a été désactivé. Veuillez contacter l\'administrateur.');
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) throw new Error('Mot de passe incorrect');

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Remove password from user object before returning
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

// Register
const register = async (
  email: string,
  password: string,
  userData: {
    nom: string;
    prenom: string;
    adresse?: string;
    phone?: string;
  }
): Promise<Omit<User, 'password'>> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('Un utilisateur avec cet email existe déjà');

  if (!userData.nom || !userData.prenom) {
    throw new Error('Les champs nom et prenom sont obligatoires');
  }

  validatePassword(password);

  const hashedPassword = await bcrypt.hash(password, 10);

  // Déterminer le rôle du nouvel utilisateur
  const usersCount = await prisma.user.count();
  let assignedRoleId: number | undefined;

  if (usersCount === 0) {
    // Premier utilisateur = ADMIN
    let adminRole = await prisma.role.findFirst({
      where: { name: 'ADMIN' }
    });

    if (!adminRole) {
      // Créer le rôle ADMIN s'il n'existe pas
      adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          description: 'Administrateur du système'
        }
      });
    }
    assignedRoleId = adminRole.id;
  } else {
    // Utilisateurs suivants = USER par défaut
    let userRole = await prisma.role.findFirst({
      where: { name: 'USER' }
    });

    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          name: 'USER',
          description: 'Utilisateur standard'
        }
      });
    }
    assignedRoleId = userRole.id;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      nom: userData.nom,
      prenom: userData.prenom,
      adresse: userData.adresse,
      phone: userData.phone,
      roleId: assignedRoleId,
    },
    include: { role: true },
  });

  // Remove password from user object before returning
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};


// Forgot Password - Génère un token et envoie l'email
const forgotPassword = async (email: string): Promise<string | void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
    return;
  }

  // Générer un token unique
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash le token avant de le stocker en base de données
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Token valide pendant 1 heure
  const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  // Sauvegarder le token hashé et la date d'expiration
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    },
  });

  // Envoyer l'email avec le token NON hashé
  try {
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      `${user.prenom} ${user.nom}`
    );
  } catch (error: any) {
    // Si l'envoi de l'email échoue, supprimer le token de la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
  }

  // En mode développement, retourner le token pour faciliter les tests
  if (process.env.NODE_ENV === 'development') {
    return resetToken;
  }
};


// Reset Password - Vérifie le token et réinitialise le mot de passe
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // Hash le token reçu pour le comparer avec celui en base de données
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Trouver l'utilisateur avec ce token et vérifier qu'il n'est pas expiré
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(), // Token non expiré
      },
    },
  });

  if (!user) {
    throw new Error('Token invalide ou expiré');
  }

  validatePassword(newPassword);

  // Hash le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Mettre à jour le mot de passe et supprimer le token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  // Envoyer un email de confirmation
  try {
    await emailService.sendPasswordResetConfirmationEmail(
      user.email,
      `${user.prenom} ${user.nom}`
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    // Ne pas échouer la réinitialisation si l'email de confirmation échoue
  }
};

// Vérifier la validité d'un token de réinitialisation
const verifyResetToken = async (token: string): Promise<boolean> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  return !!user;
};

// Get current user
const getCurrentUser = async (userId: number): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true
        }
      },
      staff: true,
      eleve: {
        include: {
          filiere: true,
          parents: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                  phone: true,
                  email: true
                }
              }
            }
          }
        }
      },
      parent: {
        include: {
          eleves: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true
                }
              },
              filiere: true
            }
          }
        }
      }
    },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier si l'utilisateur est actif (pour les staff uniquement)
  if (user.staff && !user.staff.isActive) {
    throw new Error('Votre compte a été désactivé. Veuillez contacter l\'administrateur.');
  }

  // Remove password from user object before returning
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Change Password
const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Utilisateur non trouvé');

  const passwordIsValid = await bcrypt.compare(currentPassword, user.password);
  if (!passwordIsValid) throw new Error('Mot de passe actuel incorrect');

  validatePassword(newPassword);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

// Upload Profile Photo
const uploadProfilePhoto = async (userId: number, photoPath: string): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { photoUrl: photoPath },
    include: {
      role: { include: { permissions: true } },
      staff: true,
      eleve: true,
      parent: true,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  getCurrentUser,
  changePassword,
  uploadProfilePhoto,
};
