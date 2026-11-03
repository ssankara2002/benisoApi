import { Router } from 'express';
import * as enseignementAnneeController from '../Controllers/enseignementAnnee.controller';

const router = Router();

// Routes pour la gestion des enseignements annuels

// GET /api/enseignements/enseignant - Récupérer l'enseignant d'une matière/classe
// Query params: matiereId, classeId, anneeId
router.get('/enseignant/matiere', enseignementAnneeController.getEnseignantByMatiereClasse);

// GET /api/enseignements/staff/:staffId/volume-horaire - Volume horaire total
router.get('/staff/:staffId/volume-horaire', enseignementAnneeController.getVolumeHoraireTotal);

// GET /api/enseignements/staff/:staffId - Récupérer les enseignements d'un professeur
router.get('/staff/:staffId', enseignementAnneeController.getEnseignementsByStaff);

// GET /api/enseignements/classe/:classeId - Récupérer les enseignements d'une classe
router.get('/classe/:classeId', enseignementAnneeController.getEnseignementsByClasse);

// GET /api/enseignements - Récupérer tous les enseignements (optionnel: ?anneeId=X)
router.get('/', enseignementAnneeController.getAllEnseignements);

// GET /api/enseignements/:id - Récupérer un enseignement par son ID
router.get('/:id', enseignementAnneeController.getEnseignementById);

// POST /api/enseignements - Créer un nouvel enseignement
router.post('/', enseignementAnneeController.createEnseignement);

// PUT /api/enseignements/:id - Mettre à jour un enseignement
router.put('/:id', enseignementAnneeController.updateEnseignement);

// DELETE /api/enseignements/:id - Supprimer un enseignement
router.delete('/:id', enseignementAnneeController.deleteEnseignement);

export default router;
