import express from 'express';
import {
  getAllSpecialites,
  getSpecialiteById,
  createSpecialite,
  updateSpecialite,
  deleteSpecialite,
  getSpecialitesByFiliere,
  addMatiereToSpecialite,
  removeMatiereFromSpecialite
} from '../Controllers/specialite.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Specialites
 *   description: Gestion des spécialités académiques
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Specialite:
 *       type: object
 *       description: Données pour créer une spécialité (requête POST)
 *       required:
 *         - nom
 *         - filiereId
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de la spécialité
 *           example: "Mathématiques-Physique"
 *         filiereId:
 *           type: integer
 *           description: ID de la filière associée
 *           example: 1
 */

/**
 * @swagger
 * /api/specialites:
 *   get:
 *     summary: Récupérer toutes les spécialités
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des spécialités récupérée avec succès
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
 *                     $ref: '#/components/schemas/Specialite'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken,ensurePermission('specialite.read'), getAllSpecialites);

/**
 * @swagger
 * /api/specialites/{id}:
 *   get:
 *     summary: Récupérer une spécialité par ID
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la spécialité
 *     responses:
 *       200:
 *         description: Spécialité récupérée avec succès
 *       404:
 *         description: Spécialité introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('specialite.read'),getSpecialiteById);

/**
 * @swagger
 * /api/specialites:
 *   post:
 *     summary: Créer une nouvelle spécialité
 *     tags: [Specialites]
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
 *               - filiereId
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la spécialité
 *                 example: "Mathématiques-Physique"
 *               filiereId:
 *                 type: integer
 *                 description: ID de la filière
 *                 example: 1
 *     responses:
 *       201:
 *         description: Spécialité créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('specialite.create'), createSpecialite);

/**
 * @swagger
 * /api/specialites/{id}:
 *   put:
 *     summary: Mettre à jour une spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la spécialité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la spécialité
 *               filiereId:
 *                 type: integer
 *                 description: ID de la filière
 *     responses:
 *       200:
 *         description: Spécialité mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Spécialité introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('specialite.update'), updateSpecialite);

/**
 * @swagger
 * /api/specialites/{id}:
 *   delete:
 *     summary: Supprimer une spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la spécialité
 *     responses:
 *       200:
 *         description: Spécialité supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Spécialité introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('specialite.delete'), deleteSpecialite);

/**
 * @swagger
 * /api/specialites/filiere/{filiereId}:
 *   get:
 *     summary: Récupérer les spécialités par filière
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filiereId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la filière
 *     responses:
 *       200:
 *         description: Spécialités de la filière récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/filiere/:filiereId', authenticateToken, ensurePermission('specialite.read'),getSpecialitesByFiliere);

/**
 * @swagger
 * /api/specialites/{id}/matieres:
 *   post:
 *     summary: Ajouter une matière à la spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la spécialité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matiereId
 *             properties:
 *               matiereId:
 *                 type: integer
 *                 description: ID de la matière
 *     responses:
 *       200:
 *         description: Matière ajoutée à la spécialité avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Spécialité ou matière introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/matieres', authenticateToken,ensurePermission('specialite.create'), addMatiereToSpecialite);

/**
 * @swagger
 * /api/specialites/{id}/matieres:
 *   delete:
 *     summary: Retirer une matière de la spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la spécialité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matiereId
 *             properties:
 *               matiereId:
 *                 type: integer
 *                 description: ID de la matière
 *     responses:
 *       200:
 *         description: Matière retirée de la spécialité avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Spécialité ou matière introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id/matieres', authenticateToken,ensurePermission('specialite.delete'), removeMatiereFromSpecialite);

export default router;