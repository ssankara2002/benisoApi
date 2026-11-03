import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import inscriptionEleveService from '../Services/inscription-eleve.service';

/**
 * Controller pour gérer les inscriptions d'élèves avec paiement
 */
class InscriptionEleveController {
  /**
   * Inscrire un élève existant avec paiement
   * POST /api/inscriptions/eleve
   *
   * Body:
   * {
   *   "eleveId": 1,      // Optionnel si l'utilisateur est un élève (auto-détecté)
   *   "niveauId": 1,
   *   "anneeId": 1,      // Optionnel (année en cours auto-détectée)
   *   "montant": 50000,
   *   "modePaiement": "espece" | "electronique",
   *   "paymentMethod": "mtn_benin", // Si electronique
   *   "phoneNumber": "+22997123456", // Si electronique
   *   "country": "BJ" // Si electronique
   * }
   */
  async inscrireEleve(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        eleveId,
        niveauId,
        anneeId,
        montant,
        typePaiement,
        modePaiement,
        paymentProvider,
        paymentMethod,
        phoneNumber,
        country,
        transactionId,
        currency,
        description,
        notifyUrl,
        returnUrl,
        channels,
        lang,
        metadata,
        invoice_data,
        lock_phone_number,
        customer_id,
        customer_name,
        customer_surname,
        customer_phone_number,
        customer_email,
        customer_address,
        customer_city,
        customer_country,
        customer_state,
        customer_zip_code,
      } = req.body;

      // Récupérer l'utilisateur connecté
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
      }

      // Validation des champs requis de base
      if (!montant || !modePaiement) {
        return res.status(400).json({
          success: false,
          message: 'Montant et mode de paiement sont obligatoires',
        });
      }

      // Appeler le service d'inscription avec le userId pour auto-détection
      const result = await inscriptionEleveService.inscrireEleveAvecPaiement({
        userId,
        eleveId: eleveId ? parseInt(eleveId) : undefined,
        niveauId: niveauId ? parseInt(niveauId) : undefined,
        anneeId: anneeId ? parseInt(anneeId) : undefined,
        montant: parseFloat(montant),
        typePaiement: typePaiement || 'COMPLET',
        modePaiement,
        paymentProvider,
        paymentMethod,
        phoneNumber,
        country,
        transactionId,
        currency,
        description,
        notifyUrl,
        returnUrl,
        channels,
        lang,
        metadata,
        invoice_data,
        lock_phone_number,
        customer_id,
        customer_name,
        customer_surname,
        customer_phone_number,
        customer_email,
        customer_address,
        customer_city,
        customer_country,
        customer_state,
        customer_zip_code,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error('❌ Erreur dans le controller d\'inscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de l\'inscription',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer les détails d'une inscription
   * GET /api/inscriptions/eleve/:id
   */
  async getInscriptionDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'inscription invalide',
        });
      }

      const inscription = await inscriptionEleveService.getInscriptionDetails(parseInt(id));

      return res.status(200).json({
        success: true,
        data: inscription,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération de l\'inscription:', error);

      if (error.message === 'Inscription introuvable') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message,
      });
    }
  }

  /**
   * Récupérer toutes les inscriptions pour une année
   * GET /api/inscriptions/eleve/annee/:anneeId
   */
  async getInscriptionsByAnnee(req: AuthenticatedRequest, res: Response) {
    try {
      const { anneeId } = req.params;

      if (!anneeId || isNaN(parseInt(anneeId))) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'année invalide',
        });
      }

      const inscriptions = await inscriptionEleveService.getInscriptionsByAnnee(parseInt(anneeId));

      return res.status(200).json({
        success: true,
        data: inscriptions,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des inscriptions:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message,
      });
    }
  }

  /**
   * Assigner une classe à une inscription
   * PUT /api/inscriptions/eleve/:inscriptionId/assigner-classe
   *
   * Body:
   * {
   *   "classeId": 1
   * }
   */
  async assignerClasse(req: AuthenticatedRequest, res: Response) {
    try {
      const { inscriptionId } = req.params;
      const { classeId } = req.body;

      if (!inscriptionId || isNaN(parseInt(inscriptionId))) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'inscription invalide',
        });
      }

      if (!classeId || isNaN(parseInt(classeId))) {
        return res.status(400).json({
          success: false,
          message: 'ID de classe invalide',
        });
      }

      const inscription = await inscriptionEleveService.assignerClasse(
        parseInt(inscriptionId),
        parseInt(classeId)
      );

      return res.status(200).json({
        success: true,
        message: 'Classe assignée avec succès',
        data: inscription,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'assignation de la classe:', error);

      if (error.message.includes('introuvable') || error.message.includes('niveau')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message,
      });
    }
  }

  /**
   * Mettre à jour le statut d'un paiement Moneroo
   * PUT /api/inscriptions/eleve/paiement/:paiementId/status
   *
   * Body:
   * {
   *   "status": "confirmed" | "failed" | "pending",
   *   "txHash": "...",
   *   "blockHeight": 123456
   * }
   */
  async updatePaiementStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { paiementId } = req.params;
      const { status, txHash, blockHeight } = req.body;

      if (!paiementId || isNaN(parseInt(paiementId))) {
        return res.status(400).json({
          success: false,
          message: 'ID de paiement invalide',
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Le statut est obligatoire',
        });
      }

      const paiement = await inscriptionEleveService.updateMonerooPaiementStatus(
        parseInt(paiementId),
        status,
        txHash,
        blockHeight ? parseInt(blockHeight) : undefined
      );

      return res.status(200).json({
        success: true,
        message: 'Statut du paiement mis à jour',
        data: paiement,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message,
      });
    }
  }

  /**
   * Assigner une classe à plusieurs inscriptions
   * PUT /api/inscriptions/eleve/assigner-classe-multiple
   *
   * Body:
   * {
   *   "inscriptionIds": [1, 2, 3],
   *   "classeId": 1
   * }
   */
  async assignerClassePlusieurs(req: AuthenticatedRequest, res: Response) {
    try {
      const { inscriptionIds, classeId } = req.body;

      if (!inscriptionIds || !Array.isArray(inscriptionIds) || inscriptionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La liste des IDs d\'inscription est invalide ou vide',
        });
      }

      if (!classeId || isNaN(parseInt(classeId))) {
        return res.status(400).json({
          success: false,
          message: 'ID de classe invalide',
        });
      }

      const result = await inscriptionEleveService.assignerClassePlusieurs(
        inscriptionIds.map((id: any) => parseInt(id)),
        parseInt(classeId)
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          count: result.count
        },
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'assignation multiple de la classe:', error);

      if (error.message.includes('introuvable') || error.message.includes('niveau') || error.message.includes('place')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message,
      });
    }
  }

  /**
   * Confirmer manuellement un paiement en mode SANDBOX
   * POST /api/inscriptions/eleve/paiement/:paiementId/confirmer
   *
   * Endpoint de test uniquement pour le mode SANDBOX
   * Permet de simuler la confirmation d'un paiement sans notification réelle
   */
  async confirmerPaiementSandbox(req: AuthenticatedRequest, res: Response) {
    try {
      const { paiementId } = req.params;

      if (!paiementId || isNaN(parseInt(paiementId))) {
        return res.status(400).json({
          success: false,
          message: 'ID de paiement invalide',
        });
      }

      const result = await inscriptionEleveService.confirmerPaiementSandbox(
        parseInt(paiementId)
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de la confirmation du paiement:', error);

      if (error.message.includes('PRODUCTION')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('introuvable')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message,
      });
    }
  }

  /**
   * Créer un plan de paiement par tranches
   * POST /api/paiements/plan-tranches
   */
  async creerPlanTranches(req: AuthenticatedRequest, res: Response) {
    try {
      const { inscriptionId, tranches } = req.body;

      if (!inscriptionId || !tranches || !Array.isArray(tranches) || tranches.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'InscriptionId et tranches sont requis',
        });
      }

      const result = await inscriptionEleveService.creerPlanTranches({
        inscriptionId: parseInt(inscriptionId),
        tranches,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du plan:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur serveur',
      });
    }
  }

  /**
   * Payer une tranche
   * POST /api/paiements/payer-tranche
   */
  async payerTranche(req: AuthenticatedRequest, res: Response) {
    try {
      const { inscriptionId, numeroTranche, montant, modePaiement, date, recu, paymentMethod, phoneNumber } =
        req.body;

      if (!inscriptionId || !numeroTranche || !montant || !modePaiement || !date) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs requis doivent être remplis',
        });
      }

      const result = await inscriptionEleveService.payerTranche({
        inscriptionId: parseInt(inscriptionId),
        numeroTranche: parseInt(numeroTranche),
        montant: parseFloat(montant),
        modePaiement,
        date,
        recu,
        paymentMethod,
        phoneNumber,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erreur lors du paiement de la tranche:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur serveur',
      });
    }
  }

  /**
   * Récupérer les statistiques de paiement pour une inscription
   * GET /api/paiements/statistiques/:inscriptionId
   */
  async getStatistiquesTranches(req: AuthenticatedRequest, res: Response) {
    try {
      const { inscriptionId } = req.params;

      if (!inscriptionId || isNaN(parseInt(inscriptionId))) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'inscription invalide',
        });
      }

      const result = await inscriptionEleveService.getStatistiquesTranches(parseInt(inscriptionId));

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur serveur',
      });
    }
  }

  /**
   * Récupérer les infos de l'année précédente d'un élève pour la réinscription
   * GET /api/inscriptions-eleve/eleve/:eleveId/annee-precedente
   */
  async getInfosAnneePrecedente(req: AuthenticatedRequest, res: Response) {
    try {
      const { eleveId } = req.params;

      if (!eleveId || isNaN(parseInt(eleveId))) {
        return res.status(400).json({ success: false, message: 'ID élève invalide' });
      }

      const infos = await inscriptionEleveService.getInfosAnneePrecedente(parseInt(eleveId));

      return res.status(200).json({ success: true, data: infos });
    } catch (error: any) {
      if (error.message?.includes('Aucune inscription')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }

  /**
   * Réinscrire un élève existant pour la nouvelle année scolaire
   * POST /api/inscriptions-eleve/reinscription
   */
  async reinscriptionEleve(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        eleveId,
        anneeId,
        montant,
        typePaiement,
        modePaiement,
        forcerNiveauId,
        paymentProvider,
        paymentMethod,
        phoneNumber,
        country,
        currency,
      } = req.body;

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      }

      if (!montant || !modePaiement) {
        return res.status(400).json({ success: false, message: 'Montant et mode de paiement sont obligatoires' });
      }

      const result = await inscriptionEleveService.reinscriptionEleve({
        userId,
        eleveId: eleveId ? parseInt(eleveId) : undefined,
        anneeId: anneeId ? parseInt(anneeId) : undefined,
        montant: parseFloat(montant),
        typePaiement: typePaiement || 'COMPLET',
        modePaiement,
        forcerNiveauId: forcerNiveauId ? parseInt(forcerNiveauId) : undefined,
        paymentProvider,
        paymentMethod,
        phoneNumber,
        country,
        currency,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message, error: result.error });
      }

      return res.status(201).json({ success: true, message: result.message, data: result.data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  }
}

export default new InscriptionEleveController();
