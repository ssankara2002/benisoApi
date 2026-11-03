import express from 'express';
import {
  getAllAccueils,
  getAccueilById,

} from '../Controllers/accueil.controller';
import { getActualiteById, getAllActualites } from '../Controllers/actualite.controller';
import { createContact, deleteContact, getAllContacts, getContactById, getContactsByType, updateContact } from '../Controllers/contact.controller';
import { getAllPresentations, getPresentationById } from '../Controllers/presentation.controller';
import { getAllEvenements, getEvenementById } from '../Controllers/evenement.controller';
import { getAllGaleries, getGaleryById } from '../Controllers/galery.controller';
import { getAllStaff, getStaffById } from '../Controllers/staff.controller';
import { getAllEvaluations, getEvaluationById, getEvaluationsByMatiere, getEvaluationsByClasse, getEvaluationsByAnnee } from '../Controllers/evaluation.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Routes publiques de l'API (accueil, actualités, contact, événements, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactPublic:
 *       type: object
 *       description: Données pour créer un message de contact (requête POST publique)
 *       required:
 *         - nom
 *         - email
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de la personne
 *           example: "Diallo"
 *         prenom:
 *           type: string
 *           description: Prénom de la personne
 *           example: "Amadou"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contact
 *           example: "amadou.diallo@email.com"
 *         typeSujet:
 *           type: string
 *           description: Type de sujet du message
 *           example: "Inscription"
 *         message:
 *           type: string
 *           description: Contenu du message
 *           example: "Je souhaite obtenir des informations sur les inscriptions"
 */


// -------------------------------------------------------------------
// ACCUEIL
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/accueils:
 *   get:
 *     summary: Récupérer toutes les pages d'accueil
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste des pages d'accueil récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Accueil'
 *       500:
 *         description: Erreur serveur
 */
router.get('/accueils', getAllAccueils);

/**
 * @swagger
 * /api/accueils/{id}:
 *   get:
 *     summary: Récupérer une page d'accueil par ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Page d'accueil récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Accueil'
 *       404:
 *         description: Page introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/accueils/:id', getAccueilById);


// -------------------------------------------------------------------
// ACTUALITÉS
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/actualites:
 *   get:
 *     summary: Récupérer toutes les actualités
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Actualite'
 */
router.get('/actualites', getAllActualites);

/**
 * @swagger
 * /api/actualites/{id}:
 *   get:
 *     summary: Récupérer une actualité par ID
 *     tags: [Public]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Actualité récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Actualite'
 *       404:
 *         description: Actualité introuvable
 */
router.get('/actualites/:id', getActualiteById);


// -------------------------------------------------------------------
// CONTACTS
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Récupérer tous les messages de contact
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 */
router.get('/contacts', getAllContacts);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Récupérer un contact par ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Contact récupéré
 *       404:
 *         description: Introuvable
 */
router.get('/contacts/:id', getContactById);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Créer un nouveau contact (public)
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactPublic'
 *     responses:
 *       201:
 *         description: Contact créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/contacts', createContact);


// -------------------------------------------------------------------
// PRESENTATIONS
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/presentations:
 *   get:
 *     summary: Récupérer toutes les présentations
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presentation'
 */
router.get('/presentations', getAllPresentations);

/**
 * @swagger
 * /api/presentations/{id}:
 *   get:
 *     summary: Récupérer une présentation par ID
 *     tags: [Public]
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Présentation récupérée
 *       404:
 *         description: Introuvable
 */
router.get('/presentations/:id', getPresentationById);


// -------------------------------------------------------------------
// EVENEMENTS
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/evenements:
 *   get:
 *     summary: Récupérer tous les événements
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evenement'
 */
router.get('/evenements', getAllEvenements);

/**
 * @swagger
 * /api/evenements/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     tags: [Public]
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Événement récupéré
 *       404:
 *         description: Introuvable
 */
router.get('/evenements/:id', getEvenementById);


// -------------------------------------------------------------------
// GALERIES
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/galeries:
 *   get:
 *     summary: Récupérer toutes les galeries
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Galerie'
 */
router.get('/galeries', getAllGaleries);

/**
 * @swagger
 * /api/galeries/{id}:
 *   get:
 *     summary: Récupérer une galerie par ID
 *     tags: [Public]
 *     parameters:
 *       - name: id
 *         in: path
 *     responses:
 *       200:
 *         description: Galerie récupérée
 *       404:
 *         description: Introuvable
 */
router.get('/galeries/:id', getGaleryById);


// -------------------------------------------------------------------
// STAFF
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/staffs:
 *   get:
 *     summary: Récupérer tous les membres du staff
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste des membres du staff récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 */
router.get('/staffs', getAllStaff);

/**
 * @swagger
 * /api/staffs/{id}:
 *   get:
 *     summary: Récupérer un membre du staff par ID
 *     tags: [Public]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membre du staff récupéré
 *       404:
 *         description: Introuvable
 */
router.get('/staffs/:id', getStaffById);


// -------------------------------------------------------------------
// EVALUATIONS
// -------------------------------------------------------------------

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Récupérer toutes les évaluations
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Liste des évaluations récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evaluation'
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluations', getAllEvaluations);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: Récupérer une évaluation par ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'évaluation
 *     responses:
 *       200:
 *         description: Évaluation récupérée avec succès
 *       404:
 *         description: Évaluation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluations/:id', getEvaluationById);

/**
 * @swagger
 * /api/evaluations/matiere/{matiereId}:
 *   get:
 *     summary: Récupérer les évaluations d'une matière
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: matiereId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matière
 *     responses:
 *       200:
 *         description: Évaluations de la matière récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluations/matiere/:matiereId', getEvaluationsByMatiere);

/**
 * @swagger
 * /api/evaluations/classe/{classeId}:
 *   get:
 *     summary: Récupérer les évaluations d'une classe
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *     responses:
 *       200:
 *         description: Évaluations de la classe récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluations/classe/:classeId', getEvaluationsByClasse);

/**
 * @swagger
 * /api/evaluations/annee/{anneeId}:
 *   get:
 *     summary: Récupérer les évaluations d'une année scolaire
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *     responses:
 *       200:
 *         description: Évaluations de l'année récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/evaluations/annee/:anneeId', getEvaluationsByAnnee);


export default router;