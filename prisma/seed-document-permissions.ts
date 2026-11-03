import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📄 Ajout des permissions documents...');

  const documentPermissions = [
    { key: 'document.read',   description: 'Consulter les documents officiels' },
    { key: 'document.create', description: 'Générer des documents officiels' },
    { key: 'document.update', description: 'Modifier les documents officiels' },
    { key: 'document.delete', description: 'Supprimer des documents officiels' },
  ];

  const created: any[] = [];
  for (const p of documentPermissions) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
    created.push(perm);
    console.log(`  ✅ ${p.key}`);
  }

  // ADMIN : toutes les permissions (ajout des nouvelles)
  const roleAdmin = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
  if (roleAdmin) {
    await prisma.role.update({
      where: { id: roleAdmin.id },
      data: { permissions: { connect: created.map(p => ({ id: p.id })) } },
    });
    console.log('✅ ADMIN : permissions document assignées');
  }

  // PROVISEUR : read, create, update
  const roleProviseur = await prisma.role.findFirst({ where: { name: 'PROVISEUR' } });
  if (roleProviseur) {
    const proviseurPerms = created.filter(p =>
      ['document.read', 'document.create', 'document.update'].includes(p.key)
    );
    await prisma.role.update({
      where: { id: roleProviseur.id },
      data: { permissions: { connect: proviseurPerms.map(p => ({ id: p.id })) } },
    });
    console.log('✅ PROVISEUR : permissions document assignées');
  }

  // SECRETAIRE (si existe) : read, create
  const roleSecretaire = await prisma.role.findFirst({ where: { name: 'SECRETAIRE' } });
  if (roleSecretaire) {
    const secretairePerms = created.filter(p =>
      ['document.read', 'document.create'].includes(p.key)
    );
    await prisma.role.update({
      where: { id: roleSecretaire.id },
      data: { permissions: { connect: secretairePerms.map(p => ({ id: p.id })) } },
    });
    console.log('✅ SECRETAIRE : permissions document assignées');
  }

  console.log('\n🎉 Permissions documents insérées avec succès.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
