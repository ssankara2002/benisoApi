import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPDFPermissions() {
  console.log('🔍 Vérification des permissions PDF...\n');

  // Vérifier que les permissions existent
  const pdfPermissions = await prisma.permission.findMany({
    where: {
      key: {
        startsWith: 'pdf.'
      }
    }
  });

  console.log('📋 Permissions PDF trouvées:');
  pdfPermissions.forEach(p => {
    console.log(`  ✅ ${p.key}: ${p.description}`);
  });

  console.log('\n👥 Rôles avec permissions PDF:\n');

  // Vérifier pour chaque rôle
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        where: {
          key: {
            startsWith: 'pdf.'
          }
        }
      }
    }
  });

  roles.forEach(role => {
    if (role.permissions.length > 0) {
      console.log(`✅ ${role.name}:`);
      role.permissions.forEach(p => {
        console.log(`   - ${p.key}`);
      });
    } else {
      console.log(`❌ ${role.name}: Aucune permission PDF`);
    }
  });

  console.log('\n✅ Vérification terminée!');
}

checkPDFPermissions()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Erreur:', e);
    prisma.$disconnect();
  });
