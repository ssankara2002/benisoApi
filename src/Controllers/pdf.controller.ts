import { Request, Response } from 'express';
import pdfService from '../Services/pdf.service';

/**
 * Génère un PDF avec la liste des élèves d'une classe pour une année donnée
 */
export const generateListeEleves = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classeId, anneeId } = req.params;

    if (!classeId || !anneeId) {
      res.status(400).json({
        success: false,
        message: 'Les paramètres classeId et anneeId sont obligatoires'
      });
      return;
    }

    const pdfBuffer = await pdfService.generateListeEleves(
      parseInt(classeId),
      parseInt(anneeId)
    );

    // Définir les en-têtes pour le téléchargement du PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=liste-eleves-classe-${classeId}-${anneeId}.pdf`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('❌ Erreur lors de la génération de la liste des élèves:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la liste des élèves',
      error: error.message
    });
  }
};

/**
 * Génère les cartes scolaires pour tous les élèves d'une classe
 */
export const generateCartesScolaires = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classeId, anneeId } = req.params;

    if (!classeId || !anneeId) {
      res.status(400).json({
        success: false,
        message: 'Les paramètres classeId et anneeId sont obligatoires'
      });
      return;
    }

    const pdfBuffer = await pdfService.generateCarteScolaire(
      parseInt(classeId),
      parseInt(anneeId)
    );

    // Définir les en-têtes pour le téléchargement du PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cartes-scolaires-classe-${classeId}-${anneeId}.pdf`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('❌ Erreur lors de la génération des cartes scolaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des cartes scolaires',
      error: error.message
    });
  }
};

/**
 * Génère une carte scolaire individuelle pour un élève
 */
export const generateCarteScolaireIndividuelle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eleveId, anneeId } = req.params;

    if (!eleveId || !anneeId) {
      res.status(400).json({
        success: false,
        message: 'Les paramètres eleveId et anneeId sont obligatoires'
      });
      return;
    }

    const pdfBuffer = await pdfService.generateCarteScolaireIndividuelle(
      parseInt(eleveId),
      parseInt(anneeId)
    );

    // Définir les en-têtes pour le téléchargement du PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=carte-scolaire-eleve-${eleveId}-${anneeId}.pdf`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('❌ Erreur lors de la génération de la carte scolaire:', error);

    // Si l'erreur est due à l'absence de photo
    if (error.message === 'Photo requise') {
      res.status(400).json({
        success: false,
        message: 'Veuillez uploader une photo pour générer la carte scolaire',
        code: 'PHOTO_REQUIRED'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la carte scolaire',
      error: error.message
    });
  }
};
