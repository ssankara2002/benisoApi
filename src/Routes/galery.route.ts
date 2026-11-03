import express from 'express';
import {
  getAllGaleries,
  getGaleryById,
  createGalery,
  updateGalery,
  deleteGalery,
  getGaleriesByType
} from '../Controllers/galery.controller';
import authenticateToken from '../middlewares/authMiddleware';
import {  ensurePermission } from '../middlewares/ensureAdmin';
import upload from '../middlewares/upload';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Galeries
 *   description: Gestion de la galerie d'images du site web
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Galery:
 *       type: object
 *       description: Données pour créer une entrée de galerie (requête POST multipart/form-data)
 *       required:
 *         - image
 *         - typeId
 *       properties:
 *         image:
 *           type: string
 *           format: binary
 *           description: Fichier image à uploader (JPEG, PNG, GIF, WebP)
 *         typeId:
 *           type: integer
 *           description: Type ou catégorie de l'image
 *           example: 1
 *         description:
 *           type: string
 *           description: Description de l'image
 *           example: "Photos de la fête de fin d'année 2024"
 */

/**
 * @swagger
 * /api/galeries:
 *   get:
 *     summary: Récupérer toutes les galeries
 *     tags: [Galeries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des galeries récupérée avec succès
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
 *                     $ref: '#/components/schemas/Galery'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('galery.read'), getAllGaleries);

/**
 * @swagger
 * /api/galeries/{id}:
 *   get:
 *     summary: Récupérer une galerie par ID
 *     tags: [Galeries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la galerie
 *     responses:
 *       200:
 *         description: Galerie récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Galery'
 *       404:
 *         description: Galerie introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('galery.read'), getGaleryById);

/**
 * @swagger
 * /api/galeries:
 *   post:
 *     summary: Créer une nouvelle entrée dans la galerie avec upload d'image
 *     tags: [Galeries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - typeId
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image à uploader (JPEG, PNG, GIF, WebP)
 *               typeId:
 *                 type: integer
 *                 description: Type ou catégorie (obligatoire)
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: Description de l'image
 *                 example: "Photos de la fête de fin d'année 2024"
 *     responses:
 *       201:
 *         description: Galerie créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('galery.create'), upload.single('image'), createGalery);

/**
 * @swagger
 * /api/galeries/{id}:
 *   put:
 *     summary: Mettre à jour une galerie avec upload d'image optionnel
 *     tags: [Galeries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la galerie
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nouveau fichier image à uploader (optionnel - JPEG, PNG, GIF, WebP)
 *               typeId:
 *                 type: integer
 *                 description: Nouveau type ou catégorie de l'image
 *               description:
 *                 type: string
 *                 description: Nouvelle description de l'image
 *                 example: "Description mise à jour"
 *     responses:
 *       200:
 *         description: Galerie mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Galerie introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('galery.update'), upload.single('image'), updateGalery);

/**
 * @swagger
 * /api/galeries/{id}:
 *   delete:
 *     summary: Supprimer une galerie
 *     tags: [Galeries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la galerie
 *     responses:
 *       200:
 *         description: Galerie supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Galerie introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('galery.delete'), deleteGalery);

/**
 * @swagger
 * /api/galeries/type/{type}:
 *   get:
 *     summary: Récupérer les galeries par type
 *     tags: [Galeries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type de galerie
 *     responses:
 *       200:
 *         description: Galeries du type récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/type/:type', authenticateToken, ensurePermission('galery.read'), getGaleriesByType);

export default router;