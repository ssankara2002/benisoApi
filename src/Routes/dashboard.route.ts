import express, { Response } from 'express';
import authenticateToken, { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { verifierLicenceMiddleware } from '../middlewares/licenceMiddleware';
import { getDashboardComptable }    from '../Services/dashboardComptable.service';
import { getDashboardEleve }        from '../Services/dashboardEleve.service';
import { getDashboardProfesseur }   from '../Services/dashboardProfesseur.service';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Tableaux de bord par rôle (comptable, élève, professeur)
 */

/**
 * @swagger
 * /api/dashboard/comptable:
 *   get:
 *     summary: Tableau de bord comptable
 *     description: |
 *       Retourne en un seul appel toutes les données du tableau de bord comptable.
 *       Accès réservé aux rôles **ADMIN**, **COMPTABLE** et **PROVISEUR**.
 *
 *       **Données retournées :**
 *       - `kpi` : solde trésorerie, recettes/dépenses du mois, variation vs mois précédent, transactions en attente, salaires impayés
 *       - `fluxMensuel` : tableau des 12 derniers mois (recettes, dépenses, solde)
 *       - `repartitionDepenses` : dépenses par catégorie avec pourcentage
 *       - `soldesComptes` : solde réel de chaque compte (caisse/banque)
 *       - `budgetVsRealise` : prévu vs réalisé, écart, taux, flag dépassé
 *       - `recouvrementScolarites` : par niveau + total global
 *       - `dernieresTransactions` : 8 dernières transactions
 *       - `alertes` : transactions bloquées, salaires impayés, budgets dépassés
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: anneeId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID de l'année scolaire (optionnel — toutes années si absent)
 *     responses:
 *       200:
 *         description: Données du tableau de bord comptable
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
 *                     kpi:
 *                       type: object
 *                       properties:
 *                         soldeTresorerie:
 *                           type: number
 *                           example: 4500000
 *                         recettesMoisCourant:
 *                           type: number
 *                           example: 1200000
 *                         depensesMoisCourant:
 *                           type: number
 *                           example: 800000
 *                         soldeMoisCourant:
 *                           type: number
 *                           example: 400000
 *                         variationRecettes:
 *                           type: number
 *                           nullable: true
 *                           example: 12.5
 *                         variationDepenses:
 *                           type: number
 *                           nullable: true
 *                           example: -3.2
 *                         transactionsEnAttente:
 *                           type: integer
 *                           example: 3
 *                         salairesEnAttenteMois:
 *                           type: number
 *                           example: 250000
 *                         totalSalairesMois:
 *                           type: number
 *                           example: 1500000
 *                     fluxMensuel:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mois:
 *                             type: string
 *                             example: "2026-01"
 *                           recettes:
 *                             type: number
 *                           depenses:
 *                             type: number
 *                           solde:
 *                             type: number
 *                     repartitionDepenses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categorie:
 *                             type: string
 *                           montant:
 *                             type: number
 *                           pourcentage:
 *                             type: number
 *                     soldesComptes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           libelle:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [CAISSE, BANQUE]
 *                           solde:
 *                             type: number
 *                     budgetVsRealise:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           libelle:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [RECETTE, DEPENSE]
 *                           prevu:
 *                             type: number
 *                           realise:
 *                             type: number
 *                           ecart:
 *                             type: number
 *                           taux:
 *                             type: number
 *                           depasse:
 *                             type: boolean
 *                     recouvrementScolarites:
 *                       type: object
 *                       properties:
 *                         parNiveau:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               niveau:
 *                                 type: string
 *                               scolarite:
 *                                 type: number
 *                               attendu:
 *                                 type: number
 *                               encaisse:
 *                                 type: number
 *                               reste:
 *                                 type: number
 *                               taux:
 *                                 type: number
 *                               nbEleves:
 *                                 type: integer
 *                         total:
 *                           type: object
 *                           properties:
 *                             attendu:
 *                               type: number
 *                             encaisse:
 *                               type: number
 *                             reste:
 *                               type: number
 *                             taux:
 *                               type: number
 *                     dernieresTransactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           reference:
 *                             type: string
 *                           libelle:
 *                             type: string
 *                           montant:
 *                             type: number
 *                           type:
 *                             type: string
 *                             enum: [RECETTE, DEPENSE]
 *                           statut:
 *                             type: string
 *                             enum: [EN_ATTENTE, VALIDE, ANNULE]
 *                           date:
 *                             type: string
 *                             format: date-time
 *                     alertes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: BUDGET_DEPASSE
 *                           message:
 *                             type: string
 *                           count:
 *                             type: integer
 *       403:
 *         description: Accès refusé — rôle insuffisant
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/comptable',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const role = req.user?.roleName;
      const rolesAutorises = ['ADMIN', 'COMPTABLE', 'PROVISEUR'];
      if (!role || !rolesAutorises.includes(role)) {
        res.status(403).json({ success: false, message: 'Accès refusé' });
        return;
      }

      const anneeId = req.query.anneeId ? parseInt(req.query.anneeId as string) : undefined;
      const data    = await getDashboardComptable(anneeId);

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Erreur dashboard comptable', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/eleve:
 *   get:
 *     summary: Tableau de bord élève
 *     description: |
 *       Retourne en un seul appel toutes les données du tableau de bord de l'élève connecté.
 *       Accès réservé au rôle **ELEVE** — l'élève ne voit que ses propres données (identité résolue via le token JWT).
 *
 *       **Données retournées :**
 *       - `profil` : nom, matricule, photo, statut, filière
 *       - `inscription` : classe, niveau, année, décision, moyenne générale
 *       - `kpi` : moyenne générale, nb notes, absences justifiées/non, retards, évaluations à venir
 *       - `notesParMatiere` : notes + moyenne calculée + nom du professeur
 *       - `evolutionParTrimestre` : moyenne par trimestre
 *       - `absences` : résumé + 20 dernières
 *       - `retards` : résumé + 20 derniers
 *       - `evaluationsAVenir` : prochaines évaluations planifiées
 *       - `paiements` : scolarité, total payé, reste, tranches si mode TRANCHES
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord élève
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
 *                     profil:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                         prenom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         matricule:
 *                           type: string
 *                           nullable: true
 *                         photo:
 *                           type: string
 *                           nullable: true
 *                         statut:
 *                           type: string
 *                         filiere:
 *                           type: object
 *                           nullable: true
 *                     inscription:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         annee:
 *                           type: object
 *                         classe:
 *                           type: object
 *                         niveau:
 *                           type: object
 *                         estRedoublant:
 *                           type: boolean
 *                         decision:
 *                           type: string
 *                           nullable: true
 *                         moyenneGenerale:
 *                           type: number
 *                           nullable: true
 *                     kpi:
 *                       type: object
 *                       properties:
 *                         moyenneGenerale:
 *                           type: number
 *                           nullable: true
 *                         nombreNotes:
 *                           type: integer
 *                         nombreAbsences:
 *                           type: integer
 *                         absencesJustifiees:
 *                           type: integer
 *                         absencesNonJustifiees:
 *                           type: integer
 *                         nombreRetards:
 *                           type: integer
 *                         evaluationsAVenir:
 *                           type: integer
 *                     notesParMatiere:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           matiere:
 *                             type: object
 *                           professeur:
 *                             type: string
 *                           notes:
 *                             type: array
 *                             items:
 *                               type: object
 *                           moyenne:
 *                             type: number
 *                     evolutionParTrimestre:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           trimestre:
 *                             type: string
 *                           trimestreId:
 *                             type: integer
 *                           moyenne:
 *                             type: number
 *                             nullable: true
 *                     absences:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         justifiees:
 *                           type: integer
 *                         nonJustifiees:
 *                           type: integer
 *                         liste:
 *                           type: array
 *                     retards:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         autorises:
 *                           type: integer
 *                         nonAutorises:
 *                           type: integer
 *                         liste:
 *                           type: array
 *                     evaluationsAVenir:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           bareme:
 *                             type: number
 *                             nullable: true
 *                           matiere:
 *                             type: object
 *                           trimestre:
 *                             type: object
 *                     paiements:
 *                       type: object
 *                       nullable: true
 *                       description: Null si aucune inscription trouvée
 *       403:
 *         description: Accès réservé aux élèves
 *       404:
 *         description: Profil élève introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/eleve',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const role   = req.user?.roleName;
      const userId = req.user?.userId;

      if (role !== 'ELEVE' || !userId) {
        res.status(403).json({ success: false, message: 'Accès réservé aux élèves' });
        return;
      }

      const data = await getDashboardEleve(userId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Profil élève introuvable') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Erreur dashboard élève', error: error.message });
      }
    }
  }
);

/**
 * @swagger
 * /api/dashboard/professeur:
 *   get:
 *     summary: Tableau de bord professeur
 *     description: |
 *       Retourne en un seul appel toutes les données du tableau de bord du professeur connecté.
 *       Accès réservé au rôle **PROFESSEUR** — les données sont celles du staff lié au token JWT.
 *
 *       **Données retournées :**
 *       - `profil` : nom, prénom, email, téléphone, statut actif
 *       - `kpi` : nb classes, nb matières, séances effectuées/planifiées, séances sans cahier, taux de remplissage cahier, évaluations à venir, évaluations sans notes
 *       - `emploiDuTemps` : tous les créneaux hebdomadaires actifs
 *       - `enseignements` : matières × classes × années
 *       - `prochainesSeances` : 5 prochaines séances avec flag cahier rempli
 *       - `derniersSeancesSansCahier` : séances effectuées mais cahier non rempli
 *       - `derniersCahiers` : 10 derniers cahiers de texte
 *       - `evaluationsAVenir` : prochaines évaluations planifiées
 *       - `evaluationsSansNotesList` : évaluations passées sans notes saisies
 *       - `absencesRecentes` : 20 dernières absences enregistrées
 *       - `salaires` : dernier salaire, total année, historique 12 mois
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord professeur
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
 *                     profil:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                         prenom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         isActive:
 *                           type: boolean
 *                     kpi:
 *                       type: object
 *                       properties:
 *                         nombreClasses:
 *                           type: integer
 *                         nombreMatieres:
 *                           type: integer
 *                         totalSeances:
 *                           type: integer
 *                         seancesEffectuees:
 *                           type: integer
 *                         seancesPlanifiees:
 *                           type: integer
 *                         seancesAVenir:
 *                           type: integer
 *                         seancesSansCahier:
 *                           type: integer
 *                         totalCahiers:
 *                           type: integer
 *                         cahiersValides:
 *                           type: integer
 *                         cahiersNonValides:
 *                           type: integer
 *                         tauxRemplissageCahier:
 *                           type: number
 *                           example: 87.5
 *                         totalEvaluations:
 *                           type: integer
 *                         evaluationsAVenir:
 *                           type: integer
 *                         evaluationsSansNotes:
 *                           type: integer
 *                     emploiDuTemps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           jour:
 *                             type: integer
 *                             description: 0=Lundi … 5=Samedi
 *                           heureDebut:
 *                             type: string
 *                             example: "08:00"
 *                           heureFin:
 *                             type: string
 *                             example: "10:00"
 *                           classe:
 *                             type: object
 *                           matiere:
 *                             type: object
 *                     prochainesSeances:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           heureDebut:
 *                             type: string
 *                           heureFin:
 *                             type: string
 *                           classe:
 *                             type: string
 *                           matiere:
 *                             type: string
 *                           cahierRempli:
 *                             type: boolean
 *                     evaluationsAVenir:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           bareme:
 *                             type: number
 *                             nullable: true
 *                           matiere:
 *                             type: string
 *                           classe:
 *                             type: string
 *                           trimestre:
 *                             type: string
 *                     salaires:
 *                       type: object
 *                       properties:
 *                         dernier:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             mois:
 *                               type: integer
 *                             annee:
 *                               type: integer
 *                             montantNet:
 *                               type: number
 *                             statut:
 *                               type: string
 *                               enum: [EN_ATTENTE, PAYE, ANNULE]
 *                         totalAnnee:
 *                           type: number
 *                         historique:
 *                           type: array
 *                           items:
 *                             type: object
 *       403:
 *         description: Accès réservé aux professeurs
 *       404:
 *         description: Profil professeur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get(
  '/professeur',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const role   = req.user?.roleName;
      const userId = req.user?.userId;

      if (role !== 'PROFESSEUR' || !userId) {
        res.status(403).json({ success: false, message: 'Accès réservé aux professeurs' });
        return;
      }

      const data = await getDashboardProfesseur(userId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      if (error.message === 'Profil professeur introuvable') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Erreur dashboard professeur', error: error.message });
      }
    }
  }
);

export default router;
