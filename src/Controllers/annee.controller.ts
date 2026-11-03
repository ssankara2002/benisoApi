import { Request, Response } from 'express';
import anneeService from '../Services/annee.service';

export const getAllAnnees = async (req: Request, res: Response): Promise<void> => {
  try {
    const annees = await anneeService.getAllAnnees();
    res.status(200).json({ success: true, data: annees });
  } catch (error: any) {
    console.log(error);
    
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des années', error: error.message });
  }
};

export const getAnneeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const annee = await anneeService.getAnneeById(parseInt(id));

    if (!annee) {
      res.status(404).json({ success: false, message: 'Année introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: annee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'année', error: error.message });
  }
};

export const createAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { libelle, dateDebut, dateFin } = req.body;

    const anneeData = {
      libelle,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined
    };
    const annee = await anneeService.createAnnee(anneeData);

    res.status(201).json({ success: true, message: 'Année créée avec succès', data: annee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'année', error: error.message });
  }
};

export const updateAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { libelle, dateDebut, dateFin } = req.body;

    const anneeData = {
      libelle,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined
    };
    const annee = await anneeService.updateAnnee(parseInt(id), anneeData);

    res.status(200).json({ success: true, message: 'Année mise à jour avec succès', data: annee });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Année introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'année', error: error.message });
    }
  }
};

export const deleteAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await anneeService.deleteAnnee(parseInt(id));

    res.status(200).json({ success: true, message: 'Année supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Année introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'année', error: error.message });
    }
  }
};

export const getCurrentAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const annee = await anneeService.getCurrentAnnee();

    if (!annee) {
      res.status(404).json({ success: false, message: 'Aucune année scolaire en cours trouvée' });
      return;
    }

    res.status(200).json({ success: true, data: annee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'année courante', error: error.message });
  }
};