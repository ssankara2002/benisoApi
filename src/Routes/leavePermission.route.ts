import express from 'express';
import {
  getAllLeavePermissions,
  getLeavePermissionById,
  createLeavePermission,
  updateLeavePermission,
  deleteLeavePermission,
  getLeavePermissionsByUser,
  getLeavePermissionsByPeriod,
  approveLeavePermission,
  rejectLeavePermission,
    
} from '../Controllers/leavePermission.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leave Permissions
 *   description: Gestion des permissions de congé du personnel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LeavePermission:
 *       type: object
 *       description: Données pour créer une permission de congé (requête POST)
 *       properties:
 *         motif:
 *           type: string
 *           description: Motif du congé
 *           example: "Congé maladie"
 *         dateDebut:
 *           type: string
 *           format: date-time
 *           description: Date de début du congé
 *           example: "2024-12-20T08:00:00.000Z"
 *         dateFin:
 *           type: string
 *           format: date-time
 *           description: Date de fin du congé
 *           example: "2024-12-22T17:00:00.000Z"
 */

/**
 * @swagger
 * /api/leave-permissions:
 *   get:
 *     summary: Récupérer toutes les permissions de congé
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des permissions de congé récupérée avec succès
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
 *                     $ref: '#/components/schemas/LeavePermission'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('leavePermission.read'),getAllLeavePermissions);

/**
 * @swagger
 * /api/leave-permissions/period:
 *   get:
 *     summary: Récupérer les permissions de congé par période
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Permissions de congé de la période récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/period', authenticateToken,ensurePermission('leavePermission.read'), getLeavePermissionsByPeriod);

/**
 * @swagger
 * /api/leave-permissions/{id}:
 *   get:
 *     summary: Récupérer une permission de congé par ID
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la permission de congé
 *     responses:
 *       200:
 *         description: Permission de congé récupérée avec succès
 *       404:
 *         description: Permission de congé introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken,ensurePermission('leavePermission.read'), getLeavePermissionById);

/**
 * @swagger
 * /api/leave-permissions:
 *   post:
 *     summary: Créer une nouvelle permission de congé
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *                 description: Motif du congé
 *                 example: "Congé maladie"
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *                 description: Date de début du congé
 *                 example: "2024-12-20T08:00:00.000Z"
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *                 description: Date de fin du congé
 *                 example: "2024-12-22T17:00:00.000Z"
 *     responses:
 *       201:
 *         description: Permission de congé créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('leavePermission.create'), createLeavePermission);

/**
 * @swagger
 * /api/leave-permissions/{id}:
 *   put:
 *     summary: Mettre à jour une permission de congé
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la permission de congé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *                 description: Motif du congé
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *                 description: Date de début du congé
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *                 description: Date de fin du congé
 *               statut:
 *                 type: string
 *                 description: le statut de la permission de congé
 *     responses:
 *       200:
 *         description: Permission de congé mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Permission de congé introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('leavePermission.update'), updateLeavePermission);

/**
 * @swagger
 * /api/leave-permissions/{id}:
 *   delete:
 *     summary: Supprimer une permission de congé
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la permission de congé
 *     responses:
 *       200:
 *         description: Permission de congé supprimée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Permission de congé introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('leavePermission.delete'),deleteLeavePermission);

/**
 * @swagger
 * /api/leave-permissions/user/{userId}:
 *   get:
 *     summary: Récupérer les permissions de congé par utilisateur
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Permissions de congé de l'utilisateur récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId', authenticateToken,ensurePermission('leavePermission.read'), getLeavePermissionsByUser);

/**
 * @swagger
 * /api/leave-permissions/{id}/approve:
 *   patch:
 *     summary: Approuver une permission de congé
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la permission à approuver
 *     responses:
 *       200:
 *         description: Permission de congé approuvée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Permission introuvable
 *       500:
 *         description: Erreur serveur
 */
router.patch(
  "/:id/approve",
  authenticateToken,
  ensurePermission("leavePermission.update"),
  approveLeavePermission
);
/**
 * @swagger
 * /api/leave-permissions/{id}/reject:
 *   patch:
 *     summary: Rejeter une permission de congé
 *     tags: [Leave Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la permission à rejeter
 *     responses:
 *       200:
 *         description: Permission rejetée avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Permission introuvable
 *       500:
 *         description: Erreur serveur
 */
router.patch(
  "/:id/reject",
  authenticateToken,
  ensurePermission("leavePermission.update"),
  rejectLeavePermission
);



export default router;