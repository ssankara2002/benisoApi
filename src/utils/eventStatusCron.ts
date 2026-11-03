import cron from 'node-cron';
import prisma from '../prismaClient';

export default function startEventStatusCron() {
  // Schedule: every minute
  const task = cron.schedule('*/1 * * * *', async () => {
    try {
      const now = new Date();
      const evenements = await prisma.evenement.findMany({});

      for (const ev of evenements) {
        let newStatut: string = 'EN_ATTENTE';

        const debut = ev.dateDebut ? new Date(ev.dateDebut) : null;
        const fin = ev.dateFin ? new Date(ev.dateFin) : null;

        if (fin && fin.getTime() <= now.getTime()) {
          newStatut = 'TERMINE';
        } else if (debut && debut.getTime() <= now.getTime()) {
          // debut arrived and fin not yet arrived (or not set)
          newStatut = 'EN_COURS';
        } else {
          // debut not arrived yet or not set
          newStatut = 'EN_ATTENTE';
        }

        // only update if different
        if ((ev as any).statut !== newStatut) {
          try {
            await prisma.evenement.update({
              where: { id: ev.id },
              data: { statut: newStatut as any },
            });
          } catch (e) {
            console.error('Erreur lors de la mise à jour du statut de l\'événement', ev.id, e);
          }
        }
      }
    } catch (error: any) {
      // If Prisma reports a schema mismatch (P2022), stop the cron and log a helpful message
      if (error?.code === 'P2022') {
        console.error('Prisma P2022: mismatch between schema.prisma and database for model Evenement. Cron will be stopped.');
        console.error('Détails:', error.meta || error.message);
        try {
          task.stop();
        } catch (e) {
          /* noop */
        }
        return;
      }

      console.error('Erreur cron mise à jour statut événements:', error);
    }
  });

  return task;
}
