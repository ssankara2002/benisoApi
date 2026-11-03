import express from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  validerTransaction,
  annulerTransaction,
  deleteTransaction,
  getStatistiquesTransactions,
} from '../Controllers/transaction.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Gestion des transactions comptables
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - libelle
 *         - montant
 *         - type
 *         - date
 *       properties:
 *         libelle:
 *           type: string
 *           description: Libellé de la transaction
 *           example: "Paiement frais de scolarité"
 *         montant:
 *           type: number
 *           description: Montant de la transaction
 *           example: 50000
 *         type:
 *           type: string
 *           enum: [RECETTE, DEPENSE]
 *           description: Type de transaction
 *           example: "RECETTE"
 *         date:
 *           type: string
 *           format: date
 *           description: Date de la transaction
 *           example: "2024-01-15"
 *         dateEcheance:
 *           type: string
 *           format: date
 *           description: Date d'échéance
 *           example: "2024-02-15"
 *         pieceJustificative:
 *           type: string
 *           description: URL de la pièce justificative
 *         note:
 *           type: string
 *           description: Note ou commentaire
 *         categorieId:
 *           type: integer
 *           description: ID de la catégorie
 *         compteId:
 *           type: integer
 *           description: ID du compte
 *         anneeId:
 *           type: integer
 *           description: ID de l'année scolaire
 *         paiementId:
 *           type: integer
 *           description: ID du paiement associé
 *         lignes:
 *           type: array
 *           description: Lignes de détail de la transaction
 *           items:
 *             type: object
 *             properties:
 *               libelle:
 *                 type: string
 *               montant:
 *                 type: number
 *               quantite:
 *                 type: integer
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Créer une nouvelle transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('transaction.create'), createTransaction as any);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Récupérer toutes les transactions
 *     tags: [Transactions]
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
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, ANNULE]
 *         description: Filtrer par statut
 *       - in: query
 *         name: categorieId
 *         schema:
 *           type: integer
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: compteId
 *         schema:
 *           type: integer
 *         description: Filtrer par compte
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Liste des transactions
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('transaction.read'), getAllTransactions as any);

/**
 * @swagger
 * /api/transactions/statistiques:
 *   get:
 *     summary: Obtenir les statistiques des transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Statistiques des transactions (recettes, dépenses, solde)
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/statistiques', authenticateToken, ensurePermission('transaction.read'), getStatistiquesTransactions as any);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Récupérer une transaction par ID
 *     tags: [Transactions]
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
 *         description: Détails de la transaction
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('transaction.read'), getTransactionById as any);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Mettre à jour une transaction
 *     tags: [Transactions]
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
 *               montant:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               dateEcheance:
 *                 type: string
 *                 format: date
 *               pieceJustificative:
 *                 type: string
 *               note:
 *                 type: string
 *               categorieId:
 *                 type: integer
 *               compteId:
 *                 type: integer
 *               anneeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Transaction mise à jour
 *       400:
 *         description: Transaction validée ou annulée (modification impossible)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('transaction.update'), updateTransaction as any);

/**
 * @swagger
 * /api/transactions/{id}/valider:
 *   patch:
 *     summary: Valider une transaction
 *     tags: [Transactions]
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
 *         description: Transaction validée
 *       400:
 *         description: Transaction déjà traitée
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/valider', authenticateToken, ensurePermission('transaction.validate'), validerTransaction as any);

/**
 * @swagger
 * /api/transactions/{id}/annuler:
 *   patch:
 *     summary: Annuler une transaction
 *     tags: [Transactions]
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
 *         description: Transaction annulée
 *       400:
 *         description: Transaction déjà annulée
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/annuler', authenticateToken, ensurePermission('transaction.cancel'), annulerTransaction as any);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Supprimer une transaction
 *     tags: [Transactions]
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
 *         description: Transaction supprimée
 *       400:
 *         description: Impossible de supprimer (transaction validée ou annulée)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('transaction.delete'), deleteTransaction as any);

export default router;
