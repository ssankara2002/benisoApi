import express from 'express';
import {
  creerLicence,
  recupererLicences,
  recupererLicenceParId,
  verifierLicence,
  renouvelerLicence,
  desactiverLicence,
  reactiverLicence,
  supprimerLicence,
  modifierLicence,
} from '../Controllers/licence.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensureAdmin } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Licences
 *   description: Gestion des licences API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Licence:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cleApi:
 *           type: string
 *           example: "lic_abc123..."
 *         nomEcole:
 *           type: string
 *           example: "École Sainte Anne"
 *         emailContact:
 *           type: string
 *           example: "contact@sainte-anne.edu"
 *         telephoneContact:
 *           type: string
 *           example: "+225 01 02 03 04 05"
 *         dateActivation:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         dateExpiration:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:00:00Z"
 *         estActif:
 *           type: boolean
 *           example: true
 *         nombreAppels:
 *           type: integer
 *           example: 1523
 *         derniereUtilisation:
 *           type: string
 *           format: date-time
 *           example: "2024-12-20T14:30:00Z"
 */

/**
 * @swagger
 * /api/licences:
 *   post:
 *     summary: Créer une nouvelle licence
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomEcole
 *               - emailContact
 *             properties:
 *               nomEcole:
 *                 type: string
 *                 example: "École Sainte Anne"
 *               emailContact:
 *                 type: string
 *                 example: "contact@sainte-anne.edu"
 *               telephoneContact:
 *                 type: string
 *                 example: "+225 01 02 03 04 05"
 *     responses:
 *       201:
 *         description: Licence créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Licence créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Licence'
 */
router.post('/', authenticateToken, ensureAdmin, creerLicence);

/**
 * @swagger
 * /api/licences:
 *   get:
 *     summary: Récupérer toutes les licences
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des licences
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
 *                     $ref: '#/components/schemas/Licence'
 */
router.get('/', authenticateToken, ensureAdmin, recupererLicences);

/**
 * @swagger
 * /api/licences/{id}:
 *   get:
 *     summary: Récupérer une licence par son ID
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la licence
 *     responses:
 *       200:
 *         description: Licence trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Licence'
 *       404:
 *         description: Licence introuvable
 */
router.get('/:id', authenticateToken, ensureAdmin, recupererLicenceParId);

/**
 * @swagger
 * /api/licences/verify:
 *   post:
 *     summary: Vérifier la validité d'une licence
 *     tags: [Licences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cleApi
 *             properties:
 *               cleApi:
 *                 type: string
 *                 example: "lic_abc123..."
 *     responses:
 *       200:
 *         description: Licence valide
 *       403:
 *         description: Licence invalide, expirée ou désactivée
 */
router.post('/verify', verifierLicence);

/**
 * @swagger
 * /api/licences/{id}/renouveler:
 *   patch:
 *     summary: Renouveler une licence pour 1 an
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la licence
 *     responses:
 *       200:
 *         description: Licence renouvelée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Licence renouvelée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Licence'
 */
router.patch('/:id/renouveler', authenticateToken, ensureAdmin, renouvelerLicence);

/**
 * @swagger
 * /api/licences/{id}/desactiver:
 *   patch:
 *     summary: Désactiver une licence
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la licence
 *     responses:
 *       200:
 *         description: Licence désactivée
 */
router.patch('/:id/desactiver', authenticateToken, ensureAdmin, desactiverLicence);

/**
 * @swagger
 * /api/licences/{id}/reactiver:
 *   patch:
 *     summary: Réactiver une licence
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la licence
 *     responses:
 *       200:
 *         description: Licence réactivée
 */
router.patch('/:id/reactiver', authenticateToken, ensureAdmin, reactiverLicence);

/**
 * @swagger
 * /api/licences/{id}:
 *   put:
 *     summary: Modifier les informations d'une licence
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la licence
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomEcole:
 *                 type: string
 *                 example: "École Sainte Anne"
 *               emailContact:
 *                 type: string
 *                 example: "contact@sainte-anne.edu"
 *               telephoneContact:
 *                 type: string
 *                 example: "+225 01 02 03 04 05"
 *     responses:
 *       200:
 *         description: Licence modifiée
 */
router.put('/:id', authenticateToken, ensureAdmin, modifierLicence);

/**
 * @swagger
 * /api/licences/{id}:
 *   delete:
 *     summary: Supprimer une licence
 *     tags: [Licences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la licence
 *     responses:
 *       200:
 *         description: Licence supprimée
 */
router.delete('/:id', authenticateToken, ensureAdmin, supprimerLicence);

export default router;
