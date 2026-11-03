import express from 'express';
import {
  getAllMatieres,
  getMatiereById,
  createMatiere,
  updateMatiere,
  deleteMatiere,
  addEleveToMatiere,
  removeEleveFromMatiere,
  getMatieresSuggestions
} from '../Controllers/matiere.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Matieres
 *   description: Gestion des matières scolaires (Mathématiques, Français, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Matiere:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         libelle:
 *           type: string
 *           description: Nom de la matière
 *           example: "Mathématiques"
 *         typeMatiereId:
 *           type: integer
 *           nullable: true
 *           description: ID du type de matière
 *           example: 1
 *         typeMatiere:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             libelle:
 *               type: string
 *               example: "Scientifique"
 *         eleves:
 *           type: array
 *           description: Liste des élèves inscrits à cette matière
 *           items:
 *             type: object
 *         specialites:
 *           type: array
 *           description: Liste des spécialités liées à cette matière
 *           items:
 *             type: object
 *         coeficientsNiveau:
 *           type: array
 *           description: Coefficients par niveau
 *           items:
 *             type: object
 *         coefficientsSerie:
 *           type: array
 *           description: Coefficients par série
 *           items:
 *             type: object
 *         _count:
 *           type: object
 *           description: Compteurs des relations
 *           properties:
 *             eleves:
 *               type: integer
 *               example: 45
 *             evaluations:
 *               type: integer
 *               example: 12
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     MatiereInput:
 *       type: object
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *           description: Nom de la matière
 *           example: "Mathématiques"
 *         typeMatiereId:
 *           type: integer
 *           description: ID du type de matière (optionnel)
 *           example: 1
 */

/**
 * @swagger
 * /api/matieres:
 *   get:
 *     summary: Récupérer toutes les matières
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des matières récupérée avec succès
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
 *                     $ref: '#/components/schemas/Matiere'
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       500:
 *         description: Erreur serveur
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
 */
router.get('/', authenticateToken,ensurePermission('matiere.read'), getAllMatieres);

/**
 * @swagger
 * /api/matieres/{id}:
 *   get:
 *     summary: Récupérer une matière par ID
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *         example: 1
 *     responses:
 *       200:
 *         description: Matière récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Matiere'
 *       404:
 *         description: Matière introuvable
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
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       500:
 *         description: Erreur serveur
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
 */
router.get('/:id', authenticateToken, ensurePermission('matiere.read'),getMatiereById);

/**
 * @swagger
 * /api/matieres:
 *   post:
 *     summary: Créer une nouvelle matière
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatiereInput'
 *     responses:
 *       201:
 *         description: Matière créée avec succès
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
 *                   example: "Matière créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Matiere'
 *       400:
 *         description: Données invalides ou matière déjà existante
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
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       403:
 *         description: Accès refusé - Permission insuffisante
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
 *       500:
 *         description: Erreur serveur
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
 */
router.post('/', authenticateToken, ensurePermission('matiere.create'), createMatiere);

/**
 * @swagger
 * /api/matieres/{id}:
 *   put:
 *     summary: Mettre à jour une matière
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatiereInput'
 *     responses:
 *       200:
 *         description: Matière mise à jour avec succès
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
 *                   example: "Matière mise à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Matiere'
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
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       403:
 *         description: Accès refusé - Permission insuffisante
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
 *       404:
 *         description: Matière introuvable
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
 *       500:
 *         description: Erreur serveur
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
 */
router.put('/:id', authenticateToken, ensurePermission('matiere.update'), updateMatiere);

/**
 * @swagger
 * /api/matieres/{id}:
 *   delete:
 *     summary: Supprimer une matière
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *         example: 1
 *     responses:
 *       200:
 *         description: Matière supprimée avec succès
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
 *                   example: "Matière supprimée avec succès"
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       403:
 *         description: Accès refusé - Permission insuffisante
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
 *       404:
 *         description: Matière introuvable
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
 *       500:
 *         description: Erreur serveur
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
 */
router.delete('/:id', authenticateToken, ensurePermission('matiere.delete'), deleteMatiere);

/**
 * @swagger
 * /api/matieres/{id}/eleves:
 *   post:
 *     summary: Ajouter un élève à une matière
 *     description: Associe un élève à une matière pour qu'il puisse suivre cette matière
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *         example: 1
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
 *         description: Élève ajouté à la matière avec succès
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
 *                   example: "Élève ajouté à la matière avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Matiere'
 *       400:
 *         description: Données invalides ou élève déjà inscrit
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
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       403:
 *         description: Accès refusé - Permission insuffisante
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
 *       404:
 *         description: Matière ou élève introuvable
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
 *       500:
 *         description: Erreur serveur
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
 */
router.post('/:id/eleves', authenticateToken, ensurePermission('matiere.create'), addEleveToMatiere);

/**
 * @swagger
 * /api/matieres/{id}/eleves:
 *   delete:
 *     summary: Retirer un élève d'une matière
 *     description: Supprime l'association entre un élève et une matière
 *     tags: [Matieres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *         example: 1
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
 *         description: Élève retiré de la matière avec succès
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
 *                   example: "Élève retiré de la matière avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Matiere'
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
 *       401:
 *         description: Non autorisé - Token manquant ou invalide
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
 *       403:
 *         description: Accès refusé - Permission insuffisante
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
 *       404:
 *         description: Matière ou élève introuvable
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
 *       500:
 *         description: Erreur serveur
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
 */
router.delete('/:id/eleves', authenticateToken, ensurePermission('matiere.delete'), removeEleveFromMatiere);

export default router;
