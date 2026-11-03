import express from 'express';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureMultipleRoles, ensurePermission, ensureAdminOrProviseur } from '../middlewares/ensureAdmin';
import {
  getWelcome,
  getAllAccueils,
  getAccueilById,
  createAccueil,
  updateAccueil,
  deleteAccueil,
  getAccueilsByUser
} from '../Controllers/accueil.controller';
import upload from '../middlewares/upload';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Accueil
 *   description: Gestion des pages d'accueil de l'API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Accueil:
 *       type: object
 *       description: Représentation d'une page d'accueil
 *       required:
 *         - nom
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique
 *           example: 1
 *         nom:
 *           type: string
 *           description: Nom de la page d'accueil
 *           example: "Accueil Lycée"
 *         titre:
 *           type: string
 *           description: Titre affiché sur la page d'accueil
 *           example: "Bienvenue au Lycée Saint-Anne"
 *         description:
 *           type: string
 *           description: Description de la page
 *           example: "Bienvenue sur le site de notre lycée"
 *         logoEcole:
 *           type: string
 *           description: Chemin vers le logo de l'école
 *           example: "/uploads/logo.png"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Chemins des images uploadées
 *           example: ["/uploads/img1.jpg", "/uploads/img2.jpg"]
 *         userId:
 *           type: integer
 *           description: ID de l'utilisateur propriétaire
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *           example: "2024-06-01T08:00:00.000Z"
 */


/**
 * @swagger
 * /api/accueils:
 *   get:
 *     summary: Récupérer toutes les pages d'accueil
 *     tags: [Accueil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des pages d'accueil récupérée avec succès
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
 *                     $ref: '#/components/schemas/Accueil'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/accueils', getAllAccueils);

/**
 * @swagger
 * /api/accueils/{id}:
 *   get:
 *     summary: Récupérer une page d'accueil par ID
 *     tags: [Accueil]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la page d'accueil
 *     responses:
 *       200:
 *         description: Page d'accueil récupérée avec succès
 *       404:
 *         description: Page d'accueil introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/accueils/:id', getAccueilById);

/**
 * @swagger
 * /api/accueils:
 *   post:
 *     summary: Créer une nouvelle page d'accueil avec upload d'image
 *     tags: [Accueil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la page d'accueil
 *                 example: "Accueil Lycée"
 *               titre:
 *                 type: string
 *                 description: Titre affiché sur la page d'accueil
 *                 example: "Bienvenue au Lycée Saint-Anne"
 *               description:
 *                 type: string
 *                 description: Description de la page
 *                 example: "Page d'accueil pour le lycée"
 *               logoEcole:
 *                 type: string
 *                 format: binary
 *                 description: Fichier logo de l'école (JPEG, PNG, GIF, WebP)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers images à uploader (JPEG, PNG, GIF, WebP)
 *     responses:
 *       201:
 *         description: Page d'accueil créée avec succès
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
 *                   example: "Page d'accueil créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Accueil'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/accueils', authenticateToken, ensurePermission('accueil.create'), upload.fields([{ name: 'logoEcole', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createAccueil);

/**
 * @swagger
 * /api/accueils/{id}:
 *   put:
 *     summary: Mettre à jour une page d'accueil avec upload d'image optionnel
 *     tags: [Accueil]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la page d'accueil
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom de la page d'accueil
 *                 example: "Accueil Lycée Modifié"
 *               titre:
 *                 type: string
 *                 description: Nouveau titre de la page d'accueil
 *                 example: "Bienvenue au Lycée Saint-Anne"
 *               description:
 *                 type: string
 *                 description: Nouvelle description de la page
 *                 example: "Description mise à jour"
 *               logoEcole:
 *                 type: string
 *                 format: binary
 *                 description: Nouveau logo de l'école (optionnel - JPEG, PNG, GIF, WebP)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Nouveaux fichiers images à uploader (optionnel - JPEG, PNG, GIF, WebP)
 *               userId:
 *                 type: integer
 *                 description: ID du nouvel utilisateur propriétaire (optionnel)
 *     responses:
 *       200:
 *         description: Page d'accueil mise à jour avec succès
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
 *                   example: "Page d'accueil mise à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Accueil'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Page d'accueil introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/accueils/:id', authenticateToken, ensurePermission('accueil.update'), upload.fields([{ name: 'logoEcole', maxCount: 1 }, { name: 'images', maxCount: 10 }]), updateAccueil);

/**
 * @swagger
 * /api/accueils/{id}:
 *   delete:
 *     summary: Supprimer une page d'accueil
 *     tags: [Accueil]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la page d'accueil
 *     responses:
 *       200:
 *         description: Page d'accueil supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Page d'accueil introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/accueils/:id', authenticateToken, ensurePermission('accueil.delete'), deleteAccueil);

/**
 * @swagger
 * /api/accueils/user/{userId}:
 *   get:
 *     summary: Récupérer les pages d'accueil d'un utilisateur
 *     tags: [Accueil]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Pages d'accueil de l'utilisateur récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/accueils/user/:userId', authenticateToken, ensurePermission('accueil.read'), getAccueilsByUser);

export default router;