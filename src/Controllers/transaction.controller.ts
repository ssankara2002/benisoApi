import { Request, Response } from 'express';
import { TypeTransaction, StatutTransaction } from '@prisma/client';
import transactionService from '../Services/transaction.service';
import { handlePrismaError, isPrismaError } from '../utils/prismaErrors';

// Créer une transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      libelle,
      montant,
      type,
      date,
      dateEcheance,
      pieceJustificative,
      note,
      categorieId,
      compteId,
      anneeId,
      paiementId,
      lignes,
    } = req.body;

    // Validation
    if (!libelle || !montant || !type || !date) {
      return res.status(400).json({
        success: false,
        error: 'Le libellé, le montant, le type et la date sont requis',
      });
    }

    // Vérifier que le type est valide
    if (!Object.values(TypeTransaction).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide (RECETTE ou DEPENSE)',
      });
    }

    // Vérifier que l'utilisateur est authentifié
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié',
      });
    }

    const transaction = await transactionService.createTransaction({
      libelle,
      montant: parseFloat(montant),
      type,
      date: new Date(date),
      dateEcheance: dateEcheance ? new Date(dateEcheance) : undefined,
      pieceJustificative,
      note,
      categorieId: categorieId ? parseInt(categorieId) : undefined,
      compteId: compteId ? parseInt(compteId) : undefined,
      anneeId: anneeId ? parseInt(anneeId) : undefined,
      userId,
      paiementId: paiementId ? parseInt(paiementId) : undefined,
      lignes,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction créée avec succès',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer toutes les transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { type, statut, categorieId, compteId, anneeId, dateDebut, dateFin } =
      req.query;

    // Valider le type si fourni
    if (type && !Object.values(TypeTransaction).includes(type as TypeTransaction)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transaction invalide',
      });
    }

    // Valider le statut si fourni
    if (statut && !Object.values(StatutTransaction).includes(statut as StatutTransaction)) {
      return res.status(400).json({
        success: false,
        error: 'Statut de transaction invalide',
      });
    }

    const transactions = await transactionService.getAllTransactions({
      type: type as TypeTransaction | undefined,
      statut: statut as StatutTransaction | undefined,
      categorieId: categorieId ? parseInt(categorieId as string) : undefined,
      compteId: compteId ? parseInt(compteId as string) : undefined,
      anneeId: anneeId ? parseInt(anneeId as string) : undefined,
      dateDebut: dateDebut ? new Date(dateDebut as string) : undefined,
      dateFin: dateFin ? new Date(dateFin as string) : undefined,
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Récupérer une transaction par ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const transaction = await transactionService.getTransactionById(id);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la transaction:', error);

    if (error.message === 'Transaction non trouvée') {
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

// Mettre à jour une transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const {
      libelle,
      montant,
      date,
      dateEcheance,
      pieceJustificative,
      note,
      categorieId,
      compteId,
      anneeId,
    } = req.body;

    const transaction = await transactionService.updateTransaction(id, {
      libelle,
      montant: montant ? parseFloat(montant) : undefined,
      date: date ? new Date(date) : undefined,
      dateEcheance: dateEcheance ? new Date(dateEcheance) : undefined,
      pieceJustificative,
      note,
      categorieId: categorieId ? parseInt(categorieId) : undefined,
      compteId: compteId ? parseInt(compteId) : undefined,
      anneeId: anneeId ? parseInt(anneeId) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Transaction mise à jour avec succès',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la transaction:', error);

    if (error.message === 'Transaction non trouvée') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('Impossible de modifier')) {
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

// Valider une transaction
export const validerTransaction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const transaction = await transactionService.validerTransaction(id);

    res.status(200).json({
      success: true,
      message: 'Transaction validée avec succès',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Erreur lors de la validation de la transaction:', error);

    if (error.message === 'Transaction non trouvée') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('déjà été traitée')) {
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

// Annuler une transaction
export const annulerTransaction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    const transaction = await transactionService.annulerTransaction(id);

    res.status(200).json({
      success: true,
      message: 'Transaction annulée avec succès',
      data: transaction,
    });
  } catch (error: any) {
    console.error("Erreur lors de l'annulation de la transaction:", error);

    if (error.message === 'Transaction non trouvée') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('déjà annulée')) {
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

// Supprimer une transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
      });
    }

    await transactionService.deleteTransaction(id);

    res.status(200).json({
      success: true,
      message: 'Transaction supprimée avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la transaction:', error);

    // Gestion des erreurs Prisma
    if (isPrismaError(error)) {
      const { status, message } = handlePrismaError(error);
      return res.status(status).json({
        success: false,
        error: message,
      });
    }

    // Gestion des erreurs métier
    if (error.message === 'Transaction non trouvée') {
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

// Obtenir les statistiques des transactions
export const getStatistiquesTransactions = async (req: Request, res: Response) => {
  try {
    const { anneeId, dateDebut, dateFin } = req.query;

    const statistiques = await transactionService.getStatistiquesTransactions({
      anneeId: anneeId ? parseInt(anneeId as string) : undefined,
      dateDebut: dateDebut ? new Date(dateDebut as string) : undefined,
      dateFin: dateFin ? new Date(dateFin as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: statistiques,
    });
  } catch (error: any) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

export default {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  validerTransaction,
  annulerTransaction,
  deleteTransaction,
  getStatistiquesTransactions,
};
