import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed complet...\n');

  
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
  // 3. CRÉATION DES PERMISSIONS
  // ============================================

  console.log('🔐 Création des permissions...');

 const permissions = [
  // Users
  { key: 'user.read', description: 'Consulter les utilisateurs' },
  { key: 'user.create', description: 'Créer des utilisateurs' },
  { key: 'user.update', description: 'Modifier les utilisateurs' },
  { key: 'user.delete', description: 'Supprimer les utilisateurs' },
  { key: 'user.archive', description: 'Archiver les utilisateurs' },

  // Roles
  { key: 'role.read', description: 'Consulter les rôles' },
  { key: 'role.create', description: 'Créer des rôles' },
  { key: 'role.update', description: 'Modifier les rôles' },
  { key: 'role.delete', description: 'Supprimer les rôles' },
  { key: 'role.assign_permissions', description: 'Assigner des permissions aux rôles' },

  // Permissions system
  { key: 'permission.read', description: 'Consulter les permissions' },
  { key: 'permission.create', description: 'Créer des permissions' },
  { key: 'permission.update', description: 'Modifier des permissions' },
  { key: 'permission.delete', description: 'Supprimer des permissions' },

  // Élèves
  { key: 'eleve.read', description: 'Consulter les élèves' },
  { key: 'eleve.create', description: 'Inscrire des élèves' },
  { key: 'eleve.update', description: 'Modifier les élèves' },
  { key: 'eleve.delete', description: 'Supprimer des élèves' },
  { key: 'eleve.export', description: 'Exporter les élèves' },
  { key: 'eleve.statistics', description: 'Statistiques élèves' },

  // Notes
  { key: 'note.read', description: 'Consulter les notes' },
  { key: 'note.create', description: 'Saisir des notes' },
  { key: 'note.update', description: 'Modifier des notes' },
  { key: 'note.delete', description: 'Supprimer des notes' },
  { key: 'note.export', description: 'Exporter les notes' },

  // Bulletins
  { key: 'bulletin.read', description: 'Consulter les bulletins' },
  { key: 'bulletin.generate', description: 'Générer des bulletins PDF' },
  { key: 'bulletin.export', description: 'Exporter les bulletins' },

  // Classes
  { key: 'classe.read', description: 'Consulter les classes' },
  { key: 'classe.create', description: 'Créer des classes' },
  { key: 'classe.update', description: 'Modifier les classes' },
  { key: 'classe.delete', description: 'Supprimer des classes' },
  { key: 'classe.manage_eleves', description: 'Gérer les élèves dans les classes' },

  // Accueil / contenu
  { key: 'accueil.read', description: 'Consulter accueil' },
  { key: 'accueil.create', description: 'Créer accueil' },
  { key: 'accueil.update', description: 'Modifier accueil' },
  { key: 'accueil.delete', description: 'Supprimer accueil' },

  // Présentation
  { key: 'presentation.read', description: 'Consulter présentation' },
  { key: 'presentation.create', description: 'Créer présentation' },
  { key: 'presentation.update', description: 'Modifier présentation' },
  { key: 'presentation.delete', description: 'Supprimer présentation' },

  // Évaluations
  { key: 'evaluation.read', description: 'Consulter évaluations' },
  { key: 'evaluation.create', description: 'Créer évaluations' },
  { key: 'evaluation.update', description: 'Modifier évaluations' },
  { key: 'evaluation.delete', description: 'Supprimer évaluations' },

  // Inscriptions
  { key: 'inscription.read', description: 'Consulter inscriptions' },
  { key: 'inscription.create', description: 'Créer inscriptions' },
  { key: 'inscription.update', description: 'Modifier inscriptions' },
  { key: 'inscription.delete', description: 'Supprimer inscriptions' },

  // Parents
  { key: 'parent.read', description: 'Consulter parents' },
  { key: 'parent.create', description: 'Créer parents' },
  { key: 'parent.update', description: 'Modifier parents' },
  { key: 'parent.delete', description: 'Supprimer parents' },

  // Matières
  { key: 'matiere.read', description: 'Consulter matières' },
  { key: 'matiere.create', description: 'Créer matières' },
  { key: 'matiere.update', description: 'Modifier matières' },
  { key: 'matiere.delete', description: 'Supprimer matières' },

  // Staff
  { key: 'staff.read', description: 'Consulter staff' },
  { key: 'staff.create', description: 'Créer staff' },
  { key: 'staff.update', description: 'Modifier staff' },
  { key: 'staff.delete', description: 'Supprimer staff' },

  // Niveau / année
  { key: 'niveau.read', description: 'Consulter niveaux' },
  { key: 'niveau.create', description: 'Créer niveaux' },
  { key: 'niveau.update', description: 'Modifier niveaux' },
  { key: 'niveau.delete', description: 'Supprimer niveaux' },

  { key: 'annee.read', description: 'Consulter années' },
  { key: 'annee.create', description: 'Créer années' },
  { key: 'annee.update', description: 'Modifier années' },
  { key: 'annee.delete', description: 'Supprimer années' },

  // Filière / spécialité
  { key: 'filiere.read', description: 'Consulter filières' },
  { key: 'filiere.create', description: 'Créer filières' },
  { key: 'filiere.update', description: 'Modifier filières' },
  { key: 'filiere.delete', description: 'Supprimer filières' },

  { key: 'specialite.read', description: 'Consulter spécialités' },
  { key: 'specialite.create', description: 'Créer spécialités' },
  { key: 'specialite.update', description: 'Modifier spécialités' },
  { key: 'specialite.delete', description: 'Supprimer spécialités' },

  // Paiements
  { key: 'paiement.read', description: 'Consulter paiements' },
  { key: 'paiement.create', description: 'Créer paiements' },
  { key: 'paiement.update', description: 'Modifier paiements' },
  { key: 'paiement.delete', description: 'Supprimer paiements' },
  { key: 'paiement.export', description: 'Exporter paiements' },
  { key: 'paiement.statistics', description: 'Statistiques paiements' },

  // Absences / retards
  { key: 'absence.read', description: 'Consulter absences' },
  { key: 'absence.create', description: 'Créer absences' },
  { key: 'absence.update', description: 'Modifier absences' },
  { key: 'absence.delete', description: 'Supprimer absences' },
  { key: 'absence.export', description: 'Exporter absences' },
  { key: 'absence.statistics', description: 'Statistiques absences' },
  { key: 'absence.confirmProf', description: 'Confirmer absences prof' },

  { key: 'retard.read', description: 'Consulter retards' },
  { key: 'retard.create', description: 'Créer retards' },
  { key: 'retard.update', description: 'Modifier retards' },
  { key: 'retard.delete', description: 'Supprimer retards' },
  { key: 'retard.export', description: 'Exporter retards' },
  { key: 'retard.statistics', description: 'Statistiques retards' },
  { key: 'retard.confirmProf', description: 'Confirmer retards prof' },

  // Enseignement
  { key: 'typeEnseignement.read', description: 'Consulter types enseignement' },
  { key: 'typeEnseignement.create', description: 'Créer types enseignement' },
  { key: 'typeEnseignement.update', description: 'Modifier types enseignement' },
  { key: 'typeEnseignement.delete', description: 'Supprimer types enseignement' },

  { key: 'enseignementAnnee.read', description: 'Consulter enseignements' },
  { key: 'enseignementAnnee.create', description: 'Créer enseignements' },
  { key: 'enseignementAnnee.update', description: 'Modifier enseignements' },
  { key: 'enseignementAnnee.delete', description: 'Supprimer enseignements' },

  // Coefficients
  { key: 'coefficientNiveau.read', description: 'Consulter coeff niveau' },
  { key: 'coefficientNiveau.create', description: 'Créer coeff niveau' },
  { key: 'coefficientNiveau.update', description: 'Modifier coeff niveau' },
  { key: 'coefficientNiveau.delete', description: 'Supprimer coeff niveau' },

  { key: 'coefficientSerie.read', description: 'Consulter coeff série' },
  { key: 'coefficientSerie.create', description: 'Créer coeff série' },
  { key: 'coefficientSerie.update', description: 'Modifier coeff série' },
  { key: 'coefficientSerie.delete', description: 'Supprimer coeff série' },

  // Séries
  { key: 'serie.read', description: 'Consulter séries' },
  { key: 'serie.create', description: 'Créer séries' },
  { key: 'serie.update', description: 'Modifier séries' },
  { key: 'serie.delete', description: 'Supprimer séries' },

  // Comptabilité
  { key: 'categorieComptable.read', description: 'Consulter catégories comptables' },
  { key: 'categorieComptable.create', description: 'Créer catégories comptables' },
  { key: 'categorieComptable.update', description: 'Modifier catégories comptables' },
  { key: 'categorieComptable.delete', description: 'Supprimer catégories comptables' },

  { key: 'compteBancaire.read', description: 'Consulter comptes bancaires' },
  { key: 'compteBancaire.create', description: 'Créer comptes bancaires' },
  { key: 'compteBancaire.update', description: 'Modifier comptes bancaires' },
  { key: 'compteBancaire.delete', description: 'Supprimer comptes bancaires' },
  { key: 'compteBancaire.viewSolde', description: 'Voir soldes comptes' },

  { key: 'transaction.read', description: 'Consulter transactions' },
  { key: 'transaction.create', description: 'Créer transactions' },
  { key: 'transaction.update', description: 'Modifier transactions' },
  { key: 'transaction.delete', description: 'Supprimer transactions' },
  { key: 'transaction.validate', description: 'Valider transactions' },
  { key: 'transaction.cancel', description: 'Annuler transactions' },
  { key: 'transaction.export', description: 'Exporter transactions' },
  { key: 'transaction.statistics', description: 'Statistiques transactions' },

  { key: 'budget.read', description: 'Consulter budgets' },
  { key: 'budget.create', description: 'Créer budgets' },
  { key: 'budget.update', description: 'Modifier budgets' },
  { key: 'budget.delete', description: 'Supprimer budgets' },
  { key: 'budget.dashboard', description: 'Dashboard budget' },
  { key: 'budget.viewRealization', description: 'Réalisation budget' },

  { key: 'salaire.read', description: 'Consulter salaires' },
  { key: 'salaire.create', description: 'Créer salaires' },
  { key: 'salaire.update', description: 'Modifier salaires' },
  { key: 'salaire.delete', description: 'Supprimer salaires' },
  { key: 'salaire.payer', description: 'Payer salaire' },
  { key: 'salaire.annuler', description: 'Annuler salaire' },

  { key: 'rapport.read', description: 'Consulter rapports' },

  // Documents officiels
  { key: 'document.read',   description: 'Consulter les documents officiels' },
  { key: 'document.create', description: 'Générer des documents officiels' },
  { key: 'document.update', description: 'Modifier les documents officiels' },
  { key: 'document.delete', description: 'Supprimer des documents officiels' },

  // PDF
  { key: 'pdf.liste-eleves', description: 'PDF liste élèves' },
  { key: 'pdf.cartes-scolaires', description: 'PDF cartes scolaires' },
  { key: 'pdf.carte-scolaire-individuelle', description: 'PDF carte individuelle' },

  // Type matière
  { key: 'typeMatiere.read', description: 'Consulter types matière' },
  { key: 'typeMatiere.create', description: 'Créer types matière' },
  { key: 'typeMatiere.update', description: 'Modifier types matière' },
  { key: 'typeMatiere.delete', description: 'Supprimer types matière' },
  // Documents officiels
{ key: 'document.read', description: 'Consulter les documents officiels' },
{ key: 'document.create', description: 'Générer des documents officiels' },
{ key: 'document.update', description: 'Modifier les documents officiels' },
{ key: 'document.delete', description: 'Supprimer des documents officiels' },
];

  const createdPermissions: any[] = [];
  for (const permissionData of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key: permissionData.key },
      update: {},
      create: permissionData
    });
    createdPermissions.push(permission);
  }
  console.log(`✅ ${createdPermissions.length} permissions créées\n`);

  // ============================================
  // 4. ATTRIBUTION DES PERMISSIONS AUX RÔLES
  // ============================================

  console.log('🔗 Attribution des permissions aux rôles...');

  // ADMIN : Toutes les permissions
  await prisma.role.update({
    where: { id: roleAdmin.id },
    data: {
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id }))
      }
    }
  });
  console.log(`✅ ADMIN: ${createdPermissions.length} permissions assignées`);

  // PROVISEUR : Gestion complète de l'établissement
  const proviseurPermissionKeys = [
    'user.read', 'user.create', 'user.update', 'user.archive',
    'role.read', 'role.create', 'role.update', 'role.assign_permissions',
    'permission.read', 'permission.create', 'permission.update',
    'eleve.read', 'eleve.create', 'eleve.update', 'eleve.export', 'eleve.statistics',
    'note.read', 'note.create', 'note.update', 'note.export',
    'bulletin.read', 'bulletin.generate', 'bulletin.export',
    'classe.read', 'classe.create', 'classe.update', 'classe.manage_eleves',
    'matiere.read', 'matiere.create', 'matiere.update',
    'evaluation.read', 'evaluation.create', 'evaluation.update',
    'parent.read', 'parent.create', 'parent.update',
    'staff.read', 'staff.create', 'staff.update',
    'niveau.read', 'niveau.create', 'niveau.update',
    'annee.read', 'annee.create', 'annee.update',
    'filiere.read', 'filiere.create', 'filiere.update',
    'specialite.read', 'specialite.create', 'specialite.update',
    'inscription.read', 'inscription.create', 'inscription.update',
    'paiement.read', 'paiement.create', 'paiement.statistics',
    'absence.read', 'absence.create', 'absence.update', 'absence.statistics', 'absence.confirmProf',
    'retard.read', 'retard.create', 'retard.statistics', 'retard.confirmProf',
    'type.read', 'type.create', 'type.update',
    'evenement.read', 'evenement.create', 'evenement.update', 'evenement.delete',
    'accueil.read', 'accueil.create', 'accueil.update',
    'presentation.read', 'presentation.create', 'presentation.update',
    'galery.read', 'galery.create', 'galery.update', 'galery.delete',
    'video.read', 'video.create', 'video.update', 'video.delete',
    'typeEnseignement.read', 'typeEnseignement.create', 'typeEnseignement.update',
    'enseignementAnnee.read', 'enseignementAnnee.create', 'enseignementAnnee.update',
    'coefficientNiveau.read', 'coefficientNiveau.create', 'coefficientNiveau.update',
    'coefficientSerie.read', 'coefficientSerie.create', 'coefficientSerie.update',
    'serie.read', 'serie.create', 'serie.update',
    'typeMatiere.read', 'typeMatiere.create', 'typeMatiere.update',
    'leavePermission.read', 'leavePermission.create', 'leavePermission.update',
    'leavePermission.approve', 'leavePermission.reject', 'leavePermission.statistics',
    'categorieComptable.read', 'compteBancaire.read', 'compteBancaire.viewSolde',
    'transaction.read', 'transaction.statistics',
    'budget.read', 'budget.dashboard', 'budget.viewRealization',
    'salaire.read', 'rapport.read',
    'document.read', 'document.create', 'document.update',
    'pdf.liste-eleves', 'pdf.cartes-scolaires', 'pdf.carte-scolaire-individuelle',
    'document.read',
    'document.create',
    'document.update',
  ];

  const proviseurPermissions = createdPermissions.filter(p =>
    proviseurPermissionKeys.includes(p.key)
  );

  await prisma.role.update({
    where: { id: roleProviseur.id },
    data: {
      permissions: {
        connect: proviseurPermissions.map(p => ({ id: p.id }))
      }
    }
  });
  console.log(`✅ PROVISEUR: ${proviseurPermissions.length} permissions assignées`);

  // PROFESSEUR : Gestion pédagogique
  const professeurPermissionKeys = [
    'eleve.read',
    'note.read', 'note.create', 'note.update',
    'bulletin.read', 'bulletin.generate',
    'classe.read',
    'matiere.read',
    'evaluation.read', 'evaluation.create', 'evaluation.update', 'evaluation.delete',
    'staff.read',
    'niveau.read', 'annee.read', 'filiere.read',
    'absence.read', 'absence.create',
    'retard.read', 'retard.create'
  ];

  const professeurPermissions = createdPermissions.filter(p =>
    professeurPermissionKeys.includes(p.key)
  );

  await prisma.role.update({
    where: { id: roleProfesseur.id },
    data: {
      permissions: {
        connect: professeurPermissions.map(p => ({ id: p.id }))
      }
    }
  });
  console.log(`✅ PROFESSEUR: ${professeurPermissions.length} permissions assignées`);

  // PARENT : Consultation de son enfant
  const parentPermissionKeys = [
    'eleve.read',
    'note.read',
    'bulletin.read',
    'classe.read',
    'matiere.read',
    'staff.read',
    'niveau.read', 'annee.read', 'filiere.read',
    'absence.read',
    'retard.read',
    'paiement.read', 'paiement.create',
    'inscription.read'
  ];

  const parentPermissions = createdPermissions.filter(p =>
    parentPermissionKeys.includes(p.key)
  );

  await prisma.role.update({
    where: { id: roleParent.id },
    data: {
      permissions: {
        connect: parentPermissions.map(p => ({ id: p.id }))
      }
    }
  });
  console.log(`✅ PARENT: ${parentPermissions.length} permissions assignées`);

  // ELEVE : Consultation de ses propres données
  const elevePermissionKeys = [
    'note.read',
    'bulletin.read',
    'classe.read',
    'matiere.read',
    'staff.read',
    'niveau.read', 'annee.read', 'filiere.read',
    'absence.read',
    'retard.read'
  ];

  const elevePermissions = createdPermissions.filter(p =>
    elevePermissionKeys.includes(p.key)
  );

  await prisma.role.update({
    where: { id: roleEleve.id },
    data: {
      permissions: {
        connect: elevePermissions.map(p => ({ id: p.id }))
      }
    }
  });
  console.log(`✅ ELEVE: ${elevePermissions.length} permissions assignées\n`);

  // ============================================
  // 5. CRÉATION DES UTILISATEURS
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

 
  console.log('✅ Utilisateurs créés\n');


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

  console.log('\n' + '='.repeat(70));
  console.log('✅ SEED COMPLET TERMINÉ AVEC SUCCÈS!');
  console.log('='.repeat(70));
  console.log('\n📊 DONNÉES CRÉÉES:');
  console.log('• 5 rôles');
  console.log('• 11 utilisateurs (admin, 2 profs, 1 parent, 7 élèves)');
  console.log('• 2 années académiques (2024-2025, 2025-2026)');
  console.log('• 3 niveaux (6ème, 3ème, 2nde)');
  console.log('• 2 classes (6èmeA, 3èmeA)');
  console.log('• 3 trimestres pour 2025-2026');
  console.log('• 6 matières avec coefficients');
  console.log('• 2 staff (professeurs)');
  console.log('• 7 élèves avec profils différents');
  console.log('• 8 inscriptions (dont redoublants et cas tests)');
  console.log('• 6 évaluations avec notes complètes');

  console.log('\n🔐 COMPTES DE TEST:');
  console.log('   Admin: admin@ecole.com / password123');
  
  console.log('\n💡 POUR TESTER:');
console.log('='.repeat(70));
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
