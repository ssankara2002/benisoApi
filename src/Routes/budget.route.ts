import express from 'express';
import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getTableauDeBord,
} from '../Controllers/budget.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Gestion des budgets et suivi budgétaire
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       required:
 *         - libelle
 *         - montantPrevu
 *         - type
 *       properties:
 *         libelle:
 *           type: string
 *           description: Libellé du budget
 *           example: "Budget frais de scolarité 2024"
 *         montantPrevu:
 *           type: number
 *           description: Montant prévu
 *           example: 10000000
 *         type:
 *           type: string
 *           enum: [RECETTE, DEPENSE]
 *           description: Type de budget
 *           example: "RECETTE"
 *         anneeId:
 *           type: integer
 *           description: ID de l'année scolaire
 *         categorieId:
 *           type: integer
 *           description: ID de la catégorie
 */

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Créer un nouveau budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Budget'
 *     responses:
 *       201:
 *         description: Budget créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('budget.create'), createBudget as any);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Récupérer tous les budgets avec leur réalisation
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RECETTE, DEPENSE]
 *         description: Filtrer par type
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *       - in: query
 *         name: categorieId
 *         schema:
 *           type: integer
 *         description: Filtrer par catégorie
 *     responses:
 *       200:
 *         description: Liste des budgets avec montant prévu, réalisé, taux et écart
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('budget.read'), getAllBudgets as any);

/**
 * @swagger
 * /api/budgets/tableau-de-bord:
 *   get:
 *     summary: Obtenir le tableau de bord budgétaire
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *     responses:
 *       200:
 *         description: Tableau de bord avec totaux recettes/dépenses prévues et réalisées
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/tableau-de-bord', authenticateToken, ensurePermission('budget.read'), getTableauDeBord as any);

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: Récupérer un budget par ID
 *     tags: [Budgets]
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
 *         description: Détails du budget avec transactions associées
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Budget non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('budget.read'), getBudgetById as any);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Mettre à jour un budget
 *     tags: [Budgets]
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
 *               montantPrevu:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [RECETTE, DEPENSE]
 *               anneeId:
 *                 type: integer
 *               categorieId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Budget mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Budget non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('budget.update'), updateBudget as any);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Supprimer un budget
 *     tags: [Budgets]
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
 *         description: Budget supprimé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Budget non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('budget.delete'), deleteBudget as any);

export default router;
