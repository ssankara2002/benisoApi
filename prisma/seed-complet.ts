
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed complet...\n');

  // ============================================
  // 1. NETTOYAGE DES DONNÉES EXISTANTES
  // ============================================

  console.log('🗑️ Nettoyage des données existantes...');

  // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
  await prisma.note.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.enseignementAnnee.deleteMany({});
  await prisma.coeficientSerie.deleteMany({});
  await prisma.coeficientNiveau.deleteMany({});
  await prisma.paiement.deleteMany({});
  await prisma.inscription.deleteMany({});
  await prisma.absence.deleteMany({});
  await prisma.retard.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.eleve.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.trimestre.deleteMany({});
  await prisma.serie.deleteMany({});
  await prisma.classe.deleteMany({});
  await prisma.specialite.deleteMany({});
  await prisma.matiere.deleteMany({});
  await prisma.filiere.deleteMany({});
  await prisma.niveau.deleteMany({});
  await prisma.typeEnseignement.deleteMany({});
  await prisma.annee.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Données nettoyées\n');

  // ============================================
  // 2. CRÉATION DES RÔLES
  // ============================================

  console.log('📝 Création des rôles...');

  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrateur système' }
  });

  const roleProviseur = await prisma.role.upsert({
    where: { name: 'PROVISEUR' },
    update: {},
    create: { name: 'PROVISEUR', description: 'Proviseur' }
  });

  const roleProfesseur = await prisma.role.upsert({
    where: { name: 'PROFESSEUR' },
    update: {},
    create: { name: 'PROFESSEUR', description: 'Professeur' }
  });

  const roleParent = await prisma.role.upsert({
    where: { name: 'PARENT' },
    update: {},
    create: { name: 'PARENT', description: 'Parent' }
  });

  const roleEleve = await prisma.role.upsert({
    where: { name: 'ELEVE' },
    update: {},
    create: { name: 'ELEVE', description: 'Élève' }
  });

  console.log('✅ Rôles créés\n');

  // ============================================
  // 3. CRÉATION DES UTILISATEURS
  // ============================================

  console.log('👤 Création des utilisateurs...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const userAdmin = await prisma.user.create({
    data: {
      nom: 'ADMIN',
      prenom: 'System',
      email: 'admin@ecole.com',
      password: hashedPassword,
      phone: '0600000000',
      sexe: 'M',
      roleId: roleAdmin.id
    }
  });

  // Professeurs
  const userProf1 = await prisma.user.create({
    data: {
      nom: 'BAZONGO',
      prenom: 'André',
      email: 'bazongo@ecole.com',
      password: hashedPassword,
      phone: '0601000000',
      sexe: 'M',
      roleId: roleProfesseur.id
    }
  });

  const userProf2 = await prisma.user.create({
    data: {
      nom: 'DIARRA',
      prenom: 'Fatou',
      email: 'diarra@ecole.com',
      password: hashedPassword,
      phone: '0602000000',
      sexe: 'F',
      roleId: roleProfesseur.id
    }
  });

  // Parents
  const userParent1 = await prisma.user.create({
    data: {
      nom: 'TOURE',
      prenom: 'Amadou',
      email: 'parent1@ecole.com',
      password: hashedPassword,
      phone: '0603000000',
      sexe: 'M',
      roleId: roleParent.id
    }
  });

  // Élèves avec sexe
  const userEleve1 = await prisma.user.create({
    data: {
      nom: 'COMPAORE',
      prenom: 'Marie',
      email: 'eleve1@ecole.com',
      password: hashedPassword,
      phone: '0604000000',
      sexe: 'F',
      roleId: roleEleve.id
    }
  });

  const userEleve2 = await prisma.user.create({
    data: {
      nom: 'SANKARA',
      prenom: 'Thomas',
      email: 'eleve2@ecole.com',
      password: hashedPassword,
      phone: '0605000000',
      sexe: 'M',
      roleId: roleEleve.id
    }
  });

  const userEleve3 = await prisma.user.create({
    data: {
      nom: 'KABORE',
      prenom: 'Aminata',
      email: 'eleve3@ecole.com',
      password: hashedPassword,
      phone: '0606000000',
      sexe: 'F',
      roleId: roleEleve.id
    }
  });

  console.log('✅ Utilisateurs créés\n');

  // ============================================
  // 4. CRÉATION DES ANNÉES ACADÉMIQUES
  // ============================================

  console.log('📅 Création des années académiques...');

  const annee2024 = await prisma.annee.create({
    data: {
      dateDebut: new Date('2024-09-01'),
      dateFin: new Date('2025-06-30')
    }
  });

  const annee2025 = await prisma.annee.create({
    data: {
      dateDebut: new Date('2025-09-01'),
      dateFin: new Date('2026-06-30')
    }
  });

  console.log('✅ Années académiques créées\n');

  // ============================================
  // 5. CRÉATION DES TYPES D'ENSEIGNEMENT
  // ============================================

  console.log('🎓 Création des types d\'enseignement...');

  const typeGeneral = await prisma.typeEnseignement.upsert({
    where: { nom: 'GENERAL' },
    update: {},
    create: { nom: 'GENERAL' }
  });

  console.log('✅ Types d\'enseignement créés\n');

  // ============================================
  // 6. CRÉATION DES NIVEAUX
  // ============================================

  console.log('📚 Création des niveaux...');

  const niveau6eme = await prisma.niveau.create({
    data: {
      nomNiveau: '6ème',
      cycle: 'COLLEGE',
      scolarite: 150000,
      typeEnseignementId: typeGeneral.id
    }
  });

  const niveau3eme = await prisma.niveau.create({
    data: {
      nomNiveau: '3ème',
      cycle: 'COLLEGE',
      scolarite: 165000,
      typeEnseignementId: typeGeneral.id
    }
  });

  const niveau2nde = await prisma.niveau.create({
    data: {
      nomNiveau: '2nde',
      cycle: 'LYCEE',
      scolarite: 180000,
      typeEnseignementId: typeGeneral.id
    }
  });

  console.log('✅ Niveaux créés\n');

  // ============================================
  // 7. CRÉATION DES CLASSES
  // ============================================

  console.log('🏛️ Création des classes...');

  const classe6emeA = await prisma.classe.create({
    data: {
      nom: '6èmeA',
      capacite: 40,
      niveauId: niveau6eme.id
    }
  });

  const classe3emeA = await prisma.classe.create({
    data: {
      nom: '3èmeA',
      capacite: 35,
      niveauId: niveau3eme.id
    }
  });

  console.log('✅ Classes créées\n');

  // ============================================
  // 8. CRÉATION DES TRIMESTRES
  // ============================================

  console.log('📆 Création des trimestres...');

  const trimestre1_2025 = await prisma.trimestre.create({
    data: {
      nom: '1er Trimestre',
      dateDebut: new Date('2025-09-01'),
      dateFin: new Date('2025-12-15'),
      anneeId: annee2025.id,
      invalide: false
    }
  });

  const trimestre2_2025 = await prisma.trimestre.create({
    data: {
      nom: '2ème Trimestre',
      dateDebut: new Date('2026-01-05'),
      dateFin: new Date('2026-03-31'),
      anneeId: annee2025.id,
      invalide: false
    }
  });

  const trimestre3_2025 = await prisma.trimestre.create({
    data: {
      nom: '3ème Trimestre',
      dateDebut: new Date('2026-04-01'),
      dateFin: new Date('2026-06-30'),
      anneeId: annee2025.id,
      invalide: false
    }
  });

  console.log('✅ Trimestres créés\n');

  // ============================================
  // 9. CRÉATION DES FILIÈRES ET MATIÈRES
  // ============================================

  console.log('📖 Création des filières et matières...');

  const filiereScientifique = await prisma.filiere.create({
    data: { nom: 'Scientifique' }
  });

  const typeMatiereLitteraire = await prisma.typeMatiere.create({
    data: { libelle: 'MATIERES LITTERAIRES' }
  });

  const typeMatiereScientifique = await prisma.typeMatiere.create({
    data: { libelle: 'MATIERES SCIENTIFIQUES' }
  });

  const matiereMaths = await prisma.matiere.create({
    data: {
      libelle: 'Mathématiques',
      typeMatiereId: typeMatiereScientifique.id
    }
  });

  const matiereFrancais = await prisma.matiere.create({
    data: {
      libelle: 'Français',
      typeMatiereId: typeMatiereLitteraire.id
    }
  });

  const matiereAnglais = await prisma.matiere.create({
    data: {
      libelle: 'Anglais',
      typeMatiereId: typeMatiereLitteraire.id
    }
  });

  const matierePhysique = await prisma.matiere.create({
    data: {
      libelle: 'Physique-Chimie',
      typeMatiereId: typeMatiereScientifique.id
    }
  });

  const matiereSVT = await prisma.matiere.create({
    data: {
      libelle: 'SVT',
      typeMatiereId: typeMatiereScientifique.id
    }
  });

  const matiereHG = await prisma.matiere.create({
    data: {
      libelle: 'Histoire-Géographie',
      typeMatiereId: typeMatiereLitteraire.id
    }
  });

  console.log('✅ Filières et matières créées\n');

  // ============================================
  // 10. CRÉATION DES COEFFICIENTS
  // ============================================

  console.log('📊 Création des coefficients...');

  await prisma.coeficientNiveau.create({
    data: { valeur: 4, niveauId: niveau3eme.id, matiereId: matiereMaths.id }
  });

  await prisma.coeficientNiveau.create({
    data: { valeur: 3, niveauId: niveau3eme.id, matiereId: matiereFrancais.id }
  });

  await prisma.coeficientNiveau.create({
    data: { valeur: 2, niveauId: niveau3eme.id, matiereId: matiereAnglais.id }
  });

  await prisma.coeficientNiveau.create({
    data: { valeur: 3, niveauId: niveau3eme.id, matiereId: matierePhysique.id }
  });

  await prisma.coeficientNiveau.create({
    data: { valeur: 2, niveauId: niveau3eme.id, matiereId: matiereSVT.id }
  });

  await prisma.coeficientNiveau.create({
    data: { valeur: 2, niveauId: niveau3eme.id, matiereId: matiereHG.id }
  });

  console.log('✅ Coefficients créés\n');

  // ============================================
  // 11. CRÉATION DES STAFF
  // ============================================

  console.log('👨‍💼 Création des staff...');

  const staff1 = await prisma.staff.create({
    data: { userId: userProf1.id }
  });

  const staff2 = await prisma.staff.create({
    data: { userId: userProf2.id }
  });

  console.log('✅ Staff créés\n');

  // ============================================
  // 12. CRÉATION DES ENSEIGNEMENTS
  // ============================================

  console.log('📚 Création des enseignements...');

  await prisma.enseignementAnnee.create({
    data: {
      staffId: staff1.id,
      matiereId: matiereMaths.id,
      classeId: classe3emeA.id,
      anneeId: annee2025.id,
      volumeHoraire: 6
    }
  });

  await prisma.enseignementAnnee.create({
    data: {
      staffId: staff2.id,
      matiereId: matiereFrancais.id,
      classeId: classe3emeA.id,
      anneeId: annee2025.id,
      volumeHoraire: 5
    }
  });

  await prisma.enseignementAnnee.create({
    data: {
      staffId: staff1.id,
      matiereId: matierePhysique.id,
      classeId: classe3emeA.id,
      anneeId: annee2025.id,
      volumeHoraire: 4
    }
  });

  console.log('✅ Enseignements créés\n');

  // ============================================
  // 13. CRÉATION DES ÉLÈVES
  // ============================================

  console.log('👨‍🎓 Création des élèves...');

  // Élève 1 - Normal
  const eleve1 = await prisma.eleve.create({
    data: {
      userId: userEleve1.id,
      dateNaissance: new Date('2010-05-15'),
      acteNaissance: 'ACT001',
      matricule: 'EL2025001',
      filiereId: filiereScientifique.id,
      estHandicape: false,
      statut: 'VALIDE'
    }
  });

  // Élève 2 - Redoublant
  const eleve2 = await prisma.eleve.create({
    data: {
      userId: userEleve2.id,
      dateNaissance: new Date('2009-08-20'),
      acteNaissance: 'ACT002',
      matricule: 'EL2025002',
      filiereId: filiereScientifique.id,
      estHandicape: false,
      statut: 'VALIDE'
    }
  });

  // Élève 3 - Handicapé
  const eleve3 = await prisma.eleve.create({
    data: {
      userId: userEleve3.id,
      dateNaissance: new Date('2010-11-10'),
      acteNaissance: 'ACT003',
      matricule: 'EL2025003',
      filiereId: filiereScientifique.id,
      estHandicape: true,
      statut: 'VALIDE'
    }
  });

  console.log('✅ Élèves créés\n');

  // ============================================
  // 14. CRÉATION DES PARENTS
  // ============================================

  console.log('👨‍👩‍👧 Création des parents...');

  const parent1 = await prisma.parent.create({
    data: {
      userId: userParent1.id,
      eleves: {
        connect: [{ id: eleve1.id }]
      }
    }
  });

  console.log('✅ Parents créés\n');

  // ============================================
  // 15. CRÉATION DES INSCRIPTIONS
  // ============================================

  console.log('📋 Création des inscriptions...');

  // Inscription élève 1 - année précédente (pour classe redoublée)
  const inscriptionEleve1_2024 = await prisma.inscription.create({
    data: {
      eleveId: eleve2.id,
      anneeId: annee2024.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: false,
      moyenneGenerale: 8.5,
      decision: 'REDOUBLE',
      nombreRedoublementsCycle: 0,
      cycleActuel: 'COLLEGE'
    }
  });

  // Inscriptions année 2025
  const inscriptionEleve1 = await prisma.inscription.create({
    data: {
      eleveId: eleve1.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: false,
      nombreRedoublementsCycle: 0,
      cycleActuel: 'COLLEGE'
    }
  });

  const inscriptionEleve2 = await prisma.inscription.create({
    data: {
      eleveId: eleve2.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: true, // Redoublant
      nombreRedoublementsCycle: 1,
      cycleActuel: 'COLLEGE'
    }
  });

  const inscriptionEleve3 = await prisma.inscription.create({
    data: {
      eleveId: eleve3.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: false,
      nombreRedoublementsCycle: 0,
      cycleActuel: 'COLLEGE'
    }
  });

  console.log('✅ Inscriptions créées\n');

  // ============================================
  // 16. CRÉATION DES ÉVALUATIONS ET NOTES
  // ============================================

  console.log('📝 Création des évaluations et notes...');

  // Trimestre 1 - Mathématiques
  const evalMathsDevoir1 = await prisma.evaluation.create({
    data: {
      type: 'Devoir',
      date: new Date('2025-10-15'),
      bareme: 20,
      staffId: staff1.id,
      matiereId: matiereMaths.id,
      classeId: classe3emeA.id,
      trimestreId: trimestre1_2025.id,
      anneeId: annee2025.id
    }
  });

  const evalMathsInterro1 = await prisma.evaluation.create({
    data: {
      type: 'Interrogation',
      date: new Date('2025-11-05'),
      bareme: 20,
      staffId: staff1.id,
      matiereId: matiereMaths.id,
      classeId: classe3emeA.id,
      trimestreId: trimestre1_2025.id,
      anneeId: annee2025.id
    }
  });

  const evalMathsCompo1 = await prisma.evaluation.create({
    data: {
      type: 'Composition',
      date: new Date('2025-12-10'),
      bareme: 20,
      staffId: staff1.id,
      matiereId: matiereMaths.id,
      classeId: classe3emeA.id,
      trimestreId: trimestre1_2025.id,
      anneeId: annee2025.id
    }
  });

  // Trimestre 1 - Français
  const evalFrancaisDevoir1 = await prisma.evaluation.create({
    data: {
      type: 'Devoir',
      date: new Date('2025-10-20'),
      bareme: 20,
      staffId: staff2.id,
      matiereId: matiereFrancais.id,
      classeId: classe3emeA.id,
      trimestreId: trimestre1_2025.id,
      anneeId: annee2025.id
    }
  });

  const evalFrancaisInterro1 = await prisma.evaluation.create({
    data: {
      type: 'Interrogation',
      date: new Date('2025-11-10'),
      bareme: 20,
      staffId: staff2.id,
      matiereId: matiereFrancais.id,
      classeId: classe3emeA.id,
      trimestreId: trimestre1_2025.id,
      anneeId: annee2025.id
    }
  });

  const evalFrancaisCompo1 = await prisma.evaluation.create({
    data: {
      type: 'Composition',
      date: new Date('2025-12-12'),
      bareme: 20,
      staffId: staff2.id,
      matiereId: matiereFrancais.id,
      classeId: classe3emeA.id,
      trimestreId: trimestre1_2025.id,
      anneeId: annee2025.id
    }
  });

  // Notes Élève 1 (Marie) - Bon élève
  await prisma.note.createMany({
    data: [
      { eleveId: eleve1.id, evaluationId: evalMathsDevoir1.id, valeur: 15 },
      { eleveId: eleve1.id, evaluationId: evalMathsInterro1.id, valeur: 16 },
      { eleveId: eleve1.id, evaluationId: evalMathsCompo1.id, valeur: 14 },
      { eleveId: eleve1.id, evaluationId: evalFrancaisDevoir1.id, valeur: 13 },
      { eleveId: eleve1.id, evaluationId: evalFrancaisInterro1.id, valeur: 14 },
      { eleveId: eleve1.id, evaluationId: evalFrancaisCompo1.id, valeur: 15 }
    ]
  });

  // Notes Élève 2 (Thomas) - Redoublant avec difficultés
  await prisma.note.createMany({
    data: [
      { eleveId: eleve2.id, evaluationId: evalMathsDevoir1.id, valeur: 8 },
      { eleveId: eleve2.id, evaluationId: evalMathsInterro1.id, valeur: 9 },
      { eleveId: eleve2.id, evaluationId: evalMathsCompo1.id, valeur: 7 },
      { eleveId: eleve2.id, evaluationId: evalFrancaisDevoir1.id, valeur: 10 },
      { eleveId: eleve2.id, evaluationId: evalFrancaisInterro1.id, valeur: 9 },
      { eleveId: eleve2.id, evaluationId: evalFrancaisCompo1.id, valeur: 8 }
    ]
  });

  // Notes Élève 3 (Aminata) - Handicapée mais travailleuse
  await prisma.note.createMany({
    data: [
      { eleveId: eleve3.id, evaluationId: evalMathsDevoir1.id, valeur: 11 },
      { eleveId: eleve3.id, evaluationId: evalMathsInterro1.id, valeur: 12 },
      { eleveId: eleve3.id, evaluationId: evalMathsCompo1.id, valeur: 10 },
      { eleveId: eleve3.id, evaluationId: evalFrancaisDevoir1.id, valeur: 12 },
      { eleveId: eleve3.id, evaluationId: evalFrancaisInterro1.id, valeur: 11 },
      { eleveId: eleve3.id, evaluationId: evalFrancaisCompo1.id, valeur: 13 }
    ]
  });

  console.log('✅ Évaluations et notes créées\n');

  // ============================================
  // RÉSUMÉ
  // ============================================

  console.log('\n' + '='.repeat(60));
  console.log('✅ SEED COMPLET TERMINÉ AVEC SUCCÈS!');
  console.log('='.repeat(60));
  console.log('\n📊 RÉSUMÉ:');
  console.log('• 5 rôles créés');
  console.log('• 7 utilisateurs créés (admin, 2 profs, 1 parent, 3 élèves)');
  console.log('• 2 années académiques (2024-2025, 2025-2026)');
  console.log('• 3 niveaux (6ème, 3ème, 2nde)');
  console.log('• 2 classes (6èmeA, 3èmeA)');
  console.log('• 3 trimestres pour 2025-2026');
  console.log('• 6 matières avec coefficients');
  console.log('• 2 staff (professeurs)');
  console.log('• 3 élèves avec notes complètes');
  console.log('• 4 inscriptions (dont 1 redoublant)');
  console.log('• 6 évaluations avec notes pour trimestre 1');
  console.log('\n🎯 CAS DE TEST:');
  console.log('1. Marie COMPAORE (F) - Élève normale, bonnes notes');
  console.log('2. Thomas SANKARA (M) - Redoublant 3ème, notes faibles');
  console.log('3. Aminata KABORE (F) - Handicapée, notes moyennes');
  console.log('\n🔐 COMPTES DE TEST:');
  console.log('   Admin: admin@ecole.com / password123');
  console.log('   Prof 1: bazongo@ecole.com / password123');
  console.log('   Prof 2: diarra@ecole.com / password123');
  console.log('   Parent: parent1@ecole.com / password123');
  console.log('   Élève 1: eleve1@ecole.com / password123');
  console.log('   Élève 2: eleve2@ecole.com / password123');
  console.log('   Élève 3: eleve3@ecole.com / password123');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
