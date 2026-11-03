import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import accueilService from '../Services/accueil.service';
import { log } from 'util';

export const getAllAccueils = async (req: Request, res: Response): Promise<void> => {
  try {
    const accueils = await accueilService.getAllAccueils();
    res.status(200).json({ success: true, data: accueils });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des pages d\'accueil', error: error.message });
  }
};

export const getAccueilById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accueil = await accueilService.getAccueilById(parseInt(id));

    if (!accueil) {
      res.status(404).json({ success: false, message: 'Page d\'accueil introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: accueil });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la page d\'accueil', error: error.message });
  }
};

export const createAccueil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nom, titre, description } = req.body;
    const userId = req.user?.userId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];

    console.log("createAccueil appelé avec:", { nom, titre, description, userId });

    if (!nom) {
      res.status(400).json({ success: false, message: 'Le champ nom est obligatoire' });
      return;
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      return;
    }

    // Séparer logoEcole et images selon le champ fieldname
    let logoEcolePath: string | undefined;
    let imagePaths: string[] = [];

    if (files && !Array.isArray(files)) {
      const logoFiles = (files as any)['logoEcole'] as Express.Multer.File[] | undefined;
      const imageFiles = (files as any)['images'] as Express.Multer.File[] | undefined;
      if (logoFiles && logoFiles.length > 0) {
        logoEcolePath = `/uploads/${logoFiles[0].filename}`;
      }
      if (imageFiles && imageFiles.length > 0) {
        imagePaths = imageFiles.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      }
    } else if (Array.isArray(files) && files.length > 0) {
      imagePaths = (files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    }

    const accueilData = { nom, titre, description, logoEcole: logoEcolePath, images: imagePaths, userId };
    const accueil = await accueilService.createAccueil(accueilData);

    res.status(201).json({ success: true, message: 'Page d\'accueil créée avec succès', data: accueil });
  } catch (error: any) {
    if (error.code === 'P2003') {
      console.log("Erreur dans createAccueil: Utilisateur introuvable", error);
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else if (error.message && error.message.includes('Un accueil existe déjà')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      console.log("Erreur dans createAccueil:", error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la page d\'accueil', error: error.message });
    }
  }
};

export const updateAccueil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, titre, description } = req.body;
    const userId = req.user?.userId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];

    console.log("updateAccueil appelé avec:", { id, nom, titre, description, userId });

    const accueilData: any = { nom, titre, description };

    if (userId) {
      accueilData.userId = userId;
    }

    if (files && !Array.isArray(files)) {
      const logoFiles = (files as any)['logoEcole'] as Express.Multer.File[] | undefined;
      const imageFiles = (files as any)['images'] as Express.Multer.File[] | undefined;
      if (logoFiles && logoFiles.length > 0) {
        accueilData.logoEcole = `/uploads/${logoFiles[0].filename}`;
      }
      if (imageFiles && imageFiles.length > 0) {
        accueilData.images = imageFiles.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      }
    } else if (Array.isArray(files) && files.length > 0) {
      accueilData.images = (files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    }

    const accueil = await accueilService.updateAccueil(parseInt(id), accueilData);

    res.status(200).json({ success: true, message: 'Page d\'accueil mise à jour avec succès', data: accueil });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Page d\'accueil introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      console.log("Erreur dans updateAccueil:", error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la page d\'accueil', error: error.message });
    }
  }
};

export const deleteAccueil = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await accueilService.deleteAccueil(parseInt(id));

    res.status(200).json({ success: true, message: 'Page d\'accueil supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Page d\'accueil introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la page d\'accueil', error: error.message });
    }
  }
};

export const getAccueilsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const accueils = await accueilService.getAccueilsByUser(parseInt(userId));

    res.status(200).json({ success: true, data: accueils });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des pages d\'accueil de l\'utilisateur', error: error.message });
  }
};

export const getWelcome = (req: Request, res: Response): void => {
  res.status(200).json({
    message: "Bienvenue sur l'API de gestion d'école",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/auth",
      users: "/users",
      roles: "/roles",
      permissions: "/permissions",
      accueils: "/accueils",
      eleves: "/eleves",
      parents: "/parents",
      staff: "/staff",
      classes: "/classes",
      niveaux: "/niveaux",
      annees: "/annees",
      matieres: "/matieres",
      notes: "/notes",
      evaluations: "/evaluations",
      inscriptions: "/inscriptions",
      paiements: "/paiements",
      retards: "/retards",
      absences: "/absences",
      specialites: "/specialites",
      filieres: "/filieres",
      evenements: "/evenements",
      contacts: "/contacts",
      cours: "/cours",
      galeries: "/galeries",
      presentations: "/presentations",
      videos: "/videos"
    }
  });
};

export const getAdminDashboard = (req: AuthenticatedRequest, res: Response): void => {
  res.status(200).json({
    message: "Dashboard Administrateur",
    user: {
      role: req.user?.roleName,
      email: req.user?.email
    },
    statistics: {
      totalUsers: "À calculer",
      totalEleves: "À calculer",
      totalStaff: "À calculer",
      totalAccueils: "À calculer"
    },
    actions: {
      canCreateUsers: true,
      canManageRoles: true,
      canViewReports: true,
      availableEndpoints: {
        users: "/users",
        roles: "/roles",
        permissions: "/permissions",
        accueils: "/accueils",
        eleves: "/eleves",
        staff: "/staff",
        classes: "/classes"
      }
    }
  });
};
