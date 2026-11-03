import { Request, Response } from 'express';
import specialiteService from '../Services/specialite.service';

export const getAllSpecialites = async (req: Request, res: Response): Promise<void> => {
  try {
    const specialites = await specialiteService.getAllSpecialites();
    res.status(200).json({ success: true, data: specialites });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des spécialités', error: error.message });
  }
};

export const getSpecialiteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const specialite = await specialiteService.getSpecialiteById(parseInt(id));

    if (!specialite) {
      res.status(404).json({ success: false, message: 'Spécialité introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: specialite });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la spécialité', error: error.message });
  }
};

export const createSpecialite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, filiereId } = req.body;

    if (!nom || !filiereId) {
      res.status(400).json({ success: false, message: 'Les champs nom et filiereId sont obligatoires' });
      return;
    }

    const specialiteData = { nom, filiereId };
    const specialite = await specialiteService.createSpecialite(specialiteData);

    res.status(201).json({ success: true, message: 'Spécialité créée avec succès', data: specialite });
  } catch (error: any) {
    // P2002 = Erreur de contrainte unique (doublon)
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Cette spécialité existe déjà.'
      });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Filière introuvable' });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la création de la spécialité' });
    }
  }
};

export const updateSpecialite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, filiereId } = req.body;

    const specialiteData = { nom, filiereId };
    const specialite = await specialiteService.updateSpecialite(parseInt(id), specialiteData);

    res.status(200).json({ success: true, message: 'Spécialité mise à jour avec succès', data: specialite });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Spécialité introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Cette spécialité existe déjà.'
      });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Filière introuvable' });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la mise à jour de la spécialité' });
    }
  }
};

export const deleteSpecialite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await specialiteService.deleteSpecialite(parseInt(id));

    res.status(200).json({ success: true, message: 'Spécialité supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Spécialité introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la spécialité', error: error.message });
    }
  }
};

export const getSpecialitesByFiliere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filiereId } = req.params;
    const specialites = await specialiteService.getSpecialitesByFiliere(parseInt(filiereId));

    res.status(200).json({ success: true, data: specialites });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des spécialités de la filière', error: error.message });
  }
};

export const addMatiereToSpecialite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { matiereId } = req.body;

    if (!matiereId) {
      res.status(400).json({ success: false, message: 'Le champ matiereId est obligatoire' });
      return;
    }

    const specialite = await specialiteService.addMatiereToSpecialite(parseInt(id), matiereId);
    res.status(200).json({ success: true, message: 'Matière ajoutée à la spécialité avec succès', data: specialite });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Spécialité ou matière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de la matière', error: error.message });
    }
  }
};

export const removeMatiereFromSpecialite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { matiereId } = req.body;

    if (!matiereId) {
      res.status(400).json({ success: false, message: 'Le champ matiereId est obligatoire' });
      return;
    }

    const specialite = await specialiteService.removeMatiereFromSpecialite(parseInt(id), matiereId);
    res.status(200).json({ success: true, message: 'Matière retirée de la spécialité avec succès', data: specialite });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Spécialité ou matière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du retrait de la matière', error: error.message });
    }
  }
};