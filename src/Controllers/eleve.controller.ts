import { Request, Response } from 'express';
import eleveService from '../Services/eleve.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllEleves = async (req: Request, res: Response): Promise<void> => {
  try {
    const eleves = await eleveService.getAllEleves();
    res.status(200).json({ success: true, data: eleves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des élèves', error: error.message });
  }
};

export const getEleveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const eleve = await eleveService.getEleveById(parseInt(id));

    if (!eleve) {
      res.status(404).json({ success: false, message: 'Élève introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: eleve });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'élève', error: error.message });
  }
};

export const createEleve = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nom, prenom, email, password, adresse, phone, filiereId, dateNaissance } = req.body;

  try {
    // 1. Valider les informations de base de l'utilisateur
    if (!nom || !prenom || !email || !password) {
      res.status(400).json({ success: false, message: 'Les champs nom, prenom, email et password sont obligatoires.' });
      return;
    }

    // 2. Récupérer les fichiers uploadés
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const acteNaissance = files?.acteNaissance?.[0]?.path;
    const bulletin = files?.bulletin?.map(file => file.path) || [];
    const attestation = files?.attestation?.[0]?.path;
    const photo = files?.photo?.[0]?.path; // Photo optionnelle

    // 3. Créer l'utilisateur avec le rôle "ELEVE"
    const newUser = await eleveService.createUserForEleve({
      nom,
      prenom,
      email,
      password,
      adresse,
      phone,
    });

    // 4. Créer l'élève avec l'ID du nouvel utilisateur
    const eleveData = {
      userId: newUser.id,
      filiereId: filiereId ? parseInt(filiereId) : undefined,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
      acteNaissance,
      bulletin,
      attestation,
      photo // Ajout de la photo (optionnelle)
    };
    const eleve = await eleveService.createEleve(eleveData);

    res.status(201).json({
      success: true,
      message: 'Élève créé avec succès',
      data: eleve,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Gère les conflits d'email unique
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Filière introuvable' });
    } else if (error.message?.startsWith('Le mot de passe')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      console.error('❌ Erreur lors de la création de l\'élève:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'élève', error: error.message });
    }
  }
};

export const updateEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, adresse, phone, filiereId, dateNaissance } = req.body;

    // Récupérer les fichiers uploadés
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const acteNaissance = files?.acteNaissance?.[0]?.path;
    const bulletin = files?.bulletin?.map(file => file.path) || [];
    const attestation = files?.attestation?.[0]?.path;

    const eleveData = {
      nom,
      prenom,
      email,
      adresse,
      phone,
      filiereId: filiereId ? parseInt(filiereId) : undefined,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
      acteNaissance,
      bulletin,
      attestation
    };
    const eleve = await eleveService.updateEleve(parseInt(id), eleveData);

    res.status(200).json({ success: true, message: 'Élève mis à jour avec succès', data: eleve });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Élève introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Filière introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'élève', error: error.message });
    }
  }
};

export const deleteEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await eleveService.deleteEleve(parseInt(id));

    res.status(200).json({ success: true, message: 'Élève supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Élève introuvable' });
    } else if (error.code === 'P2003') {
      // Erreur de contrainte de clé étrangère
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cet élève. Il possède des données associées (inscriptions, notes, paiements, etc.). Veuillez d\'abord supprimer ces données.'
      });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression de l\'élève' });
    }
  }
};

export const addMatiereToEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { matiereId } = req.body;

    if (!matiereId) {
      res.status(400).json({ success: false, message: 'Le champ matiereId est obligatoire' });
      return;
    }

    const eleve = await eleveService.addMatiereToEleve(parseInt(id), matiereId);
    res.status(200).json({ success: true, message: 'Matière ajoutée à l\'élève avec succès', data: eleve });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Élève ou matière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de la matière', error: error.message });
    }
  }
};

export const removeMatiereFromEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { matiereId } = req.body;

    if (!matiereId) {
      res.status(400).json({ success: false, message: 'Le champ matiereId est obligatoire' });
      return;
    }

    const eleve = await eleveService.removeMatiereFromEleve(parseInt(id), matiereId);
    res.status(200).json({ success: true, message: 'Matière retirée de l\'élève avec succès', data: eleve });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Élève ou matière introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du retrait de la matière', error: error.message });
    }
  }
};

export const getElevesByClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classeId } = req.params;
    const eleves = await eleveService.getElevesByClasse(parseInt(classeId));

    res.status(200).json({ success: true, data: eleves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des élèves de la classe', error: error.message });
  }
};

export const getTotalEffectif = async (_req: Request, res: Response): Promise<void> => {
  try {
    const effectifTotal = await eleveService.getTotalEffectif();
    res.status(200).json({
      success: true,
      data: {
        effectifTotal,
        message: `Effectif total: ${effectifTotal} élèves`
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'effectif total', error: error.message });
  }
};

export const getPlacesDisponiblesByNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId } = req.params;
    const placesDisponibles = await eleveService.getPlacesDisponiblesByNiveau(parseInt(niveauId));

    res.status(200).json({ success: true, data: placesDisponibles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des places disponibles', error: error.message });
  }
};

export const getParentsByEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parents = await eleveService.getParentsByEleve(parseInt(id));

    res.status(200).json({ success: true, data: parents });
  } catch (error: any) {
    if (error.message === 'Élève introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des parents de l\'élève', error: error.message });
    }
  }
};

/**
 * Valider une candidature d'élève
 */
export const validerCandidature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const eleve = await eleveService.validerCandidature(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Candidature validée avec succès',
      data: eleve
    });
  } catch (error: any) {
    if (error.message === 'Élève introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else if (error.message === 'Cette candidature a déjà été traitée') {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la validation de la candidature', error: error.message });
    }
  }
};

/**
 * Rejeter une candidature d'élève
 */
export const rejeterCandidature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motifRejet } = req.body;

    if (!motifRejet) {
      res.status(400).json({ success: false, message: 'Le motif de rejet est obligatoire' });
      return;
    }

    const eleve = await eleveService.rejeterCandidature(parseInt(id), motifRejet);

    res.status(200).json({
      success: true,
      message: 'Candidature rejetée',
      data: eleve
    });
  } catch (error: any) {
    if (error.message === 'Élève introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else if (error.message === 'Cette candidature a déjà été traitée') {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du rejet de la candidature', error: error.message });
    }
  }
};

/**
 * Upload la photo d'un élève
 */
export const uploadElevePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('📸 Upload photo pour élève ID:', id);
    console.log('📁 Fichier reçu:', req.file);

    if (!req.file) {
      console.error('❌ Aucun fichier dans la requête');
      res.status(400).json({
        success: false,
        message: 'Aucune photo fournie'
      });
      return;
    }

    // Utiliser le chemin relatif au lieu du chemin absolu
    const photoPath = req.file.path.replace(/\\/g, '/'); // Normaliser les slashes
    console.log('💾 Chemin de la photo:', photoPath);

    const eleve = await eleveService.updateElevePhoto(parseInt(id), photoPath);
    console.log('✅ Photo uploadée avec succès pour élève:', eleve.id);

    res.status(200).json({
      success: true,
      message: 'Photo uploadée avec succès',
      data: eleve
    });
  } catch (error: any) {
    console.error('❌ Erreur upload photo:', error);
    if (error.message === 'Élève introuvable') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload de la photo',
        error: error.message
      });
    }
  }
};