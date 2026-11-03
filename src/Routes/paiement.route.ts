import express from 'express';
import inscriptionEleveController from '../Controllers/inscription-eleve.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   POST /api/paiements/plan-tranches
 * @desc    Créer un plan de paiement par tranches pour une inscription
 * @access  Private
 */
router.post(
  '/plan-tranches',
  authenticateToken,
  inscriptionEleveController.creerPlanTranches.bind(inscriptionEleveController)
);

/**
 * @route   POST /api/paiements/payer-tranche
 * @desc    Enregistrer un paiement sur une tranche
 * @access  Private
 */
router.post(
  '/payer-tranche',
  authenticateToken,
  inscriptionEleveController.payerTranche.bind(inscriptionEleveController)
);

/**
 * @route   GET /api/paiements/statistiques/:inscriptionId
 * @desc    Récupérer les statistiques de paiement pour une inscription
 * @access  Private
 */
router.get(
  '/statistiques/:inscriptionId',
  authenticateToken,
  inscriptionEleveController.getStatistiquesTranches.bind(inscriptionEleveController)
);

export default router;
