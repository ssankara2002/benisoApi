import { Request, Response } from 'express';
import absenceService from '../Services/absence.service';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { sendAbsenceNotificationEmail } from '../Services/email.service';
import { sendAbsenceNotificationSms } from '../Services/sms.service';
const prisma = new PrismaClient();

export const getAllAbsences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const roleName = req.user?.roleName;

    if (!userId || !roleName) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    let absences;

    // Si l'utilisateur est un ELEVE, ne retourner que ses propres absences
    if (roleName === 'ELEVE') {
      const eleve = await prisma.eleve.findUnique({
        where: { userId },
      });

      if (!eleve) {
        res.status(404).json({ success: false, message: 'Aucun élève lié à cet utilisateur' });
        return;
      }

      absences = await prisma.absence.findMany({
        where: { eleveId: eleve.id },
        include: {
          eleve: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
          matiere: true,
          staff: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    // Si l'utilisateur est un PARENT, ne retourner que les absences de ses enfants
    else if (roleName === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: { eleves: true },
      });

      if (!parent) {
        res.status(404).json({ success: false, message: 'Aucun parent lié à cet utilisateur' });
        return;
      }

      const eleveIds = parent.eleves.map(e => e.id);

      absences = await prisma.absence.findMany({
        where: { eleveId: { in: eleveIds } },
        include: {
          eleve: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
          matiere: true,
          staff: {
            include: {
              user: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    // Pour les autres rôles (ADMIN, PROFESSEUR, etc.), retourner toutes les absences
    else {
      absences = await absenceService.getAllAbsences();
    }

    res.status(200).json({ success: true, data: absences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des absences', error: error.message });
  }
};

export const getAbsenceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const absence = await absenceService.getAbsenceById(parseInt(id));

    if (!absence) {
      res.status(404).json({ success: false, message: 'Absence introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: absence });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'absence', error: error.message });
  }
};

export const createAbsence = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { motif, dateDebut, dateFin, justification, eleveId, matiereId, classeId } = req.body;

    if (!dateDebut || !dateFin || justification === undefined || !matiereId || !classeId) {
      res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const isAdmin = req.user?.roleName === 'ADMIN';
    let staffId: number | undefined;

    // Si l'utilisateur n'est pas admin, on vérifie qu'il a un staff lié
    if (!isAdmin) {
      const staff = await prisma.staff.findUnique({
        where: { userId },
      });

      if (!staff) {
        res.status(404).json({ success: false, message: 'Aucun staff lié à cet utilisateur' });
        return;
      }

      staffId = staff.id;
    }

    const absenceData = {
      motif,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      justification,
      eleveId,
      matiereId,
      staffId,
      classeId,
      userId,
    };

    const absence = await absenceService.createAbsence(absenceData);

    // Notifier les parents par email (sans bloquer la réponse)
    try {
      const eleveAvecParents = await prisma.eleve.findUnique({
        where: { id: parseInt(eleveId) },
        include: {
          user: true,
          parents: {
            include: { user: true },
          },
        },
      });

      const matiere = await prisma.matiere.findUnique({ where: { id: parseInt(matiereId) } });

      if (eleveAvecParents && matiere) {
        for (const parent of eleveAvecParents.parents) {
          const parentNom = `${parent.user.prenom} ${parent.user.nom}`;
          if (parent.user?.email) {
            sendAbsenceNotificationEmail(
              parent.user.email,
              parentNom,
              eleveAvecParents.user.nom,
              eleveAvecParents.user.prenom,
              new Date(dateDebut),
              new Date(dateFin),
              matiere.libelle,
              motif,
              justification
            ).catch(err => console.error('Erreur envoi email absence:', err));
          }
          if (parent.user?.phone) {
            sendAbsenceNotificationSms(
              parent.user.phone,
              parentNom,
              eleveAvecParents.user.prenom,
              eleveAvecParents.user.nom,
              matiere.libelle,
              new Date(dateDebut),
            ).catch(err => console.error('Erreur envoi SMS absence:', err));
          }
        }
      }
    } catch (emailErr) {
      console.error('Erreur lors de la récupération des parents pour notification:', emailErr);
    }

    res.status(201).json({ success: true, message: 'Absence créée avec succès', data: absence });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Élève, matière, classe ou personnel introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'absence', error: error.message });
    }
  }
};

export const updateAbsence = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motif, dateDebut, dateFin, justification, eleveId, matiereId, classeId } = req.body;

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const isAdmin = req.user?.roleName === 'ADMIN';
    const absenceData: any = {};

    // Si l'utilisateur n'est pas admin, on vérifie qu'il a un staff lié
    if (!isAdmin) {
      const staff = await prisma.staff.findUnique({ where: { userId } });
      if (!staff) {
        res.status(404).json({ success: false, message: 'Aucun staff lié à cet utilisateur' });
        return;
      }
      absenceData.staffId = staff.id;
    }

    if (motif !== undefined) absenceData.motif = motif;
    if (dateDebut) absenceData.dateDebut = new Date(dateDebut);
    if (dateFin) absenceData.dateFin = new Date(dateFin);
    if (justification !== undefined) absenceData.justification = justification;
    if (eleveId !== undefined) absenceData.eleveId = eleveId;
    if (matiereId !== undefined) absenceData.matiereId = matiereId;
    if (classeId !== undefined) absenceData.classeId = classeId;

    const absence = await absenceService.updateAbsence(parseInt(id), absenceData);

    res.status(200).json({ success: true, message: 'Absence mise à jour avec succès', data: absence });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Absence introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Élève, matière, classe ou personnel introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'absence', error: error.message });
    }
  }
};



export const deleteAbsence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await absenceService.deleteAbsence(parseInt(id));

    res.status(200).json({ success: true, message: 'Absence supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Absence introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'absence', error: error.message });
    }
  }
};

export const getAbsencesNonJustifieesEnHeures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eleveId } = req.params;
    const absences = await absenceService.getAbsencesNonJustifieesEnHeures(parseInt(eleveId));

    res.status(200).json({ success: true, data: absences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des absences de l\'élève', error: error.message });
  }
};

export const getAbsencesByStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;
    const absences = await absenceService.getAbsencesByStaff(parseInt(staffId));

    res.status(200).json({ success: true, data: absences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des absences du personnel', error: error.message });
  }
};

export const getAbsencesByMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matiereId } = req.params;
    const absences = await absenceService.getAbsencesByMatiere(parseInt(matiereId));

    res.status(200).json({ success: true, data: absences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des absences de la matière', error: error.message });
  }
};

export const getAbsencesByPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Les paramètres startDate et endDate sont obligatoires' });
      return;
    }

    const absences = await absenceService.getAbsencesByPeriod(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.status(200).json({ success: true, data: absences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des absences par période', error: error.message });
  }
};