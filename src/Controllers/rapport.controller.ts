import { Request, Response } from 'express';
import rapportService from '../Services/rapport.service';

// Rapport financier global
export const getRapportFinancier = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, anneeId } = req.query;

    const rapport = await rapportService.getRapportFinancier({
      dateDebut: dateDebut ? new Date(dateDebut as string) : undefined,
      dateFin: dateFin ? new Date(dateFin as string) : undefined,
      anneeId: anneeId ? parseInt(anneeId as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: rapport,
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du rapport financier:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Bilan comptable
export const getBilanComptable = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, anneeId } = req.query;

    const bilan = await rapportService.getBilanComptable({
      dateDebut: dateDebut ? new Date(dateDebut as string) : undefined,
      dateFin: dateFin ? new Date(dateFin as string) : undefined,
      anneeId: anneeId ? parseInt(anneeId as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: bilan,
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du bilan comptable:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Rapport des salaires
export const getRapportSalaires = async (req: Request, res: Response) => {
  try {
    const { annee } = req.query;

    const rapport = await rapportService.getRapportSalaires(
      annee ? parseInt(annee as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: rapport,
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du rapport des salaires:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

// Rapport mensuel
export const getRapportMensuel = async (req: Request, res: Response) => {
  try {
    const { mois, annee } = req.query;

    // Validation
    if (!mois || !annee) {
      return res.status(400).json({
        success: false,
        error: 'Le mois et l\'année sont requis',
      });
    }

    const moisNum = parseInt(mois as string);
    const anneeNum = parseInt(annee as string);

    // Valider le mois
    if (moisNum < 1 || moisNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Le mois doit être entre 1 et 12',
      });
    }

    const rapport = await rapportService.getRapportMensuel(moisNum, anneeNum);

    res.status(200).json({
      success: true,
      data: rapport,
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du rapport mensuel:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
    });
  }
};

export default {
  getRapportFinancier,
  getBilanComptable,
  getRapportSalaires,
  getRapportMensuel,
};
