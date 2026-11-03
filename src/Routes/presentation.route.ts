import express from 'express';
import {
  getAllPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation
} from '../Controllers/presentation.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Presentations
 *   description: Gestion des présentations de l'école
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Presentation:
 *       type: object
 *       description: Données pour créer une présentation (requête POST)
 *       properties:
 *         description:
 *           type: string
 *           description: Description de l'école
 *           example: "Notre école est un établissement d'excellence fondé en 1985"
 *         histoire:
 *           type: string
 *           description: Histoire de l'école
 *           example: "Fondée par M. Dupont avec la vision de créer un environnement d'apprentissage exceptionnel"
 *         mission:
 *           type: string
 *           description: Mission de l'école
 *           example: "Former les leaders de demain en offrant une éducation de qualité"
 *         phone:
 *           type: string
 *           description: Numéro de téléphone de l'école
 *           example: "+221 77 123 45 67"
 *         reseau:
 *           type: object
 *           description: Liens vers les réseaux sociaux (objet JSON)
 *           example: {"facebook": "https://facebook.com/ecole", "twitter": "https://twitter.com/ecole"}
 *         email:
 *           type: string
 *           description: Adresse email de l'école
 *           example: "contact@ecole.com"
 */

/**
 * @swagger
 * /api/presentations:
 *   get:
 *     summary: Récupérer toutes les présentations
 *     tags: [Presentations]
 *     responses:
 *       200:
 *         description: Liste des présentations récupérée avec succès
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
 *                     $ref: '#/components/schemas/Presentation'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllPresentations);

/**
 * @swagger
 * /api/presentations/{id}:
 *   get:
 *     summary: Récupérer une présentation par ID
 *     tags: [Presentations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la présentation
 *     responses:
 *       200:
 *         description: Présentation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Presentation'
 *       404:
 *         description: Présentation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getPresentationById);

/**
 * @swagger
 * /api/presentations:
 *   post:
 *     summary: Créer une nouvelle présentation
 *     tags: [Presentations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description de l'école
 *                 example: "Notre école est un établissement d'excellence fondé en 1985"
 *               histoire:
 *                 type: string
 *                 description: Histoire de l'école
 *                 example: "Fondée par M. Dupont avec la vision de créer un environnement d'apprentissage exceptionnel"
 *               mission:
 *                 type: string
 *                 description: Mission de l'école
 *                 example: "Former les leaders de demain en offrant une éducation de qualité et des valeurs solides"
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone de l'école
 *                 example: "+221 77 123 45 67"
 *               reseau:
 *                 type: array
 *                 description: Liste des liens vers les réseaux sociaux de l'école
 *                 items:
 *                   type: string
 *                 example: ["https://facebook.com/ecole", "https://twitter.com/ecole", "https://instagram.com/ecole"]
 *               email:
 *                 type: string
 *                 description: Adresse email de l'école
 *                 example: "contact@ecole.com"
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur responsable
 *                 example: 1
 *     responses:
 *       201:
 *         description: Présentation créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken,  ensurePermission('presentation.create'), createPresentation);

/**
 * @swagger
 * /api/presentations/{id}:
 *   put:
 *     summary: Mettre à jour une présentation
 *     tags: [Presentations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la présentation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               histoire:
 *                 type: string
 *               mission:
 *                 type: string
 *               phone:
 *                 type: string
 *               reseau:
 *                 type: array
 *                 items:
 *                   type: string
 *               email:
 *                 type: string
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Présentation mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Présentation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('presentation.update'), updatePresentation);

/**
 * @swagger
 * /api/presentations/{id}:
 *   delete:
 *     summary: Supprimer une présentation
 *     tags: [Presentations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la présentation
 *     responses:
 *       200:
 *         description: Présentation supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Présentation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('presentation.delete'), deletePresentation);

export default router;