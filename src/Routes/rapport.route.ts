import express from 'express';
import {
  getRapportFinancier,
  getBilanComptable,
  getRapportSalaires,
  getRapportMensuel,
} from '../Controllers/rapport.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rapports
 *   description: Rapports financiers et bilans comptables
 */

/**
 * @swagger
 * /api/rapports/financier:
 *   get:
 *     summary: Obtenir le rapport financier global
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de la période
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de la période
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire
 *     responses:
 *       200:
 *         description: Rapport financier avec recettes, dépenses, solde et répartition par catégorie/compte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     periode:
 *                       type: object
 *                     resume:
 *                       type: object
 *                       properties:
 *                         totalRecettes:
 *                           type: number
 *                         totalDepenses:
 *                           type: number
 *                         solde:
 *                           type: number
 *                         nombreTransactions:
 *                           type: integer
 *                     parCategorie:
 *                       type: array
 *                     parCompte:
 *                       type: array
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/financier', authenticateToken, ensurePermission('rapport.read'), getRapportFinancier as any);

/**
 * @swagger
 * /api/rapports/bilan:
 *   get:
 *     summary: Obtenir le bilan comptable (balance sheet)
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de la période
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de la période
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire
 *     responses:
 *       200:
 *         description: Bilan comptable avec actifs, passifs et capitaux propres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     periode:
 *                       type: object
 *                     actifs:
 *                       type: object
 *                       properties:
 *                         tresorerie:
 *                           type: number
 *                         creancesScolarite:
 *                           type: number
 *                         total:
 *                           type: number
 *                     passifs:
 *                       type: object
 *                       properties:
 *                         salairesDus:
 *                           type: number
 *                         total:
 *                           type: number
 *                     capitauxPropres:
 *                       type: number
 *                     details:
 *                       type: object
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/bilan', authenticateToken, ensurePermission('rapport.read'), getBilanComptable as any);

/**
 * @swagger
 * /api/rapports/salaires:
 *   get:
 *     summary: Obtenir le rapport détaillé des salaires
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: annee
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *     responses:
 *       200:
 *         description: Rapport des salaires par personnel avec résumé global
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     annee:
 *                       type: integer
 *                     resume:
 *                       type: object
 *                       properties:
 *                         totalBrut:
 *                           type: number
 *                         totalDeductions:
 *                           type: number
 *                         totalNet:
 *                           type: number
 *                         totalPaye:
 *                           type: number
 *                         totalEnAttente:
 *                           type: number
 *                         nombreSalaires:
 *                           type: integer
 *                         nombrePersonnels:
 *                           type: integer
 *                     parPersonnel:
 *                       type: array
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/salaires', authenticateToken, ensurePermission('rapport.read'), getRapportSalaires as any);

/**
 * @swagger
 * /api/rapports/mensuel:
 *   get:
 *     summary: Obtenir le rapport mensuel (transactions + salaires)
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mois
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mois (1-12)
 *       - in: query
 *         name: annee
 *         required: true
 *         schema:
 *           type: integer
 *         description: Année
 *     responses:
 *       200:
 *         description: Rapport mensuel avec transactions et salaires
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     periode:
 *                       type: object
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         recettes:
 *                           type: number
 *                         depenses:
 *                           type: number
 *                         solde:
 *                           type: number
 *                         nombre:
 *                           type: integer
 *                     salaires:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         payes:
 *                           type: number
 *                         enAttente:
 *                           type: number
 *                         nombre:
 *                           type: integer
 *                         details:
 *                           type: array
 *                     resume:
 *                       type: object
 *                       properties:
 *                         recettes:
 *                           type: number
 *                         depenses:
 *                           type: number
 *                         salaires:
 *                           type: number
 *                         resultat:
 *                           type: number
 *       400:
 *         description: Mois ou année manquants ou invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/mensuel', authenticateToken, ensurePermission('rapport.read'), getRapportMensuel as any);

export default router;
