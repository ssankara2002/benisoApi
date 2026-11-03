import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const staffCount = await prisma.staff.count();
  console.log('📊 Total staff dans la base:', staffCount);

  const staffWithUsers = await prisma.staff.findMany({
    include: {
      user: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  console.log('\n👥 Liste des staff:');
  staffWithUsers.forEach((staff, index) => {
    console.log(`${index + 1}. ${staff.user.prenom} ${staff.user.nom} - ${staff.user.role?.name} (${staff.user.email})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
