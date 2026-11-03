import { Request, Response } from 'express';
import enseignementAnneeService from '../Services/enseignementAnnee.service';
import {
  HTTP_200_OK,
  HTTP_201_CREATE,
  HTTP_400_BAD_REQUEST,
  HTTP_404_NOT_FOUND,
  HTTP_500_INTERNAL_SERVER_ERROR,
} from '../Constantes/httpStatus';

/**
 * Récupérer tous les enseignements (optionnellement filtrés par année)
 */
export const getAllEnseignements = async (req: Request, res: Response) => {
  try {
    const anneeId = req.query.anneeId ? Number(req.query.anneeId) : undefined;
    const enseignements = await enseignementAnneeService.getAllEnseignements(anneeId);

    res.status(HTTP_200_OK).json({
      success: true,
      data: enseignements,
      message: 'Enseignements récupérés avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des enseignements',
    });
  }
};

/**
 * Récupérer un enseignement par son ID
 */
export const getEnseignementById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const enseignement = await enseignementAnneeService.getEnseignementById(id);

    if (!enseignement) {
      return res.status(HTTP_404_NOT_FOUND).json({
        success: false,
        message: 'Enseignement non trouvé',
      });
    }

    res.status(HTTP_200_OK).json({
      success: true,
      data: enseignement,
      message: 'Enseignement récupéré avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'enseignement',
    });
  }
};

/**
 * Récupérer les enseignements d'un professeur
 */
export const getEnseignementsByStaff = async (req: Request, res: Response) => {
  try {
    const staffId = Number(req.params.staffId);
    const anneeId = req.query.anneeId ? Number(req.query.anneeId) : undefined;

    const enseignements = await enseignementAnneeService.getEnseignementsByStaff(
      staffId,
      anneeId
    );

    res.status(HTTP_200_OK).json({
      success: true,
      data: enseignements,
      message: 'Enseignements du professeur récupérés avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des enseignements',
    });
  }
};

/**
 * Récupérer l'enseignant d'une matière dans une classe pour une année
 */
export const getEnseignantByMatiereClasse = async (req: Request, res: Response) => {
  try {
    const { matiereId, classeId, anneeId } = req.query;

    if (!matiereId || !classeId || !anneeId) {
      return res.status(HTTP_400_BAD_REQUEST).json({
        success: false,
        message: 'Les paramètres matiereId, classeId et anneeId sont requis',
      });
    }

    const enseignement = await enseignementAnneeService.getEnseignantByMatiereClasse(
      Number(matiereId),
      Number(classeId),
      Number(anneeId)
    );

    if (!enseignement) {
      return res.status(HTTP_404_NOT_FOUND).json({
        success: false,
        message: 'Aucun enseignant trouvé pour cette matière et cette classe',
      });
    }

    res.status(HTTP_200_OK).json({
      success: true,
      data: enseignement,
      message: 'Enseignant récupéré avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'enseignant',
    });
  }
};

/**
 * Récupérer tous les enseignements d'une classe pour une année
 */
export const getEnseignementsByClasse = async (req: Request, res: Response) => {
  try {
    const classeId = Number(req.params.classeId);
    const anneeId = Number(req.query.anneeId);

    if (!anneeId) {
      return res.status(HTTP_400_BAD_REQUEST).json({
        success: false,
        message: 'Le paramètre anneeId est requis',
      });
    }

    const enseignements = await enseignementAnneeService.getEnseignementsByClasse(
      classeId,
      anneeId
    );

    res.status(HTTP_200_OK).json({
      success: true,
      data: enseignements,
      message: 'Enseignements de la classe récupérés avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des enseignements',
    });
  }
};

/**
 * Créer un nouvel enseignement
 */
export const createEnseignement = async (req: Request, res: Response) => {
  try {
    const { staffId, matiereId, classeId, anneeId, volumeHoraire } = req.body;

    if (!staffId || !matiereId || !classeId || !anneeId) {
      return res.status(HTTP_400_BAD_REQUEST).json({
        success: false,
        message: 'Les champs staffId, matiereId, classeId et anneeId sont requis',
      });
    }

    const enseignement = await enseignementAnneeService.createEnseignement({
      staffId: Number(staffId),
      matiereId: Number(matiereId),
      classeId: Number(classeId),
      anneeId: Number(anneeId),
      volumeHoraire: volumeHoraire ? Number(volumeHoraire) : undefined,
    });

    res.status(HTTP_201_CREATE).json({
      success: true,
      data: enseignement,
      message: 'Enseignement créé avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'enseignement',
    });
  }
};

/**
 * Mettre à jour un enseignement
 */
export const updateEnseignement = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      staffId,
      matiereId,
      classeId,
      anneeId,
      volumeHoraire,
    } = req.body;

    const enseignement = await enseignementAnneeService.updateEnseignement(id, {
      staffId: staffId !== undefined ? Number(staffId) : undefined,
      matiereId: matiereId !== undefined ? Number(matiereId) : undefined,
      classeId: classeId !== undefined ? Number(classeId) : undefined,
      anneeId: anneeId !== undefined ? Number(anneeId) : undefined,
      volumeHoraire:
        volumeHoraire !== undefined ? Number(volumeHoraire) : undefined,
    });

    res.status(HTTP_200_OK).json({
      success: true,
      data: enseignement,
      message: 'Enseignement mis à jour avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de l\'enseignement',
    });
  }
};

/**
 * Supprimer un enseignement
 */
export const deleteEnseignement = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await enseignementAnneeService.deleteEnseignement(id);

    res.status(HTTP_200_OK).json({
      success: true,
      message: 'Enseignement supprimé avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de l\'enseignement',
    });
  }
};

/**
 * Récupérer le volume horaire total d'un enseignant pour une année
 */
export const getVolumeHoraireTotal = async (req: Request, res: Response) => {
  try {
    const staffId = Number(req.params.staffId);
    const anneeId = Number(req.query.anneeId);

    if (!anneeId) {
      return res.status(HTTP_400_BAD_REQUEST).json({
        success: false,
        message: 'Le paramètre anneeId est requis',
      });
    }

    const volumeTotal = await enseignementAnneeService.getVolumeHoraireTotal(
      staffId,
      anneeId
    );

    res.status(HTTP_200_OK).json({
      success: true,
      data: { volumeTotal },
      message: 'Volume horaire total récupéré avec succès',
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors du calcul du volume horaire',
    });
  }
};
