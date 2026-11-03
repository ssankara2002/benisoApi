import { Request, Response } from 'express';
import filiereService from '../Services/filiere.service';

export const getAllFilieres = async (req: Request, res: Response): Promise<void> => {
  try {
    const filieres = await filiereService.getAllFilieres();
    res.status(200).json({ success: true, data: filieres });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des filières', error: error.message });
  }
};

export const getFiliereById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const filiere = await filiereService.getFiliereById(parseInt(id));

    if (!filiere) {
      res.status(404).json({ success: false, message: 'Filière introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: filiere });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la filière', error: error.message });
  }
};

export const createFiliere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom } = req.body;

    if (!nom) {
      res.status(400).json({ success: false, message: 'Le champ nom est obligatoire' });
      return;
    }

    const filiereData = { nom };
    const filiere = await filiereService.createFiliere(filiereData);

    res.status(201).json({ success: true, message: 'Filière créée avec succès', data: filiere });
  } catch (error: any) {
    // P2002 = Erreur de contrainte unique (doublon)
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Cette filière existe déjà.'
      });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la création de la filière' });
    }
  }
};

export const updateFiliere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    const filiereData = { nom };
    const filiere = await filiereService.updateFiliere(parseInt(id), filiereData);

    res.status(200).json({ success: true, message: 'Filière mise à jour avec succès', data: filiere });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Filière introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Cette filière existe déjà.'
      });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la mise à jour de la filière' });
    }
  }
};

export const deleteFiliere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await filiereService.deleteFiliere(parseInt(id));

    res.status(200).json({ success: true, message: 'Filière supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Filière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la filière', error: error.message });
    }
  }
};