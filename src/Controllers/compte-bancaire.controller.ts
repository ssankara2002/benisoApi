import { Request, Response } from 'express';
import { TypeCompte } from '@prisma/client';
import compteBancaireService from '../Services/compte-bancaire.service';
import { handlePrismaError, isPrismaError } from '../utils/prismaErrors';

// Créer un compte bancaire
export const createCompteBancaire = async (req: Request, res: Response) => {
  try {
    const { libelle, type, soldeInitial } = req.body;

    // Validation
    if (!libelle || !type) {
      return res.status(400).json({
        success: false,
        error: 'Le libellé et le type sont requis',
      });
    }

    // Vérifier que le type est valide
    if (!Object.values(TypeCompte).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de compte invalide (CAISSE ou BANQUE)',
      });
    }

    const compte = await compteBancaireService.createCompteBancaire({
      libelle,
      type,
      soldeInitial: soldeInitial ? parseFloat(soldeInitial) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Compte bancaire créé avec succès',
      data: compte,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du compte bancaire:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer tous les comptes bancaires
export const getAllComptesBancaires = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    // Valider le type si fourni
    if (type && !Object.values(TypeCompte).includes(type as TypeCompte)) {
      return res.status(400).json({
        success: false,
        error: 'Type de compte invalide',
      });
    }

    const comptes = await compteBancaireService.getAllComptesBancaires(
      type as TypeCompte | undefined
    );

    res.status(200).json({
      success: true,
      count: comptes.length,
      data: comptes,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des comptes bancaires:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer un compte par ID
export const getCompteBancaireById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const compte = await compteBancaireService.getCompteBancaireById(id);

    res.status(200).json({
      success: true,
      data: compte,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du compte bancaire:', error);

    if (error.message === 'Compte bancaire non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Mettre à jour un compte
export const updateCompteBancaire = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const { libelle, type, soldeInitial } = req.body;

    // Vérifier que le type est valide si fourni
    if (type && !Object.values(TypeCompte).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de compte invalide (CAISSE ou BANQUE)',
      });
    }

    const compte = await compteBancaireService.updateCompteBancaire(id, {
      libelle,
      type,
      soldeInitial: soldeInitial ? parseFloat(soldeInitial) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Compte bancaire mis à jour avec succès',
      data: compte,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du compte bancaire:', error);

    if (error.message === 'Compte bancaire non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Supprimer un compte
export const deleteCompteBancaire = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    await compteBancaireService.deleteCompteBancaire(id);

    res.status(200).json({
      success: true,
      message: 'Compte bancaire supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du compte bancaire:', error);

    // Gestion des erreurs Prisma
    if (isPrismaError(error)) {
      const { status, message } = handlePrismaError(error);
      return res.status(status).json({
        success: false,
        error: message,
      });
    }

    // Gestion des erreurs métier
    if (error.message === 'Compte bancaire non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('Impossible de supprimer')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Obtenir le solde à une date donnée
export const getSoldeAtDate = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { date } = req.query;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'La date est requise',
      });
    }

    const solde = await compteBancaireService.getSoldeAtDate(
      id,
      new Date(date as string)
    );

    res.status(200).json({
      success: true,
      data: {
        compteId: id,
        date,
        solde,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors du calcul du solde:', error);

    if (error.message === 'Compte bancaire non trouvé') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

export default {
  createCompteBancaire,
  getAllComptesBancaires,
  getCompteBancaireById,
  updateCompteBancaire,
  deleteCompteBancaire,
  getSoldeAtDate,
};
