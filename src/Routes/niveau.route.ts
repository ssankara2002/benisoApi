import express from 'express';
import {
  getAllNiveaux,
  getNiveauById,
  createNiveau,
  updateNiveau,
  deleteNiveau,
  getPlacesDisponiblesByNiveau
} from '../Controllers/niveau.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Niveaux
 *   description: Gestion des niveaux scolaires (6ème, 5ème, 4ème, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Niveau:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nomNiveau:
 *           type: string
 *           description: Nom du niveau scolaire
 *           example: "Sixième"
 *         cycle:
 *           type: string
 *           description: "Cycle du niveau (ex: Primaire, Collège, Lycée)"
 *           example: "Collège"
 *         scolarite:
 *           type: integer
 *           description: Montant de la scolarité pour ce niveau
 *           example: 75000
 *         typeEnseignementId:
 *           type: integer
 *           nullable: true
 *           description: ID du type d'enseignement
 *           example: 1
 *         typeEnseignement:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             nom:
 *               type: string
 *               example: "Général"
 *         classes:
 *           type: array
 *           description: Liste des classes de ce niveau
 *           items:
 *             type: object
 *         _count:
 *           type: object
 *           description: Compteurs des relations
 *           properties:
 *             classes:
 *               type: integer
 *               example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     NiveauInput:
 *       type: object
 *       required:
 *         - nomNiveau
 *       properties:
 *         nomNiveau:
 *           type: string
 *           description: Nom du niveau scolaire
 *           example: "Sixième"
 *         cycle:
 *           type: string
 *           description: "Cycle du niveau (ex: Primaire, Collège, Lycée)"
 *           example: "Collège"
 *         scolarite:
 *           type: integer
 *           description: Montant de la scolarité pour ce niveau
 *           example: 75000
 *         typeEnseignementId:
 *           type: integer
 *           description: ID du type d'enseignement
 *           example: 1
 */

/**
 * @swagger
 * /api/niveaux:
 *   get:
 *     summary: Récupérer tous les niveaux scolaires
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des niveaux récupérée avec succès
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
 *                     $ref: '#/components/schemas/Niveau'
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
router.get('/', authenticateToken, ensurePermission('niveau.read'), getAllNiveaux);

/**
 * @swagger
 * /api/niveaux/{id}:
 *   get:
 *     summary: Récupérer un niveau par ID
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *         example: 1
 *     responses:
 *       200:
 *         description: Niveau récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Niveau'
 *       404:
 *         description: Niveau introuvable
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
router.get('/:id', authenticateToken,  ensurePermission('niveau.read'), getNiveauById);

/**
 * @swagger
 * /api/niveaux:
 *   post:
 *     summary: Créer un nouveau niveau scolaire
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NiveauInput'
 *     responses:
 *       201:
 *         description: Niveau créé avec succès
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
 *                   example: "Niveau créé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Niveau'
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
router.post('/', authenticateToken,  ensurePermission('niveau.create'), createNiveau);

/**
 * @swagger
 * /api/niveaux/{id}:
 *   put:
 *     summary: Mettre à jour un niveau scolaire
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NiveauInput'
 *     responses:
 *       200:
 *         description: Niveau mis à jour avec succès
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
 *                   example: "Niveau mis à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Niveau'
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
 *         description: Niveau introuvable
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
router.put('/:id', authenticateToken,  ensurePermission('niveau.update'),  updateNiveau);

/**
 * @swagger
 * /api/niveaux/{id}:
 *   delete:
 *     summary: Supprimer un niveau scolaire
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *         example: 1
 *     responses:
 *       200:
 *         description: Niveau supprimé avec succès
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
 *                   example: "Niveau supprimé avec succès"
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
 *         description: Niveau introuvable
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
router.delete('/:id', authenticateToken,  ensurePermission('niveau.delete'),  deleteNiveau);

/**
 * @swagger
 * /api/niveaux/{id}/places-disponibles:
 *   get:
 *     summary: Récupérer les places disponibles d'un niveau
 *     description: Retourne la capacité totale, l'effectif actuel et les places disponibles pour un niveau donné, avec le détail par classe
 *     tags: [Niveaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *         example: 1
 *     responses:
 *       200:
 *         description: Places disponibles récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     niveauId:
 *                       type: integer
 *                       example: 1
 *                     nomNiveau:
 *                       type: string
 *                       example: "Sixième"
 *                     capaciteTotale:
 *                       type: integer
 *                       description: Somme des capacités de toutes les classes
 *                       example: 90
 *                     effectifTotal:
 *                       type: integer
 *                       description: Nombre total d'élèves inscrits
 *                       example: 75
 *                     placesDisponibles:
 *                       type: integer
 *                       description: Places restantes (capacité - effectif)
 *                       example: 15
 *                     classes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           nom:
 *                             type: string
 *                             example: "6ème A"
 *                           capacite:
 *                             type: integer
 *                             example: 30
 *                           effectif:
 *                             type: integer
 *                             example: 25
 *                           placesDisponibles:
 *                             type: integer
 *                             example: 5
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
 *       404:
 *         description: Niveau introuvable
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
router.get('/:id/places-disponibles', authenticateToken, ensurePermission('niveau.read'), getPlacesDisponiblesByNiveau);

export default router;
