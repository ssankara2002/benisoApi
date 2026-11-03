import { Request, Response } from 'express';
import actualiteService from '../Services/actualite.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllActualites = async (req: Request, res: Response): Promise<void> => {
  try {
    const actualites = await actualiteService.getAllActualites();
    res.status(200).json({ success: true, data: actualites });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des actualités', error: error.message });
  }
};

export const getActualiteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const actualite = await actualiteService.getActualiteById(parseInt(id));

    if (!actualite) {
      res.status(404).json({ success: false, message: 'Actualité introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: actualite });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'actualité", error: error.message });
  }
};

export const createActualite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nom, description, typeId, date } = req.body;
    const userId = req.user?.userId;
    const imageFile = req.file;

    if (!nom || !typeId) {
      res.status(400).json({ success: false, message: 'Les champs nom et typeId sont obligatoires' });
      return;
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;

    const actualiteData = {
      nom,
      description,
      imageIllustration: imagePath,
      typeId: parseInt(typeId),
      userId,
      date,
    };

    const actualite = await actualiteService.createActualite(actualiteData);

    res.status(201).json({ success: true, message: 'Actualité créée avec succès', data: actualite });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'actualité :", error);
    if (error.code === 'P2003') { // Foreign key constraint failed
        res.status(400).json({ success: false, message: "L'utilisateur ou le type spécifié est introuvable." });
    } else {
        res.status(500).json({ success: false, message: "Erreur lors de la création de l'actualité", error: error.message });
    }
  }
};

export const updateActualite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, typeId, date } = req.body;
    const imageFile = req.file;

    const updateData: any = {};
    if (nom) updateData.nom = nom;
    if (description) updateData.description = description;
    if (typeId) updateData.typeId = parseInt(typeId);
    if (date) updateData.date = date;

    if (imageFile) {
      updateData.imageIllustration = `/uploads/${imageFile.filename}`;
    }

    const actualite = await actualiteService.updateActualite(parseInt(id), updateData);

    res.status(200).json({ success: true, message: 'Actualité mise à jour avec succès', data: actualite });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'actualité :", error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Actualité introuvable' });
    } else {
      res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'actualité", error: error.message });
    }
  }
};

export const deleteActualite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await actualiteService.deleteActualite(parseInt(id));

    res.status(200).json({ success: true, message: 'Actualité supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Actualité introuvable' });
    } else {
      res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'actualité", error: error.message });
    }
  }
};