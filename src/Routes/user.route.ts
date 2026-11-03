import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRoleTo,
  toggleUserStatus
} from '../Controllers/user.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: Données pour créer un utilisateur (requête POST)
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'utilisateur
 *           example: "Diallo"
 *         prenom:
 *           type: string
 *           description: Prénom de l'utilisateur
 *           example: "Amadou"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *           example: "amadou.diallo@ecole.com"
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe
 *           example: "password123"
 *         adresse:
 *           type: string
 *           description: Adresse de l'utilisateur (optionnel)
 *           example: "123 Rue de la Paix"
 *         phone:
 *           type: string
 *           description: Numéro de téléphone (optionnel)
 *           example: "+221 77 123 45 67"
 *         roleId:
 *           type: integer
 *           description: ID du rôle (optionnel)
 *           example: 2
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// 🔍 LECTURE - Admin, proviseur et secrétaire peuvent voir les utilisateurs
router.get('/', authenticateToken, ensurePermission('user.read'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// 🔍 CONSULTATION - Même permissions que la lecture
router.get('/:id', authenticateToken, ensurePermission('user.read'), getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
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
 *               - prenom
 *               - email
 *               - password
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               adresse:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
// ➕ CRÉATION - Seuls admin et proviseur peuvent créer des utilisateurs
router.post('/', authenticateToken, ensurePermission('user.create'), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               adresse:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: integer
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
// ✏️ MODIFICATION - Admin, proviseur et secrétaire
router.put('/:id', authenticateToken, ensurePermission('user.update'), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
// 🗑️ SUPPRESSION - Seul l'admin peut supprimer
router.delete('/:id', authenticateToken, ensurePermission('user.delete'), deleteUser);

/**
 * @swagger
 * /api/users/assign-role:
 *   post:
 *     summary: Attribuer un rôle à un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Rôle attribué avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Utilisateur ou rôle introuvable
 *       500:
 *         description: Erreur serveur
 */
// 🔑 ATTRIBUTION DE RÔLE - Seul l'admin peut attribuer des rôles
router.post('/assign-role', authenticateToken, ensurePermission('user.update'), assignRoleTo);

/**
 * @swagger
 * /api/users/{userId}/toggle-status:
 *   patch:
 *     summary: Activer ou désactiver un membre du staff
 *     description: Permet d'activer ou de désactiver un compte staff. Seuls les membres du staff peuvent être activés/désactivés.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur (doit être un staff)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: true pour activer, false pour désactiver
 *                 example: true
 *     responses:
 *       200:
 *         description: Statut du staff modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Staff activé avec succès"
 *                 data:
 *                   type: object
 *       400:
 *         description: Données invalides ou utilisateur non-staff
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (permission user.update requise)
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
// 🔄 ACTIVATION/DÉSACTIVATION - Seul l'admin peut activer/désactiver des membres du staff
router.patch('/:userId/toggle-status', authenticateToken, ensurePermission('user.update'), toggleUserStatus);


export default router;