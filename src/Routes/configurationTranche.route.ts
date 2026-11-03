import express from 'express';
import {
  configurerTranches,
  getConfigurationTranches,
  getAllConfigurationsTranches,
  supprimerConfigurationTranches
} from '../Controllers/configurationTranche.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Configuration Tranches
 *   description: Gestion de la configuration des tranches de paiement par niveau
 */

/**
 * @swagger
 * /api/configuration-tranches:
 *   get:
 *     summary: Récupérer toutes les configurations de tranches par niveau
 *     tags: [Configuration Tranches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configurations récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('niveau.read'), getAllConfigurationsTranches);

/**
 * @swagger
 * /api/configuration-tranches/niveau/{niveauId}:
 *   get:
 *     summary: Récupérer la configuration des tranches d'un niveau
 *     tags: [Configuration Tranches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: niveauId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *     responses:
 *       200:
 *         description: Configuration récupérée avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/niveau/:niveauId', authenticateToken, ensurePermission('niveau.read'), getConfigurationTranches);

/**
 * @swagger
 * /api/configuration-tranches:
 *   post:
 *     summary: Créer ou mettre à jour la configuration des tranches pour un niveau
 *     tags: [Configuration Tranches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - niveauId
 *               - tranches
 *             properties:
 *               niveauId:
 *                 type: integer
 *                 example: 1
 *               tranches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     libelle:
 *                       type: string
 *                       example: "1er trimestre"
 *                     montant:
 *                       type: integer
 *                       example: 50000
 *                     dateEcheance:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *     responses:
 *       201:
 *         description: Configuration créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission insuffisante
 *       404:
 *         description: Niveau introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('niveau.update'), configurerTranches);

/**
 * @swagger
 * /api/configuration-tranches/niveau/{niveauId}:
 *   delete:
 *     summary: Supprimer la configuration des tranches d'un niveau
 *     tags: [Configuration Tranches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: niveauId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *     responses:
 *       200:
 *         description: Configuration supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission insuffisante
 *       500:
 *         description: Erreur serveur
 */
router.delete('/niveau/:niveauId', authenticateToken, ensurePermission('niveau.delete'), supprimerConfigurationTranches);

export default router;
