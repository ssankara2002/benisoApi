import express from 'express';
import {
  getAllEmploisDuTemps,
  getEmploiDuTempsById,
  getEmploiDuTempsByClasse,
  getEmploiDuTempsByStaff,
  createEmploiDuTemps,
  updateEmploiDuTemps,
  deleteEmploiDuTemps,
  downloadEmploiDuTempsPDF,
} from '../Controllers/emploiDuTemps.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

router.get('/', authenticateToken, ensurePermission('emploiDuTemps.read'), getAllEmploisDuTemps);
router.get('/classe/:classeId', authenticateToken, ensurePermission('emploiDuTemps.read'), getEmploiDuTempsByClasse);
router.get('/staff/:staffId', authenticateToken, ensurePermission('emploiDuTemps.read'), getEmploiDuTempsByStaff);
router.get('/:id', authenticateToken, ensurePermission('emploiDuTemps.read'), getEmploiDuTempsById);
router.post('/', authenticateToken, ensurePermission('emploiDuTemps.create'), createEmploiDuTemps);
router.put('/:id', authenticateToken, ensurePermission('emploiDuTemps.update'), updateEmploiDuTemps);
router.delete('/:id', authenticateToken, ensurePermission('emploiDuTemps.delete'), deleteEmploiDuTemps);
router.get('/classe/:classeId/annee/:anneeId/pdf', authenticateToken, ensurePermission('emploiDuTemps.read'), downloadEmploiDuTempsPDF);

export default router;
