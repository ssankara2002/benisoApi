import express from 'express';
import {
  getAllFilieres,
  getFiliereById,
  createFiliere,
  updateFiliere,
  deleteFiliere
} from '../Controllers/filiere.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Filieres
 *   description: Gestion des filières d'études
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Filiere:
 *       type: object
 *       description: Données pour créer une filière (requête POST)
 *       required:
 *         - nom
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de la filière
 *           example: "Scientifique"
 */

/**
 * @swagger
 * /api/filieres:
 *   get:
 *     summary: Récupérer toutes les filières
 *     tags: [Filieres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des filières récupérée avec succès
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
 *                     $ref: '#/components/schemas/Filiere'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('filiere.read'),getAllFilieres);

/**
 * @swagger
 * /api/filieres/{id}:
 *   get:
 *     summary: Récupérer une filière par ID
 *     tags: [Filieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la filière
 *     responses:
 *       200:
 *         description: Filière récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Filiere'
 *       404:
 *         description: Filière introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken,ensurePermission('filiere.read'), getFiliereById);

/**
 * @swagger
 * /api/filieres:
 *   post:
 *     summary: Créer une nouvelle filière
 *     tags: [Filieres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la filière
 *                 example: "Scientifique"
 *     responses:
 *       201:
 *         description: Filière créée avec succès
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
 *                   $ref: '#/components/schemas/Filiere'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('filiere.create'), createFiliere);

/**
 * @swagger
 * /api/filieres/{id}:
 *   put:
 *     summary: Mettre à jour une filière
 *     tags: [Filieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la filière
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la filière
 *                 example: "Littéraire"
 *     responses:
 *       200:
 *         description: Filière mise à jour avec succès
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
 *                   $ref: '#/components/schemas/Filiere'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Filière introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken,ensurePermission('filiere.update'), updateFiliere);

/**
 * @swagger
 * /api/filieres/{id}:
 *   delete:
 *     summary: Supprimer une filière
 *     tags: [Filieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la filière
 *     responses:
 *       200:
 *         description: Filière supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Filière introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken,ensurePermission('filiere.delete'), deleteFiliere);

export default router;