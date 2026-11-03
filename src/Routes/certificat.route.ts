import express from 'express';
import { RequestHandler } from 'express';
import authenticateToken from '../middlewares/authMiddleware';
import { ensurePermission } from '../middlewares/ensureAdmin';
import { getDonneesDocument, genererPDF, genererWord, TypeDocument } from '../Services/certificat.service';

const router = express.Router();

// ─── PDF ──────────────────────────────────────────────────────────────────────

router.post('/pdf', authenticateToken, ensurePermission('document.read'), (async (req, res) => {
  try {
    const { type, eleveId, anneeId, signataireFonction, signataireNom, signataireGrade } = req.body;

    if (!type || !eleveId || !anneeId || !signataireFonction || !signataireNom || !signataireGrade) {
      res.status(400).json({ success: false, message: 'type, eleveId, anneeId, signataireFonction, signataireNom et signataireGrade sont requis.' });
      return;
    }

    const types: TypeDocument[] = ['CERTIFICAT_SCOLARITE', 'ATTESTATION_NIVEAU', 'QUITUS_SORTIE'];
    if (!types.includes(type)) {
      res.status(400).json({ success: false, message: `type invalide. Valeurs possibles : ${types.join(', ')}` });
      return;
    }

    const donnees = await getDonneesDocument(
      Number(eleveId),
      Number(anneeId),
      signataireFonction,
      signataireNom,
      signataireGrade,
    );

    const buffer = await genererPDF(type as TypeDocument, donnees);

    const nomsFichiers: Record<TypeDocument, string> = {
      CERTIFICAT_SCOLARITE: 'certificat_scolarite',
      ATTESTATION_NIVEAU: 'attestation_niveau',
      QUITUS_SORTIE: 'quitus_sortie',
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomsFichiers[type as TypeDocument]}.pdf"`);
    res.send(buffer);
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}) as RequestHandler);

// ─── WORD ─────────────────────────────────────────────────────────────────────

router.post('/word', authenticateToken, ensurePermission('document.read'), (async (req, res) => {
  try {
    const { type, eleveId, anneeId, signataireFonction, signataireNom, signataireGrade } = req.body;

    if (!type || !eleveId || !anneeId || !signataireFonction || !signataireNom || !signataireGrade) {
      res.status(400).json({ success: false, message: 'type, eleveId, anneeId, signataireFonction, signataireNom et signataireGrade sont requis.' });
      return;
    }

    const types: TypeDocument[] = ['CERTIFICAT_SCOLARITE', 'ATTESTATION_NIVEAU', 'QUITUS_SORTIE'];
    if (!types.includes(type)) {
      res.status(400).json({ success: false, message: `type invalide. Valeurs possibles : ${types.join(', ')}` });
      return;
    }

    const donnees = await getDonneesDocument(
      Number(eleveId),
      Number(anneeId),
      signataireFonction,
      signataireNom,
      signataireGrade,
    );

    const buffer = await genererWord(type as TypeDocument, donnees);

    const nomsFichiers: Record<TypeDocument, string> = {
      CERTIFICAT_SCOLARITE: 'certificat_scolarite',
      ATTESTATION_NIVEAU: 'attestation_niveau',
      QUITUS_SORTIE: 'quitus_sortie',
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${nomsFichiers[type as TypeDocument]}.docx"`);
    res.send(buffer);
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}) as RequestHandler);

export default router;
