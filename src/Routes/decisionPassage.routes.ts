import express from 'express';
import {
  invaliderTrimestre,
  getMoyenneGenerale,
  checkExclusion,
  getDecisionPassage,
  setDecisionPassage,
  traiterPassages
} from '../Controllers/decisionPassage.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DecisionPassage
 *   description: Gestion des décisions de passage et exclusions
 */

/**
 * @swagger
 * /api/decision-passage/trimestre/{trimestreId}/invalider:
 *   patch:
 *     summary: Invalider ou valider un trimestre
 *     tags: [DecisionPassage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trimestreId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invalide:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trimestre modifié avec succès
 */
router.patch(
  '/trimestre/:trimestreId/invalider',
  authenticateToken,
  ensurePermission('trimestre.update'),
  invaliderTrimestre
);

/**
 * @swagger
 * /api/decision-passage/moyenne/{eleveId}/{anneeId}/{classeId}:
 *   get:
 *     summary: Calculer la moyenne générale d'un élève
 *     tags: [DecisionPassage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Moyenne générale calculée
 */
router.get(
  '/moyenne/:eleveId/:anneeId/:classeId',
  authenticateToken,
  ensurePermission('note.read'),
  getMoyenneGenerale
);

/**
 * @swagger
 * /api/decision-passage/exclusion/{eleveId}/{inscriptionId}:
 *   get:
 *     summary: Vérifier si un élève peut être exclu
 *     tags: [DecisionPassage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: inscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 */
router.get(
  '/exclusion/:eleveId/:inscriptionId',
  authenticateToken,
  ensurePermission('eleve.read'),
  checkExclusion
);

/**
 * @swagger
 * /api/decision-passage/decision/{inscriptionId}:
 *   get:
 *     summary: Obtenir la décision de passage pour un élève
 *     tags: [DecisionPassage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Décision de passage
 */
router.get(
  '/decision/:inscriptionId',
  authenticateToken,
  ensurePermission('note.read'),
  getDecisionPassage
);

/**
 * @swagger
 * /api/decision-passage/appliquer/{inscriptionId}:
 *   patch:
 *     summary: Appliquer manuellement une décision de passage
 *     tags: [DecisionPassage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [ADMIS, REDOUBLE, EXCLU]
 *               moyenneGenerale:
 *                 type: number
 *     responses:
 *       200:
 *         description: Décision appliquée
 */
router.patch(
  '/appliquer/:inscriptionId',
  authenticateToken,
  ensurePermission('inscription.update'),
  setDecisionPassage
);

/**
 * @swagger
 * /api/decision-passage/traiter-classe/{classeId}/{anneeId}:
 *   post:
 *     summary: Traiter automatiquement les passages pour toute une classe
 *     tags: [DecisionPassage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Passages traités
 */
router.post(
  '/traiter-classe/:classeId/:anneeId',
  authenticateToken,
  ensurePermission('inscription.update'),
  traiterPassages
);

export default router;
