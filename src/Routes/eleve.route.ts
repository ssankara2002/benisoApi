import express from 'express';
import {
  getAllEleves,
  getEleveById,
  createEleve,
  updateEleve,
  deleteEleve,
  addMatiereToEleve,
  removeMatiereFromEleve,
  getElevesByClasse,
  getTotalEffectif,
  getPlacesDisponiblesByNiveau,
  getParentsByEleve,
  validerCandidature,
  rejeterCandidature,
  uploadElevePhoto
} from '../Controllers/eleve.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';
import upload from '../middlewares/upload';
import { uploadPhoto } from '../middlewares/uploadEleve';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Eleves
 *   description: |
 *     Gestion des élèves de l'école.
 *
 *     **Nouvelle structure :**
 *     - Les élèves sont créés avec leurs informations de base (nom, email, filière optionnelle, documents)
 *     - Le `niveau` et la `classe` ne sont PAS stockés au niveau de l'élève
 *     - Ils sont gérés via les **inscriptions** pour chaque année scolaire
 *
 *     **Workflow complet :**
 *     1. `POST /api/eleves` : Créer l'élève avec infos de base
 *     2. `POST /api/inscriptions-eleve/eleve` : Inscrire l'élève pour une année (avec niveauId + paiement)
 *     3. `PUT /api/inscriptions-eleve/eleve/{inscriptionId}/assigner-classe` : Assigner une classe à l'inscription
 *
 *     **Avantages :**
 *     - Historique complet : un élève peut changer de niveau/classe chaque année
 *     - Les endpoints GET retournent les inscriptions avec niveau/classe par année
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Eleve:
 *       type: object
 *       description: Données pour créer un élève (requête POST)
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'élève
 *           example: "Dupont"
 *         prenom:
 *           type: string
 *           description: Prénom de l'élève
 *           example: "Jean"
 *         email:
 *           type: string
 *           description: Email de l'élève
 *           example: "jean.dupont@email.com"
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
 *           description: Téléphone (optionnel)
 *           example: "+33612345678"
 *         filiereId:
 *           type: integer
 *           description: ID de la filière (optionnel)
 *           example: 1
 *         dateNaissance:
 *           type: string
 *           format: date
 *           description: Date de naissance (optionnel)
 *           example: "2010-05-15"
 *         acteNaissance:
 *           type: string
 *           format: binary
 *           description: Fichier acte de naissance (PDF, JPG, PNG)
 *         bulletin:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Fichiers bulletins (max 3)
 *         attestation:
 *           type: string
 *           format: binary
 *           description: Fichier attestation (optionnel)
 */

/**
 * @swagger
 * /api/eleves:
 *   get:
 *     summary: Récupérer tous les élèves
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des élèves récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     eleves:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Eleve'
 *                     effectifTotal:
 *                       type: integer
 *                       description: Nombre total d'élèves
 *                       example: 150
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token d'authentification requis"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération des élèves"
 *                 error:
 *                   type: string
 */
router.get('/', authenticateToken,ensurePermission('eleve.read'), getAllEleves);

/**
 * @swagger
 * /api/eleves/{id}:
 *   get:
 *     summary: Récupérer un élève par ID
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     responses:
 *       200:
 *         description: Élève récupéré avec succès
 *       404:
 *         description: Élève introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authenticateToken ,ensurePermission('eleve.read'), getEleveById);

/**
 * @swagger
 * /api/eleves:
 *   post:
 *     summary: Créer un nouvel élève
 *     description: |
 *       Crée un nouvel élève avec ses informations de base.
 *
 *       **Important :** Les informations de niveau et classe ne sont PAS gérées ici.
 *       Elles sont gérées via les inscriptions :
 *       1. Créer l'élève avec cet endpoint
 *       2. Inscrire l'élève pour une année avec `POST /api/inscriptions-eleve/eleve` (inclut niveauId)
 *       3. Assigner une classe avec `PUT /api/inscriptions-eleve/eleve/{inscriptionId}/assigner-classe`
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 description: Nom de l'élève
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 description: Prénom de l'élève
 *                 example: "Jean"
 *               email:
 *                 type: string
 *                 description: Email de l'élève
 *                 example: "jean.dupont@email.com"
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
 *               filiereId:
 *                 type: integer
 *                 description: ID de la filière (optionnel)
 *                 example: 1
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 description: Date de naissance de l'élève (optionnel)
 *                 example: "2010-05-15"
 *               acteNaissance:
 *                 type: string
 *                 format: binary
 *                 description: Fichier acte de naissance (PDF, JPG, PNG - max 5MB)
 *               bulletin:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers bulletins (max 3 fichiers - PDF, JPG, PNG - 5MB chacun)
 *               attestation:
 *                 type: string
 *                 format: binary
 *                 description: Fichier attestation (PDF, JPG, PNG - max 5MB)
 *     responses:
 *       201:
 *         description: Élève créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, ensurePermission('eleve.create'), upload.fields([
  { name: 'acteNaissance', maxCount: 1 },
  { name: 'bulletin', maxCount: 3 },
  { name: 'attestation', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), createEleve);

/**
 * @swagger
 * /api/eleves/{id}:
 *   put:
 *     summary: Mettre à jour un élève
 *     description: |
 *       Met à jour les informations de base d'un élève.
 *
 *       **Note :** Pour modifier le niveau/classe, utiliser les endpoints d'inscription :
 *       - Modifier l'inscription existante pour changer le niveau
 *       - Utiliser `PUT /api/inscriptions-eleve/eleve/{inscriptionId}/assigner-classe` pour changer de classe
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de l'élève
 *               prenom:
 *                 type: string
 *                 description: Prénom de l'élève
 *               email:
 *                 type: string
 *                 description: Email de l'élève
 *               adresse:
 *                 type: string
 *                 description: Adresse
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone
 *               filiereId:
 *                 type: integer
 *                 description: ID de la filière
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 description: Date de naissance de l'élève (optionnel)
 *                 example: "2010-05-15"
 *               acteNaissance:
 *                 type: string
 *                 format: binary
 *                 description: Fichier acte de naissance (PDF, JPG, PNG - max 5MB)
 *               bulletin:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers bulletins (max 3 fichiers - PDF, JPG, PNG - 5MB chacun)
 *               attestation:
 *                 type: string
 *                 format: binary
 *                 description: Fichier attestation (PDF, JPG, PNG - max 5MB)
 *     responses:
 *       200:
 *         description: Élève mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authenticateToken, ensurePermission('eleve.update'), upload.fields([
  { name: 'acteNaissance', maxCount: 1 },
  { name: 'bulletin', maxCount: 3 },
  { name: 'attestation', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), updateEleve);

/**
 * @swagger
 * /api/eleves/{id}:
 *   delete:
 *     summary: Supprimer un élève
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     responses:
 *       200:
 *         description: Élève supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authenticateToken, ensurePermission('eleve.delete'), deleteEleve);

/**
 * @swagger
 * /api/eleves/{id}/matieres:
 *   post:
 *     summary: Ajouter une matière à un élève
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matiereId
 *             properties:
 *               matiereId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Matière ajoutée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Élève ou matière introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/matieres', authenticateToken,ensurePermission('eleve.create'), addMatiereToEleve);

/**
 * @swagger
 * /api/eleves/{id}/matieres:
 *   delete:
 *     summary: Retirer une matière d'un élève
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matiereId
 *             properties:
 *               matiereId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Matière retirée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (admin requis)
 *       404:
 *         description: Élève ou matière introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id/matieres', authenticateToken,ensurePermission('eleve.delete'), removeMatiereFromEleve);

/**
 * @swagger
 * /api/eleves/classe/{classeId}:
 *   get:
 *     summary: Récupérer les élèves d'une classe
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la classe
 *     responses:
 *       200:
 *         description: Élèves de la classe récupérés avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/classe/:classeId', authenticateToken,ensurePermission('eleve.read'), getElevesByClasse);

/**
 * @swagger
 * /api/eleves/effectif/total:
 *   get:
 *     summary: Récupérer l'effectif total des élèves
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Effectif total récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     effectifTotal:
 *                       type: integer
 *                       description: Nombre total d'élèves dans l'école
 *                       example: 150
 *                     message:
 *                       type: string
 *                       example: "Effectif total: 150 élèves"
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/effectif/total', authenticateToken,ensurePermission('eleve.read'), getTotalEffectif);

/**
 * @swagger
 * /api/eleves/niveau/{niveauId}/places-disponibles:
 *   get:
 *     summary: Récupérer les places disponibles par niveau
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: niveauId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du niveau
 *     responses:
 *       200:
 *         description: Places disponibles récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     niveauId:
 *                       type: integer
 *                       example: 1
 *                     capaciteTotale:
 *                       type: integer
 *                       example: 100
 *                     effectifTotal:
 *                       type: integer
 *                       example: 75
 *                     placesDisponibles:
 *                       type: integer
 *                       example: 25
 *                     classes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *                           capacite:
 *                             type: integer
 *                           effectif:
 *                             type: integer
 *                           placesDisponibles:
 *                             type: integer
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/niveau/:niveauId/places-disponibles', authenticateToken, ensurePermission('eleve.read'), getPlacesDisponiblesByNiveau);

/**
 * @swagger
 * /api/eleves/{id}/parents:
 *   get:
 *     summary: Récupérer les parents d'un élève
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     responses:
 *       200:
 *         description: Parents de l'élève récupérés avec succès
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *                           prenom:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           adresse:
 *                             type: string
 *       404:
 *         description: Élève introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/parents', authenticateToken, ensurePermission('eleve.read'), getParentsByEleve);

/**
 * @swagger
 * /api/eleves/{id}/valider:
 *   patch:
 *     summary: Valider le dossier d'un élève
 *     description: |
 *       Valide le dossier de l'élève :
 *       - `statut` passe à `VALIDE`
 *       - Le rôle de l'utilisateur passe de `USER` à `ELEVE`
 *       - Un matricule est généré si absent
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     responses:
 *       200:
 *         description: Dossier validé avec succès — rôle promu à ELEVE
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
 *                   example: "Candidature validée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     statut:
 *                       type: string
 *                       example: "VALIDE"
 *                     matricule:
 *                       type: string
 *                       example: "EL20260001"
 *                     user:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "ELEVE"
 *       400:
 *         description: Candidature déjà traitée
 *       404:
 *         description: Élève introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/valider', authenticateToken, ensurePermission('eleve.update'), validerCandidature);

/**
 * @swagger
 * /api/eleves/{id}/rejeter:
 *   patch:
 *     summary: Rejeter le dossier d'un élève
 *     description: |
 *       Rejette le dossier de l'élève :
 *       - `statut` passe à `REJETE`
 *       - Le rôle reste `USER` (non promu)
 *       - Le `motifRejet` est **obligatoire**
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motifRejet
 *             properties:
 *               motifRejet:
 *                 type: string
 *                 description: Raison du rejet (obligatoire)
 *                 example: "Dossier incomplet — acte de naissance manquant"
 *     responses:
 *       200:
 *         description: Dossier rejeté — rôle reste USER
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
 *                   example: "Candidature rejetée"
 *                 data:
 *                   type: object
 *                   properties:
 *                     statut:
 *                       type: string
 *                       example: "REJETE"
 *                     motifRejet:
 *                       type: string
 *                       example: "Dossier incomplet — acte de naissance manquant"
 *                     user:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "USER"
 *       400:
 *         description: Motif de rejet manquant ou candidature déjà traitée
 *       404:
 *         description: Élève introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/rejeter', authenticateToken, ensurePermission('eleve.update'), rejeterCandidature);

/**
 * @swagger
 * /api/eleves/{id}/photo:
 *   patch:
 *     summary: Uploader la photo d'un élève
 *     tags: [Eleves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo de l'élève (JPG, JPEG, PNG - max 2MB)
 *     responses:
 *       200:
 *         description: Photo uploadée avec succès
 *       400:
 *         description: Fichier invalide ou manquant
 *       404:
 *         description: Élève introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/photo', authenticateToken, ensurePermission('eleve.update'), uploadPhoto.single('photo'), uploadElevePhoto);

export default router;