import express, { RequestHandler } from 'express';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';
import configEcoleService from '../Services/configurationEcole.service';

const router = express.Router();

router.get('/', authenticateToken, ensurePermission('document.read'), (async (_req, res) => {
  try {
    const data = await configEcoleService.get();
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}) as RequestHandler);

router.post('/', authenticateToken, ensurePermission('document.update'), (async (req, res) => {
  try {
    const { nomEcole } = req.body;
    if (!nomEcole) {
      res.status(400).json({ success: false, message: 'nomEcole est requis.' });
      return;
    }
    const data = await configEcoleService.upsert(req.body);
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
}) as RequestHandler);

export default router;
