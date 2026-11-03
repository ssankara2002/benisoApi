import { Request, Response } from 'express';
import trimestreService from '../Services/trimestre.service';

// Créer un trimestre
export const createTrimestre = async (req: Request, res: Response) => {
  try {
    const { nom, dateDebut, dateFin, anneeId } = req.body;

    // Validation
    if (!nom || !anneeId) {
      return res.status(400).json({
        success: false,
        error: 'Le nom et l\'année sont requis',
      });
    }

    const trimestre = await trimestreService.createTrimestre({
      nom,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      anneeId: parseInt(anneeId),
    });

    res.status(201).json({
      success: true,
      message: 'Trimestre créé avec succès',
      data: trimestre,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du trimestre:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer tous les trimestres
export const getAllTrimestres = async (req: Request, res: Response) => {
  try {
    const trimestres = await trimestreService.getAllTrimestres();

    res.status(200).json({
      success: true,
      count: trimestres.length,
      data: trimestres,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des trimestres:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer les trimestres par année
export const getTrimestresByAnnee = async (req: Request, res: Response) => {
  try {
    const anneeId = parseInt(req.params.anneeId);

    if (isNaN(anneeId)) {
      return res.status(400).json({
        success: false,
        error: 'ID d\'année invalide',
      });
    }

    const trimestres = await trimestreService.getTrimestresByAnnee(anneeId);

    res.status(200).json({
      success: true,
      count: trimestres.length,
      data: trimestres,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des trimestres:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer un trimestre par ID
export const getTrimestreById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const trimestre = await trimestreService.getTrimestreById(id);

    res.status(200).json({
      success: true,
      data: trimestre,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du trimestre:', error);

    if (error.message === 'Trimestre non trouvé') {
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

// Mettre à jour un trimestre
export const updateTrimestre = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const { nom, dateDebut, dateFin, anneeId } = req.body;

    const trimestre = await trimestreService.updateTrimestre(id, {
      nom,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      anneeId: anneeId ? parseInt(anneeId) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Trimestre mis à jour avec succès',
      data: trimestre,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du trimestre:', error);

    if (error.message === 'Trimestre non trouvé') {
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

// Supprimer un trimestre
export const deleteTrimestre = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    await trimestreService.deleteTrimestre(id);

    res.status(200).json({
      success: true,
      message: 'Trimestre supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du trimestre:', error);

    if (error.message === 'Trimestre non trouvé') {
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

// Invalider/Valider un trimestre
export const toggleTrimestreValidation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { invalide } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    if (typeof invalide !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Le champ invalide doit être un booléen',
      });
    }

    const trimestre = await trimestreService.toggleTrimestreValidation(id, invalide);

    res.status(200).json({
      success: true,
      message: invalide ? 'Trimestre invalidé avec succès' : 'Trimestre validé avec succès',
      data: trimestre,
    });
  } catch (error: any) {
    console.error('Erreur lors de la modification du trimestre:', error);

    if (error.message === 'Trimestre non trouvé') {
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

export default {
  createTrimestre,
  getAllTrimestres,
  getTrimestresByAnnee,
  getTrimestreById,
  updateTrimestre,
  deleteTrimestre,
  toggleTrimestreValidation,
};
