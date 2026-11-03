import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import emploiDuTempsService from '../Services/emploiDuTemps.service';
import { generateEmploiDuTempsPDF } from '../Services/emploiDuTempsPdf.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getAllEmploisDuTemps = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const roleName = req.user?.roleName;
    const userId = req.user?.userId;

    let data;

    if (roleName === 'PROFESSEUR') {
      const staff = await prisma.staff.findUnique({ where: { userId } });
      if (!staff) {
        res.status(404).json({ success: false, message: 'Aucun staff lié à cet utilisateur' });
        return;
      }
      data = await emploiDuTempsService.getEmploiDuTempsByStaff(staff.id);
    } else {
      data = await emploiDuTempsService.getAllEmploisDuTemps();
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getEmploiDuTempsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await emploiDuTempsService.getEmploiDuTempsById(parseInt(req.params.id));
    if (!data) {
      res.status(404).json({ success: false, message: 'Emploi du temps introuvable' });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getEmploiDuTempsByClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const classeId = parseInt(req.params.classeId);
    const anneeId = req.query.anneeId ? parseInt(req.query.anneeId as string) : undefined;
    const trimestreId = req.query.trimestreId ? parseInt(req.query.trimestreId as string) : undefined;
    const data = await emploiDuTempsService.getEmploiDuTempsByClasse(classeId, anneeId, trimestreId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getEmploiDuTempsByStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staffId = parseInt(req.params.staffId);
    const anneeId = req.query.anneeId ? parseInt(req.query.anneeId as string) : undefined;
    const data = await emploiDuTempsService.getEmploiDuTempsByStaff(staffId, anneeId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const createEmploiDuTemps = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { classeId, anneeId, trimestreId, jour, heureDebut, heureFin, matiereId, staffId, couleur } = req.body;

    if (!classeId || !anneeId || jour === undefined || !heureDebut || !heureFin || !matiereId || !staffId) {
      res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
      return;
    }

    const data = await emploiDuTempsService.createEmploiDuTemps({
      classeId: parseInt(classeId),
      anneeId: parseInt(anneeId),
      trimestreId: trimestreId ? parseInt(trimestreId) : undefined,
      jour: parseInt(jour),
      heureDebut,
      heureFin,
      matiereId: parseInt(matiereId),
      staffId: parseInt(staffId),
      couleur,
    });

    res.status(201).json({ success: true, message: 'Emploi du temps créé avec succès', data });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Un créneau existe déjà pour ce jour et cette heure dans cette classe' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création', error: error.message });
    }
  }
};

export const updateEmploiDuTemps = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { classeId, anneeId, trimestreId, jour, heureDebut, heureFin, matiereId, staffId, couleur, actif } = req.body;

    const updateData: any = {};
    if (classeId !== undefined) updateData.classeId = parseInt(classeId);
    if (anneeId !== undefined) updateData.anneeId = parseInt(anneeId);
    if (trimestreId !== undefined) updateData.trimestreId = parseInt(trimestreId);
    if (jour !== undefined) updateData.jour = parseInt(jour);
    if (heureDebut !== undefined) updateData.heureDebut = heureDebut;
    if (heureFin !== undefined) updateData.heureFin = heureFin;
    if (matiereId !== undefined) updateData.matiereId = parseInt(matiereId);
    if (staffId !== undefined) updateData.staffId = parseInt(staffId);
    if (couleur !== undefined) updateData.couleur = couleur;
    if (actif !== undefined) updateData.actif = actif;

    const data = await emploiDuTempsService.updateEmploiDuTemps(id, updateData);
    res.status(200).json({ success: true, message: 'Emploi du temps mis à jour avec succès', data });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Emploi du temps introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message });
    }
  }
};

export const deleteEmploiDuTemps = async (req: Request, res: Response): Promise<void> => {
  try {
    await emploiDuTempsService.deleteEmploiDuTemps(parseInt(req.params.id));
    res.status(200).json({ success: true, message: 'Emploi du temps supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Emploi du temps introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression', error: error.message });
    }
  }
};

export const downloadEmploiDuTempsPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const classeId = parseInt(req.params.classeId);
    const anneeId = parseInt(req.params.anneeId);
    if (isNaN(classeId) || isNaN(anneeId)) {
      res.status(400).json({ success: false, message: 'classeId et anneeId sont obligatoires' });
      return;
    }
    const filePath = await generateEmploiDuTempsPDF(classeId, anneeId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="emploi_du_temps_classe_${classeId}.pdf"`);
    res.download(filePath);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF', error: error.message });
  }
};
