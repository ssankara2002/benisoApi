import { Request, Response } from 'express';
import leavePermissionService from '../Services/leavePermission.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllLeavePermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.roleName;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Si l'utilisateur est ADMIN, il voit toutes les permissions
    // Sinon (STAFF ou ELEVE), il ne voit que ses propres permissions
    const leavePermissions = userRole === 'ADMIN'
      ? await leavePermissionService.getAllLeavePermissions()
      : await leavePermissionService.getLeavePermissionsByUser(userId);

    res.status(200).json({ success: true, data: leavePermissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des permissions de congé', error: error.message });
  }
};

export const getLeavePermissionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    const userId = req.user?.userId;
    const userRole = req.user?.roleName;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    if (!id || isNaN(parsedId)) {
      res.status(400).json({ success: false, message: 'ID invalide' });
      return;
    }

    const leavePermission = await leavePermissionService.getLeavePermissionById(parsedId);

    if (!leavePermission) {
      res.status(404).json({ success: false, message: 'Permission de congé introuvable' });
      return;
    }

    // Si l'utilisateur n'est pas admin, vérifier qu'il accède à sa propre permission
    if (userRole !== 'ADMIN' && leavePermission.userId !== userId) {
      res.status(403).json({ success: false, message: 'Accès refusé : vous ne pouvez voir que vos propres permissions' });
      return;
    }

    res.status(200).json({ success: true, data: leavePermission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la permission de congé', error: error.message });
  }
};

export const createLeavePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { motif, dateDebut, dateFin, statut, userId } = req.body;
    const requestingUserId = req.user?.userId;

    if (!requestingUserId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Si userId est fourni dans le body (admin qui crée pour quelqu'un d'autre), l'utiliser
    // Sinon, utiliser l'userId de l'utilisateur connecté (staff/élève créant pour lui-même)
    const targetUserId = userId || requestingUserId;

    const leavePermissionData = {
      motif,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      userId: targetUserId,
      statut
    };
    const leavePermission = await leavePermissionService.createLeavePermission(leavePermissionData);

    res.status(201).json({ success: true, message: 'Permission de congé créée avec succès', data: leavePermission });
  } catch (error: any) {
    console.log(error);

    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la permission de congé', error: error.message });
    }
  }
};

export const updateLeavePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motif, dateDebut, dateFin, statut, userId } = req.body;
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.roleName;

    if (!requestingUserId || !userRole) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Récupérer la permission existante pour vérifier les droits
    const existingPermission = await leavePermissionService.getLeavePermissionById(parseInt(id));

    if (!existingPermission) {
      res.status(404).json({ success: false, message: 'Permission de congé introuvable' });
      return;
    }

    // Si l'utilisateur n'est pas admin, vérifier qu'il modifie sa propre permission
    if (userRole !== 'ADMIN' && existingPermission.userId !== requestingUserId) {
      res.status(403).json({ success: false, message: 'Accès refusé : vous ne pouvez modifier que vos propres permissions' });
      return;
    }

    // Si userId est fourni dans le body et que l'utilisateur n'est pas admin, ignorer ce changement
    const targetUserId = (userRole === 'ADMIN' && userId) ? userId : existingPermission.userId;

    const leavePermissionData = {
      motif,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      statut,
      userId: targetUserId
    };
    const leavePermission = await leavePermissionService.updateLeavePermission(parseInt(id), leavePermissionData);

    res.status(200).json({ success: true, message: 'Permission de congé mise à jour avec succès', data: leavePermission });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Permission de congé introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la permission de congé', error: error.message });
    }
  }
};

export const deleteLeavePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.roleName;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Récupérer la permission existante pour vérifier les droits
    const existingPermission = await leavePermissionService.getLeavePermissionById(parseInt(id));

    if (!existingPermission) {
      res.status(404).json({ success: false, message: 'Permission de congé introuvable' });
      return;
    }

    // Si l'utilisateur n'est pas admin, vérifier qu'il supprime sa propre permission
    if (userRole !== 'ADMIN' && existingPermission.userId !== userId) {
      res.status(403).json({ success: false, message: 'Accès refusé : vous ne pouvez supprimer que vos propres permissions' });
      return;
    }

    await leavePermissionService.deleteLeavePermission(parseInt(id));

    res.status(200).json({ success: true, message: 'Permission de congé supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Permission de congé introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la permission de congé', error: error.message });
    }
  }
};

export const getLeavePermissionsByUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.roleName;

    if (!requestingUserId || !userRole) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    const targetUserId = parseInt(userId);

    // Si l'utilisateur n'est pas admin, vérifier qu'il accède à ses propres permissions
    if (userRole !== 'ADMIN' && targetUserId !== requestingUserId) {
      res.status(403).json({ success: false, message: 'Accès refusé : vous ne pouvez voir que vos propres permissions' });
      return;
    }

    const leavePermissions = await leavePermissionService.getLeavePermissionsByUser(targetUserId);

    res.status(200).json({ success: true, data: leavePermissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des permissions de congé de l\'utilisateur', error: error.message });
  }
};

export const getLeavePermissionsByPeriod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, dateDebut, dateFin } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.roleName;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Accepter soit startDate/endDate soit dateDebut/dateFin
    const debut = startDate || dateDebut;
    const fin = endDate || dateFin;

    if (!debut || !fin) {
      res.status(400).json({ success: false, message: 'Les paramètres de date sont obligatoires (startDate/endDate ou dateDebut/dateFin)' });
      return;
    }

    const leavePermissions = await leavePermissionService.getLeavePermissionsByPeriod(
      new Date(debut as string),
      new Date(fin as string),
      userRole === 'ADMIN' ? undefined : userId
    );

    res.status(200).json({ success: true, data: leavePermissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des permissions de congé par période', error: error.message });
  }

};
 export  const approveLeavePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await leavePermissionService.approveLeavePermission(parseInt(id));

    res.status(200).json({
      success: true,
      message: "La permission a été approuvée avec succès",
      data: permission
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Permission introuvable" });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'approbation de la permission",
        error: error.message
      });
    }
  }
};
 export const rejectLeavePermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await leavePermissionService.rejectLeavePermission(parseInt(id));

    res.status(200).json({
      success: true,
      message: "La permission a été rejetée",
      data: permission
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Permission introuvable" });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors du rejet de la permission",
        error: error.message
      });
    }
  }
};


