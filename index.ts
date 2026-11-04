import express, { Application } from 'express';
import accueilRouter from './src/Routes/accueil.route.js';
import authRouter from './src/Routes/auth.route.js';
import userRouter from './src/Routes/user.route.js';
import roleRouter from './src/Routes/role.route.js';
import permissionRouter from './src/Routes/permission.route.js';
 import eleveRouter from './src/Routes/eleve.route.js'; // Temporairement désactivé - erreur YAML
import parentRouter from './src/Routes/parent.route.js';
import staffRouter from './src/Routes/staff.route.js';
import classeRouter from './src/Routes/classe.route.js';
import niveauRouter from './src/Routes/niveau.route.js';
import anneeRouter from './src/Routes/annee.route.js';
import matiereRouter from './src/Routes/matiere.route.js';
import noteRouter from './src/Routes/note.route.js';
import evaluationRouter from './src/Routes/evaluation.route.js';
import inscriptionEleveRouter from './src/Routes/inscription-eleve.route.js';
import retardRouter from './src/Routes/retard.route.js';
import absenceRouter from './src/Routes/absence.route.js';
import specialiteRouter from './src/Routes/specialite.route.js';
import filiereRouter from './src/Routes/filiere.route.js';
import evenementRouter from './src/Routes/evenement.route.js';
import leavePermissionRouter from './src/Routes/leavePermission.route.js';
import publicRouter from './src/Routes/public.route.js';
import coursRouter from './src/Routes/cours.route.js';
import galeryRouter from './src/Routes/galery.route.js';
import presentationRouter from './src/Routes/presentation.route.js';
import videoRouter from './src/Routes/video.route.js';
import actualiteRouter from './src/Routes/actualite.route.js'
import setupSwagger from './utils/swagger.js';
import typeRouter from "./src/Routes/type.routes.js"
import typeEnseignementRouter from './src/Routes/typeEnseignement.route.js';
import serieRouter from './src/Routes/serie.route.js';
import coeficientNiveauRouter from './src/Routes/coeficientNiveau.route.js';
import coeficientSerieRouter from './src/Routes/coeficientSerie.route.js';
import bulletinRouter from './src/Routes/bulletin.route.js';
import trimestreRouter from './src/Routes/trimestre.route.js';
import typeMatiereRouter from './src/Routes/typeMatiere.route.js';
import categorieComptableRouter from './src/Routes/categorie-comptable.route.js';
import compteBancaireRouter from './src/Routes/compte-bancaire.route.js';
import transactionRouter from './src/Routes/transaction.route.js';
import budgetRouter from './src/Routes/budget.route.js';
import salaireRouter from './src/Routes/salaire.route.js';
import rapportRouter from './src/Routes/rapport.route.js';
import paiementRouter from './src/Routes/paiement.route.js';
import configurationTrancheRouter from './src/Routes/configurationTranche.route.js';
import pdfRouter from './src/Routes/pdf.route.js';
import enseignementAnneeRouter from './src/Routes/enseignementAnnee.route.js';
import cahierNotesRouter from './src/Routes/cahierNotes.routes.js';
import decisionPassageRouter from './src/Routes/decisionPassage.routes.js';
import emploiDuTempsRouter from './src/Routes/emploiDuTemps.route.js';
import seanceRouter from './src/Routes/seance.route.js';
import cahierTexteRouter from './src/Routes/cahierTexte.route.js';
import licenceRouter from './src/Routes/licence.route.js';
import parentSpaceRouter from './src/Routes/parentSpace.route.js';
import dashboardRouter from './src/Routes/dashboard.route.js';
import configurationEcoleRouter from './src/Routes/configurationEcole.route.js';
import certificatRouter from './src/Routes/certificat.route.js';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import startEventStatusCron from './src/utils/eventStatusCron.js';
import startRappelTrancheCron from './src/utils/rappelTrancheCron.js';
import { verifierLicenceMiddleware } from './src/middlewares/licenceMiddleware.js';

const app: Application = express();

app.use(express.json());

const allowedOrigins = [
  'https://beniso.edutrackhub.cloud',
  'https://apibeniso.edutrackhub.cloud',
  'http://localhost:5173'
];
// En développement, autoriser toutes les origines localhost
const isDevelopment = process.env.NODE_ENV !== 'production';

// Afficher les origines autorisées au démarrage
console.log('🌐 CORS - Origines autorisées:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (curl, Postman, Swagger UI)
    if (!origin) return callback(null, true);

    // En développement, autoriser toutes les origines localhost et 0.0.0.0
    if (isDevelopment && (origin.startsWith('http://localhost') || origin.startsWith('http://0.0.0.0') || origin.startsWith('http://127.0.0.1'))) {
      return callback(null, true);
    }

    // Vérifier si l'origin est dans la liste autorisée
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed origin: ${origin}`);
      return callback(null, true);
    }

    console.warn(`🚫 CORS blocked origin: ${origin}`);
    console.warn(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

setupSwagger(app);

// Health check endpoint for Docker
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes publiques (sans middleware de licence)
app.use('/api/', accueilRouter);
app.use('/api/auth', authRouter);
app.use('/api/licences', licenceRouter);
app.use('/api', publicRouter);

// Routes protégées par licence - Appliquer le middleware à toutes les routes suivantes
// Pour désactiver temporairement : ajouter LICENCE_ENABLED=false dans .env hzhzj
const LICENCE_ENABLED = process.env.LICENCE_ENABLED !== 'false'; // Par défaut activé, mettre 'false' pour désactiver
const licenceMiddleware = LICENCE_ENABLED ? verifierLicenceMiddleware : (_req: any, _res: any, next: any) => next();

console.log(`🔐 Système de licence: ${LICENCE_ENABLED ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);

app.use('/api/users', licenceMiddleware, userRouter);
app.use('/api/roles', licenceMiddleware, roleRouter);
app.use('/api/permissions', licenceMiddleware, permissionRouter);
app.use('/api/accueils', licenceMiddleware, accueilRouter);
app.use('/api/presentations', licenceMiddleware, presentationRouter);
app.use('/api/staff', licenceMiddleware, staffRouter);
app.use('/api/annees', licenceMiddleware, anneeRouter);
app.use('/api/classes', licenceMiddleware, classeRouter);
app.use('/api/niveaux', licenceMiddleware, niveauRouter);
app.use('/api/filieres', licenceMiddleware, filiereRouter);
app.use('/api/eleves', licenceMiddleware, eleveRouter);
app.use('/api/specialites', licenceMiddleware, specialiteRouter);
app.use('/api/matieres', licenceMiddleware, matiereRouter);
app.use('/api/cours', licenceMiddleware, coursRouter);
app.use('/api/actualites', licenceMiddleware, actualiteRouter);
app.use('/api/galeries', licenceMiddleware, galeryRouter);
app.use('/api/videos', licenceMiddleware, videoRouter);
app.use('/api/parents', licenceMiddleware, parentRouter);
app.use('/api/notes', licenceMiddleware, noteRouter);
app.use('/api/evaluations', licenceMiddleware, evaluationRouter);
app.use('/api/retards', licenceMiddleware, retardRouter);
app.use('/api/absences', licenceMiddleware, absenceRouter);
app.use('/api/evenements', licenceMiddleware, evenementRouter);
app.use('/api/leave-permissions', licenceMiddleware, leavePermissionRouter);
app.use('/api/inscriptions-eleve', licenceMiddleware, inscriptionEleveRouter);
app.use('/api/types', licenceMiddleware, typeRouter);
app.use('/api/types-enseignement', licenceMiddleware, typeEnseignementRouter);
app.use('/api/series', licenceMiddleware, serieRouter);
app.use('/api/coefficients-niveau', licenceMiddleware, coeficientNiveauRouter);
app.use('/api/coefficients-serie', licenceMiddleware, coeficientSerieRouter);
app.use('/api/bulletins', licenceMiddleware, bulletinRouter);
app.use('/api/trimestres', licenceMiddleware, trimestreRouter);
app.use('/api/types-matieres', licenceMiddleware, typeMatiereRouter);
app.use('/api/categories-comptables', licenceMiddleware, categorieComptableRouter);
app.use('/api/comptes-bancaires', licenceMiddleware, compteBancaireRouter);
app.use('/api/transactions', licenceMiddleware, transactionRouter);
app.use('/api/budgets', licenceMiddleware, budgetRouter);
app.use('/api/salaires', licenceMiddleware, salaireRouter);
app.use('/api/rapports', licenceMiddleware, rapportRouter);
app.use('/api/paiements', licenceMiddleware, paiementRouter);
app.use('/api/configuration-tranches', licenceMiddleware, configurationTrancheRouter);
app.use('/api/pdf', licenceMiddleware, pdfRouter);
app.use('/api/enseignements', licenceMiddleware, enseignementAnneeRouter);
app.use('/api/cahier-notes', licenceMiddleware, cahierNotesRouter);
app.use('/api/decision-passage', licenceMiddleware, decisionPassageRouter);
app.use('/api/parent-space', licenceMiddleware, parentSpaceRouter);
app.use('/api/emplois-du-temps', licenceMiddleware, emploiDuTempsRouter);
app.use('/api/seances', licenceMiddleware, seanceRouter);
app.use('/api/cahier-texte', licenceMiddleware, cahierTexteRouter);
app.use('/api/dashboard', licenceMiddleware, dashboardRouter);
app.use('/api/configuration-ecole', licenceMiddleware, configurationEcoleRouter);
app.use('/api/certificats', licenceMiddleware, certificatRouter);



const PORT: number = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📘 Swagger Docs: http://${HOST}:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  // start cron job to update evenement statut
  try {
    startEventStatusCron();
    console.log('🕒 Event status cron started');
  } catch (e) {
    console.error('Failed to start event status cron', e);
  }
  try {
    startRappelTrancheCron();
    console.log('🔔 Rappel tranches cron started');
  } catch (e) {
    console.error('Failed to start rappel tranches cron', e);
  }
});
