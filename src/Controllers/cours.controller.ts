import { Request, Response } from 'express';
import coursService from '../Services/cours.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllCours = async (req: Request, res: Response): Promise<void> => {
  try {
    const cours = await coursService.getAllCours();
    res.status(200).json({ success: true, data: cours });
  } catch (error: any) {
    console.log(error);
    
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des cours', error: error.message });
  }
};

export const getCoursById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cours = await coursService.getCoursById(parseInt(id));

    if (!cours) {
      res.status(404).json({ success: false, message: 'Cours introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: cours });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du cours', error: error.message });
  }
};

export const createCours = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nom, description, niveauId, matiereId } = req.body;
    const userId = req.user?.userId; // Récupère l'ID de l'utilisateur connecté
    const fileUpload = req.file; // Le fichier uploadé

    console.log("createCours appelé avec:", { nom, description, userId, file: fileUpload?.filename });

    if (!nom) {
      res.status(400).json({ success: false, message: 'Le champ nom est obligatoire' });
      return;
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

  // Construire le chemin du fichier si un fichier a été uploadé
  const filePath = fileUpload ? `/uploads/${fileUpload.filename}` : null;

  const coursData = { nom, description, file: filePath, userId, niveauId: niveauId ? Number(niveauId) : undefined, matiereId: matiereId ? Number(matiereId) : undefined };
  const cours = await coursService.createCours(coursData);

    res.status(201).json({ success: true, message: 'Cours créé avec succès', data: cours });
  } catch (error: any) {
    console.error("Erreur lors de la création du cours:", error);
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création du cours', error: error.message });
    }
  }
};

export const updateCours = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, niveauId, matiereId } = req.body;
    const userId = req.user?.userId; // Récupère l'ID de l'utilisateur connecté
    const fileUpload = req.file; // Le nouveau fichier uploadé (optionnel)

    console.log("updateCours appelé avec:", { id, nom, description, userId, file: fileUpload?.filename });

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

  // Construire le chemin du fichier si un nouveau fichier a été uploadé
  const filePath = fileUpload ? `/uploads/${fileUpload.filename}` : undefined;

  const coursData = { nom, description, file: filePath, userId, niveauId: niveauId ? Number(niveauId) : undefined, matiereId: matiereId ? Number(matiereId) : undefined };
  const cours = await coursService.updateCours(parseInt(id), coursData);

    res.status(200).json({ success: true, message: 'Cours mis à jour avec succès', data: cours });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du cours:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Cours introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du cours', error: error.message });
    }
  }
};

export const deleteCours = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await coursService.deleteCours(parseInt(id));

    res.status(200).json({ success: true, message: 'Cours supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Cours introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression du cours', error: error.message });
    }
  }
};

export const addEleveToCours = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🎯 addEleveToCours appelé avec:", { params: req.params, body: req.body });
    const { id } = req.params;
    const { eleveId } = req.body;

    if (!eleveId) {
      res.status(400).json({ success: false, message: 'Le champ eleveId est obligatoire' });
      return;
    }

    const cours = await coursService.addEleveToCours(parseInt(id), eleveId);
    res.status(200).json({ success: true, message: 'Élève ajouté au cours avec succès', data: cours });
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log("Erreur P2025 détectée dans addEleveToCours:", error);
      
      res.status(404).json({ success: false, message: 'Cours ou élève introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de l\'élève', error: error.message });
    }
  }
};

export const removeEleveFromCours = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eleveId } = req.body;

    if (!eleveId) {
      res.status(400).json({ success: false, message: 'Le champ eleveId est obligatoire' });
      return;
    }

    const cours = await coursService.removeEleveFromCours(parseInt(id), eleveId);
    res.status(200).json({ success: true, message: 'Élève retiré du cours avec succès', data: cours });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Cours ou élève introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du retrait de l\'élève', error: error.message });
    }
  }
};