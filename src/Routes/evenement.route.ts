import express from 'express';
import {
  getAllEvenements,
  getEvenementById,
  createEvenement,
  updateEvenement,
  deleteEvenement,
  getEvenementsByPeriod
} from '../Controllers/evenement.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Evenements
 *   description: Gestion des événements scolaires
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Evenement:
 *       type: object
 *       description: Données pour créer un événement (requête POST)
 *       required:
 *         - nom
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'événement
 *           example: "Fête de fin d'année"
 *         lieu:
 *           type: string
 *           description: Lieu de l'événement
 *           example: "Salle polyvalente"
 *         image:
 *           type: string
 *           description: URL ou chemin de l'image de l'événement
 *           example: "https://example.com/event.jpg"
 *         dateDebut:
 *           type: string
 *           format: date-time
 *           description: Date et heure de début
 *           example: "2024-12-15T14:00:00.000Z"
 *         dateFin:
 *           type: string
 *           format: date-time
 *           description: Date et heure de fin
 *           example: "2024-12-15T17:00:00.000Z"
 */

/**
 * @swagger
 * /api/evenements:
 *   get:
 *     summary: Récupérer tous les événements
 *     tags: [Evenements]
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
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
 *                     $ref: '#/components/schemas/Evenement'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllEvenements);

/**
 * @swagger
 * /api/evenements/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     tags: [Evenements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Evenement'
 *       404:
 *         description: Événement introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getEvenementById);

/**
 * @swagger
 * /api/evenements/period:
 *   get:
 *     summary: Récupérer les événements par période
 *     tags: [Evenements]
 *     parameters:
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début de la période
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Événements de la période récupérés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/period', getEvenementsByPeriod);


/**
 * @swagger
 * /api/evenements:
 *   post:
 *     summary: Créer un nouvel événement
 *     tags: [Evenements]
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
 *                 description: Nom de l'événement
 *               lieu:
 *                 type: string
 *                 description: Lieu de l'événement
 *               image:
 *                 type: string
 *                 description: URL ou chemin de l'image de l'événement
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure de début
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure de fin
 *                 example: "2024-12-15T17:00:00.000Z"
 *               userId:
 *                 type: integer
 *                 description: ID de user associée
 *                 example: 1
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken,ensurePermission('evenement.create'),  createEvenement);

/**
 * @swagger
 * /api/evenements/{id}:
 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de l'événement
 *               lieu:
 *                 type: string
 *                 description: Nom de l'événement
 *               image:
 *                 type: string
 *                 description: URL ou chemin de l'image de l'événement
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure de début
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure de fin
 *               userId:
 *                 type: integer
 *                 description: ID de user associée
 *     responses:
 *       200:
 *         description: Événement mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Événement introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('evenement.update'),  updateEvenement);

/**
 * @swagger
 * /api/evenements/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Événement introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('evenement.delete'),  deleteEvenement);


export default router;