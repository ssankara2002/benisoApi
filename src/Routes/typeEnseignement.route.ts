import express from 'express';
import {
  getAllTypeEnseignements,
  getTypeEnseignementById,
  createTypeEnseignement,
  updateTypeEnseignement,
  deleteTypeEnseignement,
} from '../Controllers/typeEnseignement.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TypesEnseignement
 *   description: Gestion des types d'enseignement
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TypeEnseignement:
 *       type: object
 *       description: Données pour créer un type d'enseignement (requête POST)
 *       required:
 *         - nom
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom du type d'enseignement
 *           example: "Général"
 */

/**
 * @swagger
 * /api/types-enseignement:
 *   get:
 *     summary: Récupérer tous les types d'enseignement
 *     tags: [TypesEnseignement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des types d'enseignement
 */
router.get('/', authenticateToken, getAllTypeEnseignements);

/**
 * @swagger
 * /api/types-enseignement/{id}:
 *   get:
 *     summary: Récupérer un type d'enseignement par ID
 *     tags: [TypesEnseignement]
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
 *         description: Type d'enseignement trouvé
 *       404:
 *         description: Type d'enseignement introuvable
 */
router.get('/:id', authenticateToken, getTypeEnseignementById);

/**
 * @swagger
 * /api/types-enseignement:
 *   post:
 *     summary: Créer un nouveau type d'enseignement
 *     tags: [TypesEnseignement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Général"
 *     responses:
 *       201:
 *         description: Type d'enseignement créé avec succès
 */
router.post('/', authenticateToken, createTypeEnseignement);

/**
 * @swagger
 * /api/types-enseignement/{id}:
 *   put:
 *     summary: Mettre à jour un type d'enseignement
 *     tags: [TypesEnseignement]
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
 *     responses:
 *       200:
 *         description: Type d'enseignement mis à jour avec succès
 */
router.put('/:id', authenticateToken, updateTypeEnseignement);

/**
 * @swagger
 * /api/types-enseignement/{id}:
 *   delete:
 *     summary: Supprimer un type d'enseignement
 *     tags: [TypesEnseignement]
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
 *         description: Type d'enseignement supprimé avec succès
 *       400:
 *         description: Impossible de supprimer (associations existantes)
 */
router.delete('/:id', authenticateToken, deleteTypeEnseignement);

export default router;
