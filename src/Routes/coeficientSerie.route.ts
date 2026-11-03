import express from 'express';
import {
  getAllCoeficientSeries,
  getCoeficientSerieById,
  createCoeficientSerie,
  updateCoeficientSerie,
  deleteCoeficientSerie,
} from '../Controllers/coeficientSerie.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CoefficientsSerie
 *   description: Gestion des coefficients série
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CoeficientSerie:
 *       type: object
 *       description: Données pour créer un coefficient série (requête POST)
 *       required:
 *         - valeur
 *         - matiereId
 *         - serieId
 *       properties:
 *         valeur:
 *           type: integer
 *           description: Valeur du coefficient
 *           example: 3
 *         matiereId:
 *           type: integer
 *           description: ID de la matière
 *           example: 1
 *         serieId:
 *           type: integer
 *           description: ID de la série
 *           example: 1
 */

/**
 * @swagger
 * /api/coefficients-serie:
 *   get:
 *     summary: Récupérer tous les coefficients série
 *     tags: [CoefficientsSerie]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des coefficients série
 */
router.get('/', authenticateToken, getAllCoeficientSeries);

/**
 * @swagger
 * /api/coefficients-serie/{id}:
 *   get:
 *     summary: Récupérer un coefficient série par ID
 *     tags: [CoefficientsSerie]
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
 *         description: Coefficient série trouvé
 *       404:
 *         description: Coefficient série introuvable
 */
router.get('/:id', authenticateToken, getCoeficientSerieById);

/**
 * @swagger
 * /api/coefficients-serie:
 *   post:
 *     summary: Créer un nouveau coefficient série
 *     tags: [CoefficientsSerie]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [valeur, matiereId, serieId]
 *             properties:
 *               valeur:
 *                 type: integer
 *                 example: 3
 *               matiereId:
 *                 type: integer
 *                 example: 1
 *               serieId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Coefficient série créé avec succès
 */
router.post('/', authenticateToken, createCoeficientSerie);

/**
 * @swagger
 * /api/coefficients-serie/{id}:
 *   put:
 *     summary: Mettre à jour un coefficient série
 *     tags: [CoefficientsSerie]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du coefficient série
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valeur:
 *                 type: integer
 *                 example: 3
 *               matiereId:
 *                 type: integer
 *                 example: 1
 *               serieId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Coefficient série mis à jour avec succès
 */
router.put('/:id', authenticateToken, updateCoeficientSerie);

/**
 * @swagger
 * /api/coefficients-serie/{id}:
 *   delete:
 *     summary: Supprimer un coefficient série
 *     tags: [CoefficientsSerie]
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
 *         description: Coefficient série supprimé avec succès
 *       400:
 *         description: Impossible de supprimer (associations existantes)
 */
router.delete('/:id', authenticateToken, deleteCoeficientSerie);

export default router;
