import express from 'express';
import {
  getAllCahiersTexte,
  getCahierTexteById,
  getCahierTexteBySeance,
  getCahiersTexteByClasse,
  getCahiersTexteByStaff,
  createCahierTexte,
  updateCahierTexte,
  deleteCahierTexte,
  validerCahierTexte,
  exportCahierTextePDF,
  exportCahierTexteWord,
  exportCahiersClassePDF,
  exportCahiersClasseWord,
} from '../Controllers/cahierTexte.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

router.get('/', authenticateToken, ensurePermission('cahierTexte.read'), getAllCahiersTexte);
router.get('/seance/:seanceId', authenticateToken, ensurePermission('cahierTexte.read'), getCahierTexteBySeance);
router.get('/classe/:classeId', authenticateToken, ensurePermission('cahierTexte.read'), getCahiersTexteByClasse);
router.get('/staff/:staffId', authenticateToken, ensurePermission('cahierTexte.read'), getCahiersTexteByStaff);
router.get('/:id/export/pdf', authenticateToken, ensurePermission('cahierTexte.read'), exportCahierTextePDF);
router.get('/:id/export/word', authenticateToken, ensurePermission('cahierTexte.read'), exportCahierTexteWord);
router.get('/classe/:classeId/export/pdf', authenticateToken, ensurePermission('cahierTexte.read'), exportCahiersClassePDF);
router.get('/classe/:classeId/export/word', authenticateToken, ensurePermission('cahierTexte.read'), exportCahiersClasseWord);
router.get('/:id', authenticateToken, ensurePermission('cahierTexte.read'), getCahierTexteById);
router.post('/', authenticateToken, ensurePermission('cahierTexte.create'), createCahierTexte);
router.put('/:id', authenticateToken, ensurePermission('cahierTexte.update'), updateCahierTexte);
router.delete('/:id', authenticateToken, ensurePermission('cahierTexte.delete'), deleteCahierTexte);
router.patch('/:id/valider', authenticateToken, validerCahierTexte);

export default router;
