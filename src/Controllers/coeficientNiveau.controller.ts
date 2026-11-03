import { Request, Response } from 'express';
import coeficientNiveauService from '../Services/coeficientNiveau.service';

/**
 * Récupérer tous les coefficients niveau
 */
export const getAllCoeficientNiveaux = async (req: Request, res: Response): Promise<void> => {
  try {
    const coeficients = await coeficientNiveauService.getAllCoeficientNiveaux();
    res.status(200).json(coeficients);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des coefficients niveau:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des coefficients niveau' });
  }
};

/**
 * Récupérer un coefficient niveau par ID
 */
export const getCoeficientNiveauById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coeficient = await coeficientNiveauService.getCoeficientNiveauById(Number(id));

    if (!coeficient) {
      res.status(404).json({ error: 'Coefficient niveau introuvable' });
      return;
    }

    res.status(200).json(coeficient);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du coefficient niveau:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du coefficient niveau' });
  }
};

/**
 * Créer un nouveau coefficient niveau
 */
export const createCoeficientNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { valeur, niveauId, matiereId } = req.body;

    if (!valeur || !niveauId || !matiereId) {
      res.status(400).json({ error: 'La valeur, niveauId et matiereId sont requis' });
      return;
    }

    const coeficient = await coeficientNiveauService.createCoeficientNiveau({ 
      valeur, 
      niveauId: Number(niveauId), 
      matiereId: Number(matiereId) 
    });
    res.status(201).json(coeficient);
  } catch (error: any) {
    console.error('Erreur lors de la création du coefficient niveau:', error);
    res.status(500).json({ error: 'Erreur lors de la création du coefficient niveau' });
  }
};

/**
 * Mettre à jour un coefficient niveau
 */
export const updateCoeficientNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { valeur } = req.body;

    const coeficient = await coeficientNiveauService.updateCoeficientNiveau(Number(id), { valeur });
    res.status(200).json(coeficient);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du coefficient niveau:', error);

    if (error.message.includes('introuvable')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du coefficient niveau' });
    }
  }
};

/**
 * Supprimer un coefficient niveau
 */
export const deleteCoeficientNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await coeficientNiveauService.deleteCoeficientNiveau(Number(id));
    res.status(200).json({ message: 'Coefficient niveau supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du coefficient niveau:', error);

    if (error.message.includes('introuvable')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Impossible de supprimer')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du coefficient niveau' });
    }
  }
};
