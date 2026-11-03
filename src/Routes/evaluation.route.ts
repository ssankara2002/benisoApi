import express from 'express';
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationsByMatiere,
  getEvaluationsByClasse,
  getEvaluationsByAnnee
} from '../Controllers/evaluation.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Evaluations
 *   description: Gestion des évaluations et examens
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Evaluation:
 *       type: object
 *       description: Données pour créer une évaluation (requête POST)
 *       required:
 *         - date
 *         - matiereId
 *         - classeId
 *         - anneeId
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de l'évaluation
 *           example: "2025-12-15T09:00:00Z"
 *         type:
 *           type: string
 *           description: Type d'évaluation (devoir, interro, compo)
 *           example: "devoir"
 *         bareme:
 *           type: number
 *           format: float
 *           description: Barème de notation (optionnel)
 *           example: 20
 *         matiereId:
 *           type: integer
 *           description: ID de la matière
 *           example: 1
 *         classeId:
 *           type: integer
 *           description: ID de la classe
 *           example: 1
 *         anneeId:
 *           type: integer
 *           description: ID de l'année scolaire
 *           example: 1
 *         trimestreId:
 *           type: integer
 *           description: ID du trimestre (optionnel)
 *           example: 1
 */

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Récupérer toutes les évaluations
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des évaluations récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evaluation'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken,ensurePermission('evaluation.read'), getAllEvaluations);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: Récupérer une évaluation par ID
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'évaluation
 *     responses:
 *       200:
 *         description: Évaluation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Evaluation'
 *       404:
 *         description: Évaluation introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('evaluation.read'), getEvaluationById);

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Créer une nouvelle évaluation (staff ou admin)
 *     description: |
 *       Crée une évaluation.
 *       - Si l'utilisateur est un **staff** (professeur): le staffId est récupéré automatiquement du token d'authentification.
 *       - Si l'utilisateur est un **admin**: le champ staffId est obligatoire dans le body de la requête.
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - matiereId
 *               - classeId
 *               - anneeId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date de l'évaluation
 *                 example: "2025-12-15T09:00:00Z"
 *               type:
 *                 type: string
 *                 description: Type d'évaluation (devoir, interro, compo)
 *                 example: "devoir"
 *               matiereId:
 *                 type: integer
 *                 description: ID de la matière
 *                 example: 1
 *               classeId:
 *                 type: integer
 *                 description: ID de la classe
 *                 example: 1
 *               anneeId:
 *                 type: integer
 *                 description: ID de l'année scolaire
 *                 example: 1
 *               trimestreId:
 *                 type: integer
 *                 description: ID du trimestre (optionnel)
 *                 example: 1
 *               staffId:
 *                 type: integer
 *                 description: ID du staff (obligatoire uniquement pour les admins, ignoré pour les professeurs)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Évaluation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Evaluation'
 *       400:
 *         description: Données invalides, champs manquants, ou staffId requis pour l'admin
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Seul un staff ou un admin peut créer une évaluation
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('evaluation.create'),  createEvaluation);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   put:
 *     summary: Mettre à jour une évaluation
 *     description: Permet de modifier la date, le type, la matière, la classe, le trimestre ou le staff de l'évaluation
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'évaluation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Nouvelle date de l'évaluation
 *               type:
 *                 type: string
 *                 description: Nouveau type d'évaluation
 *               matiereId:
 *                 type: integer
 *                 description: ID de la nouvelle matière (optionnel)
 *               classeId:
 *                 type: integer
 *                 description: ID de la nouvelle classe (optionnel)
 *               anneeId:
 *                 type: integer
 *                 description: ID de la nouvelle année scolaire (optionnel)
 *               trimestreId:
 *                 type: integer
 *                 description: ID du nouveau trimestre (optionnel)
 *               staffId:
 *                 type: integer
 *                 description: ID du nouveau staff (optionnel)
 *     responses:
 *       200:
 *         description: Évaluation mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Évaluation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('evaluation.update'),  updateEvaluation);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: Supprimer une évaluation
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'évaluation
 *     responses:
 *       200:
 *         description: Évaluation supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Évaluation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('evaluation.delete'),  deleteEvaluation);

/**
 * @swagger
 * /api/evaluations/matiere/{matiereId}:
 *   get:
 *     summary: Récupérer les évaluations d'une matière
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matiereId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *     responses:
 *       200:
 *         description: Évaluations de la matière récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/matiere/:matiereId', authenticateToken, ensurePermission('evaluation.read'), getEvaluationsByMatiere);

/**
 * @swagger
 * /api/evaluations/classe/{classeId}:
 *   get:
 *     summary: Récupérer les évaluations d'une classe
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *     responses:
 *       200:
 *         description: Évaluations de la classe récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/classe/:classeId', authenticateToken, ensurePermission('evaluation.read'), getEvaluationsByClasse);

/**
 * @swagger
 * /api/evaluations/annee/{anneeId}:
 *   get:
 *     summary: Récupérer les évaluations d'une année scolaire
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *     responses:
 *       200:
 *         description: Évaluations de l'année récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/annee/:anneeId', authenticateToken,ensurePermission('evaluation.read'),  getEvaluationsByAnnee);

export default router;