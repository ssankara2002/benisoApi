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
  await prisma.cahierTexte.deleteMany({});
  await prisma.seance.deleteMany({});
  await prisma.emploiDuTemps.deleteMany({});
  await prisma.enseignementAnnee.deleteMany({});
  await prisma.coeficientSerie.deleteMany({});
  await prisma.coeficientNiveau.deleteMany({});
  await prisma.paiement.deleteMany({});
  await prisma.inscription.deleteMany({});
  await prisma.absence.deleteMany({});
  await prisma.retard.deleteMany({});
  await prisma.leavePermission.deleteMany({});
  await prisma.salaire.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.eleve.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.trimestre.deleteMany({});
  await prisma.serie.deleteMany({});
  await prisma.classe.deleteMany({});
  await prisma.specialite.deleteMany({});
  await prisma.matiere.deleteMany({});
  await prisma.typeMatiere.deleteMany({});
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
  { key: 'typeMatiere.delete', description: 'Supprimer types matière' }
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
    'pdf.liste-eleves', 'pdf.cartes-scolaires', 'pdf.carte-scolaire-individuelle'
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

  // Inscription élève 2 - année précédente (pour classe redoublée)
  const inscriptionEleve2_2024 = await prisma.inscription.create({
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
  // 17. CAS DE TEST POUR DÉCISION DE PASSAGE
  // ============================================

  console.log('📋 Création des cas de test pour décision de passage...');

  // Cas 1: Élève handicapé avec moyenne < 7 (ne peut pas être exclu)
  const userHandicape = await prisma.user.create({
    data: {
      nom: 'HANDICAPÉ',
      prenom: 'Jean',
      email: 'jean.handicape@test.com',
      password: hashedPassword,
      phone: '0701000000',
      sexe: 'M',
      roleId: roleEleve.id
    }
  });

  const eleveHandicape = await prisma.eleve.create({
    data: {
      userId: userHandicape.id,
      dateNaissance: new Date('2010-01-01'),
      acteNaissance: 'ACT101',
      matricule: 'HAND001',
      filiereId: filiereScientifique.id,
      estHandicape: true,
      statut: 'VALIDE'
    }
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleveHandicape.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: false,
      moyenneGenerale: 5.0,
      decision: null,
      nombreRedoublementsCycle: 0,
      cycleActuel: 'COLLEGE'
    }
  });

  // Cas 2: Élève de moins de 16 ans avec moyenne < 7 (ne peut pas être exclu)
  const userMoins16 = await prisma.user.create({
    data: {
      nom: 'JEUNE',
      prenom: 'Marie',
      email: 'marie.jeune@test.com',
      password: hashedPassword,
      phone: '0702000000',
      sexe: 'F',
      roleId: roleEleve.id
    }
  });

  const eleveJeune = await prisma.eleve.create({
    data: {
      userId: userMoins16.id,
      dateNaissance: new Date('2012-06-15'), // Moins de 16 ans
      acteNaissance: 'ACT102',
      matricule: 'JEUNE001',
      filiereId: filiereScientifique.id,
      estHandicape: false,
      statut: 'VALIDE'
    }
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleveJeune.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: false,
      moyenneGenerale: 6.5,
      decision: null,
      nombreRedoublementsCycle: 0,
      cycleActuel: 'COLLEGE'
    }
  });

  // Cas 3: Élève avec 2 redoublements (exclusion automatique)
  const userRedoublant2x = await prisma.user.create({
    data: {
      nom: 'REDOUBLANT',
      prenom: 'Pierre',
      email: 'pierre.redoublant@test.com',
      password: hashedPassword,
      phone: '0703000000',
      sexe: 'M',
      roleId: roleEleve.id
    }
  });

  const eleveRedoublant2x = await prisma.eleve.create({
    data: {
      userId: userRedoublant2x.id,
      dateNaissance: new Date('2008-03-20'), // Plus de 16 ans
      acteNaissance: 'ACT103',
      matricule: 'RED2X001',
      filiereId: filiereScientifique.id,
      estHandicape: false,
      statut: 'VALIDE'
    }
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleveRedoublant2x.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: true,
      moyenneGenerale: 8.5,
      decision: null,
      nombreRedoublementsCycle: 2, // Exclusion automatique
      cycleActuel: 'COLLEGE'
    }
  });

  // Cas 4: Élève excluable (> 16 ans, moyenne <= 7, non protégé)
  const userExcluable = await prisma.user.create({
    data: {
      nom: 'EXCLUABLE',
      prenom: 'Sophie',
      email: 'sophie.excluable@test.com',
      password: hashedPassword,
      phone: '0704000000',
      sexe: 'F',
      roleId: roleEleve.id
    }
  });

  const eleveExcluable = await prisma.eleve.create({
    data: {
      userId: userExcluable.id,
      dateNaissance: new Date('2007-09-10'), // Plus de 16 ans
      acteNaissance: 'ACT104',
      matricule: 'EXCL001',
      filiereId: filiereScientifique.id,
      estHandicape: false,
      statut: 'VALIDE'
    }
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleveExcluable.id,
      anneeId: annee2025.id,
      niveauId: niveau3eme.id,
      classeId: classe3emeA.id,
      estRedoublant: false,
      moyenneGenerale: 6.8,
      decision: null,
      nombreRedoublementsCycle: 0,
      cycleActuel: 'COLLEGE'
    }
  });

  console.log('✅ Cas de test pour décision de passage créés\n');

  // ============================================
  // RÉSUMÉ
  // ============================================

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

  console.log('\n🎯 ÉLÈVES PRINCIPAUX:');
  console.log('1. Marie COMPAORE (F) - Élève normale, bonnes notes (moyenne ~14)');
  console.log('2. Thomas SANKARA (M) - Redoublant 3ème, notes faibles (moyenne ~8.5)');
  console.log('3. Aminata KABORE (F) - Handicapée, notes moyennes (moyenne ~11.5)');

  console.log('\n📋 CAS DE TEST DÉCISION DE PASSAGE:');
  console.log('4. Jean HANDICAPÉ (M) - Handicapé, moyenne 5.0 → NE PEUT PAS être exclu');
  console.log('5. Marie JEUNE (F) - Moins de 16 ans, moyenne 6.5 → NE PEUT PAS être exclu');
  console.log('6. Pierre REDOUBLANT (M) - 2 redoublements → EXCLUSION AUTOMATIQUE');
  console.log('7. Sophie EXCLUABLE (F) - Plus de 16 ans, moyenne 6.8 → PEUT être exclu');

  console.log('\n🔐 COMPTES DE TEST:');
  console.log('   Admin: admin@ecole.com / password123');
  console.log('   Prof 1 (BAZONGO): bazongo@ecole.com / password123');
  console.log('   Prof 2 (DIARRA): diarra@ecole.com / password123');
  console.log('   Parent: parent1@ecole.com / password123');
  console.log('   Élève 1: eleve1@ecole.com / password123');
  console.log('   Élève 2: eleve2@ecole.com / password123');
  console.log('   Élève 3: eleve3@ecole.com / password123');
  console.log('   Test handicapé: jean.handicape@test.com / password123');
  console.log('   Test jeune: marie.jeune@test.com / password123');
  console.log('   Test redoublant: pierre.redoublant@test.com / password123');
  console.log('   Test excluable: sophie.excluable@test.com / password123');

  console.log('\n💡 POUR TESTER:');
  console.log('• Bulletins: Générer les bulletins pour les élèves 1, 2, 3');
  console.log('• Décision passage: Tester avec les 7 cas différents');
  console.log('• Duplicata: Télécharger un bulletin 3 fois pour voir "DUPLICATA" en rouge');
  console.log('• Classe redoublée: Vérifier l\'affichage pour l\'élève 2 (Thomas)');
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
