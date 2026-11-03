import { Request, Response } from 'express';
import { TypeTransaction } from '@prisma/client';
import categorieComptableService from '../Services/categorie-comptable.service';
import { handlePrismaError, isPrismaError } from '../utils/prismaErrors';

// Créer une catégorie comptable
export const createCategorieComptable = async (req: Request, res: Response) => {
  try {
    const { libelle, type } = req.body;

    // Validation
    if (!libelle || !type) {
      return res.status(400).json({
        success: false,
        error: 'Le libellé et le type sont requis',
      });
    }

    // Vérifier que le type est valide
    if (!Object.values(TypeTransaction).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide (RECETTE ou DEPENSE)',
      });
    }

    const categorie = await categorieComptableService.createCategorieComptable({
      libelle,
      type,
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie comptable créée avec succès',
      data: categorie,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie comptable:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer toutes les catégories comptables
export const getAllCategoriesComptables = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    // Valider le type si fourni
    if (type && !Object.values(TypeTransaction).includes(type as TypeTransaction)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide',
      });
    }

    const categories = await categorieComptableService.getAllCategoriesComptables(
      type as TypeTransaction | undefined
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des catégories comptables:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer une catégorie par ID
export const getCategorieComptableById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const categorie = await categorieComptableService.getCategorieComptableById(id);

    res.status(200).json({
      success: true,
      data: categorie,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la catégorie comptable:', error);

    if (error.message === 'Catégorie comptable non trouvée') {
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

// Mettre à jour une catégorie
export const updateCategorieComptable = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const { libelle, type } = req.body;

    // Vérifier que le type est valide si fourni
    if (type && !Object.values(TypeTransaction).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide (RECETTE ou DEPENSE)',
      });
    }

    const categorie = await categorieComptableService.updateCategorieComptable(id, {
      libelle,
      type,
    });

    res.status(200).json({
      success: true,
      message: 'Catégorie comptable mise à jour avec succès',
      data: categorie,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la catégorie comptable:', error);

    if (error.message === 'Catégorie comptable non trouvée') {
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

// Supprimer une catégorie
export const deleteCategorieComptable = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    await categorieComptableService.deleteCategorieComptable(id);

    res.status(200).json({
      success: true,
      message: 'Catégorie comptable supprimée avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la catégorie comptable:', error);

    // Gestion des erreurs Prisma
    if (isPrismaError(error)) {
      const { status, message } = handlePrismaError(error);
      return res.status(status).json({
        success: false,
        error: message,
      });
    }

    // Gestion des erreurs métier
    if (error.message === 'Catégorie comptable non trouvée') {
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

export default {
  createCategorieComptable,
  getAllCategoriesComptables,
  getCategorieComptableById,
  updateCategorieComptable,
  deleteCategorieComptable,
};
