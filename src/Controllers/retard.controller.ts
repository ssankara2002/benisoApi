import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import retardService from '../Services/retard.service';
import { PrismaClient } from '@prisma/client';
import { sendRetardNotificationEmail } from '../Services/email.service';
import { sendRetardNotificationSms } from '../Services/sms.service';
const prisma = new PrismaClient();

export const getAllRetards = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const roleName = req.user?.roleName;

    if (!userId || !roleName) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    let retards;

    // Si l'utilisateur est un ELEVE, ne retourner que ses propres retards
    if (roleName === 'ELEVE') {
      const eleve = await prisma.eleve.findUnique({
        where: { userId },
      });

      if (!eleve) {
        res.status(404).json({ success: false, message: 'Aucun élève lié à cet utilisateur' });
        return;
      }

      retards = await prisma.retard.findMany({
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
          classe: true,
        },
        orderBy: { date: 'desc' }
      });
    }
    // Si l'utilisateur est un PARENT, ne retourner que les retards de ses enfants
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

      retards = await prisma.retard.findMany({
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
          classe: true,
        },
        orderBy: { date: 'desc' }
      });
    }
    // Pour les autres rôles (ADMIN, PROFESSEUR, etc.), retourner tous les retards
    else {
      retards = await retardService.getAllRetards();
    }

    res.status(200).json({ success: true, data: retards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des retards', error: error.message });
  }
};

export const getRetardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);

    if (!id || isNaN(parsedId)) {
      res.status(400).json({ success: false, message: 'ID invalide' });
      return;
    }

    const retard = await retardService.getRetardById(parsedId);

    if (!retard) {
      res.status(404).json({ success: false, message: 'Retard introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: retard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du retard', error: error.message });
  }
};

export const createRetard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { date, justification, autorisation, confProf, eleveId,classeId, matiereId } = req.body;



    if (!date || !eleveId || !matiereId) {
      res.status(400).json({ success: false, message: 'Les champs date, eleveId et matiereId sont obligatoires' });
      return;
    }
    console.log(autorisation);


    const retardData = {
      date: new Date(date),
      justification,
      autorisation,
      confProf,
      eleveId,
      matiereId,
      classeId,
      userId: req.user?.userId
    };
    const retard = await retardService.createRetard(retardData);

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
            sendRetardNotificationEmail(
              parent.user.email,
              parentNom,
              eleveAvecParents.user.nom,
              eleveAvecParents.user.prenom,
              new Date(date),
              matiere.libelle,
              justification,
              autorisation
            ).catch(err => console.error('Erreur envoi email retard:', err));
          }
          if (parent.user?.phone) {
            sendRetardNotificationSms(
              parent.user.phone,
              parentNom,
              eleveAvecParents.user.prenom,
              eleveAvecParents.user.nom,
              matiere.libelle,
              new Date(date),
            ).catch(err => console.error('Erreur envoi SMS retard:', err));
          }
        }
      }
    } catch (emailErr) {
      console.error('Erreur lors de la récupération des parents pour notification:', emailErr);
    }

    res.status(201).json({ success: true, message: 'Retard créé avec succès', data: retard });
  } catch (error: any) {
    console.log(error);

    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Élève ou matière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création du retard', error: error.message });
    }
  }
};

export const updateRetard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, justification, autorisation, confProf, eleveId, matiereId, classeId } = req.body;



    const retardData = {
      date: date ? new Date(date) : undefined,
      justification,
      autorisation,
      confProf,
      eleveId,
      matiereId,
      classeId
    };
    const retard = await retardService.updateRetard(parseInt(id), retardData);

    res.status(200).json({ success: true, message: 'Retard mis à jour avec succès', data: retard });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Retard introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Élève ou matière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du retard', error: error.message });
    }
  }
};

export const deleteRetard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await retardService.deleteRetard(parseInt(id));

    res.status(200).json({ success: true, message: 'Retard supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Retard introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression du retard', error: error.message });
    }
  }
};

export const getRetardsByEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eleveId } = req.params;
    const retards = await retardService.getRetardsByEleve(parseInt(eleveId));

    res.status(200).json({ success: true, data: retards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des retards de l\'élève', error: error.message });
  }
};

export const getRetardsByMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matiereId } = req.params;
    const retards = await retardService.getRetardsByMatiere(parseInt(matiereId));

    res.status(200).json({ success: true, data: retards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des retards de la matière', error: error.message });
  }
};

export const getRetardsByPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Les paramètres startDate et endDate sont obligatoires' });
      return;
    }

    const retards = await retardService.getRetardsByPeriod(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.status(200).json({ success: true, data: retards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des retards par période', error: error.message });
  }
};