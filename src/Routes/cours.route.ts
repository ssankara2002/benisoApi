import express from 'express';
import {
  getAllCours,
  getCoursById,
  createCours,
  updateCours,
  deleteCours,
  addEleveToCours,
  removeEleveFromCours
} from '../Controllers/cours.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';
import upload from '../middlewares/upload';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cours
 *   description: Gestion des cours de l'école
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cours:
 *       type: object
 *       description: Données pour créer un cours (requête POST multipart/form-data)
 *       required:
 *         - nom
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom du cours
 *           example: "Mathématiques avancées"
 *         description:
 *           type: string
 *           description: Description du cours
 *           example: "Cours de mathématiques pour le niveau terminale"
 *         niveauId:
 *           type: integer
 *           description: ID du niveau (optionnel)
 *           example: 1
 *         matiereId:
 *           type: integer
 *           description: ID de la matière (optionnel)
 *           example: 2
 *         file:
 *           type: string
 *           format: binary
 *           description: Fichier du cours à uploader (PDF, DOC, DOCX, etc.)
 */

/**
 * @swagger
 * /api/cours:
 *   get:
 *     summary: Récupérer tous les cours
 *     tags: [Cours]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des cours récupérée avec succès
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
 *                     $ref: '#/components/schemas/Cours'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('cours.read'), getAllCours);

/**
 * @swagger
 * /api/cours/{id}:
 *   get:
 *     summary: Récupérer un cours par ID
 *     tags: [Cours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du cours
 *     responses:
 *       200:
 *         description: Cours récupéré avec succès
 *       404:
 *         description: Cours introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken,  ensurePermission('cours.read'),getCoursById);

/**
 * @swagger
 * /api/cours:
 *   post:
 *     summary: Créer un nouveau cours
 *     tags: [Cours]
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
 *                 description: Nom du cours
 *                 example: "Mathématiques avancées"
 *               description:
 *                 type: string
 *                 description: Description du cours
 *                 example: "Cours de mathématiques pour le niveau terminale"
 *               niveauId:
 *                 type: integer
 *                 description: ID du niveau (optionnel)
 *                 example: 1
 *               matiereId:
 *                 type: integer
 *                 description: ID de la matière (optionnel)
 *                 example: 2
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier du cours à uploader (PDF, DOC, DOCX, etc.)
 *     responses:
 *       201:
 *         description: Cours créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken,  ensurePermission('cours.create'), upload.single('file'), createCours);

/**
 * @swagger
 * /api/cours/{id}:
 *   put:
 *     summary: Mettre à jour un cours
 *     tags: [Cours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du cours
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du cours
 *                 example: "Mathématiques niveau supérieur"
 *               description:
 *                 type: string
 *                 description: Nouvelle description du cours
 *                 example: "Cours de mathématiques pour étudiants avancés"
 *               niveauId:
 *                 type: integer
 *                 description: Nouvel ID du niveau (optionnel)
 *                 example: 2
 *               matiereId:
 *                 type: integer
 *                 description: Nouvel ID de la matière (optionnel)
 *                 example: 3
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Nouveau fichier du cours à uploader (optionnel - PDF, DOC, DOCX, etc.)
 *     responses:
 *       200:
 *         description: Cours mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Cours introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('cours.update'), upload.single('file'), updateCours);

/**
 * @swagger
 * /api/cours/{id}:
 *   delete:
 *     summary: Supprimer un cours
 *     tags: [Cours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du cours
 *     responses:
 *       200:
 *         description: Cours supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Cours introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken,  ensurePermission('cours.delete'), deleteCours);

/**
 * @swagger
 * /api/cours/{id}/eleves:
 *   post:
 *     summary: Ajouter un élève au cours
 *     tags: [Cours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eleveId
 *             properties:
 *               eleveId:
 *                 type: integer
 *                 description: ID de l'élève à ajouter
 *                 example: 5
 *     responses:
 *       200:
 *         description: Élève ajouté au cours avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Cours ou élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/eleves', authenticateToken,  ensurePermission('cours.create'), addEleveToCours);

/**
 * @swagger
 * /api/cours/{id}/eleves:
 *   delete:
 *     summary: Retirer un élève du cours
 *     tags: [Cours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eleveId
 *             properties:
 *               eleveId:
 *                 type: integer
 *                 description: ID de l'élève à retirer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Élève retiré du cours avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Cours ou élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id/eleves', authenticateToken,  ensurePermission('cours.delete'), removeEleveFromCours);

export default router;