import { Request, Response } from 'express';
import { TypeTransaction } from '@prisma/client';
import budgetService from '../Services/budget.service';
import { handlePrismaError, isPrismaError } from '../utils/prismaErrors';

// Créer un budget
export const createBudget = async (req: Request, res: Response) => {
  try {
    const { libelle, montantPrevu, type, anneeId, categorieId } = req.body;

    // Validation
    if (!libelle || !montantPrevu || !type) {
      return res.status(400).json({
        success: false,
        error: 'Le libellé, le montant prévu et le type sont requis',
      });
    }

    // Vérifier que le type est valide
    if (!Object.values(TypeTransaction).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide (RECETTE ou DEPENSE)',
      });
    }

    const budget = await budgetService.createBudget({
      libelle,
      montantPrevu: parseFloat(montantPrevu),
      type,
      anneeId: anneeId ? parseInt(anneeId) : undefined,
      categorieId: categorieId ? parseInt(categorieId) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Budget créé avec succès',
      data: budget,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du budget:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer tous les budgets
export const getAllBudgets = async (req: Request, res: Response) => {
  try {
    const { type, anneeId, categorieId } = req.query;

    // Valider le type si fourni
    if (type && !Object.values(TypeTransaction).includes(type as TypeTransaction)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide',
      });
    }

    const budgets = await budgetService.getAllBudgets({
      type: type as TypeTransaction | undefined,
      anneeId: anneeId ? parseInt(anneeId as string) : undefined,
      categorieId: categorieId ? parseInt(categorieId as string) : undefined,
    });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des budgets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer un budget par ID
export const getBudgetById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const budget = await budgetService.getBudgetById(id);

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du budget:', error);

    if (error.message === 'Budget non trouvé') {
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

// Mettre à jour un budget
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const { libelle, montantPrevu, type, anneeId, categorieId } = req.body;

    // Vérifier que le type est valide si fourni
    if (type && !Object.values(TypeTransaction).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide (RECETTE ou DEPENSE)',
      });
    }

    const budget = await budgetService.updateBudget(id, {
      libelle,
      montantPrevu: montantPrevu ? parseFloat(montantPrevu) : undefined,
      type,
      anneeId: anneeId ? parseInt(anneeId) : undefined,
      categorieId: categorieId ? parseInt(categorieId) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Budget mis à jour avec succès',
      data: budget,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du budget:', error);

    if (error.message === 'Budget non trouvé') {
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

// Supprimer un budget
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    await budgetService.deleteBudget(id);

    res.status(200).json({
      success: true,
      message: 'Budget supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du budget:', error);

    // Gestion des erreurs Prisma
    if (isPrismaError(error)) {
      const { status, message } = handlePrismaError(error);
      return res.status(status).json({
        success: false,
        error: message,
      });
    }

    // Gestion des erreurs métier
    if (error.message === 'Budget non trouvé') {
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

// Obtenir le tableau de bord budgétaire
export const getTableauDeBord = async (req: Request, res: Response) => {
  try {
    const { anneeId } = req.query;

    const tableauDeBord = await budgetService.getTableauDeBord(
      anneeId ? parseInt(anneeId as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: tableauDeBord,
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du tableau de bord:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

export default {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getTableauDeBord,
};
