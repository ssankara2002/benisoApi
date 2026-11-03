import express from 'express';
import {
  getAllActualites,
  getActualiteById,
  createActualite,
  updateActualite,
  deleteActualite,
} from '../Controllers/actualite.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin } from '../middlewares/ensureAdmin';
import upload from '../middlewares/upload';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Actualités
 *   description: Gestion des actualités de l'école
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Actualite:
 *       type: object
 *       description: Données pour créer une actualité (requête POST multipart/form-data)
 *       required:
 *         - nom
 *         - typeId
 *       properties:
 *         nom:
 *           type: string
 *           description: Titre de l'actualité
 *           example: "Rentrée scolaire 2024-2025"
 *         description:
 *           type: string
 *           description: Description de l'actualité
 *           example: "La rentrée scolaire aura lieu le 5 septembre 2024"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de l'actualité
 *           example: "2024-09-05T08:00:00.000Z"
 *         typeId:
 *           type: integer
 *           description: ID du type d'actualité
 *           example: 1
 *         image:
 *           type: string
 *           format: binary
 *           description: Image d'illustration à uploader
 */

/**
 * @swagger
 * /api/actualites:
 *   get:
 *     summary: Récupérer toutes les actualités
 *     tags: [Actualités]
 *     responses:
 *       200:
 *         description: Liste des actualités récupérée avec succès
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
 *                     $ref: '#/components/schemas/Actualite'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllActualites);

/**
 * @swagger
 * /api/actualites/{id}:
 *   get:
 *     summary: Récupérer une actualité par ID
 *     tags: [Actualités]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'actualité
 *     responses:
 *       200:
 *         description: Actualité récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Actualite'
 *       404:
 *         description: Actualité introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getActualiteById);

/**
 * @swagger
 * /api/actualites:
 *   post:
 *     summary: Créer une nouvelle actualité
 *     tags: [Actualités]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nom, typeId]
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               typeId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Actualité créée avec succès.
 *       400:
 *         description: Données invalides.
 *       401:
 *         description: Non authentifié.
 *       403:
 *         description: Accès refusé.
 */
router.post('/', authenticateToken, ensureAdmin, upload.single('image'), createActualite);

/**
 * @swagger
 * /api/actualites/{id}:
 *   put:
 *     summary: Mettre à jour une actualité
 *     tags: [Actualités]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               typeId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Actualité mise à jour avec succès.
 */
router.put('/:id', authenticateToken, ensureAdmin, upload.single('image'), updateActualite);

/**
 * @swagger
 * /api/actualites/{id}:
 *   delete:
 *     summary: Supprimer une actualité
 *     tags: [Actualités]
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
 *         description: Actualité supprimée avec succès.
 */
router.delete('/:id', authenticateToken, ensureAdmin, deleteActualite);

export default router;