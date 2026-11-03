import express from 'express';
import {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
} from '../Controllers/type.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Types
 *   description: Gestion des types de galeries
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Type:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du type
 *         nom:
 *           type: string
 *           description: Nom du type
 *           example: "Peinture"
 *         galleries:
 *           type: array
 *           description: Liste des galeries associées à ce type
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 */

/**
 * @swagger
 * /api/types:
 *   get:
 *     summary: Récupérer tous les types
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des types récupérée avec succès
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
 *                     $ref: '#/components/schemas/Type'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('type.read'), getAllTypes);

/**
 * @swagger
 * /api/types/{id}:
 *   get:
 *     summary: Récupérer un type par ID
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type
 *     responses:
 *       200:
 *         description: Type récupéré avec succès
 *       404:
 *         description: Type introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('type.read'), getTypeById);

/**
 * @swagger
 * /api/types:
 *   post:
 *     summary: Créer un nouveau type
 *     tags: [Types]
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
 *                 description: Nom du type
 *                 example: "Photographie"
 *     responses:
 *       201:
 *         description: Type créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('type.create'), createType);

/**
 * @swagger
 * /api/types/{id}:
 *   put:
 *     summary: Mettre à jour un type
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Sculpture"
 *     responses:
 *       200:
 *         description: Type mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Type introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('type.update'), updateType);

/**
 * @swagger
 * /api/types/{id}:
 *   delete:
 *     summary: Supprimer un type
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type à supprimer
 *     responses:
 *       200:
 *         description: Type supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Type introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('type.delete'), deleteType);

export default router;
