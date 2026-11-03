import { Request, Response } from 'express';
import coeficientSerieService from '../Services/coeficientSerie.service';

/**
 * Récupérer tous les coefficients série
 */
export const getAllCoeficientSeries = async (req: Request, res: Response): Promise<void> => {
  try {
    const coeficients = await coeficientSerieService.getAllCoeficientSeries();
    res.status(200).json(coeficients);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des coefficients série:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des coefficients série' });
  }
};

/**
 * Récupérer un coefficient série par ID
 */
export const getCoeficientSerieById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coeficient = await coeficientSerieService.getCoeficientSerieById(Number(id));

    if (!coeficient) {
      res.status(404).json({ error: 'Coefficient série introuvable' });
      return;
    }

    res.status(200).json(coeficient);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du coefficient série:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du coefficient série' });
  }
};

/**
 * Créer un nouveau coefficient série
 */
export const createCoeficientSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { valeur, matiereId, serieId, niveauId } = req.body;

    if (valeur === undefined || valeur === null || !matiereId || !serieId || !niveauId) {
      res.status(400).json({ error: 'La valeur, matiereId, serieId et niveauId sont requis' });
      return;
    }

    const coeficient = await coeficientSerieService.createCoeficientSerie({
      valeur: Number(valeur),
      matiereId: Number(matiereId),
      serieId: Number(serieId),
      niveauId: Number(niveauId),
    });
    res.status(201).json(coeficient);
  } catch (error: any) {
    console.error('Erreur lors de la création du coefficient série:', error);
    res.status(500).json({ error: 'Erreur lors de la création du coefficient série' });
  }
};

/**
 * Mettre à jour un coefficient série
 */
export const updateCoeficientSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { valeur, matiereId, serieId, niveauId } = req.body;

    const data: any = {};
    if (valeur !== undefined) data.valeur = Number(valeur);
    if (matiereId !== undefined) data.matiereId = Number(matiereId);
    if (serieId !== undefined) data.serieId = Number(serieId);
    if (niveauId !== undefined) data.niveauId = Number(niveauId);

    const coeficient = await coeficientSerieService.updateCoeficientSerie(Number(id), data);
    res.status(200).json(coeficient);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du coefficient série:', error);

    if (error.message.includes('introuvable')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du coefficient série' });
    }
  }
};

/**
 * Supprimer un coefficient série
 */
export const deleteCoeficientSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await coeficientSerieService.deleteCoeficientSerie(Number(id));
    res.status(200).json({ message: 'Coefficient série supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du coefficient série:', error);

    if (error.message.includes('introuvable')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Impossible de supprimer')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du coefficient série' });
    }
  }
};
