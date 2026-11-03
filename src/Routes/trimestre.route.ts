import express from 'express';
import {
  createTrimestre,
  getAllTrimestres,
  getTrimestresByAnnee,
  getTrimestreById,
  updateTrimestre,
  deleteTrimestre,
  toggleTrimestreValidation,
} from '../Controllers/trimestre.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trimestres
 *   description: Gestion des trimestres scolaires
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Trimestre:
 *       type: object
 *       description: Données pour créer un trimestre (requête POST)
 *       required:
 *         - nom
 *         - anneeId
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom du trimestre
 *           example: "1er Trimestre"
 *         dateDebut:
 *           type: string
 *           format: date
 *           description: Date de début du trimestre
 *           example: "2023-09-01"
 *         dateFin:
 *           type: string
 *           format: date
 *           description: Date de fin du trimestre
 *           example: "2023-12-20"
 *         anneeId:
 *           type: integer
 *           description: ID de l'année scolaire
 *           example: 1
 */

/**
 * @swagger
 * /api/trimestres:
 *   post:
 *     summary: Créer un nouveau trimestre
 *     tags: [Trimestres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - anneeId
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "1er Trimestre"
 *               dateDebut:
 *                 type: string
 *                 format: date
 *                 example: "2023-09-01"
 *               dateFin:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-20"
 *               anneeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Trimestre créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', createTrimestre as any);

/**
 * @swagger
 * /api/trimestres:
 *   get:
 *     summary: Récupérer tous les trimestres
 *     tags: [Trimestres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des trimestres
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllTrimestres as any);

/**
 * @swagger
 * /api/trimestres/annee/{anneeId}:
 *   get:
 *     summary: Récupérer les trimestres d'une année
 *     tags: [Trimestres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trimestres de l'année
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/annee/:anneeId', getTrimestresByAnnee as any);

/**
 * @swagger
 * /api/trimestres/{id}:
 *   get:
 *     summary: Récupérer un trimestre par ID
 *     tags: [Trimestres]
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
 *         description: Détails du trimestre
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Trimestre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getTrimestreById as any);

/**
 * @swagger
 * /api/trimestres/{id}:
 *   put:
 *     summary: Mettre à jour un trimestre
 *     tags: [Trimestres]
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
 *               nom:
 *                 type: string
 *               dateDebut:
 *                 type: string
 *                 format: date
 *                 example: "2023-09-01"
 *               dateFin:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-20"
 *               anneeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Trimestre mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Trimestre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', updateTrimestre as any);

/**
 * @swagger
 * /api/trimestres/{id}:
 *   delete:
 *     summary: Supprimer un trimestre
 *     tags: [Trimestres]
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
 *         description: Trimestre supprimé
 *       400:
 *         description: Impossible de supprimer (évaluations associées)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Trimestre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', deleteTrimestre as any);

/**
 * @swagger
 * /api/trimestres/{id}/toggle-validation:
 *   patch:
 *     summary: Invalider/Valider un trimestre
 *     tags: [Trimestres]
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
 *             required:
 *               - invalide
 *             properties:
 *               invalide:
 *                 type: boolean
 *                 description: true pour invalider, false pour valider
 *                 example: true
 *     responses:
 *       200:
 *         description: Trimestre invalidé/validé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Trimestre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/toggle-validation', toggleTrimestreValidation as any);

export default router;
