import express from 'express';
import inscriptionEleveController from '../Controllers/inscription-eleve.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inscriptions Eleve
 *   description: |
 *     Gestion des inscriptions d'élèves avec paiement (espèce ou électronique ).
 *
 *     **Workflow d'inscription :**
 *     1. Créer une inscription avec `niveauId` (obligatoire) et paiement
 *     2. La `classeId` est null au moment de l'inscription
 *     3. Assigner une classe plus tard via `POST /api/eleves/{id}/assigner-classe`
 *
 *     **Structure :**
 *     - Le `niveau` et la `classe` sont stockés au niveau de l'inscription (pas de l'élève)
 *     - Permet de suivre l'historique : un élève peut changer de niveau/classe chaque année
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InscriptionEleveRequest:
 *       type: object
 *       required:
 *         - montant
 *         - modePaiement
 *         - niveauId
 *       properties:
 *         eleveId:
 *           type: integer
 *           nullable: true
 *           description: |
 *             ⚠️ ID de l'élève - RÈGLES IMPORTANTES :
 *             - Si connecté en tant qu'ÉLÈVE : NE PAS ENVOYER (auto-détecté depuis le token)
 *             - Si connecté en tant que STAFF/ADMIN : REQUIS pour inscrire un élève spécifique
 *             - Validation dans le controller : le champ est vérifié selon le rôle de l'utilisateur
 *           example: 1
 *         niveauId:
 *           type: integer
 *           description: |
 *             ✅ ID du niveau scolaire (REQUIS pour inscription)
 *             - Détermine le niveau de l'élève pour cette année scolaire
 *             - Exemple : 1 = 6ème, 2 = 5ème, etc.
 *             - La classe peut être assignée plus tard via l'endpoint dédié
 *           example: 1
 *         anneeId:
 *           type: integer
 *           nullable: true
 *           description: |
 *             ID de l'année scolaire (OPTIONNEL)
 *             - Si non fourni : année en cours auto-détectée
 *             - Si fourni : utilisé pour l'inscription
 *           example: 1
 *         montant:
 *           type: number
 *           format: float
 *           description: |
 *             Montant du paiement (REQUIS)
 *             - Doit être un nombre positif
 *             - Généralement correspond à la scolarité du niveau
 *           example: 50000
 *           minimum: 0
 *         modePaiement:
 *           type: string
 *           enum: [espece, electronique, cinetpay]
 *           description: |
 *             Mode de paiement (REQUIS)
 *             - "espece" : paiement en espèces
 *             - "electronique" : paiement mobile
 *             - "cinetpay" : paiement via CinetPay / lien de paiement
 *           example: "cinetpay"
 *         paymentProvider:
 *           type: string
 *           nullable: true
 *           enum: [cinetpay]
 *           description: |
 *             Fournisseur de paiement électronique.
 *             
 *             - "cinetpay" : génération de lien de paiement CinetPay
 *           example: "cinetpay"
 *         paymentMethod:
 *           type: string
 *           nullable: true
 *           description: |
 *             Méthode de paiement électronique (REQUIS UNIQUEMENT si modePaiement="electronique" )
 *             - orange_bf - Orange Money Burkina Faso
 *             - moov_bf - Moov Money Burkina Faso
 *             - mtn_benin - MTN Mobile Money Bénin
 *             - moov_benin - Moov Money Burkina Faso
 *             - orange_ci - Orange Money Côte d'Ivoire
 *             - mtn_ci - MTN Mobile Money Côte d'Ivoire
 *             - moov_ci - Moov Money Côte d'Ivoire
 *             - orange_sn - Orange Money Sénégal
 *             - wave_sn - Wave Sénégal
 *           example: "orange_bf"
 *           enum: [orange_bf, moov_bf, mtn_benin, moov_benin, orange_ci, mtn_ci, moov_ci, orange_sn, wave_sn]
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: |
 *             Numéro de téléphone pour paiement mobile (REQUIS UNIQUEMENT si modePaiement="electronique")
 *             - Format international SANS le "+" (ex: 22677064342 pour le BF)
 *             - Le numéro recevra la demande de paiement
 *             - Doit correspondre à l'opérateur spécifié dans paymentMethod
 *           example: "22677064342"
 *           pattern: "^[0-9]{8,15}$"
 *         country:
 *           type: string
 *           nullable: true
 *           description: |
 *             ⚠️ Code pays ISO 2 lettres.
 *             Le pays est déterminé automatiquement par le paymentMethod.
 *             - BF - Burkina Faso (orange_bf, moov_bf)
 *             - BJ - Bénin (mtn_benin, moov_benin)
 *             - CI - Côte d'Ivoire (orange_ci, mtn_ci, moov_ci)
 *             - SN - Sénégal (orange_sn, wave_sn)
 *           example: "BF"
 *           enum: [BF, BJ, CI, SN]
 *         transactionId:
 *           type: string
 *           nullable: true
 *           description: |
 *             Identifiant unique de la transaction CinetPay.
 *             Si non fourni, le backend génère un identifiant unique.
 *           example: "REFID12354"
 *         currency:
 *           type: string
 *           nullable: true
 *           description: "Devise du paiement CinetPay (ex: XOF, USD)."
 *           example: "XOF"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description de l'inscription pour CinetPay.
 *           example: "Paiement scolarité 2024"
 *         notifyUrl:
 *           type: string
 *           nullable: true
 *           description: URL de notification CinetPay (webhook).
 *           example: "https://votre-api.com/api/webhooks/cinetpay"
 *         returnUrl:
 *           type: string
 *           nullable: true
 *           description: URL de redirection après paiement CinetPay.
 *           example: "https://votre-site.com/retour-paiement"
 *         channels:
 *           type: string
 *           nullable: true
 *           description: Univers de paiement CinetPay (ALL, MOBILE_MONEY, CREDIT_CARD, WALLET).
 *           example: "ALL"
 *         lang:
 *           type: string
 *           nullable: true
 *           description: Langue de l'interface CinetPay.
 *           example: "FR"
 *         metadata:
 *           type: string
 *           nullable: true
 *           description: Metadata libre pour retrouver facilement la commande.
 *           example: "inscription_eleve_123"
 *         invoice_data:
 *           type: object
 *           nullable: true
 *           description: Données supplémentaires affichées sur la facture CinetPay.
 *           example: {"Reste à payer": "25 000fr", "Matricule": "24OPO25", "Annee-scolaire": "2020-2021"}
 *         lock_phone_number:
 *           type: boolean
 *           nullable: true
 *           description: Verrouiller le numéro de téléphone pour CinetPay.
 *           example: true
 *         customer_id:
 *           type: string
 *           nullable: true
 *           description: Identifiant du client dans votre système (optionnel pour carte bancaire).
 *           example: "001"
 *         customer_name:
 *           type: string
 *           nullable: true
 *           description: Nom du client (requis pour carte bancaire).
 *           example: "John"
 *         customer_surname:
 *           type: string
 *           nullable: true
 *           description: Prénom du client (requis pour carte bancaire).
 *           example: "Doe"
 *         customer_phone_number:
 *           type: string
 *           nullable: true
 *           description: Téléphone du client pour CinetPay.
 *           example: "+2250504315545"
 *         customer_email:
 *           type: string
 *           nullable: true
 *           description: Email du client pour CinetPay.
 *           example: "john.doe@example.com"
 *         customer_address:
 *           type: string
 *           nullable: true
 *           description: Adresse du client pour CinetPay.
 *           example: "BP 0024"
 *         customer_city:
 *           type: string
 *           nullable: true
 *           description: Ville du client pour CinetPay.
 *           example: "Antananarivo"
 *         customer_country:
 *           type: string
 *           nullable: true
 *           description: Code pays ISO 2 lettres pour CinetPay.
 *           example: "CM"
 *         customer_state:
 *           type: string
 *           nullable: true
 *           description: État du client pour CinetPay.
 *           example: "CM"
 *         customer_zip_code:
 *           type: string
 *           nullable: true
 *           description: Code postal du client pour CinetPay.
 *           example: "06510"
 *     InscriptionEleveResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Inscription réussie"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 nom:
 *                   type: string
 *                   example: "Doe"
 *                 prenom:
 *                   type: string
 *                   example: "John"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *             eleve:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: integer
 *                   example: 1
 *             inscription:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 eleveId:
 *                   type: integer
 *                   example: 1
 *                 anneeId:
 *                   type: integer
 *                   example: 1
 *                 niveauId:
 *                   type: integer
 *                   nullable: true
 *                   description: ID du niveau scolaire assigné lors de l'inscription
 *                   example: 1
 *                 classeId:
 *                   type: integer
 *                   nullable: true
 *                   description: ID de la classe (null au moment de l'inscription, assigné plus tard via endpoint dédié)
 *                   example: null
 *             paiement:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 montant:
 *                   type: number
 *                   example: 50000
 *                 modePaiement:
 *                   type: string
 *                   example: "espece"
 *             mobileMoney:
 *               type: object
 *               description: Informations paiement mobile (uniquement pour paiement électronique)
 *               properties:
 *                 paymentId:
 *                   type: string
 *                   description: ID du paiement mobile
 *                   example: "pay_abc123xyz456"
 *                 status:
 *                   type: string
 *                   description: Statut du paiement
 *                   example: "pending"
 *                 reference:
 *                   type: string
 *                   description: Référence du paiement
 *                   example: "REF123456"
 *                 message:
 *                   type: string
 *                   description: Message d'information
 *                   example: "Notification envoyée. Veuillez confirmer le paiement sur votre téléphone."
 *             cinetpay:
 *               type: object
 *               description: Informations CinetPay (uniquement pour mode de paiement CinetPay)
 *               properties:
 *                 paymentToken:
 *                   type: string
 *                   description: Token de paiement CinetPay
 *                   example: "5df64dd9c5447739327eb88e1e4ea0ac015555cc262ea308c91acbd4e5c8fb95f4bd0bd7cad877a452f877fa6f51fe74184d00a84ab7f9"
 *                 paymentUrl:
 *                   type: string
 *                   description: URL du guichet CinetPay
 *                   example: "https://checkout.cinetpay.com/payment/5df64dd9c5447739327eb88e1e4ea0ac015555cc262ea308c91acbd4e5c8fb95f4bd0bd7cad877a452f877fa6f51fe74184d00a84ab7f9"
 *                 transactionId:
 *                   type: string
 *                   description: Identifiant de la transaction CinetPay
 *                   example: "REFID12354"
 *                 status:
 *                   type: string
 *                   description: Statut initial du paiement CinetPay
 *                   example: "pending"
 *                 apiResponseId:
 *                   type: string
 *                   description: Identifiant de réponse API CinetPay
 *                   example: "1632143554.8513"
 */

/**
 * @swagger
 * /api/inscriptions-eleve/eleve:
 *   post:
 *     summary: Inscrire un élève avec paiement
 *     description: |
 *       Crée une inscription et enregistre le paiement (en espèce ou électronique ).
 *
 *       **Règles importantes :**
 *       - `niveauId` est **OBLIGATOIRE** : définit le niveau scolaire pour cette inscription
 *       - `classeId` n'est **PAS envoyé** ici (null), il sera assigné plus tard via endpoint dédié
 *       - Si l'utilisateur connecté est un **élève**, l'eleveId est auto-détecté
 *       - Si l'utilisateur est un **staff/admin**, l'eleveId doit être fourni
 *       - L'année scolaire est auto-détectée si non fournie (année en cours)
 *     tags: [Inscriptions Eleve]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InscriptionEleveRequest'
 *           examples:
 *             eleveEspece:
 *               summary: 🎓 ÉLÈVE - Inscription en espèce (eleveId AUTO)
 *               value:
 *                 niveauId: 1
 *                 montant: 50000
 *                 modePaiement: "espece"
 *               description: "⚠️ NE PAS envoyer eleveId - il est auto-détecté depuis votre token. niveauId requis (ex: 1=6ème)"
 *             eleveElectroniqueOrange:
 *               summary: 🎓 ÉLÈVE - Paiement Orange Money BF (eleveId AUTO) 📱
 *               value:
 *                 niveauId: 2
 *                 montant: 50000
 *                 modePaiement: "electronique"
 *                 paymentMethod: "orange_bf"
 *                 phoneNumber: "22677064342"
 *               description: "📱 Le numéro 22677064342 (élève 77064342) recevra une NOTIFICATION PUSH sur son téléphone. L'utilisateur devra confirmer le paiement en tapant #144# + son code PIN Orange Money. Les fonds seront transférés vers le compte marchand de l'école (65194975). ⚠️ NE PAS envoyer eleveId - auto-détecté."
 *             eleveElectroniqueMTN:
 *               summary: 🎓 ÉLÈVE - Paiement MTN Mobile Money Bénin (eleveId AUTO) 📱
 *               value:
 *                 niveauId: 3
 *                 montant: 75000
 *                 modePaiement: "electronique"
 *                 paymentMethod: "mtn_benin"
 *                 phoneNumber: "22997123456"
 *               description: "📱 Le numéro 22997123456 recevra une NOTIFICATION PUSH sur son téléphone. L'utilisateur devra confirmer le paiement en tapant son code PIN MTN. ⚠️ NE PAS envoyer eleveId - auto-détecté."
 *             staffInscritEleve:
 *               summary: 👨‍🏫 STAFF - Inscription d'un élève (eleveId REQUIS)
 *               value:
 *                 eleveId: 5
 *                 niveauId: 1
 *                 montant: 50000
 *                 modePaiement: "espece"
 *               description: "✅ Staff DOIT envoyer eleveId pour inscrire un autre élève + niveauId requis"
 *             staffElectronique:
 *               summary: 👨‍🏫 STAFF - Inscription avec Orange Money BF (eleveId REQUIS) 📱
 *               value:
 *                 eleveId: 5
 *                 niveauId: 2
 *                 montant: 50000
 *                 modePaiement: "electronique"
 *                 paymentMethod: "orange_bf"
 *                 phoneNumber: "22677064342"
 *               description: "📱 Le numéro 22677064342 (élève 77064342) recevra une NOTIFICATION PUSH Orange Money. L'élève/parent devra confirmer le paiement en tapant #144# + son code PIN. Les fonds seront transférés vers le compte marchand de l'école (65194975). ✅ Staff DOIT envoyer eleveId."
 *             staffCinetpayLink:
 *               summary: 👨‍🏫 STAFF - Inscription avec lien CinetPay (eleveId REQUIS)
 *               value:
 *                 eleveId: 5
 *                 niveauId: 2
 *                 montant: 50000
 *                 modePaiement: "cinetpay"
 *                 paymentProvider: "cinetpay"
 *                 transactionId: "REFID12354"
 *                 currency: "XOF"
 *                 description: "Paiement scolarité 2024"
 *                 notifyUrl: "https://votre-api.com/api/webhooks/cinetpay"
 *                 returnUrl: "https://votre-site.com/retour-paiement"
 *                 channels: "ALL"
 *                 lang: "FR"
 *                 metadata: "inscription_eleve_5"
 *                 customer_name: "John"
 *                 customer_surname: "Doe"
 *                 customer_email: "john.doe@example.com"
 *                 customer_phone_number: "+2250504315545"
 *                 customer_address: "BP 0024"
 *                 customer_city: "Antananarivo"
 *                 customer_country: "CM"
 *                 customer_state: "CM"
 *                 customer_zip_code: "06510"
 *               description: "✅ Génère un lien de paiement CinetPay. Le client est redirigé vers le guichet pour payer par mobile ou carte bancaire."
 *     responses:
 *       201:
 *         description: Inscription créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InscriptionEleveResponse'
 *       400:
 *         description: Données invalides ou manquantes
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
 *                   example: "Champs obligatoires manquants"
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
 *                   example: "Erreur serveur lors de l'inscription"
 *                 error:
 *                   type: string
 */
router.post('/eleve', authenticateToken, async (req, res) => {
  await inscriptionEleveController.inscrireEleve(req, res);
});

/**
 * @swagger
 * /api/inscriptions-eleve/eleve/{id}:
 *   get:
 *     summary: Récupérer les détails d'une inscription
 *     description: |
 *       Récupère une inscription avec toutes ses informations :
 *       - Élève et ses informations user + filière
 *       - Niveau et classe de l'inscription (pour cette année scolaire)
 *       - Année scolaire
 *       - Tous les paiements associés
 *     tags: [Inscriptions Eleve]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'inscription
 *         example: 1
 *     responses:
 *       200:
 *         description: Détails de l'inscription
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     eleveId:
 *                       type: integer
 *                       example: 1
 *                     anneeId:
 *                       type: integer
 *                       example: 1
 *                     niveauId:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     classeId:
 *                       type: integer
 *                       nullable: true
 *                       example: 2
 *                     eleve:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         userId:
 *                           type: integer
 *                           example: 5
 *                         user:
 *                           type: object
 *                           properties:
 *                             nom:
 *                               type: string
 *                               example: "COMPAORE"
 *                             prenom:
 *                               type: string
 *                               example: "ABDOUL AZIZ"
 *                             email:
 *                               type: string
 *                               example: "abdoul.compaore@example.com"
 *                         filiere:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             nom:
 *                               type: string
 *                               example: "Scientifique"
 *                     niveau:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nomNiveau:
 *                           type: string
 *                           example: "6ème"
 *                     classe:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         nom:
 *                           type: string
 *                           example: "6ème A"
 *                     annee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         libelle:
 *                           type: string
 *                           example: "2023/2024"
 *                         dateDebut:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-09-01T00:00:00.000Z"
 *                         dateFin:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-06-30T00:00:00.000Z"
 *                     paiements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           montant:
 *                             type: number
 *                             example: 50000
 *                           modePaiement:
 *                             type: string
 *                             example: "espece"
 *                           statut:
 *                             type: string
 *                             example: "completed"
 *       400:
 *         description: ID invalide
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
 *                   example: "ID d'inscription invalide"
 *       404:
 *         description: Inscription non trouvée
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
 *                   example: "Inscription introuvable"
 *       500:
 *         description: Erreur serveur
 */
router.get('/eleve/:id', async (req, res) => {
  await inscriptionEleveController.getInscriptionDetails(req, res);
});

/**
 * @swagger
 * /api/inscriptions-eleve/eleve/annee/{anneeId}:
 *   get:
 *     summary: Récupérer toutes les inscriptions pour une année scolaire
 *     description: |
 *       Liste toutes les inscriptions d'une année scolaire avec :
 *       - Informations complètes de l'élève (user, filière)
 *       - Niveau et classe de chaque inscription
 *       - Tous les paiements associés à chaque inscription
 *     tags: [Inscriptions Eleve]
 *     parameters:
 *       - in: path
 *         name: anneeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'année scolaire
 *         example: 1
 *     responses:
 *       200:
 *         description: Liste des inscriptions
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
 *                       eleveId:
 *                         type: integer
 *                         example: 1
 *                       anneeId:
 *                         type: integer
 *                         example: 1
 *                       niveauId:
 *                         type: integer
 *                         nullable: true
 *                         example: 1
 *                       classeId:
 *                         type: integer
 *                         nullable: true
 *                         example: 2
 *                       eleve:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           user:
 *                             type: object
 *                             properties:
 *                               nom:
 *                                 type: string
 *                                 example: "COMPAORE"
 *                               prenom:
 *                                 type: string
 *                                 example: "ABDOUL AZIZ"
 *                           filiere:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               nom:
 *                                 type: string
 *                                 example: "Scientifique"
 *                       niveau:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           nomNiveau:
 *                             type: string
 *                             example: "6ème"
 *                       classe:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           nom:
 *                             type: string
 *                             example: "6ème A"
 *                       paiements:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             montant:
 *                               type: number
 *                               example: 50000
 *                             modePaiement:
 *                               type: string
 *                               example: "espece"
 *       400:
 *         description: ID invalide
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
 *                   example: "ID d'année invalide"
 *       500:
 *         description: Erreur serveur
 */
router.get('/eleve/annee/:anneeId', async (req, res) => {
  await inscriptionEleveController.getInscriptionsByAnnee(req, res);
});

/**
 * @swagger
 * /api/inscriptions-eleve/eleve/{inscriptionId}/assigner-classe:
 *   put:
 *     summary: Assigner une classe à une inscription
 *     description: |
 *       Assigne une classe à une inscription existante.
 *       **Important :** La classe doit correspondre au niveau de l'inscription.
 *     tags: [Inscriptions Eleve]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inscriptionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'inscription
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classeId
 *             properties:
 *               classeId:
 *                 type: integer
 *                 description: ID de la classe à assigner
 *                 example: 2
 *     responses:
 *       200:
 *         description: Classe assignée avec succès
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
 *                   example: "Classe assignée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     eleveId:
 *                       type: integer
 *                       example: 1
 *                     anneeId:
 *                       type: integer
 *                       example: 1
 *                     niveauId:
 *                       type: integer
 *                       example: 1
 *                     classeId:
 *                       type: integer
 *                       example: 2
 *                     classe:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         nom:
 *                           type: string
 *                           example: "6ème A"
 *       400:
 *         description: Données invalides ou classe incompatible avec le niveau
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
 *                   example: "La classe appartient au niveau \"5ème\" mais l'inscription est pour le niveau \"6ème\""
 *       500:
 *         description: Erreur serveur
 */
router.put('/eleve/:inscriptionId/assigner-classe', authenticateToken, async (req, res) => {
  await inscriptionEleveController.assignerClasse(req, res);
});

/**
 * @swagger
 * /api/inscriptions-eleve/eleve/assigner-classe-multiple:
 *   put:
 *     summary: Assigner une classe à plusieurs inscriptions
 *     description: |
 *       Assigne une classe à plusieurs inscriptions en une seule requête.
 *       **Important :**
 *       - Toutes les inscriptions doivent correspondre au même niveau que la classe
 *       - La classe doit avoir suffisamment de places disponibles
 *     tags: [Inscriptions Eleve]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inscriptionIds
 *               - classeId
 *             properties:
 *               inscriptionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Liste des IDs d'inscription à assigner
 *                 example: [1, 2, 3]
 *               classeId:
 *                 type: integer
 *                 description: ID de la classe à assigner
 *                 example: 2
 *     responses:
 *       200:
 *         description: Classes assignées avec succès
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
 *                   example: "3 élève(s) assigné(s) à la classe 6ème A"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Données invalides ou problème de capacité/niveau
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
 *                   example: "La classe n'a que 2 place(s) disponible(s) mais vous essayez d'assigner 3 élève(s)"
 *       500:
 *         description: Erreur serveur
 */
router.put('/eleve/assigner-classe-multiple', authenticateToken, async (req, res) => {
  await inscriptionEleveController.assignerClassePlusieurs(req, res);
});

/**
 * @swagger
 * /api/inscriptions-eleve/eleve/paiement/{paiementId}/status:
 *   put:
 *     summary: Mettre a jour le statut du paiement
 *     description: Met à jour le statut d'un paiement électronique (utilise notamment par les webhooks)
 *     tags: [Inscriptions Eleve]
 *     parameters:
 *       - in: path
 *         name: paiementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du paiement
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, failed]
 *                 description: Nouveau statut du paiement
 *                 example: "confirmed"
 *               txHash:
 *                 type: string
 *                 description: Hash de la transaction
 *                 example: "abc123xyz"
 *               blockHeight:
 *                 type: integer
 *                 description: Hauteur du bloc de confirmation
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
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
 *                   example: "Statut du paiement mis à jour"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     moneroStatus:
 *                       type: string
 *                       example: "confirmed"
 *                     moneroTxHash:
 *                       type: string
 *                       example: "abc123xyz"
 *                     moneroBlockHeight:
 *                       type: integer
 *                       example: 123456
 *       400:
 *         description: Données invalides
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
 *                   example: "ID de paiement invalide"
 *       500:
 *         description: Erreur serveur
 */
router.put('/eleve/paiement/:paiementId/status', async (req, res) => {
  await inscriptionEleveController.updatePaiementStatus(req, res);
});

/**
 * @swagger
 * /api/inscriptions/eleve/paiement/{paiementId}/confirmer:
 *   post:
 *     summary: 🧪 [MODE TEST] Confirmer manuellement un paiement en mode SANDBOX
 *     description: |
 *       **⚠️ ENDPOINT DE TEST UNIQUEMENT**
 *
 *       Cet endpoint permet de confirmer manuellement un paiement en mode SANDBOX (test).
 *
 *       **Quand l'utiliser ?**
 *       - En mode SANDBOX uniquement (avec clé API pvk_sandbox_...)
 *       - Pour simuler la confirmation d'un paiement Mobile Money
 *       - Après avoir initié un paiement via POST /api/inscriptions/eleve
 *
 *       **Comment ça marche ?**
 *       1. Créer une inscription avec paiement électronique (POST /api/inscriptions/eleve)
 *       2. Récupérer le `paiementId` dans la réponse (data.paiement.id)
 *       3. Appeler cet endpoint avec le `paiementId` pour confirmer le paiement
 *
 *       **En MODE PRODUCTION :**
 *       - Cet endpoint est DÉSACTIVÉ (retourne une erreur 403)
 *       - Les paiements sont confirmés automatiquement via webhook
 *       - L'utilisateur reçoit une vraie notification sur son téléphone
 *
 *       **Sécurité :**
 *       - Bloqué automatiquement si la clé API est en mode PRODUCTION (pvk_live_...)
 *       - Met à jour le statut à "success" avec des données fictives de test
 *
 *     tags: [Inscriptions Eleve]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paiementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du paiement à confirmer (obtenu lors de la création de l'inscription)
 *         example: 1
 *     responses:
 *       200:
 *         description: 🧪 Paiement confirmé avec succès (mode TEST)
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
 *                   example: "🧪 Paiement confirmé avec succès (mode TEST)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     montant:
 *                       type: integer
 *                       example: 50000
 *                     modePaiement:
 *                       type: string
 *                       example: "electronique"
 *                     moneroStatus:
 *                       type: string
 *                       example: "success"
 *                     moneroTxHash:
 *                       type: string
 *                       example: "sandbox_tx_1705234567890"
 *                       description: Hash de transaction fictif généré pour le test
 *                     moneroBlockHeight:
 *                       type: integer
 *                       example: 456789
 *                       description: Hauteur de bloc fictive générée pour le test
 *                     inscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         eleve:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 nom:
 *                                   type: string
 *                                   example: "COMPAORE"
 *                                 prenom:
 *                                   type: string
 *                                   example: "ABDOUL AZIZ"
 *       400:
 *         description: Requête invalide
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
 *                   example: "ID de paiement invalide"
 *       403:
 *         description: Mode PRODUCTION - Endpoint désactivé
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
 *                   example: "❌ Cet endpoint ne fonctionne qu'en mode SANDBOX. En PRODUCTION, les paiements sont confirmés automatiquement via webhook."
 *       404:
 *         description: Paiement introuvable
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
 *                   example: "Paiement introuvable"
 *       500:
 *         description: Erreur serveur
 *     x-code-samples:
 *       - lang: 'cURL'
 *         source: |
 *           # 🧪 Étape 1 : Obtenir un token JWT
 *           TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
 *             -H "Content-Type: application/json" \
 *             -d '{"email":"admin@ecole.com","password":"admin123"}' \
 *             | jq -r '.token')
 *
 *           # 🧪 Étape 2 : Créer une inscription avec paiement électronique
 *           PAIEMENT_ID=$(curl -X POST http://localhost:5000/api/inscriptions/eleve \
 *             -H "Authorization: Bearer $TOKEN" \
 *             -H "Content-Type: application/json" \
 *             -d '{
 *               "niveauId": 2,
 *               "montant": 50000,
 *               "modePaiement": "electronique",
 *               "paymentMethod": "orange_bf",
 *               "phoneNumber": "22677064342"
 *             }' | jq -r '.data.paiement.id')
 *
 *           # 🧪 Étape 3 : Confirmer le paiement (MODE SANDBOX uniquement)
 *           curl -X POST http://localhost:5000/api/inscriptions/eleve/paiement/$PAIEMENT_ID/confirmer \
 *             -H "Authorization: Bearer $TOKEN"
 */
router.post('/eleve/paiement/:paiementId/confirmer', authenticateToken, async (req, res) => {
  await inscriptionEleveController.confirmerPaiementSandbox(req, res);
});

// Réinscription : récupérer les infos de l'année précédente d'un élève
router.get('/eleve/:eleveId/annee-precedente', authenticateToken, async (req, res) => {
  await inscriptionEleveController.getInfosAnneePrecedente(req, res);
});

// Réinscription : réinscrire un élève existant pour la nouvelle année
router.post('/reinscription', authenticateToken, async (req, res) => {
  await inscriptionEleveController.reinscriptionEleve(req, res);
});

export default router;
