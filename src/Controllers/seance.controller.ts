import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import seanceService from '../Services/seance.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getAllSeances = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await seanceService.getAllSeances();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getSeanceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await seanceService.getSeanceById(parseInt(req.params.id));
    if (!data) {
      res.status(404).json({ success: false, message: 'Séance introuvable' });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getSeancesByEmploiDuTemps = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await seanceService.getSeancesByEmploiDuTemps(parseInt(req.params.emploiDuTempsId));
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getSeancesByClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const classeId = parseInt(req.params.classeId);
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut as string) : undefined;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin as string) : undefined;
    const data = await seanceService.getSeancesByClasse(classeId, dateDebut, dateFin);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getSeancesByStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const staffId = parseInt(req.params.staffId);
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut as string) : undefined;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin as string) : undefined;
    const data = await seanceService.getSeancesByStaff(staffId, dateDebut, dateFin);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const createSeance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emploiDuTempsId, date, statut, motifAnnulation } = req.body;

    if (!emploiDuTempsId || !date) {
      res.status(400).json({ success: false, message: 'emploiDuTempsId et date sont obligatoires' });
      return;
    }

    const data = await seanceService.createSeance({
      emploiDuTempsId: parseInt(emploiDuTempsId),
      date: new Date(date),
      statut: statut || 'PLANIFIE',
      motifAnnulation,
    });

    res.status(201).json({ success: true, message: 'Séance créée avec succès', data });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Une séance existe déjà pour cet emploi du temps à cette date' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création', error: error.message });
    }
  }
};

export const updateSeance = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { date, statut, motifAnnulation } = req.body;

    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (statut !== undefined) updateData.statut = statut;
    if (motifAnnulation !== undefined) updateData.motifAnnulation = motifAnnulation;

    const data = await seanceService.updateSeance(id, updateData);
    res.status(200).json({ success: true, message: 'Séance mise à jour avec succès', data });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Séance introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message });
    }
  }
};

export const deleteSeance = async (req: Request, res: Response): Promise<void> => {
  try {
    await seanceService.deleteSeance(parseInt(req.params.id));
    res.status(200).json({ success: true, message: 'Séance supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Séance introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression', error: error.message });
    }
  }
};
