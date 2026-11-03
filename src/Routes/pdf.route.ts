import express from 'express';
import {
  generateListeEleves,
  generateCartesScolaires,
  generateCarteScolaireIndividuelle
} from '../Controllers/pdf.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PDF
 *   description: Génération de documents PDF (listes d'élèves, cartes scolaires)
 */

/**
 * @swagger
 * /api/pdf/liste-eleves/{classeId}/{anneeId}:
 *   get:
 *     summary: Générer la liste des élèves d'une classe en PDF
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *     responses:
 *       200:
 *         description: PDF généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Classe ou année introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/liste-eleves/:classeId/:anneeId',
  authenticateToken,
  ensurePermission('pdf.liste-eleves'),
  generateListeEleves
);

/**
 * @swagger
 * /api/pdf/cartes-scolaires/{classeId}/{anneeId}:
 *   get:
 *     summary: Générer les cartes scolaires pour tous les élèves d'une classe
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *     responses:
 *       200:
 *         description: PDF généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Classe ou année introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/cartes-scolaires/:classeId/:anneeId',
  authenticateToken,
  ensurePermission('pdf.cartes-scolaires'),
  generateCartesScolaires
);

/**
 * @swagger
 * /api/pdf/carte-scolaire/{eleveId}/{anneeId}:
 *   get:
 *     summary: Générer la carte scolaire individuelle d'un élève
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *     responses:
 *       200:
 *         description: PDF généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Élève, inscription ou année introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/carte-scolaire/:eleveId/:anneeId',
  authenticateToken,
  ensurePermission('pdf.carte-scolaire-individuelle'),
  generateCarteScolaireIndividuelle
);

export default router;
