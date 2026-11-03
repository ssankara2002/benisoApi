import { Request, Response } from 'express';
import evaluationService from '../Services/evaluation.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const evaluations = await evaluationService.getAllEvaluations();
    res.status(200).json({ success: true, data: evaluations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des évaluations', error: error.message });
  }
};

export const getEvaluationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const evaluation = await evaluationService.getEvaluationById(parseInt(id));

    if (!evaluation) {
      res.status(404).json({ success: false, message: 'Évaluation introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'évaluation', error: error.message });
  }
};

export const createEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { date, type, matiereId, classeId, anneeId, staffId: requestedStaffId } = req.body;

    if (!date) {
      res.status(400).json({ success: false, message: 'Le champ date est obligatoire' });
      return;
    }

    if (!matiereId || !classeId || !anneeId) {
      res.status(400).json({ success: false, message: 'Les champs matiereId, classeId et anneeId sont obligatoires' });
      return;
    }

    // Récupérer le staffId depuis le user connecté
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Vérifier que l'utilisateur a un staff associé (sauf pour l'admin)
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Récupérer le rôle de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    let staffId = null;

    // Si c'est un admin, il doit fournir un staffId
    if (user?.role?.name === 'ADMIN') {
      if (!requestedStaffId) {
        res.status(400).json({ success: false, message: 'Le champ staffId est obligatoire pour un admin' });
        return;
      }
      staffId = parseInt(requestedStaffId);
    } else {
      // Si c'est un staff, on récupère son staffId automatiquement
      const staff = await prisma.staff.findUnique({
        where: { userId },
      });

      if (!staff) {
        res.status(403).json({ success: false, message: 'Seul un staff ou un admin peut créer une évaluation' });
        return;
      }
      staffId = staff.id;
    }

    const evaluationData: any = {
      date: new Date(date),
      type,
      matiereId: parseInt(matiereId),
      classeId: parseInt(classeId),
      anneeId: parseInt(anneeId),
      staffId: staffId,
    };
    const evaluation = await evaluationService.createEvaluation(evaluationData);

    res.status(201).json({ success: true, message: 'Évaluation créée avec succès', data: evaluation });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Matière, classe ou année introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'évaluation', error: error.message });
    }
  }
};

export const updateEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, type, matiereId, classeId, anneeId, staffId } = req.body;

    const evaluationData: any = {
      date: date ? new Date(date) : undefined,
      type,
    };

    if (matiereId) evaluationData.matiereId = parseInt(matiereId);
    if (classeId) evaluationData.classeId = parseInt(classeId);
    if (anneeId) evaluationData.anneeId = parseInt(anneeId);
    if (staffId) evaluationData.staffId = parseInt(staffId);

    const evaluation = await evaluationService.updateEvaluation(parseInt(id), evaluationData);

    res.status(200).json({ success: true, message: 'Évaluation mise à jour avec succès', data: evaluation });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Évaluation introuvable' });
    } else if (error.message.includes('introuvable')) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'évaluation', error: error.message });
    }
  }
};

export const deleteEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await evaluationService.deleteEvaluation(parseInt(id));

    res.status(200).json({ success: true, message: 'Évaluation supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Évaluation introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'évaluation', error: error.message });
    }
  }
};

export const getEvaluationsByMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matiereId } = req.params;
    const evaluations = await evaluationService.getEvaluationsByMatiere(parseInt(matiereId));

    res.status(200).json({ success: true, data: evaluations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des évaluations de la matière', error: error.message });
  }
};

export const getEvaluationsByClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classeId } = req.params;
    const evaluations = await evaluationService.getEvaluationsByClasse(parseInt(classeId));

    res.status(200).json({ success: true, data: evaluations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des évaluations de la classe', error: error.message });
  }
};

export const getEvaluationsByAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anneeId } = req.params;
    const evaluations = await evaluationService.getEvaluationsByAnnee(parseInt(anneeId));

    res.status(200).json({ success: true, data: evaluations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des évaluations de l\'année', error: error.message });
  }
};