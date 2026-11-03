import { Request, Response } from 'express';
import galeryService from '../Services/galery.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllGaleries = async (req: Request, res: Response): Promise<void> => {
  try {
    const galeries = await galeryService.getAllGaleries();
    res.status(200).json({ success: true, data: galeries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des galeries', error: error.message });
  }
};

export const getGaleryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const galery = await galeryService.getGaleryById(parseInt(id));

    if (!galery) {
      res.status(404).json({ success: false, message: 'Galerie introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: galery });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la galerie', error: error.message });
  }
};

export const createGalery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { typeId, description } = req.body;
    const userId = req.user?.userId;
    const imageUpload = req.file;

    console.log("createGalery appelé avec:", { typeId, description, userId, file: imageUpload?.filename });

    if (!imageUpload) {
      res.status(400).json({ success: false, message: 'Le fichier image est obligatoire' });
      return;
    }

    if (!typeId) {
      res.status(400).json({ success: false, message: 'Le typeId est obligatoire' });
      return;
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const imagePath = `/uploads/${imageUpload.filename}`;
    const galeryData = {
      image: imagePath,
      typeId: parseInt(typeId, 10),
      description,
      userId
    };
    const galery = await galeryService.createGalery(galeryData);

    res.status(201).json({ success: true, message: 'Galerie créée avec succès', data: galery });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      console.log("Erreur lors de la création de la galerie:", error);
      
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la galerie', error: error.message });
    }
  }
};

export const updateGalery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { typeId, description } = req.body;
    const userId = req.user?.userId;
    const imageUpload = req.file;

    console.log("updateGalery appelé avec:", { id, typeId, description, userId, file: imageUpload?.filename });

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const imagePath = imageUpload ? `/uploads/${imageUpload.filename}` : undefined;
    const galeryData: { image?: string; typeId?: number; description?: string; userId: number } = {
      image: imagePath,
      description,
      userId
    };
    if (typeId) galeryData.typeId = parseInt(typeId, 10);
    const galery = await galeryService.updateGalery(parseInt(id), galeryData);

    res.status(200).json({ success: true, message: 'Galerie mise à jour avec succès', data: galery });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Galerie introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la galerie', error: error.message });
    }
  }
};

export const deleteGalery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await galeryService.deleteGalery(parseInt(id));

    res.status(200).json({ success: true, message: 'Galerie supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Galerie introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la galerie', error: error.message });
    }
  }
};

export const getGaleriesByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const galeries = await galeryService.getGaleriesByType(type);

    res.status(200).json({ success: true, data: galeries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des galeries par type', error: error.message });
  }
};