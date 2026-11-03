import { Request, Response } from 'express';
import videoService from '../Services/video.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const videos = await videoService.getAllVideos();
    res.status(200).json({ success: true, data: videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des vidéos', error: error.message });
  }
};

export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(parseInt(id));

    if (!video) {
      res.status(404).json({ success: false, message: 'Vidéo introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: video });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la vidéo', error: error.message });
  }
};

export const createVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { description, niveauId, matiereId } = req.body;
    const userId = req.user?.userId;
    const videoUpload = req.file;

    console.log("createVideo appelé avec:", { description, userId, niveauId, matiereId, file: videoUpload?.filename });

    if (!videoUpload) {
      res.status(400).json({ success: false, message: 'Le fichier vidéo est obligatoire' });
      return;
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const videoPath = `/uploads/${videoUpload.filename}`;
    const videoData = {
      fileVideo: videoPath,
      description,
      userId,
      niveauId: niveauId ? parseInt(niveauId) : undefined,
      matiereId: matiereId ? parseInt(matiereId) : undefined,
    };
    const video = await videoService.createVideo(videoData);

    res.status(201).json({ success: true, message: 'Vidéo créée avec succès', data: video });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la vidéo', error: error.message });
    }
  }
};

export const updateVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, niveauId, matiereId } = req.body;
    const userId = req.user?.userId;
    const videoUpload = req.file;

    console.log("updateVideo appelé avec:", { id, description, userId, niveauId, matiereId, file: videoUpload?.filename });

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const videoPath = videoUpload ? `/uploads/${videoUpload.filename}` : undefined;
    const videoData: any = { description, userId };
    if (videoPath) videoData.fileVideo = videoPath;
    // Permet de dé-lier en passant null
    if (niveauId !== undefined) videoData.niveauId = niveauId ? parseInt(niveauId) : null;
    if (matiereId !== undefined) videoData.matiereId = matiereId ? parseInt(matiereId) : null;

    const video = await videoService.updateVideo(parseInt(id), videoData);

    res.status(200).json({ success: true, message: 'Vidéo mise à jour avec succès', data: video });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Vidéo introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la vidéo', error: error.message });
    }
  }
};

export const getVideosByNiveauController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId } = req.params;
    const videos = await videoService.getVideosByNiveau(parseInt(niveauId));
    res.status(200).json({ success: true, data: videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des vidéos par niveau', error: error.message });
  }
};

export const getVideosByMatiereController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matiereId } = req.params;
    const videos = await videoService.getVideosByMatiere(parseInt(matiereId));
    res.status(200).json({ success: true, data: videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des vidéos par matière', error: error.message });
  }
};


export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await videoService.deleteVideo(parseInt(id));

    res.status(200).json({ success: true, message: 'Vidéo supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Vidéo introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la vidéo', error: error.message });
    }
  }
};