import { Request, Response } from 'express';
import matiereService from '../Services/matiere.service';

// Liste des matières suggérées par type
const MATIERES_PAR_TYPE: Record<string, string[]> = {
  'MATIERES LITTERAIRES': [
    'Français',
    'Anglais',
    'Espagnol',
    'Allemand',
    'Histoire-Géographie',
    'Philosophie',
    'Autre'
  ],
  'MATIERES SCIENTIFIQUES': [
    'Mathématiques',
    'Physique',
    'Chimie',
    'SVT',
    'Biologie',
    'Sciences Physiques',
    'Informatique',
    'Autre'
  ],
  'AUTRES': [
    'Education Physique et Sportive',
    'Education Civique et Culture Religieuse',
    'Arts Plastiques',
    'Musique',
    'Autre'
  ]
};

export const getAllMatieres = async (req: Request, res: Response): Promise<void> => {
  try {
    const matieres = await matiereService.getAllMatieres();
    res.status(200).json({ success: true, data: matieres });
  } catch (error: any) {
    console.log(error);
    
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des matières', error: error.message });
  }
};

export const getMatiereById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const matiere = await matiereService.getMatiereById(parseInt(id));

    if (!matiere) {
      res.status(404).json({ success: false, message: 'Matière introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: matiere });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la matière', error: error.message });
  }
};

export const createMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { libelle, type, typeMatiereId } = req.body;

    console.log('📥 Données reçues dans le contrôleur:', req.body);

    if (!libelle) {
      res.status(400).json({ success: false, message: 'Le champ libelle est obligatoire' });
      return;
    }

    const matiereData = {
      libelle,
      type,
      typeMatiereId: typeMatiereId || null
    };

    console.log('💾 Données à sauvegarder:', matiereData);

    const matiere = await matiereService.createMatiere(matiereData);

    res.status(201).json({ success: true, message: 'Matière créée avec succès', data: matiere });
  } catch (error: any) {
    // P2002 = Erreur de contrainte unique (doublon)
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà.'
      });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la création de la matière' });
    }
  }
};

export const updateMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { libelle, type, typeMatiereId } = req.body;

    const matiereData = {
      libelle,
      type,
      typeMatiereId: typeMatiereId || null
    };

    const matiere = await matiereService.updateMatiere(parseInt(id), matiereData);

    res.status(200).json({ success: true, message: 'Matière mise à jour avec succès', data: matiere });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Matière introuvable' });
    } else if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà.'
      });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la mise à jour de la matière' });
    }
  }
};

export const deleteMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await matiereService.deleteMatiere(parseInt(id));

    res.status(200).json({ success: true, message: 'Matière supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Matière introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette matière. Elle possède des données associées (coefficients, évaluations, etc.). Veuillez d\'abord supprimer ces données.'
      });
    } else if (error.message && error.message.includes('Impossible de supprimer')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Erreur lors de la suppression de la matière' });
    }
  }
};

export const addEleveToMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eleveId } = req.body;

    if (!eleveId) {
      res.status(400).json({ success: false, message: 'Le champ eleveId est obligatoire' });
      return;
    }

    const matiere = await matiereService.addEleveToMatiere(parseInt(id), eleveId);
    res.status(200).json({ success: true, message: 'Élève ajouté à la matière avec succès', data: matiere });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Matière ou élève introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de l\'élève', error: error.message });
    }
  }
};

export const removeEleveFromMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eleveId } = req.body;

    if (!eleveId) {
      res.status(400).json({ success: false, message: 'Le champ eleveId est obligatoire' });
      return;
    }

    const matiere = await matiereService.removeEleveFromMatiere(parseInt(id), eleveId);
    res.status(200).json({ success: true, message: 'Élève retiré de la matière avec succès', data: matiere });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Matière ou élève introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors du retrait de l\'élève', error: error.message });
    }
  }
};

export const getMatieresSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { typeMatiere } = req.query;

    if (!typeMatiere || typeof typeMatiere !== 'string') {
      res.status(400).json({ success: false, message: 'Le paramètre typeMatiere est obligatoire' });
      return;
    }

    const suggestions = MATIERES_PAR_TYPE[typeMatiere] || ['Autre'];
    res.status(200).json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des suggestions', error: error.message });
  }
};