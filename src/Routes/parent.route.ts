import express from 'express';
import {
  getAllParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  addEleveToParent,
  removeEleveFromParent
} from '../Controllers/parent.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin, ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parents
 *   description: Gestion des parents d'élèves
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Parent:
 *       type: object
 *       description: Données pour créer un parent (requête POST)
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom du parent
 *           example: "Dupont"
 *         prenom:
 *           type: string
 *           description: Prénom du parent
 *           example: "Marie"
 *         email:
 *           type: string
 *           description: Email du parent
 *           example: "marie.dupont@email.com"
 *         password:
 *           type: string
 *           description: Mot de passe
 *           example: "password123"
 *         adresse:
 *           type: string
 *           description: Adresse (optionnel)
 *           example: "123 Rue de Paris"
 *         phone:
 *           type: string
 *           description: Numéro de téléphone (optionnel)
 *           example: "+33612345678"
 */

/**
 * @swagger
 * /api/parents:
 *   get:
 *     summary: Récupérer tous les parents
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des parents récupérée avec succès
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
 *                     $ref: '#/components/schemas/Parent'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, ensurePermission('parent.read'),getAllParents);

/**
 * @swagger
 * /api/parents/{id}:
 *   get:
 *     summary: Récupérer un parent par ID
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du parent
 *     responses:
 *       200:
 *         description: Parent récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       404:
 *         description: Parent introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken, ensurePermission('parent.read'),getParentById);

/**
 * @swagger
 * /api/parents:
 *   post:
 *     summary: Créer un nouveau parent
 *     tags: [Parents]
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
 *                 description: Nom du parent
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 description: Prénom du parent
 *                 example: "Marie"
 *               email:
 *                 type: string
 *                 description: Email du parent
 *                 example: "marie.dupont@email.com"
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *                 example: "password123"
 *               adresse:
 *                 type: string
 *                 description: Adresse (optionnel)
 *                 example: "123 Rue de Paris"
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone (optionnel)
 *                 example: "+33612345678"
 *     responses:
 *       201:
 *         description: Parent créé avec succès
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
 *                   $ref: '#/components/schemas/Parent'
 *       400:
 *         description: Données invalides ou utilisateur déjà parent
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('parent.create'), createParent);

/**
 * @swagger
 * /api/parents/{id}:
 *   put:
 *     summary: Mettre à jour un parent
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du parent
 *               prenom:
 *                 type: string
 *                 description: Prénom du parent
 *               email:
 *                 type: string
 *                 description: Email du parent
 *               adresse:
 *                 type: string
 *                 description: Adresse
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone
 *     responses:
 *       200:
 *         description: Parent mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Parent introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('parent.update'), updateParent);

/**
 * @swagger
 * /api/parents/{id}:
 *   delete:
 *     summary: Supprimer un parent
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du parent
 *     responses:
 *       200:
 *         description: Parent supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Parent introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken,ensurePermission('parent.delete'), deleteParent);

/**
 * @swagger
 * /api/parents/{id}/eleves:
 *   post:
 *     summary: Ajouter un élève à un parent
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eleveId
 *             properties:
 *               eleveId:
 *                 type: integer
 *                 description: ID de l'élève à ajouter
 *                 example: 1
 *     responses:
 *       200:
 *         description: Élève ajouté au parent avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Parent ou élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/eleves', authenticateToken, ensureAdmin,ensurePermission('parent.create'), addEleveToParent);

/**
 * @swagger
 * /api/parents/{id}/eleves:
 *   delete:
 *     summary: Retirer un élève d'un parent
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eleveId
 *             properties:
 *               eleveId:
 *                 type: integer
 *                 description: ID de l'élève à retirer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Élève retiré du parent avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Parent ou élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id/eleves', authenticateToken, ensurePermission('parent.delete'),removeEleveFromParent);

export default router;