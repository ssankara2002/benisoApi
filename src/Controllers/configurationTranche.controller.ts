import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer ou mettre à jour la configuration des tranches pour un niveau
export const configurerTranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId, tranches } = req.body;

    if (!niveauId || !tranches || !Array.isArray(tranches)) {
      res.status(400).json({
        success: false,
        message: 'niveauId et tranches (tableau) sont obligatoires'
      });
      return;
    }

    // Vérifier que le niveau existe
    const niveau = await prisma.niveau.findUnique({
      where: { id: parseInt(niveauId) }
    });

    if (!niveau) {
      res.status(404).json({
        success: false,
        message: 'Niveau introuvable'
      });
      return;
    }

    // Vérifier que la scolarité est définie
    if (!niveau.scolarite) {
      res.status(400).json({
        success: false,
        message: 'La scolarité du niveau doit être définie avant de configurer les tranches'
      });
      return;
    }

    // Valider chaque tranche
    for (let i = 0; i < tranches.length; i++) {
      const tranche = tranches[i];

      // Vérifier que le montant est positif
      if (!tranche.montant || parseInt(tranche.montant) <= 0) {
        res.status(400).json({
          success: false,
          message: `La tranche ${i + 1} doit avoir un montant positif`
        });
        return;
      }

      // Vérifier les dates si elles sont fournies
      if (tranche.dateDebut && tranche.dateFin) {
        const dateDebut = new Date(tranche.dateDebut);
        const dateFin = new Date(tranche.dateFin);

        // Vérifier que la date de fin est supérieure à la date de début
        if (dateFin <= dateDebut) {
          res.status(400).json({
            success: false,
            message: `La date de fin de la tranche ${i + 1} (${tranche.libelle}) doit être supérieure à la date de début`
          });
          return;
        }
      }

      // Vérifier qu'il n'y a pas de chevauchement de dates avec les autres tranches
      for (let j = 0; j < tranches.length; j++) {
        if (i !== j) {
          const autreTranche = tranches[j];

          if (tranche.dateDebut && tranche.dateFin && autreTranche.dateDebut && autreTranche.dateFin) {
            const dateDebut1 = new Date(tranche.dateDebut);
            const dateFin1 = new Date(tranche.dateFin);
            const dateDebut2 = new Date(autreTranche.dateDebut);
            const dateFin2 = new Date(autreTranche.dateFin);

            // Vérifier le chevauchement
            const chevauchement = (
              (dateDebut1 >= dateDebut2 && dateDebut1 < dateFin2) ||
              (dateFin1 > dateDebut2 && dateFin1 <= dateFin2) ||
              (dateDebut1 <= dateDebut2 && dateFin1 >= dateFin2)
            );

            if (chevauchement) {
              res.status(400).json({
                success: false,
                message: `Les périodes de la tranche ${i + 1} (${tranche.libelle}) et de la tranche ${j + 1} (${autreTranche.libelle}) se chevauchent`
              });
              return;
            }
          }
        }
      }
    }

    // Calculer le total des montants des tranches
    const totalTranches = tranches.reduce((sum: number, tranche: any) => {
      return sum + parseInt(tranche.montant);
    }, 0);

    // Vérifier que le total ne dépasse pas la scolarité
    if (totalTranches > niveau.scolarite) {
      res.status(400).json({
        success: false,
        message: `Le total des tranches (${totalTranches}) ne peut pas dépasser la scolarité du niveau (${niveau.scolarite})`,
        totalTranches,
        scolarite: niveau.scolarite
      });
      return;
    }

    // Vérifier que le total est égal à la scolarité (optionnel mais recommandé)
    if (totalTranches < niveau.scolarite) {
      res.status(400).json({
        success: false,
        message: `Le total des tranches (${totalTranches}) doit être égal à la scolarité du niveau (${niveau.scolarite})`,
        totalTranches,
        scolarite: niveau.scolarite
      });
      return;
    }

    // Supprimer les anciennes configurations
    await prisma.configurationTranche.deleteMany({
      where: { niveauId: parseInt(niveauId) }
    });

    // Créer les nouvelles configurations
    const configurationsCreees = await Promise.all(
      tranches.map((tranche: any, index: number) =>
        prisma.configurationTranche.create({
          data: {
            niveauId: parseInt(niveauId),
            numeroTranche: index + 1,
            libelle: tranche.libelle,
            montant: parseInt(tranche.montant),
            dateDebut: tranche.dateDebut ? new Date(tranche.dateDebut) : null,
            dateFin: tranche.dateFin ? new Date(tranche.dateFin) : null
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Configuration des tranches créée avec succès',
      data: configurationsCreees
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la configuration des tranches',
      error: error.message
    });
  }
};

// Récupérer la configuration des tranches d'un niveau
export const getConfigurationTranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId } = req.params;

    // Récupérer le niveau avec ses tranches
    const niveau = await prisma.niveau.findUnique({
      where: { id: parseInt(niveauId) },
      include: {
        configurationTranches: {
          orderBy: { numeroTranche: 'asc' }
        }
      }
    });

    if (!niveau) {
      res.status(404).json({
        success: false,
        message: 'Niveau introuvable'
      });
      return;
    }

    const configurations = niveau.configurationTranches;

    // Calculer le total des tranches
    const totalTranches = configurations.reduce((sum, t) => sum + t.montant, 0);

    res.status(200).json({
      success: true,
      data: {
        niveau: {
          id: niveau.id,
          nomNiveau: niveau.nomNiveau,
          scolarite: niveau.scolarite
        },
        tranches: configurations,
        totalTranches,
        nombreTranches: configurations.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
      error: error.message
    });
  }
};

// Récupérer toutes les configurations de tranches (par niveau)
export const getAllConfigurationsTranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const configurations = await prisma.niveau.findMany({
      include: {
        configurationTranches: {
          orderBy: { numeroTranche: 'asc' }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: configurations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des configurations',
      error: error.message
    });
  }
};

// Supprimer la configuration des tranches d'un niveau
export const supprimerConfigurationTranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { niveauId } = req.params;

    await prisma.configurationTranche.deleteMany({
      where: { niveauId: parseInt(niveauId) }
    });

    res.status(200).json({
      success: true,
      message: 'Configuration supprimée avec succès'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la configuration',
      error: error.message
    });
  }
};
