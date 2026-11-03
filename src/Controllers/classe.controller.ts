import { Request, Response } from 'express';
import classeService from '../Services/classe.service';

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const classes = await classeService.getAllClasses();
    res.status(200).json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des classes', error: error.message });
  }
};

export const getClasseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const classe = await classeService.getClasseById(parseInt(id));

    if (!classe) {
      res.status(404).json({ success: false, message: 'Classe introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: classe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la classe', error: error.message });
  }
};

export const createClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, capacite, niveauId } = req.body;

    if (!nom) {
      res.status(400).json({ success: false, message: 'Le champ nom est obligatoire' });
      return;
    }

    const classeData = { nom, capacite, niveauId };
    const classe = await classeService.createClasse(classeData);

    res.status(201).json({ success: true, message: 'Classe créée avec succès', data: classe });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Niveau introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la classe', error: error.message });
    }
  }
};

export const updateClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, capacite, niveauId } = req.body;

    const classeData = { nom, capacite, niveauId };
    const classe = await classeService.updateClasse(parseInt(id), classeData);

    res.status(200).json({ success: true, message: 'Classe mise à jour avec succès', data: classe });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Classe introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Niveau introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la classe', error: error.message });
    }
  }
};

export const deleteClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await classeService.deleteClasse(parseInt(id));

    res.status(200).json({ success: true, message: 'Classe supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Classe introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la classe', error: error.message });
    }
  }
};

export const getClassesByNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId } = req.params;
    const classes = await classeService.getClassesByNiveau(parseInt(niveauId));

    res.status(200).json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des classes du niveau', error: error.message });
  }
};