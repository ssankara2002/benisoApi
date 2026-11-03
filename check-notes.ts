import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotes() {
  console.log('🔍 Vérification des données...\n');

  // Vérifier les trimestres
  const trimestres = await prisma.trimestre.findMany({
    include: { annee: true }
  });
  console.log('📅 Trimestres:');
  trimestres.forEach(t => {
    console.log(`  - ID: ${t.id}, Nom: ${t.nom}, Année: ${t.annee.annee}`);
  });

  // Vérifier les évaluations
  const evaluations = await prisma.evaluation.findMany({
    include: {
      trimestre: true,
      matiere: true
    }
  });
  console.log(`\n📝 Évaluations: ${evaluations.length} au total`);

  // Grouper par trimestre
  const evalParTrimestre = new Map<number, number>();
  evaluations.forEach(e => {
    evalParTrimestre.set(e.trimestreId, (evalParTrimestre.get(e.trimestreId) || 0) + 1);
  });

  evalParTrimestre.forEach((count, trimestreId) => {
    const t = trimestres.find(tr => tr.id === trimestreId);
    console.log(`  - Trimestre ${t?.nom} (ID: ${trimestreId}): ${count} évaluations`);
  });

  // Vérifier les notes
  const notes = await prisma.note.findMany({
    include: {
      evaluation: {
        include: {
          trimestre: true,
          matiere: true
        }
      },
      eleve: {
        include: { user: true }
      }
    }
  });
  console.log(`\n📊 Notes: ${notes.length} au total`);

  // Grouper par trimestre
  const notesParTrimestre = new Map<number, number>();
  notes.forEach(n => {
    notesParTrimestre.set(n.evaluation.trimestreId, (notesParTrimestre.get(n.evaluation.trimestreId) || 0) + 1);
  });

  notesParTrimestre.forEach((count, trimestreId) => {
    const t = trimestres.find(tr => tr.id === trimestreId);
    console.log(`  - Trimestre ${t?.nom} (ID: ${trimestreId}): ${count} notes`);
  });

  // Vérifier les élèves
  const eleves = await prisma.eleve.findMany({
    include: {
      user: true,
      inscriptions: {
        include: {
          classe: true,
          annee: true
        }
      }
    }
  });
  console.log(`\n👨‍🎓 Élèves: ${eleves.length} au total`);

  // Notes par élève pour trimestre 3
  const trimestre3 = trimestres.find(t => t.nom.includes('3'));
  if (trimestre3) {
    console.log(`\n🔎 Détail pour ${trimestre3.nom} (ID: ${trimestre3.id}):`);
    const notesT3 = notes.filter(n => n.evaluation.trimestreId === trimestre3.id);

    eleves.forEach(e => {
      const notesEleve = notesT3.filter(n => n.eleveId === e.id);
      console.log(`  - ${e.user.prenom} ${e.user.nom}: ${notesEleve.length} notes`);
    });
  }

  await prisma.$disconnect();
}

checkNotes().catch(console.error);
