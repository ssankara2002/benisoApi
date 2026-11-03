import { Request, Response } from 'express';
import {
  toggleTrimestreValidation,
  calculerMoyenneGenerale,
  verifierExclusion,
  determinerDecision,
  appliquerDecision,
  traiterPassagesClasse
} from '../Services/decisionPassage.service';

/**
 * Invalider ou valider un trimestre
 */
export const invaliderTrimestre = async (req: Request, res: Response) => {
  try {
    const { trimestreId } = req.params;
    const { invalide } = req.body;

    const trimestre = await toggleTrimestreValidation(
      parseInt(trimestreId),
      invalide
    );

    res.status(200).json({
      success: true,
      message: invalide ? 'Trimestre invalidé' : 'Trimestre validé',
      data: trimestre
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du trimestre',
      error: error.message
    });
  }
};

/**
 * Calculer la moyenne générale d'un élève
 */
export const getMoyenneGenerale = async (req: Request, res: Response) => {
  try {
    const { eleveId, anneeId, classeId } = req.params;

    const moyenne = await calculerMoyenneGenerale(
      parseInt(eleveId),
      parseInt(anneeId),
      parseInt(classeId)
    );

    res.status(200).json({
      success: true,
      data: {
        moyenneGenerale: moyenne
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de la moyenne',
      error: error.message
    });
  }
};

/**
 * Vérifier si un élève peut être exclu
 */
export const checkExclusion = async (req: Request, res: Response) => {
  try {
    const { eleveId, inscriptionId } = req.params;

    const resultat = await verifierExclusion(
      parseInt(eleveId),
      parseInt(inscriptionId)
    );

    res.status(200).json({
      success: true,
      data: resultat
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
};

/**
 * Obtenir la décision de passage pour un élève
 */
export const getDecisionPassage = async (req: Request, res: Response) => {
  try {
    const { inscriptionId } = req.params;

    const decision = await determinerDecision(parseInt(inscriptionId));

    res.status(200).json({
      success: true,
      data: decision
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la détermination de la décision',
      error: error.message
    });
  }
};

/**
 * Appliquer manuellement une décision de passage
 */
export const setDecisionPassage = async (req: Request, res: Response) => {
  try {
    const { inscriptionId } = req.params;
    const { decision, moyenneGenerale } = req.body;

    const inscription = await appliquerDecision(
      parseInt(inscriptionId),
      decision,
      parseFloat(moyenneGenerale)
    );

    res.status(200).json({
      success: true,
      message: 'Décision appliquée avec succès',
      data: inscription
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'application de la décision',
      error: error.message
    });
  }
};

/**
 * Traiter automatiquement les passages pour toute une classe
 */
export const traiterPassages = async (req: Request, res: Response) => {
  try {
    const { classeId, anneeId } = req.params;

    const resultats = await traiterPassagesClasse(
      parseInt(classeId),
      parseInt(anneeId)
    );

    res.status(200).json({
      success: true,
      message: `${resultats.length} élèves traités`,
      data: resultats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement des passages',
      error: error.message
    });
  }
};
