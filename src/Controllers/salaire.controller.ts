import { Request, Response } from 'express';
import { StatutPaiementSalaire } from '@prisma/client';
import salaireService from '../Services/salaire.service';

// Calculer les heures depuis le cahier de textes
export const getHeuresDepuisCahier = async (req: Request, res: Response) => {
  try {
    const staffId = Number(req.params.staffId);
    const mois = Number(req.query.mois);
    const annee = Number(req.query.annee);
    if (!mois || !annee) return res.status(400).json({ success: false, error: 'mois et annee sont requis' });
    const data = await salaireService.getHeuresDepuisCahier(staffId, mois, annee);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Définir le taux horaire d'un staff
export const setTauxHoraire = async (req: Request, res: Response) => {
  try {
    const staffId = Number(req.params.staffId);
    const { tauxHoraire } = req.body;
    if (!tauxHoraire || tauxHoraire <= 0) {
      return res.status(400).json({ success: false, error: 'Le taux horaire doit être supérieur à 0' });
    }
    const staff = await salaireService.setTauxHoraire(staffId, Number(tauxHoraire));
    return res.status(200).json({ success: true, data: staff });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Créer un salaire
export const createSalaire = async (req: Request, res: Response) => {
  try {
    const { mois, annee, heuresNormales, heuresSupplementaires, tauxHoraireSupp, deductions, staffId } = req.body;

    if (!mois || !annee || heuresNormales === undefined || !staffId) {
      return res.status(400).json({ success: false, error: 'Le mois, l\'année, les heures normales et le staffId sont requis' });
    }
    if (mois < 1 || mois > 12) {
      return res.status(400).json({ success: false, error: 'Le mois doit être entre 1 et 12' });
    }
    if (heuresNormales < 0) {
      return res.status(400).json({ success: false, error: 'Les heures normales doivent être positives' });
    }

    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });

    const salaire = await salaireService.createSalaire({
      mois: Number(mois),
      annee: Number(annee),
      heuresNormales: Number(heuresNormales),
      heuresSupplementaires: Number(heuresSupplementaires ?? 0),
      tauxHoraireSupp: Number(tauxHoraireSupp ?? 0),
      deductions: Number(deductions ?? 0),
      staffId: Number(staffId),
      userId: Number(userId),
    });

    return res.status(201).json({ success: true, data: salaire });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Récupérer tous les salaires
export const getAllSalaires = async (req: Request, res: Response) => {
  try {
    const { staffId, mois, annee, statut } = req.query;
    const salaires = await salaireService.getAllSalaires({
      staffId: staffId ? Number(staffId) : undefined,
      mois: mois ? Number(mois) : undefined,
      annee: annee ? Number(annee) : undefined,
      statut: statut as StatutPaiementSalaire | undefined,
    });
    return res.status(200).json({ success: true, data: salaires });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Récupérer un salaire par ID
export const getSalaireById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const salaire = await salaireService.getSalaireById(id);
    return res.status(200).json({ success: true, data: salaire });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

// Mettre à jour un salaire
export const updateSalaire = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const salaire = await salaireService.updateSalaire(id, req.body);
    return res.status(200).json({ success: true, data: salaire });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Payer un salaire
export const payerSalaire = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const salaire = await salaireService.payerSalaire(id);
    return res.status(200).json({ success: true, data: salaire });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Annuler un salaire
export const annulerSalaire = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const salaire = await salaireService.annulerSalaire(id);
    return res.status(200).json({ success: true, data: salaire });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Supprimer un salaire
export const deleteSalaire = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await salaireService.deleteSalaire(id);
    return res.status(200).json({ success: true, message: 'Salaire supprimé avec succès' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Statistiques
export const getStatistiquesSalaires = async (req: Request, res: Response) => {
  try {
    const annee = req.query.annee ? Number(req.query.annee) : undefined;
    const stats = await salaireService.getStatistiquesSalaires(annee);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
