import express from 'express';
import {
  getAllSeries,
  getSerieById,
  createSerie,
  updateSerie,
  deleteSerie,
  getSeriesByNiveau,
  checkSerieNameExists,
} from '../Controllers/serie.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Series
 *   description: Gestion des séries
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Serie:
 *       type: object
 *       description: Données pour créer une série (requête POST)
 *       required:
 *         - nom
 *         - niveauId
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de la série
 *           example: "S1"
 *         niveauId:
 *           type: integer
 *           description: ID du niveau associé
 *           example: 1
 */

/**
 * @swagger
 * /api/series/check-name:
 *   get:
 *     summary: Vérifier si un nom de série existe déjà
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nom
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: excludeId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 */
router.get('/check-name', authenticateToken, checkSerieNameExists);

/**
 * @swagger
 * /api/series:
 *   get:
 *     summary: Récupérer toutes les séries
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des séries
 */
router.get('/', authenticateToken, getAllSeries);

/**
 * @swagger
 * /api/series/{id}:
 *   get:
 *     summary: Récupérer une série par ID
 *     tags: [Series]
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
 *         description: Série trouvée
 *       404:
 *         description: Série introuvable
 */
router.get('/:id', authenticateToken, getSerieById);

/**
 * @swagger
 * /api/series/niveau/{niveauId}:
 *   get:
 *     summary: Récupérer les séries par niveau
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: niveauId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des séries du niveau
 */
router.get('/niveau/:niveauId', authenticateToken, getSeriesByNiveau);

/**
 * @swagger
 * /api/series:
 *   post:
 *     summary: Créer une nouvelle série
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, niveauId]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "S1"
 *               niveauId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Série créée avec succès
 */
router.post('/', authenticateToken, createSerie);

/**
 * @swagger
 * /api/series/{id}:
 *   put:
 *     summary: Mettre à jour une série
 *     tags: [Series]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               niveauId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Série mise à jour avec succès
 */
router.put('/:id', authenticateToken, updateSerie);

/**
 * @swagger
 * /api/series/{id}:
 *   delete:
 *     summary: Supprimer une série
 *     tags: [Series]
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
 *         description: Série supprimée avec succès
 *       400:
 *         description: Impossible de supprimer (associations existantes)
 */
router.delete('/:id', authenticateToken, deleteSerie);

export default router;
