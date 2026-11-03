import express from 'express';
import {
  getAllAnnees,
  getAnneeById,
  createAnnee,
  updateAnnee,
  deleteAnnee,
  getCurrentAnnee
} from '../Controllers/annee.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Annees
 *   description: Gestion des années scolaires (2024-2025, 2025-2026, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Annee:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         dateDebut:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date de début de l'année scolaire
 *           example: "2024-09-01T00:00:00Z"
 *         dateFin:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date de fin de l'année scolaire
 *           example: "2025-06-30T00:00:00Z"
 *         trimestres:
 *           type: array
 *           description: Liste des trimestres de cette année
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nom:
 *                 type: string
 *                 example: "1er Trimestre"
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *         inscriptions:
 *           type: array
 *           description: Liste des inscriptions pour cette année
 *           items:
 *             type: object
 *         evaluations:
 *           type: array
 *           description: Liste des évaluations pour cette année
 *           items:
 *             type: object
 *         _count:
 *           type: object
 *           description: Compteurs des relations
 *           properties:
 *             inscriptions:
 *               type: integer
 *               description: Nombre d'inscriptions
 *               example: 250
 *             evaluations:
 *               type: integer
 *               description: Nombre d'évaluations
 *               example: 45
 *             trimestres:
 *               type: integer
 *               description: Nombre de trimestres
 *               example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     AnneeInput:
 *       type: object
 *       properties:
 *         dateDebut:
 *           type: string
 *           format: date
 *           description: Date de début de l'année scolaire
 *           example: "2024-09-01"
 *         dateFin:
 *           type: string
 *           format: date
 *           description: Date de fin de l'année scolaire
 *           example: "2025-06-30"
 */

/**
 * @swagger
 * /api/annees:
 *   get:
 *     summary: Récupérer toutes les années scolaires
 *     tags: [Annees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des années récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Annee'
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.get('/', authenticateToken,ensurePermission('annee.read'), getAllAnnees);

/**
 * @swagger
 * /api/annees/current:
 *   get:
 *     summary: Récupérer l'année scolaire en cours
 *     description: Retourne l'année scolaire dont la date actuelle se situe entre dateDebut et dateFin
 *     tags: [Annees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Année scolaire en cours récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Annee'
 *       404:
 *         description: Aucune année scolaire en cours trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Aucune année scolaire en cours"
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.get('/current', authenticateToken,ensurePermission('annee.read'), getCurrentAnnee);

/**
 * @swagger
 * /api/annees/{id}:
 *   get:
 *     summary: Récupérer une année scolaire par ID
 *     tags: [Annees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *     responses:
 *       200:
 *         description: Année récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Annee'
 *       404:
 *         description: Année introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.get('/:id', authenticateToken, ensurePermission('annee.read'),getAnneeById);

/**
 * @swagger
 * /api/annees:
 *   post:
 *     summary: Créer une nouvelle année scolaire
 *     tags: [Annees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnneeInput'
 *     responses:
 *       201:
 *         description: Année créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Année scolaire créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Annee'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès refusé - Permission insuffisante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.post('/', authenticateToken, ensurePermission('annee.create'), createAnnee);

/**
 * @swagger
 * /api/annees/{id}:
 *   put:
 *     summary: Mettre à jour une année scolaire
 *     tags: [Annees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnneeInput'
 *     responses:
 *       200:
 *         description: Année mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Année scolaire mise à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Annee'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès refusé - Permission insuffisante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       404:
 *         description: Année introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.put('/:id', authenticateToken, ensurePermission('annee.update'), updateAnnee);

/**
 * @swagger
 * /api/annees/{id}:
 *   delete:
 *     summary: Supprimer une année scolaire
 *     tags: [Annees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *     responses:
 *       200:
 *         description: Année supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Année scolaire supprimée avec succès"
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès refusé - Permission insuffisante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       404:
 *         description: Année introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.delete('/:id', authenticateToken, ensurePermission('annee.delete'), deleteAnnee);

export default router;
