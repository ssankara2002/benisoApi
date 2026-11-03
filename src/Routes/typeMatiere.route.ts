import express from 'express';
import {
  createTypeMatiere,
  getAllTypesMatieres,
  getTypeMatiereById,
  updateTypeMatiere,
  deleteTypeMatiere,
} from '../Controllers/typeMatiere.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Types de Matières
 *   description: Gestion des types de matières (LITTERAIRES, SCIENTIFIQUES, AUTRES)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TypeMatiere:
 *       type: object
 *       description: Données pour créer un type de matière (requête POST)
 *       required:
 *         - libelle
 *       properties:
 *         libelle:
 *           type: string
 *           description: Libellé du type de matière
 *           example: "MATIERES SCIENTIFIQUES"
 */

/**
 * @swagger
 * /api/types-matieres:
 *   post:
 *     summary: Créer un nouveau type de matière
 *     tags: [Types de Matières]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *             properties:
 *               libelle:
 *                 type: string
 *                 example: "MATIERES LITTERAIRES"
 *     responses:
 *       201:
 *         description: Type de matière créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', createTypeMatiere as any);

/**
 * @swagger
 * /api/types-matieres:
 *   get:
 *     summary: Récupérer tous les types de matières
 *     tags: [Types de Matières]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des types de matières
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllTypesMatieres as any);

/**
 * @swagger
 * /api/types-matieres/{id}:
 *   get:
 *     summary: Récupérer un type de matière par ID
 *     tags: [Types de Matières]
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
 *         description: Détails du type de matière
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Type de matière non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getTypeMatiereById as any);

/**
 * @swagger
 * /api/types-matieres/{id}:
 *   put:
 *     summary: Mettre à jour un type de matière
 *     tags: [Types de Matières]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Type de matière mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Type de matière non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', updateTypeMatiere as any);

/**
 * @swagger
 * /api/types-matieres/{id}:
 *   delete:
 *     summary: Supprimer un type de matière
 *     tags: [Types de Matières]
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
 *         description: Type de matière supprimé
 *       400:
 *         description: Impossible de supprimer (matières associées)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Type de matière non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', deleteTypeMatiere as any);

export default router;
