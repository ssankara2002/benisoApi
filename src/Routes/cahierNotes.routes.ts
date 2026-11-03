import express from 'express';
import {
  getCahierNotesByStaff,
  getStaffByClasseAndAnnee,
  getClassesByStaffAndAnnee,
  generatePageGardePDFController,
  generateListeElevesPDFController
} from '../Controllers/cahierNotes.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CahierNotes
 *   description: Gestion du cahier de notes des professeurs
 */

/**
 * @swagger
 * /api/cahier-notes/staff/{staffId}/annee/{anneeId}/classe/{classeId}:
 *   get:
 *     summary: Récupérer le cahier de notes d'un professeur pour une classe et une année
 *     tags: [CahierNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professeur
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *     responses:
 *       200:
 *         description: Cahier de notes récupéré avec succès
 *       404:
 *         description: Professeur, année ou classe introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/staff/:staffId/annee/:anneeId/classe/:classeId',
  authenticateToken,
  ensurePermission('note.read'),
  getCahierNotesByStaff
);

/**
 * @swagger
 * /api/cahier-notes/annee/{anneeId}/classe/{classeId}/staff:
 *   get:
 *     summary: Récupérer tous les enseignants d'une classe pour une année
 *     tags: [CahierNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *     responses:
 *       200:
 *         description: Liste des enseignants récupérée avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/annee/:anneeId/classe/:classeId/staff',
  authenticateToken,
  ensurePermission('note.read'),
  getStaffByClasseAndAnnee
);

/**
 * @swagger
 * /api/cahier-notes/staff/{staffId}/annee/{anneeId}/classes:
 *   get:
 *     summary: Récupérer toutes les classes d'un professeur pour une année
 *     tags: [CahierNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professeur
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *     responses:
 *       200:
 *         description: Liste des classes récupérée avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/staff/:staffId/annee/:anneeId/classes',
  authenticateToken,
  ensurePermission('note.read'),
  getClassesByStaffAndAnnee
);

/**
 * @swagger
 * /api/cahier-notes/pdf/page-garde/staff/{staffId}/annee/{anneeId}/classe/{classeId}:
 *   get:
 *     summary: Générer le PDF de la page de garde
 *     tags: [CahierNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF de la page de garde généré
 */
router.get(
  '/pdf/page-garde/staff/:staffId/annee/:anneeId/classe/:classeId',
  authenticateToken,
  ensurePermission('note.read'),
  generatePageGardePDFController
);

/**
 * @swagger
 * /api/cahier-notes/pdf/liste-eleves/staff/{staffId}/annee/{anneeId}/classe/{classeId}:
 *   get:
 *     summary: Générer le PDF de la liste des élèves
 *     tags: [CahierNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF de la liste des élèves généré
 */
router.get(
  '/pdf/liste-eleves/staff/:staffId/annee/:anneeId/classe/:classeId',
  authenticateToken,
  ensurePermission('note.read'),
  generateListeElevesPDFController
);

export default router;
