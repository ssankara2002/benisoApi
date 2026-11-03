import express from 'express';
import {
  getAllAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence,
  getAbsencesByStaff,
  getAbsencesByMatiere,
  getAbsencesNonJustifieesEnHeures
} from '../Controllers/absence.controller';

import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Absences
 *   description: Gestion des absences des élèves et du personnel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Absence:
 *       type: object
 *       description: Données pour créer une absence (requête POST)
 *       required:
 *         - dateDebut
 *         - dateFin
 *         - motif
 *         - justification
 *         - matiereId
 *         - classeId
 *       properties:
 *         dateDebut:
 *           type: string
 *           format: date-time
 *           description: Date et heure de début de l'absence
 *           example: "2024-01-15T08:00:00Z"
 *         dateFin:
 *           type: string
 *           format: date-time
 *           description: Date et heure de fin de l'absence
 *           example: "2024-01-15T12:00:00Z"
 *         motif:
 *           type: string
 *           description: Motif de l'absence
 *           example: "Maladie"
 *         justification:
 *           type: boolean
 *           description: L'absence est-elle justifiée
 *           example: true
 *         eleveId:
 *           type: integer
 *           description: ID de l'élève (optionnel si absence de staff)
 *           example: 1
 *         matiereId:
 *           type: integer
 *           description: ID de la matière
 *           example: 1
 *         classeId:
 *           type: integer
 *           description: ID de la classe
 *           example: 1
 */


/**
 * @swagger
 * /api/absences:
 *   get:
 *     summary: Récupérer toutes les absences
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des absences récupérée
 */
router.get('/', authenticateToken, ensurePermission('absence.read'), getAllAbsences);


/**
 * @swagger
 * /api/absences/{id}:
 *   get:
 *     summary: Récupérer une absence par ID
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Absence trouvée
 */
router.get('/:id', authenticateToken, ensurePermission('absence.read'), getAbsenceById);


/**
 * @swagger
 * /api/absences:
 *   post:
 *     summary: Créer une nouvelle absence
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateDebut
 *               - dateFin
 *               - motif
 *               - justification
 *               - matiereId
 *               - classeId
 *             properties:
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *               motif:
 *                 type: string
 *               justification:
 *                 type: boolean
 *               eleveId:
 *                 type: integer
 *                 nullable: true
 *               matiereId:
 *                 type: integer
 *               classeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Absence créée
 */
router.post('/', authenticateToken, ensurePermission('absence.create'), createAbsence);


/**
 * @swagger
 * /api/absences/{id}:
 *   put:
 *     summary: Mettre à jour une absence
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateDebut:
 *                 type: string
 *               dateFin:
 *                 type: string
 *               motif:
 *                 type: string
 *               justification:
 *                 type: boolean
 *               eleveId:
 *                 type: integer
 *                 nullable: true
 *               matiereId:
 *                 type: integer
 *               classeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Absence mise à jour
 */
router.put('/:id', authenticateToken, ensurePermission('absence.update'), updateAbsence);


/**
 * @swagger
 * /api/absences/{id}:
 *   delete:
 *     summary: Supprimer une absence
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Absence supprimée
 */
router.delete('/:id', authenticateToken, ensurePermission('absence.delete'), deleteAbsence);


/**
 * @swagger
 * /api/absences/eleve/{eleveId}:
 *   get:
 *     summary: Récupérer les absences d'un élève
 *     tags: [Absences]
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
 *         description: Absences de l'élève récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/eleve/:eleveId', authenticateToken, ensurePermission('absence.read'), getAbsencesNonJustifieesEnHeures);

/**
 * @swagger
 * /api/absences/staff/{staffId}:
 *   get:
 *     summary: Récupérer les absences d'un personnel
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du personnel
 *     responses:
 *       200:
 *         description: Absences du personnel récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/staff/:staffId', authenticateToken, ensurePermission('absence.read'), getAbsencesByStaff);

/**
 * @swagger
 * /api/absences/matiere/{matiereId}:
 *   get:
 *     summary: Récupérer les absences par matière
 *     tags: [Absences]
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
 *         description: Absences récupérées par matière
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/matiere/:matiereId', authenticateToken, ensurePermission('absence.read'), getAbsencesByMatiere);

// /**
//  * @swagger
//  * /api/absences/period:
//  *   get:
//  *     summary: Récupérer les absences sur une période
//  *     tags: [Absences]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: dateDebut
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: date-time
//  *         description: Date de début de la période
//  *       - in: query
//  *         name: dateFin
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: date-time
//  *         description: Date de fin de la période
//  *     responses:
//  *       200:
//  *         description: Absences récupérées sur la période
//  *       400:
//  *         description: Paramètres invalides
//  *       401:
//  *         description: Non autorisé
//  *       500:
//  *         description: Erreur serveur
//  */
// router.get('/period', authenticateToken, ensurePermission('absence.read'), getAbsencesByPeriod);

export default router;
