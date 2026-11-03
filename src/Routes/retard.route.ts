import express from 'express';
import {
  getAllRetards,
  getRetardById,
  createRetard,
  updateRetard,
  deleteRetard,
  getRetardsByEleve,
  getRetardsByMatiere,
  getRetardsByPeriod
} from '../Controllers/retard.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Retards
 *   description: Gestion des retards des élèves
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Retard:
 *       type: object
 *       description: Données pour créer un retard (requête POST)
 *       required:
 *         - date
 *         - eleveId
 *         - matiereId
 *         - classeId
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date et heure du retard
 *           example: "2024-01-15T08:15:00Z"
 *         justification:
 *           type: boolean
 *           description: Le retard est-il justifié
 *           example: false
 *         autorisation:
 *           type: string
 *           description: Autorisation ou motif du retard
 *           example: "malade"
 *         confProf:
 *           type: boolean
 *           description: Confirmation du professeur
 *           example: false
 *         eleveId:
 *           type: integer
 *           description: ID de l'élève
 *           example: 1
 *         matiereId:
 *           type: integer
 *           description: ID de la matière
 *           example: 1
 *         classeId:
 *           type: integer
 *           description: ID de la classe
 *           example: 1
 */

/**
 * @swagger
 * /api/retards:
 *   get:
 *     summary: Récupérer tous les retards
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des retards récupérée avec succès
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
 *                     $ref: '#/components/schemas/Retard'
 */
router.get('/', authenticateToken, ensurePermission('retard.read'), getAllRetards);

/**
 * @swagger
 * /api/retards/{id}:
 *   get:
 *     summary: Récupérer un retard par ID
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retard récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Retard'
 *       404:
 *         description: Retard introuvable
 */
router.get('/:id', authenticateToken, ensurePermission('retard.read'), getRetardById);

/**
 * @swagger
 * /api/retards:
 *   post:
 *     summary: Créer un nouveau retard
 *     tags: [Retards]
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
 *               - eleveId
 *               - matiereId
 *               - classeId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T08:15:00Z"
 *               justification:
 *                 type: boolean
 *                 example: false
 *               autorisation:
 *                 type: string
 *                 example: "malade"
 *               confProf:
 *                 type: boolean
 *                 example: false
 *               eleveId:
 *                 type: integer
 *                 example: 1
 *               matiereId:
 *                 type: integer
 *                 example: 1
 *               classeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Retard créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Retard'
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
 *                   example: "Erreur de validation des champs"
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('retard.create'), createRetard);

/**
 * @swagger
 * /api/retards/{id}:
 *   put:
 *     summary: Mettre à jour un retard
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du retard à mettre à jour
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
 *               justification:
 *                 type: boolean
 *               autorisation:
 *                 type: string
 *               confProf:
 *                 type: boolean
 *               eleveId:
 *                 type: integer
 *               matiereId:
 *                 type: integer
 *               classeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Retard mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Retard'
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
 *                   example: "Erreur de validation des champs"
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Retard introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('retard.update'), updateRetard);

/**
 * @swagger
 * /api/retards/{id}:
 *   delete:
 *     summary: Supprimer un retard
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retard supprimé avec succès
 */
router.delete('/:id', authenticateToken, ensurePermission('retard.delete'), deleteRetard);

/**
 * @swagger
 * /api/retards/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les retards d'un élève
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retards de l'élève récupérés avec succès
 */
router.get('/eleve/:eleveId', authenticateToken, ensurePermission('retard.read'), getRetardsByEleve);

/**
 * @swagger
 * /api/retards/matiere/{matiereId}:
 *   get:
 *     summary: Récupérer les retards d'une matière
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matiereId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retards de la matière récupérés avec succès
 */
router.get('/matiere/:matiereId', authenticateToken, ensurePermission('retard.read'), getRetardsByMatiere);

/**
 * @swagger
 * /api/retards/period:
 *   get:
 *     summary: Récupérer les retards par période
 *     tags: [Retards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Retards de la période récupérés avec succès
 */
router.get('/period', authenticateToken, ensurePermission('retard.read'), getRetardsByPeriod);

export default router;
