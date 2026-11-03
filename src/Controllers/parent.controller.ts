import { Request, Response } from 'express';
import parentService from '../Services/parent.service';

export const getAllParents = async (req: Request, res: Response): Promise<void> => {
  try {
    const parents = await parentService.getAllParents();
    res.status(200).json({ success: true, data: parents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des parents', error: error.message });
  }
};

export const getParentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parent = await parentService.getParentById(parseInt(id));

    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: parent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du parent', error: error.message });
  }
};

export const createParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, prenom, email, password, adresse, phone, eleveIds } = req.body;

    if (!nom || !prenom || !email || !password) {
      res.status(400).json({ success: false, message: 'Les champs nom, prenom, email et password sont obligatoires' });
      return;
    }

    const parentData = { nom, prenom, email, password, adresse, phone, eleveIds };
    const parent = await parentService.createParent(parentData);

    res.status(201).json({ success: true, message: 'Parent créé avec succès', data: parent });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Un ou plusieurs élèves spécifiés sont introuvables' });
    } else if (error.message?.startsWith('Le mot de passe')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création du parent', error: error.message });
    }
  }
};

export const updateParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, adresse, phone, eleveIds } = req.body;

    const parentData = { nom, prenom, email, adresse, phone, eleveIds };
    const parent = await parentService.updateParent(parseInt(id), parentData);

    res.status(200).json({ success: true, message: 'Parent mis à jour avec succès', data: parent });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Parent ou élève introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà' });
    } else if (error.message === 'Parent introuvable') {
      res.status(404).json({ success: false, message: 'Parent introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du parent', error: error.message });
    }
  }
};

export const deleteParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await parentService.deleteParent(parseInt(id));

    res.status(200).json({ success: true, message: 'Parent supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Parent introuvable' });
    } else if (error.code === 'P2003') {
      // Erreur de contrainte de clé étrangère
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce parent. Il est associé à des élèves. Veuillez d\'abord supprimer ces associations.'
      });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du parent' });
    }
  }
};

export const addEleveToParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eleveId } = req.body;

    if (!eleveId) {
      res.status(400).json({ success: false, message: 'Le champ eleveId est obligatoire' });
      return;
    }

    const parent = await parentService.addEleveToParent(parseInt(id), eleveId);
    res.status(200).json({ success: true, message: 'Élève ajouté au parent avec succès', data: parent });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Parent ou élève introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de l\'élève', error: error.message });
    }
  }
};

export const removeEleveFromParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eleveId } = req.body;

    if (!eleveId) {
      res.status(400).json({ success: false, message: 'Le champ eleveId est obligatoire' });
      return;
    }

    const parent = await parentService.removeEleveFromParent(parseInt(id), eleveId);
    res.status(200).json({ success: true, message: 'Élève retiré du parent avec succès', data: parent });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Parent ou élève introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du retrait de l\'élève', error: error.message });
    }
  }
};