import { Request, Response } from 'express';
import bulletinService from '../Services/bulletin.service';

// Récupérer les données du bulletin (JSON)
export const getBulletinData = async (req: Request, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const classeId = parseInt(req.params.classeId);
    const trimestreId = parseInt(req.params.trimestreId);
    const anneeId = parseInt(req.params.anneeId);

    if (isNaN(eleveId) || isNaN(classeId) || isNaN(trimestreId) || isNaN(anneeId)) {
      res.status(400).json({ error: 'IDs invalides' });
      return;
    }

    const bulletinData = await bulletinService.getBulletinData(eleveId, classeId, trimestreId, anneeId);

    res.status(200).json({
      success: true,
      data: bulletinData
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du bulletin:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
};

// Générer le PDF du bulletin
export const generateBulletinPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const eleveId = parseInt(req.params.eleveId);
    const classeId = parseInt(req.params.classeId);
    const trimestreId = parseInt(req.params.trimestreId);
    const anneeId = parseInt(req.params.anneeId);

    if (isNaN(eleveId) || isNaN(classeId) || isNaN(trimestreId) || isNaN(anneeId)) {
      res.status(400).json({ error: 'IDs invalides' });
      return;
    }

    const filePath = await bulletinService.generateBulletinPDF(eleveId, classeId, trimestreId, anneeId);

    // Envoyer le fichier PDF en réponse avec des en-têtes explicites
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="bulletin.pdf"');

    res.download(filePath, 'bulletin.pdf', (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Erreur lors du téléchargement du PDF'
          });
        }
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du bulletin PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
};

// Récupérer les bulletins de tous les élèves d'une classe pour une année et un trimestre
export const getBulletinsClasse = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Params reçus:', req.params); // Debug
    const classeId = parseInt(req.params.classeId);
    const anneeId = parseInt(req.params.anneeId);
    const trimestreId = parseInt(req.params.trimestreId);

    console.log('IDs parsés:', { classeId, anneeId, trimestreId }); // Debug

    if (isNaN(classeId) || isNaN(anneeId) || isNaN(trimestreId)) {
      res.status(400).json({ error: 'IDs invalides' });
      return;
    }

    const bulletins = await bulletinService.getBulletinsClasse(classeId, anneeId, trimestreId);

    console.log('✅ Premier bulletin retourné:', JSON.stringify(bulletins.bulletins?.[0], null, 2));

    res.status(200).json({
      success: true,
      data: bulletins
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des bulletins de classe:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
};

export default {
  getBulletinData,
  generateBulletinPDF,
  getBulletinsClasse
};
