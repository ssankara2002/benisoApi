import { Request, Response } from 'express';
import licenceService from '../Services/licence.service';

/**
 * Crée une nouvelle licence
 */
export const creerLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nomEcole, emailContact, telephoneContact } = req.body;

    if (!nomEcole || !emailContact) {
      res.status(400).json({
        success: false,
        message: 'Le nom de l\'école et l\'email de contact sont requis',
      });
      return;
    }

    const licence = await licenceService.creerLicence(nomEcole, emailContact, telephoneContact);

    res.status(201).json({
      success: true,
      message: 'Licence créée avec succès',
      data: licence,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la licence',
    });
  }
};

/**
 * Récupère toutes les licences
 */
export const recupererLicences = async (_req: Request, res: Response): Promise<void> => {
  try {
    const licences = await licenceService.recupererLicences();

    res.status(200).json({
      success: true,
      data: licences,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des licences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des licences',
    });
  }
};

/**
 * Récupère une licence par son ID
 */
export const recupererLicenceParId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const licence = await licenceService.recupererLicenceParId(parseInt(id));

    if (!licence) {
      res.status(404).json({
        success: false,
        message: 'Licence introuvable',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: licence,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la licence',
    });
  }
};

/**
 * Vérifie la validité d'une licence
 */
export const verifierLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cleApi } = req.body;

    if (!cleApi) {
      res.status(400).json({
        success: false,
        message: 'La clé API est requise',
      });
      return;
    }

    const resultat = await licenceService.verifierLicence(cleApi);

    if (!resultat.valide) {
      res.status(403).json({
        success: false,
        message: resultat.message,
        data: resultat.licence,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: resultat.message,
      data: resultat.licence,
    });
  } catch (error: any) {
    console.error('Erreur lors de la vérification de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la vérification de la licence',
    });
  }
};

/**
 * Renouvelle une licence
 */
export const renouvelerLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const licence = await licenceService.renouvelerLicence(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Licence renouvelée avec succès',
      data: licence,
    });
  } catch (error: any) {
    console.error('Erreur lors du renouvellement de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du renouvellement de la licence',
    });
  }
};

/**
 * Désactive une licence
 */
export const desactiverLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const licence = await licenceService.desactiverLicence(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Licence désactivée avec succès',
      data: licence,
    });
  } catch (error: any) {
    console.error('Erreur lors de la désactivation de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la désactivation de la licence',
    });
  }
};

/**
 * Réactive une licence
 */
export const reactiverLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const licence = await licenceService.reactiverLicence(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Licence réactivée avec succès',
      data: licence,
    });
  } catch (error: any) {
    console.error('Erreur lors de la réactivation de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la réactivation de la licence',
    });
  }
};

/**
 * Supprime une licence
 */
export const supprimerLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await licenceService.supprimerLicence(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Licence supprimée avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de la licence',
    });
  }
};

/**
 * Modifie les informations d'une licence
 */
export const modifierLicence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nomEcole, emailContact, telephoneContact } = req.body;

    const licence = await licenceService.modifierLicence(parseInt(id), {
      nomEcole,
      emailContact,
      telephoneContact,
    });

    res.status(200).json({
      success: true,
      message: 'Licence modifiée avec succès',
      data: licence,
    });
  } catch (error: any) {
    console.error('Erreur lors de la modification de la licence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la modification de la licence',
    });
  }
};
