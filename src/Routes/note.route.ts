import express from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNotesByEleve,
  getNotesByEvaluation,
  getNotesByMatiere,
  getStatistiquesNotes,
  getNotesByEleveGroupedByMatiere
} from '../Controllers/note.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Gestion des notes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       description: Données pour créer une note (requête POST)
 *       required:
 *         - valeur
 *         - eleveId
 *         - evaluationId
 *       properties:
 *         valeur:
 *           type: number
 *           format: float
 *           description: Note obtenue par l'élève
 *           example: 15.5
 *           minimum: 0
 *           maximum: 20
 *         eleveId:
 *           type: integer
 *           description: ID de l'élève noté
 *           example: 1
 *         evaluationId:
 *           type: integer
 *           description: ID de l'évaluation
 *           example: 1
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Récupérer toutes les notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken,ensurePermission('note.read'), getAllNotes);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Récupérer une note par ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la note
 *     responses:
 *       200:
 *         description: Note récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken,ensurePermission('note.read'), getNoteById);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Créer une nouvelle note (seul le staff propriétaire de l'évaluation)
 *     description: Seul le staff qui a créé l'évaluation peut ajouter des notes. La vérification se fait automatiquement via middleware.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valeur
 *               - eleveId
 *               - evaluationId
 *             properties:
 *               valeur:
 *                 type: number
 *                 format: float
 *                 description: Note obtenue par l'élève
 *                 example: 15.5
 *                 minimum: 0
 *                 maximum: 20
 *               eleveId:
 *                 type: integer
 *                 description: ID de l'élève noté
 *                 example: 1
 *               evaluationId:
 *                 type: integer
 *                 description: ID de l'évaluation (doit appartenir au staff connecté)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Note créée avec succès
 *       400:
 *         description: Données invalides ou champs manquants
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - seul le propriétaire de l'évaluation peut créer des notes
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('note.create'), createNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Mettre à jour une note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valeur:
 *                 type: number
 *                 format: float
 *                 description: Nouvelle note de l'élève
 *                 minimum: 0
 *                 maximum: 20
 *                 example: 17
 *               eleveId:
 *                 type: integer
 *                 description: Nouvel ID de l'élève (optionnel)
 *               evaluationId:
 *                 type: integer
 *                 description: Nouvel ID de l'évaluation (optionnel)
 *     responses:
 *       200:
 *         description: Note mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - seul le propriétaire de l'évaluation peut modifier
 *       404:
 *         description: Note introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('note.update'), updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Supprimer une note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la note
 *     responses:
 *       200:
 *         description: Note supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Note introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('note.delete'), deleteNote);

/**
 * @swagger
 * /api/notes/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les notes par élève
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     responses:
 *       200:
 *         description: Notes de l'élève récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/eleve/:eleveId', authenticateToken, ensurePermission('note.read'),getNotesByEleve);

/**
 * @swagger
 * /api/notes/evaluation/{evaluationId}:
 *   get:
 *     summary: Récupérer les notes par évaluation
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'évaluation
 *     responses:
 *       200:
 *         description: Notes de l'évaluation récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluation/:evaluationId', authenticateToken,ensurePermission('note.read'), getNotesByEvaluation);

/**
 * @swagger
 * /api/notes/matiere/{matiereId}:
 *   get:
 *     summary: Récupérer les notes par matière
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matiereId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *     responses:
 *       200:
 *         description: Notes de la matière récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/matiere/:matiereId', authenticateToken,ensurePermission('note.read'), getNotesByMatiere);

/**
 * @swagger
 * /api/notes/evaluation/{evaluationId}/stats:
 *   get:
 *     summary: Récupérer les statistiques des notes d'une évaluation
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'évaluation
 *     responses:
 *       200:
 *         description: Statistiques des notes récupérées avec succès
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
 *                     moyenne:
 *                       type: number
 *                       format: float
 *                       description: Moyenne générale
 *                       example: 13.5
 *                     mediane:
 *                       type: number
 *                       format: float
 *                       description: Médiane
 *                       example: 14.0
 *                     noteMin:
 *                       type: number
 *                       format: float
 *                       description: Note minimale
 *                       example: 8.0
 *                     noteMax:
 *                       type: number
 *                       format: float
 *                       description: Note maximale
 *                       example: 19.5
 *                     nombreEleves:
 *                       type: integer
 *                       description: Nombre d'élèves évalués
 *                       example: 25
 *                     repartition:
 *                       type: object
 *                       description: Répartition par tranches de notes
 *                       properties:
 *                         excellent:
 *                           type: integer
 *                           description: Notes >= 16
 *                         bien:
 *                           type: integer
 *                           description: Notes entre 14 et 16
 *                         assezBien:
 *                           type: integer
 *                           description: Notes entre 12 et 14
 *                         passable:
 *                           type: integer
 *                           description: Notes entre 10 et 12
 *                         insuffisant:
 *                           type: integer
 *                           description: Notes < 10
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Évaluation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluation/:evaluationId/stats', authenticateToken,ensurePermission('note.read'), getStatistiquesNotes);

/**
 * @swagger
 * /api/notes/eleve/{eleveId}/par-matiere:
 *   get:
 *     summary: Récupérer les notes d'un élève groupées par matière
 *     description: Retourne toutes les notes d'un élève organisées par matière avec la moyenne pour chaque matière
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire (optionnel, pour filtrer par année)
 *     responses:
 *       200:
 *         description: Notes groupées par matière récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       matiereId:
 *                         type: integer
 *                         example: 1
 *                       matiere:
 *                         type: string
 *                         example: "Mathématiques"
 *                       typeMatiere:
 *                         type: string
 *                         nullable: true
 *                         example: "scientifique"
 *                       notes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             valeur:
 *                               type: number
 *                               example: 15.5
 *                             typeEvaluation:
 *                               type: string
 *                               example: "composition"
 *                             date:
 *                               type: string
 *                               format: date-time
 *                             evaluationId:
 *                               type: integer
 *                               example: 5
 *                       nombreNotes:
 *                         type: integer
 *                         example: 8
 *                       moyenne:
 *                         type: number
 *                         nullable: true
 *                         example: 14.25
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/eleve/:eleveId/par-matiere', authenticateToken, ensurePermission('note.read'), getNotesByEleveGroupedByMatiere);

export default router;