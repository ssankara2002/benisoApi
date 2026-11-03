import { Request, Response } from 'express';
import userService from '../Services/user.service';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(parseInt(id));

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, prenom, email, password, adresse, phone, roleId } = req.body;

    if (!nom || !prenom || !email || !password) {
      res.status(400).json({ success: false, message: 'Les champs nom, prenom, email et password sont obligatoires' });
      return;
    }

    const userData = { nom, prenom, email, password, adresse, phone, roleId };
    const user = await userService.createUser(userData);

    res.status(201).json({ success: true, message: 'Utilisateur créé avec succès', data: user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
    } else if (error.message?.startsWith('Le mot de passe')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
    }
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, password, adresse, phone, roleId, isArchived } = req.body;

    const userData = { nom, prenom, email, password, adresse, phone, roleId, isArchived };
    const user = await userService.updateUser(parseInt(id), userData);

    res.status(200).json({ success: true, message: 'Utilisateur mis à jour avec succès', data: user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
    } else if (error.message?.startsWith('Le mot de passe')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(parseInt(id));

    res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    } else if (error.code === 'P2003') {
      // Erreur de contrainte de clé étrangère
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cet utilisateur. Il possède des profils associés (élève, parent ou staff). Veuillez d\'abord supprimer ces profils.'
      });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }
};

export const assignRoleTo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      res.status(400).json({ success: false, message: 'userId et roleId sont requis' });
      return;
    }

    const user = await userService.assignRoleTo(parseInt(userId), parseInt(roleId));

    res.status(200).json({ success: true, message: 'Rôle attribué avec succès', data: user });
  } catch (error: any) {
    if (error.message === 'Utilisateur introuvable' || error.message === 'Rôle introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'attribution du rôle', error: error.message });
    }
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined || isActive === null) {
      res.status(400).json({ success: false, message: 'Le champ isActive est requis (true ou false)' });
      return;
    }

    const user = await userService.toggleUserStatus(parseInt(userId), isActive);

    const message = isActive ? 'Staff activé avec succès' : 'Staff désactivé avec succès';
    res.status(200).json({ success: true, message, data: user });
  } catch (error: any) {
    if (error.message === 'Utilisateur introuvable' || error.message === 'Seuls les membres du staff peuvent être activés/désactivés') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du changement de statut du staff', error: error.message });
    }
  }
};

