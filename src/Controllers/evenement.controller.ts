import { Request, Response } from 'express';
import evenementService from '../Services/evenement.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllEvenements = async (req: Request, res: Response): Promise<void> => {
  try {
    const evenements = await evenementService.getAllEvenements();
    res.status(200).json({ success: true, data: evenements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des événements', error: error.message });
  }
};

export const getEvenementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const evenement = await evenementService.getEvenementById(parseInt(id));

    if (!evenement) {
      res.status(404).json({ success: false, message: 'Événement introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: evenement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'événement', error: error.message });
  }
};


export const createEvenement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nom, dateDebut, dateFin, lieu, image } = req.body;
    const userId = req.user?.userId; // Récupère l'ID de l'utilisateur connecté
    if (!nom) {
      res.status(400).json({ success: false, message: 'Le champ nom est obligatoire' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const evenementData = {
      nom,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      lieu,
      image,
      userId // user who created the event
    };

    const evenement = await evenementService.createEvenement(evenementData);

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: evenement,
    });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Matière ou utilisateur introuvable' });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'événement',
        error: error.message,
      });
    }
  }
};

export const updateEvenement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
        const userId = req.user?.userId; // Récupère l'ID de l'utilisateur connecté
    const { nom, dateDebut, dateFin, lieu, image } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const evenementData = {
      nom,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      lieu,
      image,
      userId
    };

    const evenement = await evenementService.updateEvenement(
      parseInt(id),
      evenementData
    );

    res.status(200).json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: evenement,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Événement introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Matière ou utilisateur introuvable' });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'événement',
        error: error.message,
      });
    }
  }
};

export const deleteEvenement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await evenementService.deleteEvenement(parseInt(id));

    res.status(200).json({ success: true, message: 'Événement supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Événement introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'événement', error: error.message });
    }
  }
};



// getEvenementsByMatiere removed from controller: matiere filtering is not exposed via API anymore

export const getEvenementsByPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Les paramètres startDate et endDate sont obligatoires' });
      return;
    }

    const evenements = await evenementService.getEvenementsByPeriod(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.status(200).json({ success: true, data: evenements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des événements par période', error: error.message });
  }
};