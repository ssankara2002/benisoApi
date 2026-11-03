import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import presentationService from '../Services/presentation.service';

export const getAllPresentations = async (req: Request, res: Response): Promise<void> => {
  try {
    const presentations = await presentationService.getAllPresentations();
    res.status(200).json({ success: true, data: presentations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des présentations', error: error.message });
  }
};

export const getPresentationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const presentation = await presentationService.getPresentationById(parseInt(id));

    if (!presentation) {
      res.status(404).json({ success: false, message: 'Présentation introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: presentation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la présentation', error: error.message });
  }
};

export const createPresentation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { description, histoire, mission } = req.body;
    const userId = req.user?.userId;

    console.log("createPresentation appelé avec:", { description, histoire, mission, userId });

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }


   

    const presentationData = { description, histoire, mission,  userId: userId };
    const presentation = await presentationService.createPresentation(presentationData);

    res.status(201).json({ success: true, message: 'Présentation créée avec succès', data: presentation });
  } catch (error: any) {
    if (error.code === 'P2003') {
      console.log("Erreur dans createPresentation: Relation invalide", error);
      res.status(400).json({ success: false, message: 'Erreur de relation - vérifiez les données' });
    } else if (error.message && error.message.includes('Une présentation existe déjà')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      console.log("Erreur dans createPresentation:", error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la présentation', error: error.message });
    }
  }
};

export const updatePresentation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, histoire, mission } = req.body;
    const userId = req.user?.userId;

    console.log("updatePresentation appelé avec:", { id, description, histoire, mission, userId});

    const presentationData: any = { description, histoire, mission };

   

  
    const presentation = await presentationService.updatePresentation(parseInt(id), presentationData);

    res.status(200).json({ success: true, message: 'Présentation mise à jour avec succès', data: presentation });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Présentation introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Erreur de relation - vérifiez les données' });
    } else {
      console.log("Erreur dans updatePresentation:", error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la présentation', error: error.message });
    }
  }
};

export const deletePresentation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await presentationService.deletePresentation(parseInt(id));

    res.status(200).json({ success: true, message: 'Présentation supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Présentation introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la présentation', error: error.message });
    }
  }
};