import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardProfesseur = async (userId: number) => {
  // ── Résolution du staff depuis userId ──
  const staff = await prisma.staff.findUnique({
    where: { userId },
    select: {
      id: true,
      isActive: true,
      user: { select: { nom: true, prenom: true, email: true, phone: true, adresse: true } },
    },
  });

  if (!staff) throw new Error('Profil professeur introuvable');

  const staffId = staff.id;
  const now     = new Date();

  // ── Requêtes parallèles ──
  const [
    enseignements,
    seances,
    cahiers,
    evaluations,
    absences,
    salaires,
  ] = await Promise.all([

    // Matières enseignées (tous créneaux actifs)
    prisma.enseignementAnnee.findMany({
      where: { staffId },
      select: {
        id: true,
        volumeHoraire: true,
        annee:   { select: { id: true, dateDebut: true, dateFin: true } },
        classe:  { select: { id: true, nom: true } },
        matiere: { select: { id: true, libelle: true } },
      },
      orderBy: { annee: { dateDebut: 'desc' } },
    }),

    // Toutes les séances du staff
    prisma.seance.findMany({
      where: { emploiDuTemps: { staffId } },
      select: {
        id: true, date: true, statut: true,
        emploiDuTemps: {
          select: {
            heureDebut: true, heureFin: true, jour: true,
            classe:  { select: { id: true, nom: true } },
            matiere: { select: { id: true, libelle: true } },
          },
        },
        cahierTexte: { select: { id: true, valide: true } },
      },
      orderBy: { date: 'desc' },
    }),

    // Cahiers de texte
    prisma.cahierTexte.findMany({
      where: { staffId },
      select: {
        id: true, valide: true, contenu: true, createdAt: true,
        seance: {
          select: {
            date: true,
            emploiDuTemps: {
              select: {
                classe:  { select: { nom: true } },
                matiere: { select: { libelle: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    // Évaluations créées par ce professeur
    prisma.evaluation.findMany({
      where: { staffId },
      select: {
        id: true, type: true, date: true, bareme: true,
        matiere:   { select: { id: true, libelle: true } },
        classe:    { select: { id: true, nom: true } },
        trimestre: { select: { id: true, nom: true } },
        annee:     { select: { id: true, dateDebut: true, dateFin: true } },
        _count:    { select: { notes: true } },
      },
      orderBy: { date: 'desc' },
    }),

    // Absences enregistrées par ce professeur
    prisma.absence.findMany({
      where: { staffId },
      select: {
        id: true, dateDebut: true, dateFin: true, motif: true, justification: true,
        classe:  { select: { nom: true } },
        matiere: { select: { libelle: true } },
      },
      orderBy: { dateDebut: 'desc' },
      take: 20,
    }),

    // Salaires du professeur
    prisma.salaire.findMany({
      where: { staffId },
      select: {
        id: true, mois: true, annee: true,
        montantBrut: true, deductions: true, montantNet: true, statut: true,
      },
      orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
      take: 12,
    }),
  ]);

  // ── KPI séances ──
  const seancesEffectuees = seances.filter(s => s.statut === 'EFFECTUE').length;
  const seancesPlanifiees = seances.filter(s => s.statut === 'PLANIFIE').length;
  const seancesAVenir     = seances.filter(s => s.statut === 'PLANIFIE' && new Date(s.date) >= now);

  // Séances sans cahier de texte (effectuées mais pas remplies)
  const seancesSansCahier = seances.filter(
    s => s.statut === 'EFFECTUE' && !s.cahierTexte
  ).length;

  // ── Cahiers de texte ──
  const cahiersTotalCount  = await prisma.cahierTexte.count({ where: { staffId } });
  const cahiersValides     = await prisma.cahierTexte.count({ where: { staffId, valide: true } });
  const cahiersNonValides  = cahiersTotalCount - cahiersValides;

  // ── Classes et matières uniques ──
  const classesMap: Record<number, string> = {};
  const matieresMap: Record<number, string> = {};
  enseignements.forEach(e => {
    classesMap[e.classe.id]   = e.classe.nom;
    matieresMap[e.matiere.id] = e.matiere.libelle;
  });
  const nombreClasses  = Object.keys(classesMap).length;
  const nombreMatieres = Object.keys(matieresMap).length;

  // ── Évaluations ──
  const evaluationsAVenir = evaluations.filter(e => new Date(e.date) >= now);
  const evaluationsPassees = evaluations.filter(e => new Date(e.date) < now);
  // Évaluations sans notes saisies
  const evaluationsSansNotes = evaluationsPassees.filter(e => e._count.notes === 0).length;

  // ── Taux de remplissage cahier ──
  const tauxCahier = seancesEffectuees > 0
    ? Number(((cahiersTotalCount / seancesEffectuees) * 100).toFixed(1))
    : 0;

  // ── Emploi du temps (créneaux hebdomadaires actifs) ──
  const emplois = await prisma.emploiDuTemps.findMany({
    where: { staffId, actif: true },
    select: {
      id: true, jour: true, heureDebut: true, heureFin: true,
      classe:  { select: { id: true, nom: true } },
      matiere: { select: { id: true, libelle: true } },
      annee:   { select: { id: true, dateDebut: true, dateFin: true } },
    },
    orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
  });

  // ── Prochaines séances (5) ──
  const prochainesSeances = seances
    .filter(s => s.statut === 'PLANIFIE' && new Date(s.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)
    .map(s => ({
      id: s.id,
      date: s.date,
      heureDebut: s.emploiDuTemps?.heureDebut,
      heureFin:   s.emploiDuTemps?.heureFin,
      classe:     s.emploiDuTemps?.classe?.nom,
      matiere:    s.emploiDuTemps?.matiere?.libelle,
      cahierRempli: !!s.cahierTexte,
    }));

  // ── Salaires résumé ──
  const dernierSalaire    = salaires[0] ?? null;
  const totalSalaireAnnee = salaires
    .filter(s => s.annee === now.getFullYear())
    .reduce((sum, s) => sum + s.montantNet, 0);

  return {
    profil: {
      id: staffId,
      nom:     staff.user.nom,
      prenom:  staff.user.prenom,
      email:   staff.user.email,
      phone:   staff.user.phone,
      adresse: staff.user.adresse,
      isActive: staff.isActive,
    },

    kpi: {
      nombreClasses,
      nombreMatieres,
      totalSeances:        seances.length,
      seancesEffectuees,
      seancesPlanifiees,
      seancesAVenir:       seancesAVenir.length,
      seancesSansCahier,
      totalCahiers:        cahiersTotalCount,
      cahiersValides,
      cahiersNonValides,
      tauxRemplissageCahier: tauxCahier,
      totalEvaluations:     evaluations.length,
      evaluationsAVenir:    evaluationsAVenir.length,
      evaluationsSansNotes,
    },

    emploiDuTemps: emplois,

    enseignements,

    prochainesSeances,

    derniersSeancesSansCahier: seances
      .filter(s => s.statut === 'EFFECTUE' && !s.cahierTexte)
      .slice(0, 5)
      .map(s => ({
        id:       s.id,
        date:     s.date,
        classe:   s.emploiDuTemps?.classe?.nom,
        matiere:  s.emploiDuTemps?.matiere?.libelle,
      })),

    derniersCahiers: cahiers.map(c => ({
      id:       c.id,
      valide:   c.valide,
      contenu:  c.contenu.substring(0, 100),
      date:     c.seance?.date,
      classe:   c.seance?.emploiDuTemps?.classe?.nom,
      matiere:  c.seance?.emploiDuTemps?.matiere?.libelle,
      createdAt: c.createdAt,
    })),

    evaluationsAVenir: evaluationsAVenir.map(e => ({
      id:        e.id,
      type:      e.type,
      date:      e.date,
      bareme:    e.bareme,
      matiere:   e.matiere?.libelle,
      classe:    e.classe?.nom,
      trimestre: e.trimestre?.nom,
    })),

    evaluationsSansNotesList: evaluationsPassees
      .filter(e => e._count.notes === 0)
      .slice(0, 5)
      .map(e => ({
        id:      e.id,
        type:    e.type,
        date:    e.date,
        matiere: e.matiere?.libelle,
        classe:  e.classe?.nom,
      })),

    absencesRecentes: absences,

    salaires: {
      dernier:        dernierSalaire,
      totalAnnee:     totalSalaireAnnee,
      historique:     salaires,
    },
  };
};
