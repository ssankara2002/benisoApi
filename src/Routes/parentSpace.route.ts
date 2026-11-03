import express from 'express';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';
import {
  getMesEnfants,
  getNotesDEnfant,
  getAbsencesDEnfant,
  getRetardsDEnfant,
  getEvaluationsDEnfant,
  getSituationDEnfant,
  getPaiementsDEnfant,
} from '../Controllers/parentSpace.controller';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Espace Parent
 *   description: Espace personnel du parent — consultation du suivi scolaire de ses enfants
 */

/**
 * @swagger
 * /api/parent-space/mes-enfants:
 *   get:
 *     summary: Liste des enfants du parent connecté
 *     description: Retourne tous les enfants rattachés au compte parent avec leur classe, niveau et année scolaire actifs.
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des enfants récupérée avec succès
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
 *                         example: 1
 *                       matricule:
 *                         type: string
 *                         example: "KD120251"
 *                       statut:
 *                         type: string
 *                         example: "VALIDE"
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                       dateNaissance:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           nom:
 *                             type: string
 *                           prenom:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                       classe:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *                           capacite:
 *                             type: integer
 *                             nullable: true
 *                       annee:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           dateDebut:
 *                             type: string
 *                             format: date-time
 *                           dateFin:
 *                             type: string
 *                             format: date-time
 *                       niveau:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nomNiveau:
 *                             type: string
 *                           cycle:
 *                             type: string
 *                             nullable: true
 *       403:
 *         description: Accès refusé — rôle PARENT requis
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/mes-enfants', ensurePermission('parent.space.enfants'), getMesEnfants);

/**
 * @swagger
 * /api/parent-space/enfants/{eleveId}/situation:
 *   get:
 *     summary: Situation scolaire d'un enfant
 *     description: Retourne l'inscription active de l'enfant (classe, niveau, année, décision, moyenne générale).
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire (optionnel — dernière inscription si absent)
 *         example: 2
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: integer
 *         description: Filtrer par classe (optionnel)
 *         example: 3
 *     responses:
 *       200:
 *         description: Situation scolaire récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     estRedoublant:
 *                       type: boolean
 *                     decision:
 *                       type: string
 *                       nullable: true
 *                     moyenneGenerale:
 *                       type: number
 *                       nullable: true
 *                     classe:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                     annee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         dateDebut:
 *                           type: string
 *                           format: date-time
 *                         dateFin:
 *                           type: string
 *                           format: date-time
 *                     niveau:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nomNiveau:
 *                           type: string
 *       403:
 *         description: Accès refusé — l'élève ne vous appartient pas
 *       404:
 *         description: Aucune inscription trouvée
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/enfants/:eleveId/situation', ensurePermission('parent.space.situation'), getSituationDEnfant);

/**
 * @swagger
 * /api/parent-space/enfants/{eleveId}/notes:
 *   get:
 *     summary: Notes d'un enfant
 *     description: Retourne les notes de l'enfant groupées par matière. Filtrable par année, classe et trimestre.
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire (optionnel)
 *         example: 2
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: integer
 *         description: Filtrer par classe (optionnel)
 *         example: 3
 *       - in: query
 *         name: trimestreId
 *         schema:
 *           type: integer
 *         description: Filtrer par trimestre (optionnel)
 *         example: 1
 *     responses:
 *       200:
 *         description: Notes récupérées avec succès
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
 *                     type: object
 *                     properties:
 *                       matiere:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           libelle:
 *                             type: string
 *                       notes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             valeur:
 *                               type: number
 *                               example: 14.5
 *                             bareme:
 *                               type: number
 *                               example: 20
 *                             type:
 *                               type: string
 *                               example: "Devoir"
 *                             date:
 *                               type: string
 *                               format: date-time
 *                             trimestre:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 nom:
 *                                   type: string
 *       403:
 *         description: Accès refusé — l'élève ne vous appartient pas
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/enfants/:eleveId/notes', ensurePermission('parent.space.notes'), getNotesDEnfant);

/**
 * @swagger
 * /api/parent-space/enfants/{eleveId}/absences:
 *   get:
 *     summary: Absences d'un enfant
 *     description: Retourne la liste des absences de l'enfant. Filtrable par année et classe.
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire (optionnel)
 *         example: 2
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: integer
 *         description: Filtrer par classe (optionnel — prioritaire sur anneeId)
 *         example: 3
 *     responses:
 *       200:
 *         description: Absences récupérées avec succès
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       dateDebut:
 *                         type: string
 *                         format: date-time
 *                       dateFin:
 *                         type: string
 *                         format: date-time
 *                       motif:
 *                         type: string
 *                       justification:
 *                         type: boolean
 *                       matiere:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           libelle:
 *                             type: string
 *                       classe:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *       403:
 *         description: Accès refusé — l'élève ne vous appartient pas
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/enfants/:eleveId/absences', ensurePermission('parent.space.absences'), getAbsencesDEnfant);

/**
 * @swagger
 * /api/parent-space/enfants/{eleveId}/retards:
 *   get:
 *     summary: Retards d'un enfant
 *     description: Retourne la liste des retards de l'enfant. Filtrable par année et classe.
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire (optionnel)
 *         example: 2
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: integer
 *         description: Filtrer par classe (optionnel — prioritaire sur anneeId)
 *         example: 3
 *     responses:
 *       200:
 *         description: Retards récupérés avec succès
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       justification:
 *                         type: boolean
 *                       autorisation:
 *                         type: string
 *                         nullable: true
 *                       confProf:
 *                         type: boolean
 *                       matiere:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           libelle:
 *                             type: string
 *                       classe:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *       403:
 *         description: Accès refusé — l'élève ne vous appartient pas
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/enfants/:eleveId/retards', ensurePermission('parent.space.retards'), getRetardsDEnfant);

/**
 * @swagger
 * /api/parent-space/enfants/{eleveId}/evaluations:
 *   get:
 *     summary: Évaluations planifiées dans la classe de l'enfant
 *     description: >
 *       Retourne les évaluations de la classe de l'enfant pour l'année/trimestre donnés.
 *       Chaque évaluation inclut la note de l'enfant si elle a déjà été saisie.
 *       Si classeId n'est pas fourni, il est résolu automatiquement depuis l'inscription de l'élève.
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 1
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire (optionnel)
 *         example: 2
 *       - in: query
 *         name: classeId
 *         schema:
 *           type: integer
 *         description: Filtrer par classe (optionnel — résolu automatiquement si absent)
 *         example: 3
 *       - in: query
 *         name: trimestreId
 *         schema:
 *           type: integer
 *         description: Filtrer par trimestre (optionnel)
 *         example: 1
 *     responses:
 *       200:
 *         description: Évaluations récupérées avec succès
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                         example: "Devoir"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       bareme:
 *                         type: number
 *                         nullable: true
 *                         example: 20
 *                       matiere:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           libelle:
 *                             type: string
 *                       classe:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *                       trimestre:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nom:
 *                             type: string
 *                       annee:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           dateDebut:
 *                             type: string
 *                             format: date-time
 *                           dateFin:
 *                             type: string
 *                             format: date-time
 *                       staff:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               nom:
 *                                 type: string
 *                               prenom:
 *                                 type: string
 *                       notes:
 *                         type: array
 *                         description: Note de l'enfant pour cette évaluation (vide si pas encore saisie)
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             valeur:
 *                               type: number
 *                               example: 16
 *       403:
 *         description: Accès refusé — l'élève ne vous appartient pas
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/enfants/:eleveId/evaluations', ensurePermission('parent.space.evaluations'), getEvaluationsDEnfant);

/**
 * @swagger
 * /api/parent-space/enfants/{eleveId}/paiements:
 *   get:
 *     summary: Paiements de scolarité d'un enfant
 *     description: Retourne l'historique des paiements de scolarité de l'enfant avec un récapitulatif (total payé, total attendu, reste à payer).
 *     tags: [Espace Parent]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: eleveId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élève
 *         example: 86
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         description: Filtrer par année scolaire (optionnel)
 *         example: 34
 *     responses:
 *       200:
 *         description: Paiements récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     paiements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           montant:
 *                             type: number
 *                             example: 55000
 *                           montantAttendu:
 *                             type: number
 *                             nullable: true
 *                             example: 55000
 *                           modePaiement:
 *                             type: string
 *                             nullable: true
 *                             example: "Espèces"
 *                           libelleTranche:
 *                             type: string
 *                             nullable: true
 *                             example: "Tranche 1"
 *                           numeroTranche:
 *                             type: integer
 *                             nullable: true
 *                           totalTranches:
 *                             type: integer
 *                             nullable: true
 *                           recu:
 *                             type: string
 *                             nullable: true
 *                           dateEcheance:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           inscription:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               modePaiement:
 *                                 type: string
 *                               annee:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   dateDebut:
 *                                     type: string
 *                                     format: date-time
 *                                   dateFin:
 *                                     type: string
 *                                     format: date-time
 *                               classe:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   nom:
 *                                     type: string
 *                     recapitulatif:
 *                       type: object
 *                       properties:
 *                         totalPaye:
 *                           type: number
 *                           example: 110000
 *                         totalAttendu:
 *                           type: number
 *                           example: 165000
 *                         resteAPayer:
 *                           type: number
 *                           example: 55000
 *       403:
 *         description: Accès refusé — l'élève ne vous appartient pas
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/enfants/:eleveId/paiements', ensurePermission('parent.space.paiements'), getPaiementsDEnfant);

export default router;
