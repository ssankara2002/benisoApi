import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import parentSpaceService from '../Services/parentSpace.service';

const toInt = (v: unknown) => (v ? parseInt(v as string) : undefined);

// GET /api/parent-space/mes-enfants
export const getMesEnfants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await parentSpaceService.getMesEnfants(req.user!.userId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') || error.message.includes('introuvable') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/parent-space/enfants/:eleveId/situation?anneeId=&classeId=
export const getSituationDEnfant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const anneeId = toInt(req.query.anneeId);
    const classeId = toInt(req.query.classeId);

    const data = await parentSpaceService.getSituationDEnfant(req.user!.userId, eleveId, { anneeId, classeId });
    if (!data) {
      res.status(404).json({ success: false, message: 'Aucune inscription trouvée pour cet élève' });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/parent-space/enfants/:eleveId/notes?anneeId=&classeId=&trimestreId=
export const getNotesDEnfant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const anneeId = toInt(req.query.anneeId);
    const classeId = toInt(req.query.classeId);
    const trimestreId = toInt(req.query.trimestreId);

    const data = await parentSpaceService.getNotesDEnfant(req.user!.userId, eleveId, { anneeId, classeId, trimestreId });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/parent-space/enfants/:eleveId/absences?anneeId=&classeId=
export const getAbsencesDEnfant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const anneeId = toInt(req.query.anneeId);
    const classeId = toInt(req.query.classeId);

    const data = await parentSpaceService.getAbsencesDEnfant(req.user!.userId, eleveId, { anneeId, classeId });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/parent-space/enfants/:eleveId/retards?anneeId=&classeId=
export const getRetardsDEnfant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const anneeId = toInt(req.query.anneeId);
    const classeId = toInt(req.query.classeId);

    const data = await parentSpaceService.getRetardsDEnfant(req.user!.userId, eleveId, { anneeId, classeId });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/parent-space/enfants/:eleveId/paiements?anneeId=
export const getPaiementsDEnfant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const anneeId = toInt(req.query.anneeId);

    const data = await parentSpaceService.getPaiementsDEnfant(req.user!.userId, eleveId, { anneeId });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/parent-space/enfants/:eleveId/evaluations?anneeId=&classeId=&trimestreId=
export const getEvaluationsDEnfant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const anneeId = toInt(req.query.anneeId);
    const classeId = toInt(req.query.classeId);
    const trimestreId = toInt(req.query.trimestreId);

    const data = await parentSpaceService.getEvaluationsDEnfant(req.user!.userId, eleveId, { anneeId, classeId, trimestreId });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    const status = error.message.startsWith('Accès refusé') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
