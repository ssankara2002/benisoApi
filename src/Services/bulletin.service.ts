import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotesByMatiere, MoyenneParType, BulletinData } from '../interface/allInterface';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Fonction pour calculer la moyenne selon les règles
// IMPORTANT: 0 est considéré comme une vraie note (pas une absence de note)
// - Si 3 notes: ((devoir + interro) / 2 + compo) / 2
// - Si 2 notes: (note1 + note2) / 2
// - Si 1 note: la note
// - Si 0 note: 0
const calculerMoyenne = (devoir?: number, interro?: number, compo?: number): number => {
  // Si les trois notes existent: ((devoir + interro) / 2 + compo) / 2
  if (devoir !== undefined && interro !== undefined && compo !== undefined) {
    return (((devoir + interro) / 2) + compo) / 2;
  }

  // Sinon, moyenne des notes disponibles (undefined = pas de note, 0 = note de zéro)
  const notes = [devoir, interro, compo].filter(n => n !== undefined) as number[];
  if (notes.length === 0) return 0;

  return notes.reduce((sum, note) => sum + note, 0) / notes.length;
};

// Fonction pour déterminer l'appréciation selon la moyenne
const getAppreciation = (moyenne: number): string => {
  if (moyenne >= 18) return 'Excellent';
  if (moyenne >= 16) return 'Très bien';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 12) return 'Assez bien';
  if (moyenne >= 10) return 'Passable';
  if (moyenne >= 7) return 'Insuffisant';
  if (moyenne >= 4) return 'Faible';
  return 'Très faible';
};

// Fonction pour récupérer le coefficient d'une matière pour un élève
const getCoeficient = async (matiereId: number, eleveId: number): Promise<number> => {
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      filiere: true,
      inscriptions: {
        include: {
          niveau: true,
          classe: true,
        }
      }
    }
  });

  if (!eleve || !eleve.inscriptions || eleve.inscriptions.length === 0) return 1;

  // Prendre le niveau de l'inscription la plus récente
  const inscription = eleve.inscriptions[eleve.inscriptions.length - 1];
  if (!inscription || !inscription.niveau) return 1;

  // Déterminer si c'est collège (6ème à 3ème) ou lycée (2nde à Terminale)
  const niveauNom = inscription.niveau.nomNiveau.toLowerCase();
  const isCollege = ['6ème', '6eme', '5ème', '5eme', '4ème', '4eme', '3ème', '3eme'].includes(niveauNom);
  const isLycee = ['2nde', '2nd', '1ère', '1ere', 'terminale', 'tle'].includes(niveauNom);

  if (isCollege) {
    // Pour le collège (6ème à 3ème), utiliser CoeficientNiveau
    const coefNiveau = await prisma.coeficientNiveau.findFirst({
      where: {
        matiereId,
        niveauId: inscription.niveauId || 0
      }
    });

    if (coefNiveau) return coefNiveau.valeur;
  }
  else if (isLycee) {
    // Pour le lycée (2nde à Terminale), utiliser CoeficientSerie
    // On cherche la série liée à la filière de l'élève et son niveau
    const serie = await prisma.serie.findFirst({
      where: {
        niveauId: inscription.niveauId || 0
      }
    });

    if (serie) {
      const coefSerie = await prisma.coeficientSerie.findFirst({
        where: {
          matiereId,
          serieId: serie.id
        }
      });

      if (coefSerie) return coefSerie.valeur;
    }

    // Si pas de série trouvée, essayer avec CoeficientNiveau en fallback
    const coefNiveau = await prisma.coeficientNiveau.findFirst({
      where: {
        matiereId,
        niveauId: inscription.niveauId || 0
      }
    });

    if (coefNiveau) return coefNiveau.valeur;
  }

  // Si pas de coefficient trouvé, retourner 1 par défaut
  return 1;
};

// Fonction pour calculer le rang d'un élève dans sa classe
const calculerRang = async (
  eleveId: number,
  classeId: number,
  trimestreId: number,
  moyenneEleve: number
): Promise<{ rang: number; totalEleves: number }> => {
  // Récupérer tous les élèves de la classe
  const elevesClasse = await prisma.eleve.findMany({
    where: { } // classeId removed
  });

  // Calculer la moyenne de chaque élève
  const moyennes: { eleveId: number; moyenne: number }[] = [];

  for (const eleve of elevesClasse) {
    try {
      const bulletinData = await getBulletinDataSimple(eleve.id, trimestreId);
      moyennes.push({
        eleveId: eleve.id,
        moyenne: bulletinData.moyenneGenerale
      });
    } catch (error) {
      // Si un élève n'a pas de notes, on lui donne 0
      moyennes.push({
        eleveId: eleve.id,
        moyenne: 0
      });
    }
  }

  // Trier par moyenne décroissante
  moyennes.sort((a, b) => b.moyenne - a.moyenne);

  // Trouver le rang de l'élève
  const rang = moyennes.findIndex(m => m.eleveId === eleveId) + 1;

  return {
    rang,
    totalEleves: elevesClasse.length
  };
};

// Fonction pour calculer le rang avec statistiques complètes
const calculerRangAvecStats = async (
  eleveId: number,
  classeId: number,
  trimestreId: number,
  moyenneEleve: number
): Promise<{ rang: number; totalEleves: number; meilleureMoyenneClasse: number; moyennePlusBasse: number }> => {
  // Récupérer tous les élèves de la classe
  const elevesClasse = await prisma.eleve.findMany({
    where: { } // classeId removed
  });

  // Calculer la moyenne de chaque élève
  const moyennes: { eleveId: number; moyenne: number }[] = [];

  for (const eleve of elevesClasse) {
    try {
      const bulletinData = await getBulletinDataSimple(eleve.id, trimestreId);
      moyennes.push({
        eleveId: eleve.id,
        moyenne: bulletinData.moyenneGenerale
      });
    } catch (error) {
      // Si un élève n'a pas de notes, on lui donne 0
      moyennes.push({
        eleveId: eleve.id,
        moyenne: 0
      });
    }
  }

  // Trier par moyenne décroissante
  moyennes.sort((a, b) => b.moyenne - a.moyenne);

  // Trouver le rang de l'élève
  const rang = moyennes.findIndex(m => m.eleveId === eleveId) + 1;

  // Meilleure moyenne = première position
  const meilleureMoyenneClasse = moyennes.length > 0 ? moyennes[0].moyenne : 0;

  // Moyenne la plus basse = dernière position
  const moyennePlusBasse = moyennes.length > 0 ? moyennes[moyennes.length - 1].moyenne : 0;

  return {
    rang,
    totalEleves: elevesClasse.length,
    meilleureMoyenneClasse,
    moyennePlusBasse
  };
};

// Fonction pour calculer le rang par type de matière
const calculerRangParType = async (
  eleveId: number,
  classeId: number,
  trimestreId: number,
  typeMatiere: string,
  moyenneEleve: number
): Promise<{ rang: number; totalEleves: number; meilleureMoyenne: number }> => {
  // Récupérer tous les élèves de la classe
  const elevesClasse = await prisma.eleve.findMany({
    where: { } // classeId removed
  });

  // Calculer la moyenne de chaque élève pour ce type de matière
  const moyennes: { eleveId: number; moyenne: number }[] = [];

  for (const eleve of elevesClasse) {
    try {
      const bulletinData = await getBulletinDataSimple(eleve.id, trimestreId);

      // Calculer la moyenne pour ce type de matière
      const notesDuType = bulletinData.notesByMatiere?.filter(
        n => n.typeMatiere === typeMatiere
      ) || [];

      if (notesDuType.length > 0) {
        const sommePonderee = notesDuType.reduce((sum, n) => sum + n.notePonderee, 0);
        const sommeCoef = notesDuType.reduce((sum, n) => sum + n.coef, 0);
        const moyenneType = sommeCoef > 0 ? sommePonderee / sommeCoef : 0;

        moyennes.push({
          eleveId: eleve.id,
          moyenne: moyenneType
        });
      } else {
        moyennes.push({
          eleveId: eleve.id,
          moyenne: 0
        });
      }
    } catch (error) {
      moyennes.push({
        eleveId: eleve.id,
        moyenne: 0
      });
    }
  }

  // Trier par moyenne décroissante
  moyennes.sort((a, b) => b.moyenne - a.moyenne);

  // Trouver le rang de l'élève
  const rang = moyennes.findIndex(m => m.eleveId === eleveId) + 1;

  // La meilleure moyenne est celle du premier élève (après tri)
  const meilleureMoyenne = moyennes.length > 0 ? moyennes[0].moyenne : 0;

  return {
    rang,
    totalEleves: elevesClasse.length,
    meilleureMoyenne
  };
};

// Version simplifiée pour le calcul de rang (évite la récursion infinie)
const getBulletinDataSimple = async (eleveId: number, trimestreId: number) => {
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      user: true,
      inscriptions: {
        include: {
          niveau: true,
        }
      }
    }
  });

  if (!eleve) {
    throw new Error('Élève non trouvé');
  }

  // Déterminer l'année et la classe depuis la dernière inscription
  let classeId: number | null = null;
  let finalAnneeId: number | null = null;

  if (eleve.inscriptions.length > 0) {
    const inscription = eleve.inscriptions[eleve.inscriptions.length - 1];
    finalAnneeId = inscription.anneeId;
    classeId = inscription.classeId;
  }

  if (!finalAnneeId || !classeId) {
    throw new Error('Année ou classe non trouvée pour cet élève');
  }

  // Récupérer toutes les évaluations du trimestre pour la classe de l'élève
  const evaluations = await prisma.evaluation.findMany({
    where: {
      classeId: classeId,
      trimestreId: trimestreId,
      anneeId: finalAnneeId
    },
    include: {
      matiere: {
        include: {
          typeMatiere: true
        }
      },
      notes: {
        where: {
          eleveId: eleveId
        }
      },
      staff: {
        include: {
          user: true
        }
      }
    }
  });

  // Regrouper les notes par matière
  const notesByMatiereMap = new Map<number, {
    matiereLibelle: string;
    typeMatiere: string;
    devoir?: number;
    interro?: number;
    compo?: number;
    nomProf: string;
  }>();

  for (const evaluation of evaluations) {
    const matiereId = evaluation.matiereId;
    const note = evaluation.notes[0]?.valeur;

    // Vérifier que la matière existe
    if (!matiereId || !evaluation.matiere) {
      continue;
    }

    if (!notesByMatiereMap.has(matiereId)) {
      // Récupérer l'enseignant de la matière pour cette classe et cette année
      let nomProf = 'Non assigné';

      if (evaluation.anneeId && evaluation.classeId) {
        const enseignement = await prisma.enseignementAnnee.findFirst({
          where: {
            matiereId: matiereId,
            classeId: evaluation.classeId,
            anneeId: evaluation.anneeId,
          },
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    nom: true,
                    prenom: true,
                  }
                }
              }
            }
          }
        });

        if (enseignement?.staff?.user) {
          nomProf = `M. ${enseignement.staff.user.nom}`;
        }
      } else if (evaluation.staff?.user) {
        // Fallback sur l'ancien système si anneeId ou classeId manquant
        nomProf = `M. ${evaluation.staff.user.nom}`;
      }

      notesByMatiereMap.set(matiereId, {
        matiereLibelle: evaluation.matiere.libelle,
        typeMatiere: evaluation.matiere.typeMatiere?.libelle || 'AUTRES',
        nomProf
      });
    }

    const matiereData = notesByMatiereMap.get(matiereId)!;

    // Assigner la note selon le type d'évaluation
    if (note !== undefined) {
      if (evaluation.type.toLowerCase() === 'devoir') {
        matiereData.devoir = note;
      } else if (evaluation.type.toLowerCase() === 'interro') {
        matiereData.interro = note;
      } else if (evaluation.type.toLowerCase() === 'compo') {
        matiereData.compo = note;
      }
    }
  }

  // Calculer les moyennes par matière
  let sommePonderee = 0;
  let sommeCoef = 0;

  for (const [matiereId, data] of notesByMatiereMap) {
    const moyenne = calculerMoyenne(data.devoir, data.interro, data.compo);
    const coef = await getCoeficient(matiereId, eleveId);
    const notePonderee = moyenne * coef;

    sommePonderee += notePonderee;
    sommeCoef += coef;
  }

  const moyenneGenerale = sommeCoef > 0 ? sommePonderee / sommeCoef : 0;

  // Construire le tableau des notes par matière pour le calcul des rangs par type
  const notesByMatiereArray: NotesByMatiere[] = [];
  for (const [matiereId, data] of notesByMatiereMap) {
    const moyenne = calculerMoyenne(data.devoir, data.interro, data.compo);
    const coef = await getCoeficient(matiereId, eleveId);
    const notePonderee = moyenne * coef;

    notesByMatiereArray.push({
      matiereId,
      matiereLibelle: data.matiereLibelle,
      typeMatiere: data.typeMatiere,
      devoir: data.devoir,
      interro: data.interro,
      compo: data.compo,
      moyenne,
      appreciation: getAppreciation(moyenne),
      coef,
      notePonderee,
      nomProf: data.nomProf
    });
  }

  return { moyenneGenerale, notesByMatiere: notesByMatiereArray };
};

// Service pour récupérer les données complètes du bulletin d'un élève
export const getBulletinData = async (eleveId: number, classeId: number, trimestreId: number, anneeId: number): Promise<BulletinData> => {
  // Récupérer l'élève avec ses informations
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      user: true,
      inscriptions: {
        include: {
          annee: true,
          niveau: true
        }
      }
    }
  });

  if (!eleve) {
    throw new Error('Élève non trouvé');
  }

  // Vérifier que l'élève est bien inscrit dans cette classe et cette année
  const inscription = eleve.inscriptions.find(
    i => i.classeId === classeId && i.anneeId === anneeId
  );

  if (!inscription) {
    throw new Error('Élève non inscrit dans cette classe pour cette année');
  }

  // Récupérer toutes les évaluations du trimestre pour la classe de l'élève
  const evaluations = await prisma.evaluation.findMany({
    where: {
      classeId: classeId,
      trimestreId: trimestreId,
      anneeId: anneeId
    },
    include: {
      matiere: {
        include: {
          typeMatiere: true
        }
      },
      notes: {
        where: {
          eleveId: eleveId
        }
      },
      staff: {
        include: {
          user: true
        }
      }
    }
  });

  // Regrouper les notes par matière
  const notesByMatiereMap = new Map<number, {
    matiereLibelle: string;
    typeMatiere: string;
    devoir?: number;
    interro?: number;
    compo?: number;
    nomProf: string;
  }>();

  for (const evaluation of evaluations) {
    const matiereId = evaluation.matiereId;
    const note = evaluation.notes[0]?.valeur;

    // Vérifier que la matière existe
    if (!matiereId || !evaluation.matiere) {
      continue;
    }

    if (!notesByMatiereMap.has(matiereId)) {
      // Récupérer l'enseignant de la matière pour cette classe et cette année
      let nomProf = 'Non assigné';

      if (evaluation.anneeId && evaluation.classeId) {
        const enseignement = await prisma.enseignementAnnee.findFirst({
          where: {
            matiereId: matiereId,
            classeId: evaluation.classeId,
            anneeId: evaluation.anneeId,
          },
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    nom: true,
                    prenom: true,
                  }
                }
              }
            }
          }
        });

        if (enseignement?.staff?.user) {
          nomProf = `M. ${enseignement.staff.user.nom}`;
        }
      } else if (evaluation.staff?.user) {
        // Fallback sur l'ancien système si anneeId ou classeId manquant
        nomProf = `M. ${evaluation.staff.user.nom}`;
      }

      notesByMatiereMap.set(matiereId, {
        matiereLibelle: evaluation.matiere.libelle,
        typeMatiere: evaluation.matiere.typeMatiere?.libelle || 'AUTRES',
        nomProf
      });
    }

    const matiereData = notesByMatiereMap.get(matiereId)!;

    // Assigner la note selon le type d'évaluation
    if (note !== undefined) {
      if (evaluation.type.toLowerCase() === 'devoir') {
        matiereData.devoir = note;
      } else if (evaluation.type.toLowerCase() === 'interro') {
        matiereData.interro = note;
      } else if (evaluation.type.toLowerCase() === 'compo') {
        matiereData.compo = note;
      }
    }
  }

  // Calculer les moyennes par matière
  const notesByMatiere: NotesByMatiere[] = [];
  let sommePonderee = 0;
  let sommeCoef = 0;

  // Map pour stocker les moyennes par type de matière
  const moyennesParTypeMap = new Map<string, {
    sommePonderee: number;
    sommeCoef: number;
    moyennes: number[];
  }>();

  for (const [matiereId, data] of notesByMatiereMap) {
    const moyenne = calculerMoyenne(data.devoir, data.interro, data.compo);
    const appreciation = getAppreciation(moyenne);
    const coef = await getCoeficient(matiereId, eleveId);
    const notePonderee = moyenne * coef;

    notesByMatiere.push({
      matiereId,
      matiereLibelle: data.matiereLibelle,
      typeMatiere: data.typeMatiere,
      devoir: data.devoir,
      interro: data.interro,
      compo: data.compo,
      moyenne,
      appreciation,
      coef,
      notePonderee,
      nomProf: data.nomProf
    });

    sommePonderee += notePonderee;
    sommeCoef += coef;

    // Grouper par type de matière
    if (!moyennesParTypeMap.has(data.typeMatiere)) {
      moyennesParTypeMap.set(data.typeMatiere, {
        sommePonderee: 0,
        sommeCoef: 0,
        moyennes: []
      });
    }

    const typeData = moyennesParTypeMap.get(data.typeMatiere)!;
    typeData.sommePonderee += notePonderee;
    typeData.sommeCoef += coef;
    typeData.moyennes.push(moyenne);
  }

  const moyenneGenerale = sommeCoef > 0 ? sommePonderee / sommeCoef : 0;

  // Calculer les moyennes par type et les rangs
  const moyennesParType: MoyenneParType[] = [];
  for (const [typeMatiere, data] of moyennesParTypeMap) {
    const moyenneType = data.sommeCoef > 0 ? data.sommePonderee / data.sommeCoef : 0;

    const { rang, totalEleves, meilleureMoyenne } = await calculerRangParType(
      eleveId,
      classeId,
      trimestreId,
      typeMatiere,
      moyenneType
    );

    moyennesParType.push({
      typeMatiere,
      moyenne: moyenneType,
      meilleureMoyenne,
      totalCoef: data.sommeCoef,
      rang,
      totalEleves
    });
  }

  // Trier les matières par type
  notesByMatiere.sort((a, b) => {
    if (a.typeMatiere !== b.typeMatiere) {
      return a.typeMatiere.localeCompare(b.typeMatiere);
    }
    return a.matiereLibelle.localeCompare(b.matiereLibelle);
  });

  // Calculer le rang et récupérer les statistiques de classe
  const { rang, totalEleves, meilleureMoyenneClasse, moyennePlusBasse } = await calculerRangAvecStats(
    eleveId,
    classeId,
    trimestreId,
    moyenneGenerale
  );

  // Récupérer les informations du trimestre
  const trimestre = await prisma.trimestre.findUnique({
    where: { id: trimestreId }
  });

  if (!trimestre) {
    throw new Error('Trimestre non trouvé');
  }

  // Récupérer tous les trimestres dans l'ordre
  const tousLesTrimestres = await prisma.trimestre.findMany({
    orderBy: { id: 'asc' }
  });

  // Trouver l'index du trimestre actuel
  const indexTrimestreActuel = tousLesTrimestres.findIndex(t => t.id === trimestreId);

  // Récupérer les moyennes des trimestres précédents
  const rappelMoyennes: { trimestre1?: number; trimestre2?: number } = {};

  // Si on est au trimestre 2 ou 3, récupérer la moyenne du trimestre 1
  if (indexTrimestreActuel >= 1 && tousLesTrimestres[0]) {
    try {
      const trim1Data = await getBulletinDataSimple(eleveId, tousLesTrimestres[0].id);
      rappelMoyennes.trimestre1 = trim1Data.moyenneGenerale;
    } catch (error) {
      // Pas de données pour le trimestre 1
    }
  }

  // Si on est au trimestre 3, récupérer aussi la moyenne du trimestre 2
  if (indexTrimestreActuel >= 2 && tousLesTrimestres[1]) {
    try {
      const trim2Data = await getBulletinDataSimple(eleveId, tousLesTrimestres[1].id);
      rappelMoyennes.trimestre2 = trim2Data.moyenneGenerale;
    } catch (error) {
      // Pas de données pour le trimestre 2
    }
  }

  // Calculer la moyenne annuelle avec tous les trimestres disponibles
  const moyennesTrimestres: number[] = [moyenneGenerale];
  if (rappelMoyennes.trimestre1 !== undefined) {
    moyennesTrimestres.push(rappelMoyennes.trimestre1);
  }
  if (rappelMoyennes.trimestre2 !== undefined) {
    moyennesTrimestres.push(rappelMoyennes.trimestre2);
  }

  const moyenneAnnuelle = moyennesTrimestres.length > 0
    ? moyennesTrimestres.reduce((sum, moy) => sum + moy, 0) / moyennesTrimestres.length
    : moyenneGenerale;

  // Récupérer les absences de l'élève pour ce trimestre
  const absences = await prisma.absence.findMany({
    where: {
      eleveId: eleveId,
      dateDebut: {
        gte: trimestre.dateDebut || undefined,
        lte: trimestre.dateFin || undefined
      }
    }
  });

  // Calculer le nombre d'heures d'absence
  let heuresJustifiees = 0;
  let heuresNonJustifiees = 0;

  for (const absence of absences) {
    // Calculer la différence en heures entre dateDebut et dateFin
    const heures = Math.ceil((absence.dateFin.getTime() - absence.dateDebut.getTime()) / (1000 * 60 * 60));

    // Si l'absence dure moins d'1h, compter au minimum 1h
    const heuresAbsence = heures > 0 ? heures : 1;

    if (absence.justification) {
      heuresJustifiees += heuresAbsence;
    } else {
      heuresNonJustifiees += heuresAbsence;
    }
  }

  const totalHeures = heuresJustifiees + heuresNonJustifiees;

  // Calculer le retrait de points (0.25 point par heure d'absence non justifiée)
  const retraitPoints = heuresNonJustifiees * 0.25;

  // Le retrait se fait sur le TOTAL DES NOTES PONDEREES
  // Moyenne définitive = (Total notes pondérées - Retrait) / Total coefficients
  const totalNotesPondereesApresRetrait = Math.max(0, sommePonderee - retraitPoints);
  const moyenneDefinitive = sommeCoef > 0 ? totalNotesPondereesApresRetrait / sommeCoef : 0;

  // Get latest inscription data
  const latestInscription = eleve.inscriptions?.[eleve.inscriptions.length - 1];

  // Fetch classe information
  const classe = await prisma.classe.findUnique({
    where: { id: classeId },
    include: {
      niveau: true
    }
  });

  return {
    eleve: {
      nom: eleve.user.nom,
      prenom: eleve.user.prenom,
      niveau: latestInscription?.niveau?.nomNiveau || ''
    },
    classe: {
      id: classe?.id || 0,
      nom: classe?.nom || '',
      niveau: classe?.niveau?.nomNiveau || ''
    },
    trimestre: {
      id: trimestre.id,
      nom: trimestre.nom
    },
    annee: {
      id: latestInscription?.annee?.id || 0,
      libelle: '',
      dateDebut: latestInscription?.annee?.dateDebut || null,
      dateFin: latestInscription?.annee?.dateFin || null
    },
    notesByMatiere,
    moyennesParType,
    moyenneGenerale,
    appreciationGenerale: getAppreciation(moyenneGenerale),
    rang,
    totalEleves,
    meilleureMoyenneClasse,
    moyennePlusBasse,
    moyenneAnnuelle,
    absences: {
      justifiees: heuresJustifiees,
      nonJustifiees: heuresNonJustifiees,
      total: totalHeures,
      retraitPoints: retraitPoints
    },
    moyenneDefinitive,
    rappelMoyennes
  };
};

// Service pour générer le PDF du bulletin
export const generateBulletinPDF = async (
  eleveId: number,
  classeId: number,
  trimestreId: number,
  anneeId: number,
  outputPath?: string
): Promise<string> => {
  const bulletinData = await getBulletinData(eleveId, classeId, trimestreId, anneeId);

  // Récupérer le trimestre
  const trimestre = await prisma.trimestre.findUnique({
    where: { id: trimestreId }
  });

  // Récupérer l'année académique depuis bulletinData
  const anneeText = bulletinData.annee?.dateDebut
    ? `${new Date(bulletinData.annee.dateDebut).getFullYear()}/${new Date(bulletinData.annee.dateFin || '').getFullYear()}`
    : '2023/2024';

  // Créer le document PDF avec marges réduites
  const doc = new PDFDocument({ size: 'A4', margin: 20 });

  // Définir le chemin de sortie
  const fileName = `bulletin_${bulletinData.eleve.nom}_${bulletinData.eleve.prenom}_${trimestre?.nom || 'trimestre'}.pdf`;
  const filePath = outputPath || path.join(__dirname, '../../bulletins', fileName);

  // Créer le dossier si nécessaire
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ===== LOGO ET INFORMATIONS ÉTABLISSEMENT (en haut) =====

  // Logo FNTI à droite
  const logoPath = path.join(process.cwd(), 'assets', 'logo-fnti.png');
  try {
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 490, 20, { width: 60, height: 45 });
    }
  } catch (error) {
    console.log('Logo FNTI non trouvé:', logoPath);
  }

  doc.fontSize(7).font('Helvetica');

  // Informations à gauche
  doc.text('ANNEE INANORO', 25, 25);
  doc.text('01 BP 01 NANORO', 25, 35);
  doc.text('Tél : 72 53 03 37 / 78 62 00 53', 25, 45);
  doc.text('E-mail : ipannanoro84@gmail.com', 25, 55);

  // Slogan en bas du logo
  doc.fontSize(7).font('Helvetica-Oblique');
  doc.text('"L\'Amour des Hommes, du Travail et de la Terre"', 445, 70, { width: 130, align: 'center' });
  doc.font('Helvetica');

  doc.moveDown(1);

  // ===== EN-TÊTE CENTRÉ =====
  const headerY = doc.y;
  doc.fontSize(13).font('Helvetica-Bold');
  doc.text('BULLETIN DE NOTES', 0, headerY, { width: doc.page.width, align: 'center' });

  doc.moveDown(0.1);

  // Formater le texte du trimestre (enlever "Trimestre" si déjà présent dans nom)
  const trimestreText = trimestre?.nom?.includes('Trimestre')
    ? trimestre.nom
    : `${trimestre?.nom || '3'}ème Trimestre`;
  doc.fontSize(9).font('Helvetica');
  doc.text(trimestreText, 0, doc.y, { width: doc.page.width, align: 'center' });
  doc.moveDown(0.2);

  // ===== INFORMATIONS ÉLÈVE =====
  const infoY = doc.y;
  doc.fontSize(7).font('Helvetica');

  // Ligne 1: Année scolaire et Effectif
  doc.text(`Année scolaire: ${anneeText}`, 25, infoY);
  doc.text(`Effectif: ${bulletinData.totalEleves}`, 450, infoY);

  // Ligne 2: Nom de l'élève et Classe redoublée
  doc.font('Helvetica-Bold');
  doc.text(`Nom de l'élève: ${bulletinData.eleve.nom.toUpperCase()} ${bulletinData.eleve.prenom}`, 25, infoY + 10);
  doc.font('Helvetica');
  doc.text(`Classe redoublée:`, 450, infoY + 10);

  // Ligne 3: Né(e) le, Matricule et Classe de (PLUS GRAND)
  doc.text(`Né(e) le`, 25, infoY + 20, { continued: true });
  doc.text(`     Matricule:`, { continued: false });

  doc.font('Helvetica-Bold');
  doc.fontSize(8);
  doc.text(`Classe de: ${bulletinData.eleve.niveau || 'Non spécifiée'}`, 450, infoY + 20);
  doc.font('Helvetica');
  doc.fontSize(7);

  doc.moveDown(1);

  // Grouper les matières par type
  const matieresParType = bulletinData.notesByMatiere.reduce((acc, matiere) => {
    if (!acc[matiere.typeMatiere]) {
      acc[matiere.typeMatiere] = [];
    }
    acc[matiere.typeMatiere].push(matiere);
    return acc;
  }, {} as Record<string, NotesByMatiere[]>);

  // Définir les largeurs de colonnes (à utiliser partout)
  const colWidths = {
    matiere: 140,
    coef: 25,
    interro: 32,
    devoir: 32,
    compo: 32,
    moyenne: 32,
    notePond: 48,
    appreciation: 89
  };

  // Hauteur réduite des lignes pour tenir sur une page
  const rowHeight = 14;
  const headerHeight = 16;
  const sectionTitleHeight = 10;

  // Ordre d'affichage : LITTERAIRES, SCIENTIFIQUES, AUTRES
  const ordreTypes = ['MATIERES LITTERAIRES', 'MATIERES SCIENTIFIQUES', 'AUTRES'];
  const typesOrdonnes = ordreTypes.filter(type => matieresParType[type]);

  // Calculer la hauteur totale du GRAND tableau unique
  let totalTableHeight = headerHeight; // 1 ligne pour les en-têtes
  for (const typeMatiere of typesOrdonnes) {
    const matieres = matieresParType[typeMatiere];
    if (matieres) {
      totalTableHeight += sectionTitleHeight; // Ligne titre section
      totalTableHeight += matieres.length * rowHeight; // Lignes des matières
      totalTableHeight += rowHeight; // Ligne "Total matières X"
      totalTableHeight += rowHeight; // Ligne "Moyenne : ... Rang : ..."
    }
  }

  const bigTableStartY = doc.y;
  const bigTableStartX = 35;
  const bigTableWidth = 530;

  // ===== 1. TRACER LE GRAND RECTANGLE EXTÉRIEUR =====
  doc.rect(bigTableStartX, bigTableStartY, bigTableWidth, totalTableHeight).stroke();

  // ===== 2. TRACER TOUTES LES LIGNES VERTICALES (du haut en bas du tableau) =====
  let verticalX = bigTableStartX;
  // Après colonne Matières
  verticalX += colWidths.matiere;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();
  // Après colonne Coef
  verticalX += colWidths.coef;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();
  // Après colonne Interro
  verticalX += colWidths.interro;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();
  // Après colonne Devoir
  verticalX += colWidths.devoir;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();
  // Après colonne Compo
  verticalX += colWidths.compo;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();
  // Après colonne Moyenne
  verticalX += colWidths.moyenne;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();
  // Après colonne Notes pondérées
  verticalX += colWidths.notePond;
  doc.moveTo(verticalX, bigTableStartY).lineTo(verticalX, bigTableStartY + totalTableHeight).stroke();

  // ===== 3. REMPLIR LE CONTENU LIGNE PAR LIGNE =====
  let currentRowY = bigTableStartY;

  // ===== LIGNE 1: EN-TETES =====
  let xText = bigTableStartX;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('black');
  doc.text('Matieres', xText + 2, currentRowY + 4, { width: colWidths.matiere - 4 });
  xText += colWidths.matiere;
  doc.text('Coef', xText, currentRowY + 4, { width: colWidths.coef, align: 'center' });
  xText += colWidths.coef;
  doc.fontSize(6);
  doc.text('Interro', xText, currentRowY + 2, { width: colWidths.interro, align: 'center' });
  xText += colWidths.interro;
  doc.text('Devoir', xText, currentRowY + 2, { width: colWidths.devoir, align: 'center' });
  xText += colWidths.devoir;
  doc.text('Compo', xText, currentRowY + 2, { width: colWidths.compo, align: 'center' });
  xText += colWidths.compo;
  doc.fontSize(7);
  doc.text('Moyenne', xText, currentRowY + 4, { width: colWidths.moyenne, align: 'center' });
  xText += colWidths.moyenne;
  doc.fontSize(6);
  doc.text('Notes\npondérées', xText, currentRowY + 2, { width: colWidths.notePond, align: 'center' });
  xText += colWidths.notePond;
  doc.fontSize(6);
  doc.text('Appréciations et signatures', xText, currentRowY + 2, { width: colWidths.appreciation, align: 'center' });

  // Ligne horizontale après en-têtes
  currentRowY += headerHeight;
  doc.moveTo(bigTableStartX, currentRowY).lineTo(bigTableStartX + bigTableWidth, currentRowY).stroke();

  // ===== PARCOURIR CHAQUE TYPE DE MATIÈRE =====
  for (const typeMatiere of typesOrdonnes) {
    const matieres = matieresParType[typeMatiere];
    if (!matieres) continue;

    // ===== LIGNE TITRE SECTION (avec fond gris) =====
    const sectionRowY = currentRowY;
    doc.rect(bigTableStartX, sectionRowY, bigTableWidth, sectionTitleHeight).fillAndStroke('#E8E8E8', '#000000');
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('black');
    doc.text(typeMatiere, bigTableStartX, sectionRowY + 2, { width: bigTableWidth, align: 'center' });

    // Ligne horizontale après titre section
    currentRowY += sectionTitleHeight;
    doc.moveTo(bigTableStartX, currentRowY).lineTo(bigTableStartX + bigTableWidth, currentRowY).stroke();

    // ===== LIGNES DES MATIÈRES =====
    for (let i = 0; i < matieres.length; i++) {
      const matiere = matieres[i];
      const matiereRowY = currentRowY;

      // Contenu de la ligne
      xText = bigTableStartX;
      doc.fontSize(7).font('Helvetica').fillColor('black');

      // Matière
      doc.text(matiere.matiereLibelle, xText + 2, matiereRowY + 2, { width: colWidths.matiere - 4 });
      xText += colWidths.matiere;

      // Coef
      doc.text(matiere.coef.toString(), xText, matiereRowY + 2, { width: colWidths.coef, align: 'center' });
      xText += colWidths.coef;

      // Interro
      doc.text(matiere.interro?.toFixed(2) || '', xText, matiereRowY + 2, { width: colWidths.interro, align: 'center' });
      xText += colWidths.interro;

      // Devoir
      doc.text(matiere.devoir?.toFixed(2) || '', xText, matiereRowY + 2, { width: colWidths.devoir, align: 'center' });
      xText += colWidths.devoir;

      // Compo
      doc.text(matiere.compo?.toFixed(2) || '', xText, matiereRowY + 2, { width: colWidths.compo, align: 'center' });
      xText += colWidths.compo;

      // Moyenne
      doc.text(matiere.moyenne.toFixed(2), xText, matiereRowY + 2, { width: colWidths.moyenne, align: 'center' });
      xText += colWidths.moyenne;

      // Note pondérée
      doc.text(matiere.notePonderee.toFixed(2), xText, matiereRowY + 2, { width: colWidths.notePond, align: 'center' });
      xText += colWidths.notePond;

      // Appréciation à gauche
      doc.fontSize(6.5);
      doc.text(matiere.appreciation, xText + 2, matiereRowY + 5, { width: 50, align: 'left', lineBreak: false });

      // Nom du professeur en gras à droite
      doc.fontSize(6).font('Helvetica-Bold');
      doc.text(matiere.nomProf, xText + colWidths.appreciation - 35, matiereRowY + 5, { width: 33, align: 'right' });

      // Ligne horizontale après matière (sauf si dernière ligne du tableau)
      currentRowY += rowHeight;
      if (!(typeMatiere === typesOrdonnes[typesOrdonnes.length - 1] && i === matieres.length - 1)) {
        doc.moveTo(bigTableStartX, currentRowY).lineTo(bigTableStartX + bigTableWidth, currentRowY).stroke();
      }
    }

    // ===== LIGNE TOTAL (DANS LE TABLEAU) =====
    const moyenneType = bulletinData.moyennesParType.find(m => m.typeMatiere === typeMatiere);
    if (moyenneType) {
      // Calculer le total des notes pondérées pour ce type
      const totalNotesPonderees = matieres.reduce((sum, m) => sum + m.notePonderee, 0);

      // Ligne horizontale avant le total
      doc.moveTo(bigTableStartX, currentRowY).lineTo(bigTableStartX + bigTableWidth, currentRowY).stroke();

      // LIGNE 1: Total matières avec coefficient et notes pondérées
      const totalRowY = currentRowY;
      xText = bigTableStartX;
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('black');

      // "Total matières X" dans la colonne matières
      doc.text(`Total matières ${typeMatiere.toLowerCase()}`, xText + 2, totalRowY + 2, { width: colWidths.matiere - 4 });
      xText += colWidths.matiere;

      // Coefficient total dans la colonne coef
      doc.text(`${moyenneType.totalCoef}`, xText, totalRowY + 2, { width: colWidths.coef, align: 'center' });
      xText += colWidths.coef;

      // Sauter les colonnes Interro, Dev, Compo, Moy
      xText += colWidths.interro + colWidths.devoir + colWidths.compo + colWidths.moyenne;

      // Total notes pondérées dans la colonne notes pondérées
      doc.text(`${totalNotesPonderees.toFixed(2)}`, xText, totalRowY + 2, { width: colWidths.notePond, align: 'center' });

      currentRowY += rowHeight;

      // Ligne horizontale après le total
      doc.moveTo(bigTableStartX, currentRowY).lineTo(bigTableStartX + bigTableWidth, currentRowY).stroke();

      // LIGNE 2: Moyenne, Meilleure Moyenne, Rang (DANS LE TABLEAU - CELLULE FUSIONNÉE SANS SEPARATIONS VERTICALES)
      const moyRowY = currentRowY;

      // Remplir avec un rectangle blanc pour masquer les lignes verticales (effet cellule fusionnée)
      doc.rect(bigTableStartX + 0.5, moyRowY + 0.5, bigTableWidth - 1, rowHeight - 1).fillAndStroke('white', 'white');

      // Redessiner les bordures gauche et droite seulement
      doc.moveTo(bigTableStartX, moyRowY).lineTo(bigTableStartX, moyRowY + rowHeight).stroke();
      doc.moveTo(bigTableStartX + bigTableWidth, moyRowY).lineTo(bigTableStartX + bigTableWidth, moyRowY + rowHeight).stroke();

      // Texte centré sur toute la largeur du tableau avec espacement amélioré
      doc.fontSize(7).font('Helvetica').fillColor('black');
      const ligneRecap = `Moyenne : ${moyenneType.moyenne.toFixed(2)}                    Meilleure Moyenne : ${moyenneType.meilleureMoyenne.toFixed(2)}                    Rang : ${moyenneType.rang}°`;
      doc.text(ligneRecap, bigTableStartX, moyRowY + 2, { width: bigTableWidth, align: 'center' });

      currentRowY += rowHeight;

      // Ligne horizontale après la ligne moyenne (si ce n'est pas la dernière section)
      if (typeMatiere !== typesOrdonnes[typesOrdonnes.length - 1]) {
        doc.moveTo(bigTableStartX, currentRowY).lineTo(bigTableStartX + bigTableWidth, currentRowY).stroke();
      }
    }

    // Espacement réduit entre les sections
    doc.moveDown(0.1);
  }

  // Positionner le curseur définitivement après tout le tableau
  doc.moveDown(0.3);

  // ===== BILAN TRIMESTRIEL =====
  doc.moveDown(0.5);
  const bilanTitleY = doc.y;
  doc.rect(35, bilanTitleY, 530, 12).fillAndStroke('#E8E8E8', '#000000');
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('black');
  doc.text('BILAN TRIMESTRIEL', 35, bilanTitleY + 2, { width: 530, align: 'center' });
  doc.moveDown(1);

  // Calcul du total coefficient
  const totalCoef = bulletinData.notesByMatiere.reduce((sum, m) => sum + m.coef, 0);
  const totalNotesPonderees = bulletinData.notesByMatiere.reduce((sum, m) => sum + m.notePonderee, 0);

  // Tableau bilan - Structure améliorée
  const bilanY = doc.y;
  const leftMargin = 35;
  const tableWidth = 530;

  // === LIGNE 1: TOTAL COEFFICIENT | TOTAL NOTES PONDÉRÉES ===
  let bilanCurrentY = bilanY;
  const row1Height = 16;

  // Bordure extérieure complète
  doc.rect(leftMargin, bilanCurrentY, tableWidth, row1Height).stroke();

  // Ligne verticale au milieu
  doc.moveTo(leftMargin + 265, bilanCurrentY).lineTo(leftMargin + 265, bilanCurrentY + row1Height).stroke();

  // Contenu gauche
  doc.fontSize(7.5).font('Helvetica');
  doc.text('TOTAL COEFFICIENT', leftMargin + 5, bilanCurrentY + 4, { width: 120, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${totalCoef.toFixed(1)}`, { width: 130 });

  // Contenu droite
  doc.font('Helvetica').fontSize(7.5);
  doc.text('TOTAL NOTES PONDÉRÉES', leftMargin + 270, bilanCurrentY + 4, { width: 140, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${totalNotesPonderees.toFixed(2)}`, { width: 110 });

  // === LIGNE 2: MOYENNE SUR 20 | RETRAIT | JUSTIFIEES | NON JUSTIFIEES ===
  bilanCurrentY += row1Height;
  const row2Height = 16;

  doc.font('Helvetica').fontSize(7.5);
  doc.rect(leftMargin, bilanCurrentY, tableWidth, row2Height).stroke();

  // Séparateurs verticaux
  doc.moveTo(leftMargin + 140, bilanCurrentY).lineTo(leftMargin + 140, bilanCurrentY + row2Height).stroke();
  doc.moveTo(leftMargin + 210, bilanCurrentY).lineTo(leftMargin + 210, bilanCurrentY + row2Height).stroke();
  doc.moveTo(leftMargin + 300, bilanCurrentY).lineTo(leftMargin + 300, bilanCurrentY + row2Height).stroke();

  // Col 1: MOYENNE SUR 20
  doc.text('MOYENNE SUR 20', leftMargin + 5, bilanCurrentY + 4, { width: 130, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${bulletinData.moyenneGenerale.toFixed(2)}`, { width: 130 });

  // Col 2: RETRAIT DE POINTS
  doc.font('Helvetica').fontSize(6.5);
  doc.text('RETRAIT DE', leftMargin + 142, bilanCurrentY + 2, { width: 65, align: 'left' });
  doc.text('POINTS', leftMargin + 142, bilanCurrentY + 9, { width: 65, align: 'left' });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`${bulletinData.absences.retraitPoints.toFixed(2)}`, leftMargin + 142, bilanCurrentY + 4, { width: 65, align: 'right' });

  // Col 3: Nombre d'heures d'absence (titre au-dessus)
  doc.font('Helvetica').fontSize(6.5);

  // Col 4: Justifiées
  doc.text('Justifiées', leftMargin + 212, bilanCurrentY + 4, { width: 60, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${bulletinData.absences.justifiees}`, { width: 25 });

  // Col 5: Non justifiées
  doc.font('Helvetica').fontSize(6.5);
  doc.text('Non justifiées', leftMargin + 302, bilanCurrentY + 4, { width: 80, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${bulletinData.absences.nonJustifiees}`, { width: 140 });

  // === LIGNE 3: MOYENNE DÉFINITIVE (sur toute la largeur) ===
  bilanCurrentY += row2Height;
  const row3Height = 18;

  doc.rect(leftMargin, bilanCurrentY, tableWidth, row3Height).stroke();

  doc.font('Helvetica').fontSize(8);
  doc.text('MOYENNE DÉFINITIVE', leftMargin + 5, bilanCurrentY + 5, { width: 150, continued: true });
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
  doc.text(`  ${bulletinData.moyenneDefinitive.toFixed(2)}`, { width: 365, align: 'left' });
  doc.fillColor('black');

  // === LIGNE 4: MOYENNE ÉLÈVE | CONDUITE | RANG ===
  bilanCurrentY += row3Height;
  const row4Height = 16;

  doc.rect(leftMargin, bilanCurrentY, tableWidth, row4Height).stroke();

  // Séparateurs verticaux
  doc.moveTo(leftMargin + 265, bilanCurrentY).lineTo(leftMargin + 265, bilanCurrentY + row4Height).stroke();

  // Col 1: Moyenne de l'élève
  doc.font('Helvetica').fontSize(7.5);
  doc.text('Moyenne de l\'élève', leftMargin + 5, bilanCurrentY + 4, { width: 120, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${bulletinData.moyenneDefinitive.toFixed(2)}`, { width: 130 });

  // Col 2: Conduite (vide)
  doc.font('Helvetica').fontSize(7.5);
  doc.text('Conduite:', leftMargin + 270, bilanCurrentY + 4, { width: 255 });

  // === LIGNE 5: MOYENNE CLASSE | RANG DU TRIMESTRE ===
  bilanCurrentY += row4Height;
  const row5Height = 16;

  doc.rect(leftMargin, bilanCurrentY, tableWidth, row5Height).stroke();
  doc.moveTo(leftMargin + 265, bilanCurrentY).lineTo(leftMargin + 265, bilanCurrentY + row5Height).stroke();

  // Col 1: Moyenne de la classe
  doc.font('Helvetica').fontSize(7.5);
  const moyenneClasse = bulletinData.meilleureMoyenneClasse || bulletinData.moyenneGenerale;
  doc.text('Moyenne de la classe', leftMargin + 5, bilanCurrentY + 4, { width: 120, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${moyenneClasse.toFixed(2)}`, { width: 130 });

  // Col 2: Rang du trimestre
  doc.font('Helvetica').fontSize(7.5);
  doc.text('Rang du trimestre:', leftMargin + 270, bilanCurrentY + 4, { width: 110, continued: true });
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(`  ${bulletinData.rang}e`, { width: 145 });

  // === LIGNE 6: MEILLEURE MOYENNE | RAPPEL DES MOYENNES (titre) ===
  bilanCurrentY += row5Height;
  const row6Height = 16;

  doc.rect(leftMargin, bilanCurrentY, tableWidth, row6Height).stroke();
  doc.moveTo(leftMargin + 265, bilanCurrentY).lineTo(leftMargin + 265, bilanCurrentY + row6Height).stroke();

  // Col 1: Meilleure moyenne
  doc.font('Helvetica').fontSize(7.5);
  const meilleureMoyenneGenerale = bulletinData.meilleureMoyenneClasse || Math.max(...bulletinData.moyennesParType.map(m => m.meilleureMoyenne));
  doc.text('Meilleure moyenne', leftMargin + 5, bilanCurrentY + 4, { width: 120, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${meilleureMoyenneGenerale.toFixed(2)}`, { width: 130 });

  // Col 2: Rappel des Moyennes (centré)
  doc.font('Helvetica').fontSize(8);
  doc.text('Rappel des Moyennes', leftMargin + 270, bilanCurrentY + 4, { width: 255, align: 'center' });

  // === LIGNE 7: MOYENNE LA PLUS BASSE | 1ER TRIMESTRE | 2È TRIMESTRE ===
  bilanCurrentY += row6Height;
  const row7Height = 16;

  doc.rect(leftMargin, bilanCurrentY, tableWidth, row7Height).stroke();
  doc.moveTo(leftMargin + 265, bilanCurrentY).lineTo(leftMargin + 265, bilanCurrentY + row7Height).stroke();
  doc.moveTo(leftMargin + 397, bilanCurrentY).lineTo(leftMargin + 397, bilanCurrentY + row7Height).stroke();

  // Col 1: Moyenne la plus basse
  doc.font('Helvetica').fontSize(7.5);
  doc.text('Moyenne la plus basse', leftMargin + 5, bilanCurrentY + 4, { width: 120, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  doc.text(`  ${bulletinData.moyennePlusBasse?.toFixed(2) || '0.00'}`, { width: 130 });

  // Col 2: 1er Trimestre
  doc.font('Helvetica').fontSize(7.5);
  doc.text('1er Trimestre', leftMargin + 270, bilanCurrentY + 4, { width: 80, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  const trim1 = bulletinData.rappelMoyennes.trimestre1?.toFixed(2) || '-';
  doc.text(`  ${trim1}`, { width: 45 });

  // Col 3: 2è Trimestre
  doc.font('Helvetica').fontSize(7.5);
  doc.text('2è Trimestre', leftMargin + 402, bilanCurrentY + 4, { width: 75, continued: true });
  doc.font('Helvetica-Bold').fontSize(8.5);
  const trim2 = bulletinData.rappelMoyennes.trimestre2?.toFixed(2) || '-';
  doc.text(`  ${trim2}`, { width: 50 });

  // === LIGNE 8: MOYENNE ANNUELLE (uniquement 3ème trimestre) | AVERTISSEMENT ===
  // Vérifier si c'est le 3ème trimestre
  const isTrimestre3 = trimestre?.nom?.includes('3') || trimestre?.nom?.toLowerCase().includes('trois');

  if (isTrimestre3) {
    bilanCurrentY += row7Height;
    const row8Height = 16;

    doc.rect(leftMargin, bilanCurrentY, tableWidth, row8Height).stroke();
    doc.moveTo(leftMargin + 265, bilanCurrentY).lineTo(leftMargin + 265, bilanCurrentY + row8Height).stroke();

    // Col 1: Moyenne annuelle
    doc.font('Helvetica').fontSize(7.5);
    const moyenneAnnuelle = bulletinData.moyenneAnnuelle || bulletinData.moyenneGenerale;
    doc.text('Moyenne annuelle', leftMargin + 5, bilanCurrentY + 4, { width: 120, continued: true });
    doc.font('Helvetica-Bold').fontSize(8.5);
    doc.text(`  ${moyenneAnnuelle.toFixed(2)}`, { width: 130 });

    // Col 2: Avertissement + Rang annuel
    doc.font('Helvetica').fontSize(7.5);
    doc.text('Avertissement:', leftMargin + 270, bilanCurrentY + 4, { width: 150, continued: true });
    doc.font('Helvetica-Bold');
    doc.text(`  Rang annuel: ${bulletinData.rang}e`, { width: 105 });
  } else {
    // Pour les trimestres 1 et 2, afficher seulement Avertissement
    bilanCurrentY += row7Height;
    const row8Height = 16;

    doc.rect(leftMargin, bilanCurrentY, tableWidth, row8Height).stroke();

    // Avertissement sur toute la largeur
    doc.font('Helvetica').fontSize(7.5);
    doc.text('Avertissement:', leftMargin + 5, bilanCurrentY + 4, { width: 520 });
  }

  doc.moveDown(1);

  // === DÉCISION DU CONSEIL DE CLASSE ===
  let finalSectionY = doc.y;

  // Titre "Décision du Conseil de Classe" (hors du rectangle)
  doc.fontSize(7.5).font('Helvetica');
  doc.text('Décision du Conseil de Classe', leftMargin, finalSectionY);

  finalSectionY += 10;

  // === GRAND RECTANGLE ENGLOBANT TOUT ===
  const totalHeight = 80;
  doc.rect(leftMargin, finalSectionY, tableWidth, totalHeight).stroke();

  // Ligne verticale séparant les 2 colonnes
  const col1Width = 340;
  const horizontalLineY = finalSectionY;
  doc.moveTo(leftMargin + col1Width, finalSectionY).lineTo(leftMargin + col1Width, finalSectionY + totalHeight).stroke();

  // === COLONNE GAUCHE BAS: Redouble en cas d'échec ===
  const redoubleBoxY = finalSectionY + 50;
  const redoubleBoxX = leftMargin + 55;
  doc.rect(redoubleBoxX, redoubleBoxY, 230, 24).stroke();
  doc.fontSize(8).font('Helvetica-Oblique');
  doc.text('Redouble en cas d\'échec', redoubleBoxX + 55, redoubleBoxY + 8);

  // === COLONNE DROITE BAS: Date, Le Directeur, Signature ===
  const col2X = leftMargin + col1Width;

  // Date
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  doc.font('Helvetica').fontSize(7.5);
  doc.text(`NANORO, le  ${dateStr}`, col2X + 25, horizontalLineY + 5);

  // "Le Directeur"
  doc.text('Le Directeur', col2X + 45, horizontalLineY + 25);

  // Nom du directeur en bas
  doc.font('Helvetica');
  doc.text('Frère Jonas BARY', col2X + 35, finalSectionY + totalHeight - 10);

  // Finaliser le PDF
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

// Service pour récupérer les bulletins de tous les élèves d'une classe pour une année et un trimestre
export const getBulletinsClasse = async (classeId: number, anneeId: number, trimestreId: number) => {
  // Vérifier que la classe existe
  const existingClasse = await prisma.classe.findUnique({
    where: { id: classeId }
  });

  if (!existingClasse) {
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'année existe
  const annee = await prisma.annee.findUnique({
    where: { id: anneeId }
  });

  if (!annee) {
    throw new Error('Année non trouvée');
  }

  // Récupérer tous les élèves de la classe pour cette année
  const eleves = await prisma.eleve.findMany({
    where: {
      inscriptions: {
        some: {
          classeId: classeId,
          anneeId: anneeId
        }
      }
    },
    include: {
      user: true,
      inscriptions: {
        where: {
          classeId: classeId,
          anneeId: anneeId
        },
        include: {
          niveau: true,
          annee: true,
          classe: true
        }
      }
    }
  });

  if (eleves.length === 0) {
    throw new Error('Aucun élève trouvé pour cette classe et cette année');
  }

  // Récupérer le trimestre spécifié
  const trimestre = await prisma.trimestre.findUnique({
    where: { id: trimestreId }
  });

  if (!trimestre) {
    throw new Error('Trimestre non trouvé');
  }

  // Construire les bulletins pour chaque élève pour le trimestre donné
  const bulletins = [];

  for (const eleve of eleves) {
    try {
      const bulletinData = await getBulletinData(eleve.id, classeId, trimestreId, anneeId);
      bulletins.push({
        eleveId: eleve.id,
        eleve: {
          id: eleve.id,
          matricule: eleve.matricule,
          user: {
            nom: eleve.user.nom,
            prenom: eleve.user.prenom
          }
        },
        moyenneGenerale: bulletinData.moyenneGenerale,
        rang: bulletinData.rang,
        effectif: bulletinData.totalEleves,
        appreciation: bulletinData.appreciationGenerale
      });
    } catch (error: any) {
      // Si pas de bulletin pour cet élève, on l'inclut quand même avec une erreur
      bulletins.push({
        eleveId: eleve.id,
        eleve: {
          id: eleve.id,
          matricule: eleve.matricule,
          user: {
            nom: eleve.user.nom,
            prenom: eleve.user.prenom
          }
        },
        moyenneGenerale: null,
        rang: null,
        effectif: null,
        appreciation: null,
        error: error.message || 'Pas de données disponibles'
      });
    }
  }

  // Get class and level from first student's latest inscription
  const firstInscription = eleves[0]?.inscriptions?.[eleves[0].inscriptions.length - 1];

  // Fetch classe information
  const classe = await prisma.classe.findUnique({
    where: { id: classeId },
    include: {
      niveau: true
    }
  });

  return {
    classe: classe?.nom || '',
    niveau: firstInscription?.niveau?.nomNiveau || '',
    anneeId,
    trimestreId,
    trimestreNom: trimestre.nom,
    totalEleves: eleves.length,
    bulletins
  };
};

export default {
  getBulletinData,
  generateBulletinPDF,
  getBulletinsClasse
};
