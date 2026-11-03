import express from 'express';
import {
  getAllCoeficientNiveaux,
  getCoeficientNiveauById,
  createCoeficientNiveau,
  updateCoeficientNiveau,
  deleteCoeficientNiveau,
} from '../Controllers/coeficientNiveau.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CoefficientsNiveau
 *   description: Gestion des coefficients niveau
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CoeficientNiveau:
 *       type: object
 *       description: Données pour créer un coefficient niveau (requête POST)
 *       required:
 *         - valeur
 *         - niveauId
 *         - matiereId
 *       properties:
 *         valeur:
 *           type: integer
 *           description: Valeur du coefficient
 *           example: 3
 *         niveauId:
 *           type: integer
 *           description: ID du niveau
 *           example: 1
 *         matiereId:
 *           type: integer
 *           description: ID de la matière
 *           example: 1
 */

/**
 * @swagger
 * /api/coefficients-niveau:
 *   get:
 *     summary: Récupérer tous les coefficients niveau
 *     tags: [CoefficientsNiveau]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des coefficients niveau
 */
router.get('/', authenticateToken, getAllCoeficientNiveaux);

/**
 * @swagger
 * /api/coefficients-niveau/{id}:
 *   get:
 *     summary: Récupérer un coefficient niveau par ID
 *     tags: [CoefficientsNiveau]
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
 *         description: Coefficient niveau trouvé
 *       404:
 *         description: Coefficient niveau introuvable
 */
router.get('/:id', authenticateToken, getCoeficientNiveauById);

/**
 * @swagger
 * /api/coefficients-niveau:
 *   post:
 *     summary: Créer un nouveau coefficient niveau
 *     tags: [CoefficientsNiveau]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [valeur, niveauId, matiereId]
 *             properties:
 *               valeur:
 *                 type: integer
 *                 example: 3
 *               niveauId:
 *                 type: integer
 *                 example: 1
 *               matiereId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Coefficient niveau créé avec succès
 */
router.post('/', authenticateToken, createCoeficientNiveau);

/**
 * @swagger
 * /api/coefficients-niveau/{id}:
 *   put:
 *     summary: Mettre à jour un coefficient niveau
 *     tags: [CoefficientsNiveau]
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
 *               valeur:
 *                 type: integer
 *               niveauId:
 *                 type: integer
 *               matiereId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Coefficient niveau mis à jour avec succès
 */
router.put('/:id', authenticateToken, updateCoeficientNiveau);

/**
 * @swagger
 * /api/coefficients-niveau/{id}:
 *   delete:
 *     summary: Supprimer un coefficient niveau
 *     tags: [CoefficientsNiveau]
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
 *         description: Coefficient niveau supprimé avec succès
 *       400:
 *         description: Impossible de supprimer (associations existantes)
 */
router.delete('/:id', authenticateToken, deleteCoeficientNiveau);

export default router;
