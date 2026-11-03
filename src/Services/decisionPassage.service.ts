import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Invalider ou valider un trimestre
 */
export const toggleTrimestreValidation = async (trimestreId: number, invalide: boolean) => {
  return await prisma.trimestre.update({
    where: { id: trimestreId },
    data: { invalide }
  });
};

/**
 * Calculer la moyenne générale d'un élève pour une année
 * en tenant compte uniquement des trimestres valides
 */
export const calculerMoyenneGenerale = async (
  eleveId: number,
  anneeId: number,
  classeId: number
) => {
  // Récupérer tous les trimestres de l'année
  const trimestres = await prisma.trimestre.findMany({
    where: { anneeId },
    include: {
      evaluations: {
        where: {
          classeId,
          anneeId
        },
        include: {
          notes: {
            where: { eleveId }
          }
        }
      }
    }
  });

  // Filtrer les trimestres valides uniquement
  const trimestresValides = trimestres.filter(t => !t.invalide);

  if (trimestresValides.length === 0) {
    return null; // Aucun trimestre valide
  }

  let sommeMoyennes = 0;
  let nombreTrimestresAvecNotes = 0;

  // Calculer la moyenne pour chaque trimestre valide
  for (const trimestre of trimestresValides) {
    let totalNotesCoefficients = 0;
    let totalCoefficients = 0;

    for (const evaluation of trimestre.evaluations) {
      // Récupérer le coefficient de la matière
      const classeInfo = await prisma.classe.findUnique({
        where: { id: classeId },
        select: { niveauId: true }
      });

      const coefNiveau = await prisma.coeficientNiveau.findFirst({
        where: {
          matiereId: evaluation.matiereId,
          niveauId: classeInfo?.niveauId || undefined
        }
      });

      const coefficient = coefNiveau?.valeur || 1;

      for (const note of evaluation.notes) {
        if (note.valeur !== null) {
          totalNotesCoefficients += note.valeur * coefficient;
          totalCoefficients += coefficient;
        }
      }
    }

    if (totalCoefficients > 0) {
      const moyenneTrimestre = totalNotesCoefficients / totalCoefficients;
      sommeMoyennes += moyenneTrimestre;
      nombreTrimestresAvecNotes++;
    }
  }

  // Moyenne générale = somme des moyennes des trimestres valides / nombre de trimestres valides
  if (nombreTrimestresAvecNotes === 0) {
    return null;
  }

  return sommeMoyennes / nombreTrimestresAvecNotes;
};

/**
 * Vérifier si un élève peut être exclu selon les règles
 */
export const verifierExclusion = async (eleveId: number, inscriptionId: number) => {
  const eleve = await prisma.eleve.findUnique({
    where: { id: eleveId },
    include: {
      user: true
    }
  });

  const inscription = await prisma.inscription.findUnique({
    where: { id: inscriptionId }
  });

  if (!eleve || !inscription) {
    return { peutEtreExclu: false, raison: 'Élève ou inscription introuvable' };
  }

  // Règle 1 : Élèves de moins de 16 ans ne peuvent pas être exclus
  const age = Math.floor(
    (new Date().getTime() - new Date(eleve.dateNaissance).getTime()) /
    (1000 * 60 * 60 * 24 * 365.25)
  );

  if (age < 16) {
    return { peutEtreExclu: false, raison: 'Élève de moins de 16 ans (protection légale)' };
  }

  // Règle 2 : Élèves handicapés (privilégiés) ne peuvent pas être exclus
  if (eleve.estHandicape) {
    return { peutEtreExclu: false, raison: 'Élève handicapé (statut privilégié)' };
  }

  // Règle 3 : Si redoublé 2 fois dans le même cycle = exclusion automatique
  if (inscription.nombreRedoublementsCycle >= 2) {
    return {
      peutEtreExclu: true,
      raison: 'Deux redoublements dans le même cycle',
      exclusionAutomatique: true
    };
  }

  // Règle 4 : Moyenne <= 7 = peut être exclu (mais pas automatique)
  if (inscription.moyenneGenerale !== null && inscription.moyenneGenerale <= 7) {
    return {
      peutEtreExclu: true,
      raison: 'Moyenne générale inférieure ou égale à 7/20',
      exclusionAutomatique: false
    };
  }

  return { peutEtreExclu: false, raison: 'Aucun critère d\'exclusion rempli' };
};

/**
 * Déterminer AUTOMATIQUEMENT la décision de passage pour un élève
 */
export const determinerDecision = async (
  inscriptionId: number
) => {
  const inscription = await prisma.inscription.findUnique({
    where: { id: inscriptionId },
    include: {
      eleve: true,
      classe: true,
      annee: true
    }
  });

  if (!inscription || !inscription.classe) {
    return { decision: null, moyenneGenerale: null, message: 'Inscription ou classe introuvable', estRedoublant: false };
  }

  // Calculer la moyenne générale automatiquement
  const moyenneGenerale = await calculerMoyenneGenerale(
    inscription.eleveId,
    inscription.anneeId,
    inscription.classe.id
  );

  if (moyenneGenerale === null) {
    return { decision: null, moyenneGenerale: null, message: 'Impossible de calculer la moyenne', estRedoublant: false };
  }

  // Vérifier les conditions d'exclusion
  const exclusion = await verifierExclusion(inscription.eleveId, inscriptionId);

  let decision: string;
  let estRedoublant: boolean;
  let message: string;

  // LOGIQUE AUTOMATIQUE :
  // 1. Si exclusion automatique (2 redoublements dans le cycle)
  if (exclusion.exclusionAutomatique) {
    decision = 'EXCLU';
    estRedoublant = false;
    message = exclusion.raison;
  }
  // 2. Si moyenne <= 7 ET peut être exclu (mais pas protégé)
  else if (moyenneGenerale <= 7 && exclusion.peutEtreExclu) {
    decision = 'EXCLU';
    estRedoublant = false;
    message = `Exclusion : ${exclusion.raison}`;
  }
  // 3. Si moyenne >= 10 : ADMIS
  else if (moyenneGenerale >= 10) {
    decision = 'ADMIS';
    estRedoublant = false;
    message = 'Admis en classe supérieure';
  }
  // 4. Si moyenne < 10 : REDOUBLE
  else {
    decision = 'REDOUBLE';
    estRedoublant = true;
    message = 'Redoublement (moyenne < 10/20)';
  }

  return {
    decision,
    moyenneGenerale,
    estRedoublant,
    message
  };
};

/**
 * Appliquer la décision de passage pour un élève
 */
export const appliquerDecision = async (
  inscriptionId: number,
  decision: string,
  moyenneGenerale: number
) => {
  const inscription = await prisma.inscription.update({
    where: { id: inscriptionId },
    data: {
      decision,
      moyenneGenerale
    },
    include: {
      eleve: true
    }
  });

  // Si redoublement, incrémenter le compteur dans l'inscription
  if (decision === 'REDOUBLE') {
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: {
        nombreRedoublementsCycle: {
          increment: 1
        }
      }
    });
  }

  // Si passage en classe supérieure, le compteur sera à 0 pour la nouvelle inscription
  // (Pas besoin de réinitialiser car chaque année = nouvelle inscription)

  return inscription;
};

/**
 * Traiter automatiquement les passages pour une classe entière
 */
export const traiterPassagesClasse = async (classeId: number, anneeId: number) => {
  // Récupérer toutes les inscriptions de la classe pour cette année
  const inscriptions = await prisma.inscription.findMany({
    where: {
      classeId,
      anneeId
    },
    include: {
      eleve: {
        include: {
          user: true
        }
      }
    }
  });

  const resultats = [];

  for (const inscription of inscriptions) {
    const decision = await determinerDecision(inscription.id);

    if (decision.decision && decision.moyenneGenerale !== null) {
      const inscriptionMiseAJour = await appliquerDecision(
        inscription.id,
        decision.decision,
        decision.moyenneGenerale
      );

      resultats.push({
        eleve: inscription.eleve,
        decision: decision.decision,
        moyenneGenerale: decision.moyenneGenerale,
        message: decision.message
      });
    }
  }

  return resultats;
};
