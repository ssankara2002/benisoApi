import { Request, Response } from 'express';
import niveauService from '../Services/niveau.service';

export const getAllNiveaux = async (req: Request, res: Response): Promise<void> => {
  try {
    const niveaux = await niveauService.getAllNiveaux();
    res.status(200).json({ success: true, data: niveaux });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des niveaux', error: error.message });
  }
};

export const getNiveauById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const niveau = await niveauService.getNiveauById(parseInt(id));

    if (!niveau) {
      res.status(404).json({ success: false, message: 'Niveau introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: niveau });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du niveau', error: error.message });
  }
};

export const createNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nomNiveau, effectif, cycle, scolarite, typeEnseignementId } = req.body;

    if (!nomNiveau) {
      res.status(400).json({ success: false, message: 'Le champ nomNiveau est obligatoire' });
      return;
    }

    const niveauData = {
      nomNiveau,
      effectif,
      cycle,
      scolarite: scolarite ? parseInt(scolarite) : undefined,
      typeEnseignementId: typeEnseignementId ? parseInt(typeEnseignementId) : undefined
    };
    const niveau = await niveauService.createNiveau(niveauData);

    res.status(201).json({ success: true, message: 'Niveau créé avec succès', data: niveau });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création du niveau', error: error.message });
  }
};

export const updateNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nomNiveau, effectif, cycle, scolarite, typeEnseignementId } = req.body;

    const niveauData = {
      nomNiveau,
      effectif,
      cycle,
      scolarite: scolarite ? parseInt(scolarite) : undefined,
      typeEnseignementId: typeEnseignementId ? parseInt(typeEnseignementId) : undefined
    };
    const niveau = await niveauService.updateNiveau(parseInt(id), niveauData);

    res.status(200).json({ success: true, message: 'Niveau mis à jour avec succès', data: niveau });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Niveau introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du niveau', error: error.message });
    }
  }
};

export const deleteNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await niveauService.deleteNiveau(parseInt(id));

    res.status(200).json({ success: true, message: 'Niveau supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Niveau introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression du niveau', error: error.message });
    }
  }
};

export const getPlacesDisponiblesByNiveau = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const placesDisponibles = await niveauService.getPlacesDisponiblesByNiveau(parseInt(id));

    res.status(200).json({ success: true, data: placesDisponibles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des places disponibles', error: error.message });
  }
};