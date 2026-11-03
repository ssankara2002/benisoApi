import { Request, Response } from 'express';
import serieService from '../Services/serie.service';

/**
 * Récupérer toutes les séries
 */
export const getAllSeries = async (req: Request, res: Response): Promise<void> => {
  try {
    const series = await serieService.getAllSeries();
    res.status(200).json(series);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des séries:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des séries' });
  }
};

/**
 * Récupérer une série par ID
 */
export const getSerieById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const serie = await serieService.getSerieById(Number(id));

    if (!serie) {
      res.status(404).json({ error: 'Série introuvable' });
      return;
    }

    res.status(200).json(serie);
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la série:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la série' });
  }
};

/**
 * Créer une nouvelle série
 */
export const createSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, niveauId } = req.body;

    if (!nom || !niveauId) {
      res.status(400).json({ error: 'Le nom et le niveau sont requis' });
      return;
    }

    const serie = await serieService.createSerie({ nom, niveauId: Number(niveauId) });
    res.status(201).json(serie);
  } catch (error: any) {
    console.log('Erreur lors de la création de la série:', error);

    if (error.message.includes('existe déjà')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de la série' });
    }
  }
};

/**
 * Mettre à jour une série
 */
export const updateSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, niveauId } = req.body;

    const data: any = {};
    if (nom) data.nom = nom;
    if (niveauId) data.niveauId = Number(niveauId);

    const serie = await serieService.updateSerie(Number(id), data);
    res.status(200).json(serie);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la série:', error);

    if (error.message.includes('introuvable')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('existe déjà')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la série' });
    }
  }
};

/**
 * Supprimer une série
 */
export const deleteSerie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await serieService.deleteSerie(Number(id));
    res.status(200).json({ message: 'Série supprimée avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la série:', error);

    if (error.message.includes('introuvable')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Impossible de supprimer')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression de la série' });
    }
  }
};

/**
 * Récupérer les séries par niveau
 */
export const getSeriesByNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId } = req.params;
    const series = await serieService.getSeriesByNiveau(Number(niveauId));
    res.status(200).json(series);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des séries par niveau:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des séries par niveau' });
  }
};

/**
 * Vérifier si un nom de série existe déjà
 */
export const checkSerieNameExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom } = req.query;
    const { excludeId } = req.query;

    if (!nom || typeof nom !== 'string') {
      res.status(400).json({ error: 'Le nom de la série est requis' });
      return;
    }

    const exists = await serieService.checkSerieNameExists(
      nom,
      excludeId ? Number(excludeId) : undefined
    );

    res.status(200).json({ exists });
  } catch (error: any) {
    console.error('Erreur lors de la vérification du nom de série:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du nom de série' });
  }
};
