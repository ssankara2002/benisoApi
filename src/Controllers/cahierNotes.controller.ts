import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generatePageGardePDF, generateListeElevesPDF } from '../Services/cahierNotes.service';

const prisma = new PrismaClient();

// Récupérer les informations pour le cahier de notes d'un professeur
export const getCahierNotesByStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, anneeId, classeId } = req.params;

    // Récupérer les informations du professeur
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(staffId) },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (!staff) {
      res.status(404).json({ success: false, message: 'Professeur introuvable' });
      return;
    }

    // Récupérer l'année scolaire
    const annee = await prisma.annee.findUnique({
      where: { id: parseInt(anneeId) }
    });

    if (!annee) {
      res.status(404).json({ success: false, message: 'Année scolaire introuvable' });
      return;
    }

    // Récupérer la classe
    const classe = await prisma.classe.findUnique({
      where: { id: parseInt(classeId) },
      include: {
        niveau: true
      }
    });

    if (!classe) {
      res.status(404).json({ success: false, message: 'Classe introuvable' });
      return;
    }

    // Récupérer les matières enseignées par le prof dans cette classe pour cette année
    const enseignements = await prisma.enseignementAnnee.findMany({
      where: {
        staffId: parseInt(staffId),
        classeId: parseInt(classeId),
        anneeId: parseInt(anneeId)
      },
      include: {
        matiere: true
      }
    });

    // Récupérer les coefficients pour chaque matière
    const matieresAvecCoef = await Promise.all(
      enseignements.map(async (ens) => {
        // Chercher d'abord par niveau
        const coefNiveau = await prisma.coeficientNiveau.findFirst({
          where: {
            niveauId: classe.niveauId,
            matiereId: ens.matiereId
          }
        });

        return {
          id: ens.matiere.id,
          libelle: ens.matiere.libelle,
          coefficient: coefNiveau?.valeur || 1,
          volumeHoraire: ens.volumeHoraire || 0
        };
      })
    );

    // Récupérer les élèves inscrits dans cette classe pour cette année
    const inscriptions = await prisma.inscription.findMany({
      where: {
        classeId: parseInt(classeId),
        anneeId: parseInt(anneeId)
      },
      include: {
        eleve: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        }
      },
      orderBy: {
        eleve: {
          user: {
            nom: 'asc'
          }
        }
      }
    });

    const eleves = inscriptions.map(insc => ({
      id: insc.eleve.id,
      nom: insc.eleve.user.nom,
      prenom: insc.eleve.user.prenom,
      matricule: insc.eleve.matricule
    }));

    res.status(200).json({
      success: true,
      data: {
        professeur: {
          nom: staff.user.nom,
          prenom: staff.user.prenom
        },
        annee: {
          dateDebut: annee.dateDebut,
          dateFin: annee.dateFin
        },
        classe: {
          nom: classe.nom,
          niveau: classe.niveau.nomNiveau
        },
        matieres: matieresAvecCoef,
        eleves: eleves
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du cahier de notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cahier de notes',
      error: error.message
    });
  }
};

// Récupérer tous les enseignants d'une classe pour une année
export const getStaffByClasseAndAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anneeId, classeId } = req.params;

    const enseignements = await prisma.enseignementAnnee.findMany({
      where: {
        classeId: parseInt(classeId),
        anneeId: parseInt(anneeId)
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        }
      },
      distinct: ['staffId']
    });

    const staffList = enseignements.map(ens => ({
      id: ens.staff.id,
      nom: ens.staff.user.nom,
      prenom: ens.staff.user.prenom
    }));

    res.status(200).json({
      success: true,
      data: staffList
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des enseignants',
      error: error.message
    });
  }
};

// Récupérer toutes les classes d'un professeur pour une année
export const getClassesByStaffAndAnnee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, anneeId } = req.params;

    const enseignements = await prisma.enseignementAnnee.findMany({
      where: {
        staffId: parseInt(staffId),
        anneeId: parseInt(anneeId)
      },
      include: {
        classe: {
          include: {
            niveau: true
          }
        }
      },
      distinct: ['classeId']
    });

    const classes = enseignements.map(ens => ({
      id: ens.classe.id,
      nom: ens.classe.nom,
      niveau: ens.classe.niveau.nomNiveau
    }));

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des classes',
      error: error.message
    });
  }
};

// Générer le PDF de la page de garde
export const generatePageGardePDFController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, anneeId, classeId } = req.params;

    const fileName = await generatePageGardePDF(
      parseInt(staffId),
      parseInt(anneeId),
      parseInt(classeId)
    );

    res.status(200).json({
      success: true,
      message: 'PDF de la page de garde généré avec succès',
      data: {
        fileName: fileName,
        downloadUrl: `/api/uploads/cahiers/${fileName}`
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
      error: error.message
    });
  }
};

// Générer le PDF de la liste des élèves
export const generateListeElevesPDFController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, anneeId, classeId } = req.params;

    const fileName = await generateListeElevesPDF(
      parseInt(staffId),
      parseInt(anneeId),
      parseInt(classeId)
    );

    res.status(200).json({
      success: true,
      message: 'PDF de la liste des élèves généré avec succès',
      data: {
        fileName: fileName,
        downloadUrl: `/api/uploads/cahiers/${fileName}`
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF',
      error: error.message
    });
  }
};
