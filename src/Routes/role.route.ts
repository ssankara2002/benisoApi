import express from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole
} from '../Controllers/role.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestion des rôles utilisateur
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       description: Données pour créer un rôle (requête POST)
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du rôle
 *           example: "TEACHER"
 *         description:
 *           type: string
 *           description: Description du rôle
 *           example: "Professeur ayant accès aux notes et évaluations"
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Récupérer tous les rôles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rôles récupérée avec succès
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
 *                     $ref: '#/components/schemas/Role'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// 🔍 LECTURE - Admin et proviseur peuvent voir les rôles
router.get('/', authenticateToken, ensurePermission('role.read'), getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Récupérer un rôle par ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rôle
 *     responses:
 *       200:
 *         description: Rôle récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Rôle introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// 🔍 CONSULTATION - Même permissions que la lecture
router.get('/:id', authenticateToken, ensurePermission('role.read'), getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Créer un nouveau rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du rôle
 *                 example: "TEACHER"
 *               description:
 *                 type: string
 *                 description: Description du rôle
 *                 example: "Professeur ayant accès aux notes et évaluations"
 *     responses:
 *       201:
 *         description: Rôle créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Données invalides ou rôle existant
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
// ➕ CRÉATION - Seul l'admin peut créer des rôles
router.post('/', authenticateToken, ensurePermission('role.create'), createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Mettre à jour un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rôle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du rôle
 *               description:
 *                 type: string
 *                 description: Description du rôle
 *     responses:
 *       200:
 *         description: Rôle mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Rôle introuvable
 *       500:
 *         description: Erreur serveur
 */
// ✏️ MODIFICATION - Seul l'admin peut modifier les rôles
router.put('/:id', authenticateToken, ensurePermission('role.update'), updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Supprimer un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rôle
 *     responses:
 *       200:
 *         description: Rôle supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Rôle introuvable
 *       500:
 *         description: Erreur serveur
 */
// 🗑️ SUPPRESSION - Seul l'admin peut supprimer les rôles
router.delete('/:id', authenticateToken, ensurePermission('role.delete'), deleteRole);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   post:
 *     summary: Assigner des permissions à un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rôle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Liste des IDs des permissions à assigner
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Permissions assignées avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Rôle ou permissions introuvables
 *       500:
 *         description: Erreur serveur
 */
// 🔐 ASSIGNATION PERMISSIONS - Seul l'admin peut assigner des permissions
router.post('/:id/permissions', authenticateToken, ensurePermission('role.assign_permissions'), assignPermissionsToRole);

export default router;