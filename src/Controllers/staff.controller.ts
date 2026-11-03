import { Request, Response } from 'express';
import staffService from '../Services/staff.service';

export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await staffService.getAllStaff();
    res.status(200).json({ success: true, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du personnel', error: error.message });
  }
};

export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const staff = await staffService.getStaffById(parseInt(id));

    if (!staff) {
      res.status(404).json({ success: false, message: 'Personnel introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du personnel', error: error.message });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, prenom, email, password, adresse, phone, roleId } = req.body;

    // 1. Valider les informations de base
    if (!nom || !prenom || !email || !password || !roleId) {
      res.status(400).json({ success: false, message: 'Les champs nom, prenom, email, password et roleId sont obligatoires.' });
      return;
    }

    // 2. Créer l'utilisateur
    const newUser = await staffService.createUserForStaff({
      nom,
      prenom,
      email,
      password,
      adresse,
      phone,
      roleId,
    });

    // 3. Créer le membre du personnel avec l'ID du nouvel utilisateur
    const staffData = { userId: newUser.id };
    const staff = await staffService.createStaff(staffData);

    res.status(201).json({ success: true, message: 'Personnel créé avec succès', data: staff });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else if (error.message && error.message.includes("Le rôle avec l'ID")) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error.message?.startsWith('Le mot de passe')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création du personnel', error: error.message });
    }
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const staffData = req.body;

    const staff = await staffService.updateStaff(parseInt(id), staffData);

    res.status(200).json({ success: true, message: 'Personnel mis à jour avec succès', data: staff });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Personnel introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du personnel', error: error.message });
    }
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await staffService.deleteStaff(parseInt(id));

    res.status(200).json({ success: true, message: 'Personnel supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Personnel introuvable' });
    } else if (error.code === 'P2003') {
      // Erreur de contrainte de clé étrangère
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce membre du personnel. Il possède des données associées (absences, permissions, etc.). Veuillez d\'abord supprimer ces données.'
      });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du personnel' });
    }
  }
};