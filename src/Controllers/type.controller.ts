import { Request, Response } from 'express';
import typeService from '../Services/type.service';

/**
 * Récupérer tous les types
 */
export const getAllTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await typeService.getAllTypes();
    res.status(200).json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des types', error: error.message });
  }
};

/**
 * Récupérer un type par son ID
 */
export const getTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const type = await typeService.getTypeById(parseInt(id));

    if (!type) {
      res.status(404).json({ success: false, message: 'Type introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: type });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du type', error: error.message });
  }
};

/**
 * Créer un nouveau type
 */
export const createType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom } = req.body;

    if (!nom || nom.trim() === '') {
      res.status(400).json({ success: false, message: 'Le champ nom est obligatoire' });
      return;
    }

    const type = await typeService.createType({ nom });
    res.status(201).json({ success: true, message: 'Type créé avec succès', data: type });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Violation contrainte unique
      res.status(400).json({ success: false, message: 'Un type avec ce nom existe déjà' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création du type', error: error.message });
    }
  }
};

/**
 * Mettre à jour un type existant
 */
export const updateType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    if (nom && nom.trim() === '') {
      res.status(400).json({ success: false, message: 'Le champ nom ne peut pas être vide' });
      return;
    }

    const type = await typeService.updateType(parseInt(id), { nom });
    res.status(200).json({ success: true, message: 'Type mis à jour avec succès', data: type });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Type introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un type avec ce nom existe déjà' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du type', error: error.message });
    }
  }
};

/**
 * Supprimer un type
 */
export const deleteType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await typeService.deleteType(parseInt(id));
    res.status(200).json({ success: true, message: 'Type supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Type introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression du type', error: error.message });
    }
  }
};
