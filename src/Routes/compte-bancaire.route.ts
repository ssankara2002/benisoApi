import express from 'express';
import {
  createCompteBancaire,
  getAllComptesBancaires,
  getCompteBancaireById,
  updateCompteBancaire,
  deleteCompteBancaire,
  getSoldeAtDate,
} from '../Controllers/compte-bancaire.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comptes Bancaires
 *   description: Gestion des comptes bancaires et caisses
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CompteBancaire:
 *       type: object
 *       required:
 *         - libelle
 *         - type
 *       properties:
 *         libelle:
 *           type: string
 *           description: Libellé du compte
 *           example: "Compte principal"
 *         type:
 *           type: string
 *           enum: [CAISSE, BANQUE]
 *           description: Type de compte
 *           example: "BANQUE"
 *         soldeInitial:
 *           type: number
 *           description: Solde initial du compte
 *           example: 1000000
 */

/**
 * @swagger
 * /api/comptes-bancaires:
 *   post:
 *     summary: Créer un nouveau compte bancaire
 *     tags: [Comptes Bancaires]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompteBancaire'
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('compteBancaire.create'), createCompteBancaire as any);

/**
 * @swagger
 * /api/comptes-bancaires:
 *   get:
 *     summary: Récupérer tous les comptes bancaires
 *     tags: [Comptes Bancaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CAISSE, BANQUE]
 *         description: Filtrer par type de compte
 *     responses:
 *       200:
 *         description: Liste des comptes bancaires avec leur solde actuel
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('compteBancaire.read'), getAllComptesBancaires as any);

/**
 * @swagger
 * /api/comptes-bancaires/{id}:
 *   get:
 *     summary: Récupérer un compte par ID
 *     tags: [Comptes Bancaires]
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
 *         description: Détails du compte avec solde et dernières transactions
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Compte non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('compteBancaire.read'), getCompteBancaireById as any);

/**
 * @swagger
 * /api/comptes-bancaires/{id}/solde:
 *   get:
 *     summary: Obtenir le solde à une date donnée
 *     tags: [Comptes Bancaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date pour le calcul du solde
 *     responses:
 *       200:
 *         description: Solde du compte à la date spécifiée
 *       400:
 *         description: Date invalide ou manquante
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Compte non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/solde', authenticateToken, ensurePermission('compteBancaire.read'), getSoldeAtDate as any);

/**
 * @swagger
 * /api/comptes-bancaires/{id}:
 *   put:
 *     summary: Mettre à jour un compte
 *     tags: [Comptes Bancaires]
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
 *                 enum: [CAISSE, BANQUE]
 *               soldeInitial:
 *                 type: number
 *     responses:
 *       200:
 *         description: Compte mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Compte non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('compteBancaire.update'), updateCompteBancaire as any);

/**
 * @swagger
 * /api/comptes-bancaires/{id}:
 *   delete:
 *     summary: Supprimer un compte
 *     tags: [Comptes Bancaires]
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
 *         description: Compte supprimé
 *       400:
 *         description: Impossible de supprimer (transactions associées)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Compte non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('compteBancaire.delete'), deleteCompteBancaire as any);

export default router;
