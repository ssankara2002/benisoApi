import cron from 'node-cron';
import prisma from '../prismaClient';
import { sendRappelTrancheEmail } from '../Services/email.service';
import { sendRappelTrancheSms } from '../Services/sms.service';

// Rappels envoyés J-7, J-3, J-1 et le jour J (0) et après échéance
const JOURS_RAPPEL = [7, 3, 1, 0];

export default function startRappelTrancheCron() {
  // Tourne chaque jour à 8h00
  cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Cron rappel tranches : vérification des échéances...');

    try {
      const aujourd_hui = new Date();
      aujourd_hui.setHours(0, 0, 0, 0);

      // Récupérer toutes les tranches non soldées avec une échéance définie
      const paiements = await prisma.paiement.findMany({
        where: {
          dateEcheance: { not: null },
          montantAttendu: { gt: 0 },
        },
        include: {
          eleve: {
            include: {
              user: true,
              parents: {
                include: { user: true },
              },
            },
          },
        },
      });

      let nbRappels = 0;

      for (const paiement of paiements) {
        const montantPaye = paiement.montant || 0;
        const montantAttendu = paiement.montantAttendu || 0;

        // Tranche déjà soldée, on ignore
        if (montantPaye >= montantAttendu) continue;

        if (!paiement.dateEcheance) continue;

        const echeance = new Date(paiement.dateEcheance);
        echeance.setHours(0, 0, 0, 0);

        const diffMs = echeance.getTime() - aujourd_hui.getTime();
        const joursRestants = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Envoyer rappel seulement aux jours définis (J-7, J-3, J-1, J0) ou si dépassé (J-1 après échéance)
        const doitEnvoyer = JOURS_RAPPEL.includes(joursRestants) || joursRestants === -1;
        if (!doitEnvoyer) continue;

        const eleve = paiement.eleve;
        if (!eleve?.parents?.length) continue;

        for (const parent of eleve.parents) {
          const parentNom = `${parent.user.prenom} ${parent.user.nom}`;
          const libelle = paiement.libelleTranche || `Tranche ${paiement.numeroTranche}`;

          if (parent.user?.email) {
            try {
              await sendRappelTrancheEmail(
                parent.user.email,
                parentNom,
                eleve.user.nom,
                eleve.user.prenom,
                libelle,
                montantAttendu,
                montantPaye,
                paiement.dateEcheance,
                joursRestants
              );
              nbRappels++;
            } catch (err) {
              console.error(`❌ Rappel tranche email non envoyé à ${parent.user.email}:`, err);
            }
          }

          if (parent.user?.phone) {
            try {
              await sendRappelTrancheSms(
                parent.user.phone,
                parentNom,
                eleve.user.prenom,
                eleve.user.nom,
                libelle,
                montantAttendu - montantPaye,
                paiement.dateEcheance,
                joursRestants
              );
            } catch (err) {
              console.error(`❌ Rappel tranche SMS non envoyé à ${parent.user.phone}:`, err);
            }
          }
        }
      }

      console.log(`✅ Cron rappel tranches terminé : ${nbRappels} email(s) envoyé(s)`);
    } catch (error) {
      console.error('❌ Erreur cron rappel tranches:', error);
    }
  });
}
