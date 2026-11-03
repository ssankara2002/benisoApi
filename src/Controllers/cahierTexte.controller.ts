import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cahierTexteService from '../Services/cahierTexte.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
  exportCahierPDF,
  exportCahierClassePDF,
  exportCahierWord,
  exportCahierClasseWord,
} from '../Services/cahierTexteExport.service';

const prisma = new PrismaClient();

export const getAllCahiersTexte = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      data = await cahierTexteService.getCahiersTexteByStaff(staff.id);
    } else {
      // ADMIN, PROVISEUR et autres rôles voient tout
      data = await cahierTexteService.getAllCahiersTexte();
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getCahierTexteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await cahierTexteService.getCahierTexteById(parseInt(req.params.id));
    if (!data) {
      res.status(404).json({ success: false, message: 'Cahier de texte introuvable' });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getCahierTexteBySeance = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await cahierTexteService.getCahierTexteBySeance(parseInt(req.params.seanceId));
    res.status(200).json({ success: true, data: data || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getCahiersTexteByClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const classeId = parseInt(req.params.classeId);
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut as string) : undefined;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin as string) : undefined;
    const data = await cahierTexteService.getCahiersTexteByClasse(classeId, dateDebut, dateFin);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const getCahiersTexteByStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await cahierTexteService.getCahiersTexteByStaff(parseInt(req.params.staffId));
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message });
  }
};

export const createCahierTexte = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { seanceId, contenu, devoirs, dateRemise, observations, fichiers, signatureProf, dateSignature } = req.body;
    const userId = req.user?.userId;

    if (!seanceId || !contenu) {
      res.status(400).json({ success: false, message: 'seanceId et contenu sont obligatoires' });
      return;
    }

    const roleName = req.user?.roleName;
    const staff = await prisma.staff.findUnique({ where: { userId } });

    // L'admin peut créer sans être staff — il faut alors un staffId explicite dans le body ou null
    if (!staff && roleName !== 'ADMIN') {
      res.status(404).json({ success: false, message: 'Aucun staff lié à cet utilisateur' });
      return;
    }

    const staffId = staff ? staff.id : (req.body.staffId ? parseInt(req.body.staffId) : null);
    if (!staffId) {
      res.status(400).json({ success: false, message: 'staffId obligatoire pour un admin sans profil staff' });
      return;
    }

    // Marquer la séance comme effectuée automatiquement
    await prisma.seance.update({
      where: { id: parseInt(seanceId) },
      data: { statut: 'EFFECTUE' },
    });

    const data = await cahierTexteService.createCahierTexte({
      seanceId: parseInt(seanceId),
      contenu,
      devoirs,
      dateRemise: dateRemise ? new Date(dateRemise) : undefined,
      observations,
      fichiers: fichiers || [],
      staffId,
      signatureProf: signatureProf || undefined,
      dateSignature: signatureProf ? (dateSignature ? new Date(dateSignature) : new Date()) : undefined,
    });

    res.status(201).json({ success: true, message: 'Cahier de texte créé avec succès', data });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Un cahier de texte existe déjà pour cette séance' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création', error: error.message });
    }
  }
};

export const updateCahierTexte = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { contenu, devoirs, dateRemise, observations, fichiers, signatureProf, dateSignature } = req.body;

    const updateData: any = {};
    if (contenu !== undefined) updateData.contenu = contenu;
    if (devoirs !== undefined) updateData.devoirs = devoirs;
    if (dateRemise !== undefined) updateData.dateRemise = new Date(dateRemise);
    if (observations !== undefined) updateData.observations = observations;
    if (fichiers !== undefined) updateData.fichiers = fichiers;
    if (signatureProf !== undefined) {
      updateData.signatureProf = signatureProf;
      updateData.dateSignature = signatureProf ? (dateSignature ? new Date(dateSignature) : new Date()) : null;
    }

    const data = await cahierTexteService.updateCahierTexte(id, updateData);
    res.status(200).json({ success: true, message: 'Cahier de texte mis à jour avec succès', data });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Cahier de texte introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message });
    }
  }
};

export const deleteCahierTexte = async (req: Request, res: Response): Promise<void> => {
  try {
    await cahierTexteService.deleteCahierTexte(parseInt(req.params.id));
    res.status(200).json({ success: true, message: 'Cahier de texte supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Cahier de texte introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression', error: error.message });
    }
  }
};

export const validerCahierTexte = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const roleName = req.user?.roleName;
    if (roleName !== 'ADMIN' && roleName !== 'DIRECTEUR') {
      res.status(403).json({ success: false, message: 'Seul un administrateur peut valider un cahier de texte' });
      return;
    }
    const data = await cahierTexteService.validerCahierTexte(parseInt(req.params.id));
    res.status(200).json({ success: true, message: 'Cahier de texte validé avec succès', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la validation', error: error.message });
  }
};

export const exportCahierTextePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const buffer = await exportCahierPDF(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cahier-texte-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (error: any) {
    if (error.message === 'Cahier introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF', error: error.message });
    }
  }
};

export const exportCahierTexteWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const buffer = await exportCahierWord(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="cahier-texte-${id}.docx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (error: any) {
    if (error.message === 'Cahier introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du document Word', error: error.message });
    }
  }
};

export const exportCahiersClassePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const classeId = parseInt(req.params.classeId);
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut as string) : undefined;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin as string) : undefined;
    const buffer = await exportCahierClassePDF(classeId, dateDebut, dateFin);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cahier-texte-classe-${classeId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (error: any) {
    if (error.message?.includes('Aucun cahier')) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF', error: error.message });
    }
  }
};

export const exportCahiersClasseWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const classeId = parseInt(req.params.classeId);
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut as string) : undefined;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin as string) : undefined;
    const buffer = await exportCahierClasseWord(classeId, dateDebut, dateFin);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="cahier-texte-classe-${classeId}.docx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (error: any) {
    if (error.message?.includes('Aucun cahier')) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du document Word', error: error.message });
    }
  }
};
