import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔄 Réinitialisation du mot de passe admin...');

  try {
    // Trouver l'utilisateur admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ecole.com' }
    });

    if (!admin) {
      console.log('❌ Utilisateur admin introuvable. Création d\'un nouvel admin...');

      // Récupérer le rôle ADMIN
      const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' }
      });

      if (!adminRole) {
        console.error('❌ Rôle ADMIN introuvable. Exécutez d\'abord le seed complet.');
        process.exit(1);
      }

      // Créer un nouvel admin
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@ecole.com',
          password: hashedPassword,
          nom: 'Admin',
          prenom: 'System',
          roleId: adminRole.id
        }
      });

      console.log(`✅ Nouvel utilisateur admin créé: ${newAdmin.email}`);
      console.log('✅ Mot de passe: admin123');
    } else {
      // Réinitialiser le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 12);

      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });

      console.log(`✅ Mot de passe réinitialisé pour: ${admin.email}`);
      console.log('✅ Nouveau mot de passe: admin123');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
