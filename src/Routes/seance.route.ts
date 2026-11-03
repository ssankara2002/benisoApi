import express from 'express';
import {
  getAllSeances,
  getSeanceById,
  getSeancesByEmploiDuTemps,
  getSeancesByClasse,
  getSeancesByStaff,
  createSeance,
  updateSeance,
  deleteSeance,
} from '../Controllers/seance.controller';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';

const router = express.Router();

router.get('/', authenticateToken, ensurePermission('seance.read'), getAllSeances);
router.get('/emploi-du-temps/:emploiDuTempsId', authenticateToken, ensurePermission('seance.read'), getSeancesByEmploiDuTemps);
router.get('/classe/:classeId', authenticateToken, ensurePermission('seance.read'), getSeancesByClasse);
router.get('/staff/:staffId', authenticateToken, ensurePermission('seance.read'), getSeancesByStaff);
router.get('/:id', authenticateToken, ensurePermission('seance.read'), getSeanceById);
router.post('/', authenticateToken, ensurePermission('seance.create'), createSeance);
router.put('/:id', authenticateToken, ensurePermission('seance.update'), updateSeance);
router.delete('/:id', authenticateToken, ensurePermission('seance.delete'), deleteSeance);

export default router;
