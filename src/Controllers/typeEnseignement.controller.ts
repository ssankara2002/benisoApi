import { Request, Response } from 'express';
import typeEnseignementService from '../Services/typeEnseignement.service';

/**
 * Récupérer tous les types d'enseignement
 */
export const getAllTypeEnseignements = async (req: Request, res: Response): Promise<void> => {
  try {
    const typeEnseignements = await typeEnseignementService.getAllTypeEnseignements();
    res.status(200).json(typeEnseignements);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des types d\'enseignement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des types d\'enseignement' });
  }
};

/**
 * Récupérer un type d'enseignement par ID
 */
export const getTypeEnseignementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const typeEnseignement = await typeEnseignementService.getTypeEnseignementById(Number(id));

    if (!typeEnseignement) {
      res.status(404).json({ error: 'Type d\'enseignement introuvable' });
      return;
    }

    res.status(200).json(typeEnseignement);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du type d\'enseignement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du type d\'enseignement' });
  }
};

/**
 * Créer un nouveau type d'enseignement
 */
export const createTypeEnseignement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom } = req.body;

    if (!nom) {
      res.status(400).json({ error: 'Le nom est requis' });
      return;
    }

    const typeEnseignement = await typeEnseignementService.createTypeEnseignement({ nom });
    res.status(201).json(typeEnseignement);
  } catch (error: any) {
    console.error('Erreur lors de la création du type d\'enseignement:', error);

    // P2002 = Erreur de contrainte unique (doublon)
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Ce type d\'enseignement existe déjà.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du type d\'enseignement'
      });
    }
  }
};

/**
 * Mettre à jour un type d'enseignement
 */
export const updateTypeEnseignement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    const typeEnseignement = await typeEnseignementService.updateTypeEnseignement(Number(id), { nom });
    res.status(200).json(typeEnseignement);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du type d\'enseignement:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Type d\'enseignement introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Ce type d\'enseignement existe déjà.'
      });
    } else if (error.message.includes('introuvable')) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du type d\'enseignement'
      });
    }
  }
};

/**
 * Supprimer un type d'enseignement
 */
export const deleteTypeEnseignement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await typeEnseignementService.deleteTypeEnseignement(Number(id));
    res.status(200).json({ success: true, message: 'Type d\'enseignement supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du type d\'enseignement:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Type d\'enseignement introuvable' });
    } else if (error.code === 'P2003') {
      // Erreur de contrainte de clé étrangère
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce type d\'enseignement. Il possède des niveaux associés. Veuillez d\'abord supprimer ces niveaux.'
      });
    } else if (error.message.includes('Impossible de supprimer')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du type d\'enseignement' });
    }
  }
};
