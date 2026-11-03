import express from 'express';
import {
  createCategorieComptable,
  getAllCategoriesComptables,
  getCategorieComptableById,
  updateCategorieComptable,
  deleteCategorieComptable,
} from '../Controllers/categorie-comptable.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Catégories Comptables
 *   description: Gestion des catégories comptables
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategorieComptable:
 *       type: object
 *       required:
 *         - libelle
 *         - type
 *       properties:
 *         libelle:
 *           type: string
 *           description: Libellé de la catégorie
 *           example: "Frais de scolarité"
 *         type:
 *           type: string
 *           enum: [RECETTE, DEPENSE]
 *           description: Type de transaction
 *           example: "RECETTE"
 */

/**
 * @swagger
 * /api/categories-comptables:
 *   post:
 *     summary: Créer une nouvelle catégorie comptable
 *     tags: [Catégories Comptables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategorieComptable'
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('categorieComptable.create'), createCategorieComptable as any);

/**
 * @swagger
 * /api/categories-comptables:
 *   get:
 *     summary: Récupérer toutes les catégories comptables
 *     tags: [Catégories Comptables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RECETTE, DEPENSE]
 *         description: Filtrer par type de transaction
 *     responses:
 *       200:
 *         description: Liste des catégories comptables
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('categorieComptable.read'), getAllCategoriesComptables as any);

/**
 * @swagger
 * /api/categories-comptables/{id}:
 *   get:
 *     summary: Récupérer une catégorie par ID
 *     tags: [Catégories Comptables]
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
 *         description: Détails de la catégorie
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Catégorie non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('categorieComptable.read'), getCategorieComptableById as any);

/**
 * @swagger
 * /api/categories-comptables/{id}:
 *   put:
 *     summary: Mettre à jour une catégorie
 *     tags: [Catégories Comptables]
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
 *               type:
 *                 type: string
 *                 enum: [RECETTE, DEPENSE]
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Catégorie non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('categorieComptable.update'), updateCategorieComptable as any);

/**
 * @swagger
 * /api/categories-comptables/{id}:
 *   delete:
 *     summary: Supprimer une catégorie
 *     tags: [Catégories Comptables]
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
 *         description: Catégorie supprimée
 *       400:
 *         description: Impossible de supprimer (transactions ou budgets associés)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Catégorie non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('categorieComptable.delete'), deleteCategorieComptable as any);

export default router;
