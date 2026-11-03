import express from 'express';
import {
  getHeuresDepuisCahier,
  setTauxHoraire,
  createSalaire,
  getAllSalaires,
  getSalaireById,
  updateSalaire,
  payerSalaire,
  annulerSalaire,
  deleteSalaire,
  getStatistiquesSalaires,
} from '../Controllers/salaire.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Salaires
 *   description: Gestion des salaires du personnel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Salaire:
 *       type: object
 *       required:
 *         - mois
 *         - annee
 *         - montantBrut
 *         - staffId
 *       properties:
 *         mois:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Mois du salaire (1-12)
 *           example: 1
 *         annee:
 *           type: integer
 *           description: Année du salaire
 *           example: 2024
 *         montantBrut:
 *           type: number
 *           description: Montant brut du salaire
 *           example: 500000
 *         deductions:
 *           type: number
 *           description: Montant des déductions
 *           example: 50000
 *         staffId:
 *           type: integer
 *           description: ID du membre du personnel
 *           example: 1
 *         statut:
 *           type: string
 *           enum: [EN_ATTENTE, PAYE, ANNULE]
 *           description: Statut du paiement
 *           example: EN_ATTENTE
 */

/**
 * @swagger
 * /api/salaires:
 *   post:
 *     summary: Créer un nouveau salaire
 *     tags: [Salaires]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Salaire'
 *     responses:
 *       201:
 *         description: Salaire créé avec succès
 *       400:
 *         description: Données invalides ou salaire existe déjà
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Personnel introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/staff/:staffId/heures-cahier', authenticateToken, ensurePermission('salaire.read'), getHeuresDepuisCahier as any);
router.patch('/staff/:staffId/taux-horaire', authenticateToken, ensurePermission('salaire.update'), setTauxHoraire as any);
router.post('/', authenticateToken, ensurePermission('salaire.create'), createSalaire as any);

/**
 * @swagger
 * /api/salaires:
 *   get:
 *     summary: Récupérer tous les salaires
 *     tags: [Salaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: integer
 *         description: Filtrer par personnel
 *       - in: query
 *         name: mois
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filtrer par mois
 *       - in: query
 *         name: annee
 *         schema:
 *           type: integer
 *         description: Filtrer par année
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, PAYE, ANNULE]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des salaires
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('salaire.read'), getAllSalaires as any);

/**
 * @swagger
 * /api/salaires/statistiques:
 *   get:
 *     summary: Obtenir les statistiques des salaires
 *     tags: [Salaires]
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
 *         description: Statistiques des salaires (total, payés, en attente)
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/statistiques', authenticateToken, ensurePermission('salaire.read'), getStatistiquesSalaires as any);

/**
 * @swagger
 * /api/salaires/{id}:
 *   get:
 *     summary: Récupérer un salaire par ID
 *     tags: [Salaires]
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
 *         description: Détails du salaire
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Salaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('salaire.read'), getSalaireById as any);

/**
 * @swagger
 * /api/salaires/{id}:
 *   put:
 *     summary: Mettre à jour un salaire
 *     tags: [Salaires]
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
 *               mois:
 *                 type: integer
 *               annee:
 *                 type: integer
 *               montantBrut:
 *                 type: number
 *               deductions:
 *                 type: number
 *               statut:
 *                 type: string
 *                 enum: [EN_ATTENTE, PAYE, ANNULE]
 *     responses:
 *       200:
 *         description: Salaire mis à jour
 *       400:
 *         description: Salaire déjà payé (modification impossible)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Salaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('salaire.update'), updateSalaire as any);

/**
 * @swagger
 * /api/salaires/{id}/payer:
 *   patch:
 *     summary: Marquer un salaire comme payé
 *     tags: [Salaires]
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
 *         description: Salaire payé
 *       400:
 *         description: Salaire déjà payé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Salaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/payer', authenticateToken, ensurePermission('salaire.payer'), payerSalaire as any);

/**
 * @swagger
 * /api/salaires/{id}/annuler:
 *   patch:
 *     summary: Annuler un salaire
 *     tags: [Salaires]
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
 *         description: Salaire annulé
 *       400:
 *         description: Salaire déjà annulé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Salaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/annuler', authenticateToken, ensurePermission('salaire.annuler'), annulerSalaire as any);

/**
 * @swagger
 * /api/salaires/{id}:
 *   delete:
 *     summary: Supprimer un salaire
 *     tags: [Salaires]
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
 *         description: Salaire supprimé
 *       400:
 *         description: Impossible de supprimer (salaire déjà payé)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Salaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('salaire.delete'), deleteSalaire as any);

export default router;
