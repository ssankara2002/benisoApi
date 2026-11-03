import { Request, Response, NextFunction } from 'express';
import licenceService from '../Services/licence.service';

/**
 * Interface pour les requêtes avec licence
 */
export interface LicenceRequest extends Request {
  licence?: {
    id: number;
    cleApi: string;
    nomEcole: string;
    emailContact: string;
    dateExpiration: Date;
  };
}

/**
 * Middleware pour vérifier la validité de la licence API
 * La clé API doit être fournie dans le header X-API-Key
 */
export const verifierLicenceMiddleware = async (
  req: LicenceRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer la clé API depuis le header
    const cleApi = req.header('X-API-Key');

    if (!cleApi) {
      res.status(401).json({
        success: false,
        message: 'Clé API manquante. Veuillez fournir une clé API valide dans le header X-API-Key.',
      });
      return;
    }

    // Vérifier la validité de la licence
    const resultat = await licenceService.verifierLicence(cleApi);

    if (!resultat.valide) {
      res.status(403).json({
        success: false,
        message: resultat.message,
        details: resultat.licence ? {
          nomEcole: resultat.licence.nomEcole,
          dateExpiration: resultat.licence.dateExpiration,
          estActif: resultat.licence.estActif,
        } : undefined,
      });
      return;
    }

    // Ajouter les informations de licence à la requête
    if (resultat.licence) {
      req.licence = {
        id: resultat.licence.id,
        cleApi: resultat.licence.cleApi,
        nomEcole: resultat.licence.nomEcole,
        emailContact: resultat.licence.emailContact,
        dateExpiration: resultat.licence.dateExpiration,
      };
    }

    next();
  } catch (error: any) {
    console.error('Erreur lors de la vérification de la licence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la licence',
      error: error.message,
    });
  }
};

/**
 * Middleware optionnel pour vérifier la licence uniquement si fournie
 * Ne bloque pas si la clé API n'est pas fournie
 */
export const verifierLicenceOptionnelle = async (
  req: LicenceRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cleApi = req.header('X-API-Key');

    // Si pas de clé API, continuer sans vérification
    if (!cleApi) {
      next();
      return;
    }

    // Si clé API fournie, la vérifier
    const resultat = await licenceService.verifierLicence(cleApi);

    if (resultat.valide && resultat.licence) {
      req.licence = {
        id: resultat.licence.id,
        cleApi: resultat.licence.cleApi,
        nomEcole: resultat.licence.nomEcole,
        emailContact: resultat.licence.emailContact,
        dateExpiration: resultat.licence.dateExpiration,
      };
    }

    next();
  } catch (error: any) {
    console.error('Erreur lors de la vérification optionnelle de la licence:', error);
    next(); // Continuer même en cas d'erreur pour ce middleware optionnel
  }
};
