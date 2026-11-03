import { Request, Response } from 'express';
import typeMatiereService from '../Services/typeMatiere.service';

// Créer un type de matière
export const createTypeMatiere = async (req: Request, res: Response) => {
  try {
    const { libelle } = req.body;

    // Validation
    if (!libelle) {
      return res.status(400).json({
        success: false,
        error: 'Le libellé est requis',
      });
    }

    const typeMatiere = await typeMatiereService.createTypeMatiere({
      libelle,
    });

    res.status(201).json({
      success: true,
      message: 'Type de matière créé avec succès',
      data: typeMatiere,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du type de matière:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer tous les types de matières
export const getAllTypesMatieres = async (req: Request, res: Response) => {
  try {
    const typesMatieres = await typeMatiereService.getAllTypesMatieres();

    res.status(200).json({
      success: true,
      count: typesMatieres.length,
      data: typesMatieres,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des types de matières:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer un type de matière par ID
export const getTypeMatiereById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const typeMatiere = await typeMatiereService.getTypeMatiereById(id);

    res.status(200).json({
      success: true,
      data: typeMatiere,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du type de matière:', error);

    if (error.message === 'Type de matière non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Mettre à jour un type de matière
export const updateTypeMatiere = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const { libelle } = req.body;

    const typeMatiere = await typeMatiereService.updateTypeMatiere(id, {
      libelle,
    });

    res.status(200).json({
      success: true,
      message: 'Type de matière mis à jour avec succès',
      data: typeMatiere,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du type de matière:', error);

    if (error.message === 'Type de matière non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Supprimer un type de matière
export const deleteTypeMatiere = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    await typeMatiereService.deleteTypeMatiere(id);

    res.status(200).json({
      success: true,
      message: 'Type de matière supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du type de matière:', error);

    if (error.message === 'Type de matière non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('Impossible de supprimer')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

export default {
  createTypeMatiere,
  getAllTypesMatieres,
  getTypeMatiereById,
  updateTypeMatiere,
  deleteTypeMatiere,
};
