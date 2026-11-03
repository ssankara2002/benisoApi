import { Request, Response } from 'express';
import contactService from '../Services/contact.service';

export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await contactService.getAllContacts();
    res.status(200).json({ success: true, data: contacts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des contacts', error: error.message });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContactById(parseInt(id));

    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du contact', error: error.message });
  }
};

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, prenom, email, typeSujet, message } = req.body;
    const userId = (req as any).user?.userId; // Récupère l'ID de l'utilisateur connecté (optionnel)

    if (!nom || !email) {
      res.status(400).json({ success: false, message: 'Les champs nom et email sont obligatoires' });
      return;
    }

    const contactData = { nom, prenom, email, typeSujet, message, userId: userId || undefined };
    const contact = await contactService.createContact(contactData);

    res.status(201).json({ success: true, message: 'Contact créé avec succès', data: contact });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création du contact', error: error.message });
    }
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, typeSujet, message } = req.body;
    const userId = (req as any).user?.userId; // Récupère l'ID de l'utilisateur connecté (optionnel)

    const contactData = { nom, prenom, email, typeSujet, message, userId: userId || undefined };
    const contact = await contactService.updateContact(parseInt(id), contactData);

    res.status(200).json({ success: true, message: 'Contact mis à jour avec succès', data: contact });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Contact introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du contact', error: error.message });
    }
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(parseInt(id));

    res.status(200).json({ success: true, message: 'Contact supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Contact introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression du contact', error: error.message });
    }
  }
};

export const getContactsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { typeSujet } = req.params;
    const contacts = await contactService.getContactsByType(typeSujet);

    res.status(200).json({ success: true, data: contacts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des contacts par type', error: error.message });
  }
};