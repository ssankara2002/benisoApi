import { PrismaClient, StatutTransaction, StatutPaiementSalaire, TypeTransaction } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardComptable = async (anneeId?: number) => {
  const now = new Date();
  const debutMoisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const finMoisCourant   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const debutMoisPrec    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finMoisPrec      = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const whereAnnee = anneeId ? { anneeId } : {};

  const [
    // ── KPI mois courant ──
    recettesMois,
    depensesMois,
    recettesMoisPrec,
    depensesMoisPrec,
    transactionsEnAttente,

    // ── Flux mensuel (12 derniers mois) ──
    toutesTransactions,

    // ── Soldes comptes ──
    comptes,

    // ── Budget vs réalisé ──
    budgets,

    // ── Scolarités ──
    inscriptions,

    // ── Salaires ──
    salairesEnAttente,
    salairesMoisCourant,

    // ── 8 dernières transactions ──
    dernieresTransactions,

  ] = await Promise.all([
    // recettes mois courant
    prisma.transaction.aggregate({
      where: { type: TypeTransaction.RECETTE, statut: StatutTransaction.VALIDE, date: { gte: debutMoisCourant, lte: finMoisCourant }, ...whereAnnee },
      _sum: { montant: true },
    }),
    // dépenses mois courant
    prisma.transaction.aggregate({
      where: { type: TypeTransaction.DEPENSE, statut: StatutTransaction.VALIDE, date: { gte: debutMoisCourant, lte: finMoisCourant }, ...whereAnnee },
      _sum: { montant: true },
    }),
    // recettes mois précédent
    prisma.transaction.aggregate({
      where: { type: TypeTransaction.RECETTE, statut: StatutTransaction.VALIDE, date: { gte: debutMoisPrec, lte: finMoisPrec }, ...whereAnnee },
      _sum: { montant: true },
    }),
    // dépenses mois précédent
    prisma.transaction.aggregate({
      where: { type: TypeTransaction.DEPENSE, statut: StatutTransaction.VALIDE, date: { gte: debutMoisPrec, lte: finMoisPrec }, ...whereAnnee },
      _sum: { montant: true },
    }),
    // transactions en attente
    prisma.transaction.count({
      where: { statut: StatutTransaction.EN_ATTENTE, ...whereAnnee },
    }),

    // toutes les transactions validées pour flux mensuel + répartition
    prisma.transaction.findMany({
      where: { statut: StatutTransaction.VALIDE, ...whereAnnee },
      select: { type: true, montant: true, date: true, categorieComptable: { select: { libelle: true, type: true } }, compteId: true },
    }),

    // comptes bancaires
    prisma.compteBancaire.findMany({
      select: {
        id: true, libelle: true, type: true, soldeInitial: true,
        transactions: {
          where: { statut: StatutTransaction.VALIDE, ...whereAnnee },
          select: { type: true, montant: true },
        },
      },
    }),

    // budgets
    prisma.budget.findMany({
      where: anneeId ? { anneeId } : {},
      select: { id: true, libelle: true, montantPrevu: true, type: true, categorieId: true, anneeId: true },
    }),

    // inscriptions avec paiements pour scolarités
    prisma.inscription.findMany({
      where: anneeId ? { anneeId } : {},
      select: {
        niveau: { select: { nomNiveau: true, scolarite: true } },
        paiements: { select: { montant: true, montantAttendu: true } },
      },
    }),

    // salaires en attente
    prisma.salaire.count({ where: { statut: StatutPaiementSalaire.EN_ATTENTE } }),

    // salaires mois courant
    prisma.salaire.findMany({
      where: { mois: now.getMonth() + 1, annee: now.getFullYear() },
      select: { montantNet: true, statut: true },
    }),

    // dernières transactions
    prisma.transaction.findMany({
      where: { ...whereAnnee },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, reference: true, libelle: true, montant: true,
        type: true, statut: true, date: true,
        categorieComptable: { select: { libelle: true } },
      },
    }),
  ]);

  // ── KPI ──
  const recettesMoisVal   = recettesMois._sum.montant   ?? 0;
  const depensesMoisVal   = depensesMois._sum.montant   ?? 0;
  const recettesPrecVal   = recettesMoisPrec._sum.montant ?? 0;
  const depensesPrecVal   = depensesMoisPrec._sum.montant ?? 0;
  const soldeMois         = recettesMoisVal - depensesMoisVal;

  const variationRecettes = recettesPrecVal > 0
    ? ((recettesMoisVal - recettesPrecVal) / recettesPrecVal) * 100 : null;
  const variationDepenses = depensesPrecVal > 0
    ? ((depensesMoisVal - depensesPrecVal) / depensesPrecVal) * 100 : null;

  const totalSalairesMois    = salairesMoisCourant.reduce((s, x) => s + x.montantNet, 0);
  const salairesMoisPayes    = salairesMoisCourant.filter(x => x.statut === StatutPaiementSalaire.PAYE).reduce((s, x) => s + x.montantNet, 0);
  const salairesMoisAttente  = totalSalairesMois - salairesMoisPayes;

  // ── Flux mensuel 12 mois ──
  const fluxParMois: Record<string, { mois: string; recettes: number; depenses: number; solde: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    fluxParMois[key] = { mois: key, recettes: 0, depenses: 0, solde: 0 };
  }
  toutesTransactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!fluxParMois[key]) return;
    if (t.type === TypeTransaction.RECETTE) fluxParMois[key].recettes += t.montant;
    else fluxParMois[key].depenses += t.montant;
  });
  Object.values(fluxParMois).forEach(f => { f.solde = f.recettes - f.depenses; });

  // ── Répartition dépenses par catégorie ──
  const totalDepensesAll = toutesTransactions
    .filter(t => t.type === TypeTransaction.DEPENSE)
    .reduce((s, t) => s + t.montant, 0);

  const repartitionMap: Record<string, { categorie: string; montant: number }> = {};
  toutesTransactions
    .filter(t => t.type === TypeTransaction.DEPENSE && t.categorieComptable)
    .forEach(t => {
      const lib = t.categorieComptable!.libelle;
      if (!repartitionMap[lib]) repartitionMap[lib] = { categorie: lib, montant: 0 };
      repartitionMap[lib].montant += t.montant;
    });
  const repartitionDepenses = Object.values(repartitionMap).map(r => ({
    ...r,
    pourcentage: totalDepensesAll > 0 ? Number(((r.montant / totalDepensesAll) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.montant - a.montant);

  // ── Soldes comptes ──
  const soldesComptes = comptes.map(c => {
    const recettes = c.transactions.filter(t => t.type === TypeTransaction.RECETTE).reduce((s, t) => s + t.montant, 0);
    const depenses = c.transactions.filter(t => t.type === TypeTransaction.DEPENSE).reduce((s, t) => s + t.montant, 0);
    return {
      id: c.id,
      libelle: c.libelle,
      type: c.type,
      solde: c.soldeInitial + recettes - depenses,
    };
  });
  const soldeTotal = soldesComptes.reduce((s, c) => s + c.solde, 0);

  // ── Budget vs Réalisé ──
  const budgetVsRealise = await Promise.all(budgets.map(async b => {
    const agg = await prisma.transaction.aggregate({
      where: {
        type: b.type,
        statut: StatutTransaction.VALIDE,
        ...(b.categorieId ? { categorieId: b.categorieId } : {}),
        ...(b.anneeId ? { anneeId: b.anneeId } : {}),
      },
      _sum: { montant: true },
    });
    const realise = agg._sum.montant ?? 0;
    const taux    = b.montantPrevu > 0 ? Number(((realise / b.montantPrevu) * 100).toFixed(1)) : 0;
    return {
      id: b.id, libelle: b.libelle, type: b.type,
      prevu: b.montantPrevu, realise, ecart: realise - b.montantPrevu, taux,
      depasse: realise > b.montantPrevu,
    };
  }));

  // ── Recouvrement scolarités par niveau ──
  const niveauMap: Record<string, { niveau: string; scolarite: number; attendu: number; encaisse: number; nbEleves: number }> = {};
  inscriptions.forEach(ins => {
    const nomNiveau = ins.niveau?.nomNiveau ?? 'Inconnu';
    const scolarite = ins.niveau?.scolarite ?? 0;
    if (!niveauMap[nomNiveau]) niveauMap[nomNiveau] = { niveau: nomNiveau, scolarite, attendu: 0, encaisse: 0, nbEleves: 0 };
    niveauMap[nomNiveau].nbEleves += 1;
    niveauMap[nomNiveau].attendu  += scolarite;
    niveauMap[nomNiveau].encaisse += ins.paiements.reduce((s, p) => s + p.montant, 0);
  });
  const recouvrementScolarites = Object.values(niveauMap).map(n => ({
    ...n,
    reste: n.attendu - n.encaisse,
    taux: n.attendu > 0 ? Number(((n.encaisse / n.attendu) * 100).toFixed(1)) : 0,
  }));
  const totalAttendu  = recouvrementScolarites.reduce((s, n) => s + n.attendu,  0);
  const totalEncaisse = recouvrementScolarites.reduce((s, n) => s + n.encaisse, 0);

  // ── Alertes ──
  const alertes: { type: string; message: string; count: number }[] = [];
  if (transactionsEnAttente > 0)
    alertes.push({ type: 'TRANSACTIONS_ATTENTE', message: `${transactionsEnAttente} transaction(s) en attente de validation`, count: transactionsEnAttente });
  if (salairesEnAttente > 0)
    alertes.push({ type: 'SALAIRES_IMPAYEES', message: `${salairesEnAttente} salaire(s) non payé(s)`, count: salairesEnAttente });
  budgetVsRealise.filter(b => b.depasse).forEach(b =>
    alertes.push({ type: 'BUDGET_DEPASSE', message: `Budget "${b.libelle}" dépassé (${b.taux}%)`, count: 1 })
  );
  const resteTotal = totalAttendu - totalEncaisse;
  if (resteTotal > 0)
    alertes.push({ type: 'SCOLARITES_IMPAYEES', message: `${resteTotal.toLocaleString('fr-FR')} FCFA de scolarités non recouvrées`, count: 0 });

  return {
    kpi: {
      soldeTresorerie: soldeTotal,
      recettesMoisCourant: recettesMoisVal,
      depensesMoisCourant: depensesMoisVal,
      soldeMoisCourant: soldeMois,
      variationRecettes: variationRecettes !== null ? Number(variationRecettes.toFixed(1)) : null,
      variationDepenses: variationDepenses !== null ? Number(variationDepenses.toFixed(1)) : null,
      transactionsEnAttente,
      salairesEnAttenteMois: salairesMoisAttente,
      totalSalairesMois,
    },
    fluxMensuel: Object.values(fluxParMois),
    repartitionDepenses,
    soldesComptes,
    budgetVsRealise,
    recouvrementScolarites: {
      parNiveau: recouvrementScolarites,
      total: { attendu: totalAttendu, encaisse: totalEncaisse, reste: resteTotal, taux: totalAttendu > 0 ? Number(((totalEncaisse / totalAttendu) * 100).toFixed(1)) : 0 },
    },
    dernieresTransactions,
    alertes,
  };
};
