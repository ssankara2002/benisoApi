import { Request, Response } from 'express';
import authService from '../Services/auth.service';
import { User } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';


export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe sont requis' });
      return;
    }

    const { token, user } = await authService.login(email, password);

    if (!token) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    } else {
      res.status(200).json({
        success: true,
        token,
        user
      });
    }
  } catch (error: any) {
    console.log("Erreur dans loginController:", error);

    // Gestion spécifique des erreurs d'authentification
    if (error.message === 'Utilisateur non trouvé' || error.message === 'Mot de passe incorrect') {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    } else if (error.message && error.message.includes('compte a été désactivé')) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
    }
  }
};

/**
 * Controller pour l'inscription d'un nouvel utilisateur
 * @param req - La requête HTTP
 * @param res - La réponse HTTP
 */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nom, prenom, adresse, phone } = req.body;
    console.log("registerController appelé avec:", req.body);
    
    // Vérification des champs requis
    if (!email || !password || !nom || !prenom) {
      res.status(400).json({ message: 'Email, mot de passe, nom et prénom sont requis.' });
      return;
    }

    const userData = { nom, prenom, adresse, phone };
    // Appel au service pour créer un utilisateur
    const user = await authService.register(email, password, userData);

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user });
  } catch (error: any) {
    if (
      error.message === 'Un utilisateur avec cet email existe déjà' ||
      error.message === 'Les champs nom et prenom sont obligatoires' ||
      error.message?.startsWith('Le mot de passe')
    ) {
      res.status(400).json({ message: error.message });
    } else {
      console.error("Erreur dans registerController:", error);
      res.status(500).json({ message: 'Erreur interne du serveur lors de l\'enregistrement.', details: error.message });
    }
  }
};

/**
 * Controller pour la demande de réinitialisation de mot de passe
 */
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email est requis' });
      return;
    }

    const token = await authService.forgotPassword(email);

    const response: any = {
      message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
    };

    // En mode développement, inclure le token pour faciliter les tests
    if (process.env.NODE_ENV === 'development' && token) {
      response.devToken = token;
      response.resetUrl = `http://localhost:5000/reset-password?token=${token}`;
    }

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Erreur dans forgotPasswordController:", error);
    res.status(500).json({
      message: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
      details: error.message
    });
  }
};

/**
 * Controller pour la réinitialisation du mot de passe
 */
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token et nouveau mot de passe sont requis' });
      return;
    }

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      message: 'Votre mot de passe a été réinitialisé avec succès'
    });
  } catch (error: any) {
    console.error("Erreur dans resetPasswordController:", error);

    if (
      error.message === 'Token invalide ou expiré' ||
      error.message?.startsWith('Le mot de passe')
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Erreur lors de la réinitialisation du mot de passe',
        details: error.message
      });
    }
  }
};

/**
 * Controller pour vérifier la validité d'un token de réinitialisation
 */
export const verifyResetTokenController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ message: 'Token est requis' });
      return;
    }

    const isValid = await authService.verifyResetToken(token);

    res.status(200).json({ valid: isValid });
  } catch (error: any) {
    console.error("Erreur dans verifyResetTokenController:", error);
    res.status(500).json({
      message: 'Erreur lors de la vérification du token',
      details: error.message
    });
  }
};

/**
 * Controller pour récupérer les informations de l'utilisateur connecté
 */
export const getMeController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error("Erreur dans getMeController:", error);

    if (error.message === 'Utilisateur non trouvé') {
      res.status(404).json({ message: error.message });
    } else if (error.message && error.message.includes('compte a été désactivé')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Erreur lors de la récupération des informations utilisateur',
        details: error.message
      });
    }
  }
};

export const changePasswordController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe sont requis' });
      return;
    }

    await authService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error: any) {
    if (error.message === 'Mot de passe actuel incorrect' || error.message?.startsWith('Le mot de passe')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Erreur lors du changement de mot de passe', details: error.message });
    }
  }
};

export const uploadProfilePhotoController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Aucune photo fournie' });
      return;
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const user = await authService.uploadProfilePhoto(userId, photoUrl);
    res.status(200).json({ success: true, photoUrl, user });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de l'upload de la photo", details: error.message });
  }
};
