import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from './authMiddleware';

const prisma = new PrismaClient();

/**
 * Middleware pour vérifier que le staff connecté est bien le propriétaire de l'évaluation
 * Ce middleware vérifie que le staff qui tente d'accéder aux notes d'une évaluation
 * est bien celui qui a créé cette évaluation
 */
export const checkEvaluationOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Récupérer le staff associé à l'utilisateur
    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      res.status(403).json({ success: false, message: 'Seul un staff peut accéder aux notes' });
      return;
    }

    // Récupérer evaluationId depuis les params ou le body
    const evaluationId = req.params.evaluationId || req.body.evaluationId;

    if (!evaluationId) {
      res.status(400).json({ success: false, message: 'evaluationId est requis' });
      return;
    }

    // Récupérer l'évaluation
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: parseInt(evaluationId) },
    });

    if (!evaluation) {
      res.status(404).json({ success: false, message: 'Évaluation introuvable' });
      return;
    }

    // Vérifier que le staff de l'évaluation correspond au staff connecté
    if (evaluation.staffId !== staff.id) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé : Vous ne pouvez gérer que les notes de vos propres évaluations'
      });
      return;
    }

    // Si tout est OK, passer au prochain middleware/controller
    next();
  } catch (error: any) {
    
    .error('Erreur dans checkEvaluationOwnership:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification des droits', error: error.message });
  }
};

/**
 * Middleware pour vérifier que le staff connecté est bien le propriétaire de la note
 * via l'évaluation associée
 */
export const checkNoteOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Récupérer le staff associé à l'utilisateur
    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      res.status(403).json({ success: false, message: 'Seul un staff peut gérer les notes' });
      return;
    }

    // Récupérer noteId depuis les params
    const noteId = req.params.id;

    if (!noteId) {
      res.status(400).json({ success: false, message: 'noteId est requis' });
      return;
    }

    // Récupérer la note avec son évaluation
    const note = await prisma.note.findUnique({
      where: { id: parseInt(noteId) },
      include: {
        evaluation: true,
      },
    });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note introuvable' });
      return;
    }

    if (!note.evaluation) {
      res.status(400).json({ success: false, message: 'Cette note n\'a pas d\'évaluation associée' });
      return;
    }

    // Vérifier que le staff de l'évaluation correspond au staff connecté
    if (note.evaluation.staffId !== staff.id) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé : Vous ne pouvez gérer que les notes de vos propres évaluations'
      });
      return;
    }

    // Si tout est OK, passer au prochain middleware/controller
    next();
  } catch (error: any) {
    
    .error('Erreur dans checkNoteOwnership:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification des droits', error: error.message });
  }
};
