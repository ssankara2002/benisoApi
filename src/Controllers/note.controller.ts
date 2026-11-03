import { Request, Response } from 'express';
import noteService from '../Services/note.service';

export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await noteService.getAllNotes();
    res.status(200).json({ success: true, data: notes });
  } catch (error: any) {
    console.log(error);
    
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des notes', error: error.message });
  }
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await noteService.getNoteById(parseInt(id));

    if (!note) {
      res.status(404).json({ success: false, message: 'Note introuvable' });
      return;
    }

    res.status(200).json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la note', error: error.message });
  }
};

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { valeur, eleveId, evaluationId } = req.body;

    if (!eleveId || !evaluationId) {
      res.status(400).json({ success: false, message: 'Les champs eleveId et evaluationId sont obligatoires' });
      return;
    }

    if (valeur === undefined || valeur === null) {
      res.status(400).json({ success: false, message: 'Le champ valeur est obligatoire' });
      return;
    }

    const noteData = { valeur: parseFloat(valeur), eleveId: parseInt(eleveId), evaluationId: parseInt(evaluationId) };
    const newNote = await noteService.createNote(noteData);

    res.status(201).json({ success: true, message: 'Note créée avec succès', data: newNote });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Élève ou évaluation introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la note', error: error.message });
    }
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { valeur, eleveId, evaluationId } = req.body;

    const noteData: any = {};
    if (valeur !== undefined) noteData.valeur = parseFloat(valeur);
    if (eleveId !== undefined) noteData.eleveId = parseInt(eleveId);
    if (evaluationId !== undefined) noteData.evaluationId = parseInt(evaluationId);

    const updatedNote = await noteService.updateNote(parseInt(id), noteData);

    res.status(200).json({ success: true, message: 'Note mise à jour avec succès', data: updatedNote });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Note introuvable' });
    } else if (error.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Élève ou évaluation introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la note', error: error.message });
    }
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await noteService.deleteNote(parseInt(id));

    res.status(200).json({ success: true, message: 'Note supprimée avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Note introuvable' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la note', error: error.message });
    }
  }
};

export const getNotesByEleve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eleveId } = req.params;
    const notes = await noteService.getNotesByEleve(parseInt(eleveId));

    res.status(200).json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des notes de l\'élève', error: error.message });
  }
};

export const getNotesByEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { evaluationId } = req.params;
    const notes = await noteService.getNotesByEvaluation(parseInt(evaluationId));

    res.status(200).json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des notes de l\'évaluation', error: error.message });
  }
};

export const getNotesByMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matiereId } = req.params;
    const notes = await noteService.getNotesByMatiere(parseInt(matiereId));

    res.status(200).json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des notes de la matière', error: error.message });
  }
};

export const getStatistiquesNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { evaluationId } = req.params;
    const stats = await noteService.getStatistiquesNotes(parseInt(evaluationId));

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques', error: error.message });
  }
};

export const getNotesByEleveGroupedByMatiere = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eleveId } = req.params;
    const { anneeId } = req.query;

    const notes = await noteService.getNotesByEleveGroupedByMatiere(
      parseInt(eleveId),
      anneeId ? parseInt(anneeId as string) : undefined
    );

    res.status(200).json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes par matière',
      error: error.message
    });
  }
};