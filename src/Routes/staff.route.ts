import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from '../Controllers/staff.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Gestion du personnel éducatif
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       description: Données pour créer un membre du personnel (requête POST)
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 *         - roleId
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom du personnel
 *           example: "Martin"
 *         prenom:
 *           type: string
 *           description: Prénom du personnel
 *           example: "Paul"
 *         email:
 *           type: string
 *           description: Email du personnel
 *           example: "paul.martin@ecole.com"
 *         password:
 *           type: string
 *           description: Mot de passe
 *           example: "password123"
 *         roleId:
 *           type: integer
 *           description: ID du rôle du personnel
 *           example: 3
 *         adresse:
 *           type: string
 *           description: Adresse (optionnel)
 *           example: "456 Avenue de la Paix"
 *         phone:
 *           type: string
 *           description: Numéro de téléphone (optionnel)
 *           example: "+33687654321"
 */

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Récupérer tout le personnel
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste du personnel récupérée avec succès
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
 *                     $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, getAllStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Récupérer un membre du personnel par ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du personnel
 *     responses:
 *       200:
 *         description: Personnel récupéré avec succès
 *       404:
 *         description: Personnel introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, getStaffById);

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Créer un nouveau membre du personnel
 *     tags: [Staff]
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
 *               - roleId
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du personnel
 *                 example: "Martin"
 *               prenom:
 *                 type: string
 *                 description: Prénom du personnel
 *                 example: "Paul"
 *               email:
 *                 type: string
 *                 description: Email du personnel
 *                 example: "paul.martin@ecole.com"
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *                 example: "password123"
 *               roleId:
 *                 type: integer
 *                 description: ID du rôle du personnel
 *                 example: 3
 *               adresse:
 *                 type: string
 *                 description: Adresse (optionnel)
 *                 example: "456 Avenue de la Paix"
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone (optionnel)
 *                 example: "+33687654321"
 *     responses:
 *       201:
 *         description: Personnel créé avec succès
 *       400:
 *         description: Données invalides ou utilisateur déjà personnel
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensureAdmin, createStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Mettre à jour un membre du personnel
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du personnel
 *               prenom:
 *                 type: string
 *                 description: Prénom du personnel
 *               email:
 *                 type: string
 *                 description: Email du personnel
 *               roleId:
 *                 type: integer
 *                 description: ID du rôle du personnel
 *               adresse:
 *                 type: string
 *                 description: Adresse
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone
 *     responses:
 *       200:
 *         description: Personnel mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Personnel introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensureAdmin, updateStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   delete:
 *     summary: Supprimer un membre du personnel
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du personnel
 *     responses:
 *       200:
 *         description: Personnel supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Personnel introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensureAdmin, deleteStaff);

export default router;