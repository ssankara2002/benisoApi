import express from 'express';
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideosByNiveauController,
  getVideosByMatiereController,
} from '../Controllers/video.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';
import upload from '../middlewares/upload';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Gestion des vidéos du site web
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       description: Données pour créer une vidéo (requête POST multipart/form-data)
 *       required:
 *         - fileVideo
 *       properties:
 *         fileVideo:
 *           type: string
 *           format: binary
 *           description: Fichier vidéo à uploader (MP4, AVI, MOV, WebM)
 *         description:
 *           type: string
 *           description: Description de la vidéo
 *           example: "Présentation vidéo de notre école"
 *         niveauId:
 *           type: integer
 *           description: ID du niveau associé (optionnel)
 *           example: 1
 *         matiereId:
 *           type: integer
 *           description: ID de la matière associée (optionnel)
 *           example: 2
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Récupérer toutes les vidéos
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des vidéos récupérée avec succès
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
 *                     $ref: '#/components/schemas/Video'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('video.read'), getAllVideos);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Récupérer une vidéo par ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Vidéo récupérée avec succès
 *       404:
 *         description: Vidéo introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('video.read'), getVideoById);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Créer une nouvelle vidéo avec upload de fichier
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fileVideo
 *             properties:
 *               fileVideo:
 *                 type: string
 *                 format: binary
 *                 description: Fichier vidéo à uploader (MP4, AVI, MOV, WebM)
 *               description:
 *                 type: string
 *                 description: Description de la vidéo
 *                 example: "Présentation vidéo de notre école et de ses installations"
 *               niveauId:
 *                 type: integer
 *                 description: ID du niveau associé
 *               matiereId:
 *                 type: integer
 *                 description: ID de la matière associée
 *     responses:
 *       201:
 *         description: Vidéo créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (permission requise)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('video.create'), upload.single('fileVideo'), createVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Mettre à jour une vidéo avec upload de fichier optionnel
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vidéo
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fileVideo:
 *                 type: string
 *                 format: binary
 *                 description: Nouveau fichier vidéo à uploader (optionnel - MP4, AVI, MOV, WebM)
 *               description:
 *                 type: string
 *                 description: Nouvelle description de la vidéo
 *                 example: "Description mise à jour"
 *               niveauId:
 *                 type: integer
 *                 description: ID du niveau associé (envoyer null pour dé-lier)
 *               matiereId:
 *                 type: integer
 *                 description: ID de la matière associée (envoyer null pour dé-lier)
 *     responses:
 *       200:
 *         description: Vidéo mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (permission requise)
 *       404:
 *         description: Vidéo introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('video.update'), upload.single('fileVideo'), updateVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Supprimer une vidéo
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Vidéo supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (permission requise)
 *       404:
 *         description: Vidéo introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('video.delete'), deleteVideo);

/**
 * @swagger
 * /api/videos/niveau/{niveauId}:
 *   get:
 *     summary: Récupérer les vidéos par ID de niveau
 *     tags: [Videos]
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
 *         description: Liste des vidéos pour le niveau
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/niveau/:niveauId', authenticateToken, ensurePermission('video.read'), getVideosByNiveauController);

/**
 * @swagger
 * /api/videos/matiere/{matiereId}:
 *   get:
 *     summary: Récupérer les vidéos par ID de matière
 *     tags: [Videos]
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
 *         description: Liste des vidéos pour la matière
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/matiere/:matiereId', authenticateToken, ensurePermission('video.read'), getVideosByMatiereController);

export default router;