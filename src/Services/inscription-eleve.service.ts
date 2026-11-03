import { PrismaClient, Prisma } from '@prisma/client';
import { InscriptionEleveData, InscriptionResult } from '../interface/allInterface';

const prisma = new PrismaClient();

class InscriptionEleveService {
  /**
   * Inscription d'un élève avec paiement (espèce ou électronique)
   */
  async inscrireEleveAvecPaiement(data: InscriptionEleveData): Promise<InscriptionResult> {
    try {
      // Utiliser une transaction Prisma pour assurer l'atomicité
      const result = await prisma.$transaction(async (tx) => {
        // 1. Déterminer l'eleveId et l'anneeId selon l'utilisateur connecté
        let finalEleveId = data.eleveId;
        let finalAnneeId = data.anneeId;

        // Récupérer l'utilisateur connecté avec son rôle
        const user = await tx.user.findUnique({
          where: { id: data.userId },
          include: {
            role: true,
            eleve: true,
            staff: true
          },
        });

        if (!user) {
          throw new Error('Utilisateur introuvable');
        }

        // Si l'utilisateur est un élève (role ELEVE), utiliser son propre ID
        if (user.role?.name === 'ELEVE') {
          if (!user.eleve) {
            throw new Error('Aucun profil élève trouvé pour cet utilisateur');
          }
          finalEleveId = user.eleve.id;
          console.log(`✅ Élève auto-détecté : ${user.eleve.id}`);
        } else if (user.role?.name === 'STAFF' || user.role?.name === 'ADMIN') {
          // Si c'est un staff/admin, eleveId doit être fourni
          if (!finalEleveId) {
            throw new Error('eleveId est obligatoire pour un staff/admin');
          }
          console.log(`✅ Staff/Admin inscrit l'élève : ${finalEleveId}`);
        } else {
          throw new Error('Rôle non autorisé pour les inscriptions');
        }

        // Si anneeId n'est pas fourni, récupérer l'année scolaire en cours
        if (!finalAnneeId) {
          const anneeEnCours = await tx.annee.findFirst({
            where: {
              dateDebut: { lte: new Date() },
              dateFin: { gte: new Date() }
            }
          });

          if (!anneeEnCours) {
            // Si pas d'année en cours, prendre la dernière créée
            const derniereAnnee = await tx.annee.findFirst({
              orderBy: { dateDebut: 'desc' }
            });

            if (!derniereAnnee) {
              throw new Error('Aucune année scolaire trouvée');
            }

            finalAnneeId = derniereAnnee.id;
            console.log(`⚠️  Pas d'année en cours, utilisation de la dernière année : ${finalAnneeId}`);
          } else {
            finalAnneeId = anneeEnCours.id;
            console.log(`✅ Année en cours auto-détectée : ${finalAnneeId}`);
          }
        }

        // Validation finale
        if (!finalEleveId || !finalAnneeId) {
          throw new Error('eleveId et anneeId sont requis');
        }

        if (!data.niveauId) {
          throw new Error('niveauId est requis pour l\'inscription');
        }

        // 2. Récupérer l'élève avec ses infos user
        const eleve = await tx.eleve.findUnique({
          where: { id: finalEleveId },
          include: { user: true },
        });

        if (!eleve) {
          throw new Error('Élève introuvable');
        }

        // 3. Récupérer les tranches configurées pour le niveau (si paiement par tranches)
        let tranchesConfigurees = null;
        if (data.typePaiement === 'TRANCHE') {
          tranchesConfigurees = await tx.configurationTranche.findMany({
            where: { niveauId: data.niveauId },
            orderBy: { numeroTranche: 'asc' }
          });

          if (!tranchesConfigurees || tranchesConfigurees.length === 0) {
            throw new Error('Aucune tranche configurée pour ce niveau. Veuillez configurer les tranches avant d\'inscrire avec paiement par tranches.');
          }
        }

        // 4. Créer l'inscription avec les IDs finaux
        const inscription = await tx.inscription.create({
          data: {
            eleveId: finalEleveId,
            anneeId: finalAnneeId,
            niveauId: data.niveauId,
            modePaiement: data.typePaiement || 'COMPLET',
            // classeId sera assigné plus tard via assignerClasse
          },
        });

        // 5. Gérer le paiement selon le type (COMPLET ou TRANCHE)
        let paiement;
        let paiements = [];

        if (data.typePaiement === 'TRANCHE' && tranchesConfigurees) {
          // Créer un paiement pour chaque tranche configurée
          paiements = await Promise.all(
            tranchesConfigurees.map(async (tranche, index) => {
              return await tx.paiement.create({
                data: {
                  inscriptionId: inscription.id,
                  eleveId: eleve.id,
                  numeroTranche: tranche.numeroTranche,
                  totalTranches: tranchesConfigurees.length,
                  libelleTranche: tranche.libelle,
                  montantAttendu: tranche.montant,
                  montant: 0, // Pas encore payé
                  date: new Date(),
                  dateEcheance: tranche.dateFin || undefined,
                  modePaiement: null,
                },
              });
            })
          );

          // Si des tranches spécifiques sont sélectionnées, payer uniquement celles-ci
          if (data.tranchesSelectionnees && data.tranchesSelectionnees.length > 0) {
            // Calculer le montant total des tranches sélectionnées
            let montantTotalTranches = 0;

            for (const numeroTranche of data.tranchesSelectionnees) {
              const paiementIndex = paiements.findIndex(p => p.numeroTranche === numeroTranche);

              if (paiementIndex >= 0) {
                const tranchePaiement = paiements[paiementIndex];
                const montantTranche = tranchePaiement.montantAttendu || 0;
                montantTotalTranches += montantTranche;

                // Mettre à jour le paiement de cette tranche
                paiements[paiementIndex] = await tx.paiement.update({
                  where: { id: tranchePaiement.id },
                  data: {
                    montant: montantTranche, // Payer le montant complet de la tranche
                    modePaiement: data.modePaiement,
                    date: new Date(),
                  },
                });
              }
            }

            console.log(`✅ ${data.tranchesSelectionnees.length} tranche(s) payée(s) pour un total de ${montantTotalTranches} FCFA`);
          } else if (data.montant && data.montant > 0) {
            // Si pas de tranches sélectionnées mais un montant fourni, payer les premières tranches
            let montantRestant = data.montant;

            for (let i = 0; i < paiements.length && montantRestant > 0; i++) {
              const tranchePaiement = paiements[i];
              const montantAPayer = Math.min(montantRestant, tranchePaiement.montantAttendu || 0);

              // Mettre à jour le paiement de cette tranche
              paiements[i] = await tx.paiement.update({
                where: { id: tranchePaiement.id },
                data: {
                  montant: montantAPayer,
                  modePaiement: data.modePaiement,
                  date: new Date(),
                },
              });

              montantRestant -= montantAPayer;
            }

            // Si montant restant > 0, c'est qu'on a trop payé
            if (montantRestant > 0) {
              throw new Error(`Le montant fourni (${data.montant}) dépasse le total requis`);
            }
          }

          paiement = paiements[0];
        } else if (data.modePaiement === 'espece') {
          // Paiement en espèce - simple enregistrement
          paiement = await tx.paiement.create({
            data: {
              date: new Date(),
              modePaiement: 'espece',
              montant: data.montant,
              inscriptionId: inscription.id,
              eleveId: eleve.id,
              // Paiement complet (1 tranche)
              numeroTranche: 1,
              totalTranches: 1,
              libelleTranche: 'Paiement complet',
              montantAttendu: data.montant,
            },
          });
        }

        return {
          user: eleve.user,
          eleve,
          inscription,
          paiement,
          paiements: paiements.length > 0 ? paiements : undefined,
        } as any;
      });

      return {
        success: true,
        message: 'Inscription réussie',
        data: {
          user: result.user,
          eleve: result.eleve,
          inscription: result.inscription,
          paiement: result.paiement,
          ...(result.paiements && { paiements: result.paiements }),
        },
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);

      return {
        success: false,
        message: 'Erreur lors de l\'inscription',
        error: error.message,
      };
    }
  }

  /**
   * Récupérer une inscription avec tous les détails
   */
  async getInscriptionDetails(inscriptionId: number) {
    try {
      const inscription = await prisma.inscription.findUnique({
        where: { id: inscriptionId },
        include: {
          eleve: {
            include: {
              user: true,
              filiere: true,
            },
          },
          annee: true,
          niveau: true,
          classe: true,
          paiements: true,
        },
      });

      if (!inscription) {
        throw new Error('Inscription introuvable');
      }

      return inscription;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les inscriptions pour une année
   */
  async getInscriptionsByAnnee(anneeId: number) {
    try {
      const inscriptions = await prisma.inscription.findMany({
        where: { anneeId },
        include: {
          eleve: {
            include: {
              user: true,
              filiere: true,
            },
          },
          annee: true,
          niveau: true,
          classe: true,
          paiements: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return inscriptions;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des inscriptions:', error);
      throw error;
    }
  }


  /**
   * Assigner une classe à une inscription
   */
  async assignerClasse(inscriptionId: number, classeId: number) {
    try {
      // Vérifier que l'inscription existe
      const inscription = await prisma.inscription.findUnique({
        where: { id: inscriptionId },
        include: {
          niveau: true,
        },
      });

      if (!inscription) {
        throw new Error('Inscription introuvable');
      }

      // Vérifier que la classe existe
      const classe = await prisma.classe.findUnique({
        where: { id: classeId },
        include: {
          niveau: true,
        },
      });

      if (!classe) {
        throw new Error('Classe introuvable');
      }

      // Vérifier que la classe correspond au niveau de l'inscription
      if (inscription.niveauId && classe.niveauId && classe.niveauId !== inscription.niveauId) {
        throw new Error(
          `La classe appartient au niveau "${classe.niveau?.nomNiveau}" mais l'inscription est pour le niveau "${inscription.niveau?.nomNiveau}"`
        );
      }

      // Mettre à jour l'inscription avec la classe
      const updatedInscription = await prisma.inscription.update({
        where: { id: inscriptionId },
        data: {
          classeId: classeId,
        },
        include: {
          eleve: {
            include: {
              user: true,
            },
          },
          annee: true,
          niveau: true,
          classe: true,
        },
      });

      return updatedInscription;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'assignation de la classe:', error);
      throw error;
    }
  }

  /**
   * Assigner une classe à plusieurs inscriptions
   */
  async assignerClassePlusieurs(inscriptionIds: number[], classeId: number) {
    try {
      // Vérifier que la classe existe
      const classe = await prisma.classe.findUnique({
        where: { id: classeId },
        include: {
          niveau: true,
          _count: {
            select: {
              inscriptions: true
            }
          }
        },
      });

      if (!classe) {
        throw new Error('Classe introuvable');
      }

      // Vérifier la capacité de la classe
      const effectifActuel = classe._count.inscriptions;
      const capacite = classe.capacite || 0;
      const placesDisponibles = capacite - effectifActuel;

      if (inscriptionIds.length > placesDisponibles) {
        throw new Error(`La classe n'a que ${placesDisponibles} place(s) disponible(s) mais vous essayez d'assigner ${inscriptionIds.length} élève(s)`);
      }

      // Récupérer toutes les inscriptions
      const inscriptions = await prisma.inscription.findMany({
        where: { id: { in: inscriptionIds } },
        include: {
          niveau: true,
        },
      });

      if (inscriptions.length !== inscriptionIds.length) {
        throw new Error('Une ou plusieurs inscriptions sont introuvables');
      }

      // Vérifier que toutes les inscriptions correspondent au niveau de la classe
      const incompatibleInscriptions = inscriptions.filter(
        inscription => inscription.niveauId && classe.niveauId && inscription.niveauId !== classe.niveauId
      );

      if (incompatibleInscriptions.length > 0) {
        const incompatibleNames = incompatibleInscriptions.map(i => i.niveau?.nomNiveau || 'inconnu').join(', ');
        throw new Error(
          `La classe appartient au niveau "${classe.niveau?.nomNiveau}" mais certaines inscriptions sont pour les niveaux: ${incompatibleNames}`
        );
      }

      // Mettre à jour toutes les inscriptions
      const updatedInscriptions = await prisma.inscription.updateMany({
        where: { id: { in: inscriptionIds } },
        data: {
          classeId: classeId,
        },
      });

      return {
        success: true,
        count: updatedInscriptions.count,
        message: `${updatedInscriptions.count} élève(s) assigné(s) à la classe ${classe.nom}`
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'assignation multiple de la classe:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un paiement Moneroo
   */
  async updateMonerooPaiementStatus(
    paiementId: number,
    status: string,
    txHash?: string,
    blockHeight?: number
  ) {
    try {
      const paiement = await prisma.paiement.update({
        where: { id: paiementId },
        data: {
          moneroStatus: status,
          ...(txHash && { moneroTxHash: txHash }),
          ...(blockHeight && { moneroBlockHeight: blockHeight }),
        },
      });

      return paiement;
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour du statut du paiement:', error);
      throw error;
    }
  }

  /**
   * Confirmer manuellement un paiement en mode SANDBOX uniquement
   * Simule la confirmation d'un paiement Mobile Money pour les tests
   */
  async confirmerPaiementSandbox(paiementId: number) {
    try {
      const isSandbox = process.env.FEDAPAY_MODE !== 'production';

      if (!isSandbox) {
        throw new Error('❌ Cet endpoint ne fonctionne qu\'en mode SANDBOX. En PRODUCTION, les paiements sont confirmés automatiquement via webhook.');
      }

      console.log('🧪 ════════════════════════════════════════');
      console.log('🧪 [MODE TEST] Confirmation manuelle du paiement');
      console.log(`🧪 Payment ID: ${paiementId}`);
      console.log('🧪 ════════════════════════════════════════');

      // Récupérer le paiement
      const paiement = await prisma.paiement.findUnique({
        where: { id: paiementId },
        include: {
          eleve: {
            include: {
              user: true
            }
          }
        }
      });

      if (!paiement) {
        throw new Error('Paiement introuvable');
      }

      // Vérifier que c'est un paiement électronique
      if (paiement.modePaiement !== 'electronique') {
        throw new Error('Ce paiement n\'est pas un paiement électronique');
      }

      // Vérifier le statut actuel
      if (paiement.moneroStatus === 'success') {
        console.log('⚠️  Le paiement est déjà confirmé');
        return {
          message: 'Le paiement est déjà confirmé',
          data: paiement
        };
      }

      console.log(`🧪 Statut actuel: ${paiement.moneroStatus}`);

      // Mettre à jour le paiement avec le statut confirmé
      const updatedPaiement = await prisma.paiement.update({
        where: { id: paiementId },
        data: {
          moneroStatus: 'success',
          moneroTxHash: `sandbox_tx_${Date.now()}`, // TX hash fictif pour le test
          moneroBlockHeight: Math.floor(Math.random() * 1000000), // Block height fictif
        },
        include: {
          eleve: {
            include: {
              user: true
            }
          }
        }
      });

      console.log('🧪 ✅ Paiement confirmé avec succès (mode SANDBOX)');
      console.log(`🧪 💰 Montant: ${updatedPaiement.montant} FCFA`);
      console.log(`🧪 🎓 Élève: ${updatedPaiement.eleve?.user.nom} ${updatedPaiement.eleve?.user.prenom}`);
      console.log('🧪 ════════════════════════════════════════');

      return {
        message: '🧪 Paiement confirmé avec succès (mode TEST)',
        data: updatedPaiement
      };

    } catch (error: any) {
      console.error('❌ Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  }

  /**
   * Créer un plan de paiement par tranches pour une inscription
   */
  async creerPlanTranches(data: {
    inscriptionId: number;
    tranches: Array<{
      libelle: string;
      montantAttendu: number;
      dateEcheance?: string;
    }>;
  }) {
    try {
      const { inscriptionId, tranches } = data;

      // Vérifier que l'inscription existe
      const inscription = await prisma.inscription.findUnique({
        where: { id: inscriptionId },
        include: { eleve: true },
      });

      if (!inscription) {
        throw new Error('Inscription introuvable');
      }

      // Vérifier qu'il n'y a pas déjà un plan de tranches
      const paiementsExistants = await prisma.paiement.findMany({
        where: { inscriptionId },
      });

      if (paiementsExistants.length > 0) {
        throw new Error('Un plan de paiement existe déjà pour cette inscription');
      }

      const totalTranches = tranches.length;

      // Créer les paiements pour chaque tranche
      const paiementsCreated = await Promise.all(
        tranches.map((tranche, index) =>
          prisma.paiement.create({
            data: {
              inscriptionId,
              eleveId: inscription.eleveId,
              numeroTranche: index + 1,
              totalTranches,
              libelleTranche: tranche.libelle,
              montantAttendu: tranche.montantAttendu,
              montant: 0, // Pas encore payé
              date: new Date(),
              dateEcheance: tranche.dateEcheance ? new Date(tranche.dateEcheance) : undefined,
            },
          })
        )
      );

      return {
        success: true,
        message: `Plan de ${totalTranches} tranches créé avec succès`,
        data: paiementsCreated,
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du plan:', error);
      throw error;
    }
  }

  /**
   * Enregistrer un paiement sur une tranche
   */
  async payerTranche(data: {
    inscriptionId: number;
    numeroTranche: number;
    montant: number;
    modePaiement: string;
    date: string;
    recu?: string;
    paymentMethod?: string;
    phoneNumber?: string;
  }) {
    try {
      const { inscriptionId, numeroTranche, montant, modePaiement, date, recu } = data;

      // Trouver le paiement correspondant à cette tranche
      const paiementTranche = await prisma.paiement.findFirst({
        where: {
          inscriptionId,
          numeroTranche,
        },
      });

      if (!paiementTranche) {
        throw new Error(`Tranche ${numeroTranche} introuvable pour cette inscription`);
      }

      // Vérifier que le montant ne dépasse pas le montant attendu
      const montantRestant = (paiementTranche.montantAttendu || 0) - (paiementTranche.montant || 0);
      if (montant > montantRestant) {
        throw new Error(`Le montant ne peut pas dépasser ${montantRestant} FCFA`);
      }

      // Mettre à jour le paiement
      const paiementMisAJour = await prisma.paiement.update({
        where: { id: paiementTranche.id },
        data: {
          montant: (paiementTranche.montant || 0) + montant,
          modePaiement,
          date: new Date(date),
          recu,
        },
      });

      return {
        success: true,
        message: 'Paiement enregistré avec succès',
        data: paiementMisAJour,
      };
    } catch (error: any) {
      console.error('❌ Erreur lors du paiement de la tranche:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques de paiement pour une inscription
   */
  async getStatistiquesTranches(inscriptionId: number) {
    try {
      const paiements = await prisma.paiement.findMany({
        where: { inscriptionId },
        orderBy: { numeroTranche: 'asc' },
      });

      if (paiements.length === 0) {
        return null;
      }

      const totalAttendu = paiements.reduce((sum, p) => sum + (p.montantAttendu || 0), 0);
      const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
      const tranchesPayees = paiements.filter((p) => p.montant >= (p.montantAttendu || 0)).length;

      return {
        totalAttendu,
        totalPaye,
        totalRestant: totalAttendu - totalPaye,
        nombreTranches: paiements.length,
        tranchesPayees,
        pourcentage: totalAttendu > 0 ? (totalPaye / totalAttendu) * 100 : 0,
        tranches: paiements,
      };
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
  /**
   * Récupérer les informations de l'année précédente pour un élève (pour la réinscription)
   */
  async getInfosAnneePrecedente(eleveId: number): Promise<{
    inscription: any;
    niveauActuel: any;
    niveauSuivant: any | null;
    decision: string | null;
    moyenneGenerale: number | null;
    passe: boolean;
  }> {
    // Récupérer la dernière inscription de l'élève
    const derniereInscription = await prisma.inscription.findFirst({
      where: { eleveId },
      orderBy: { createdAt: 'desc' },
      include: {
        eleve: { include: { user: true } },
        niveau: true,
        classe: true,
        annee: true,
        paiements: true,
      },
    });

    if (!derniereInscription) {
      throw new Error("Aucune inscription précédente trouvée pour cet élève");
    }

    const niveauActuel = derniereInscription.niveau;

    // Chercher le niveau supérieur par ID (supposons ordre croissant des IDs)
    // On récupère tous les niveaux du même type d'enseignement triés par ID
    const tousLesNiveaux = await prisma.niveau.findMany({
      where: { typeEnseignementId: niveauActuel.typeEnseignementId },
      orderBy: { id: 'asc' },
    });

    const indexActuel = tousLesNiveaux.findIndex(n => n.id === niveauActuel.id);
    const niveauSuivant = indexActuel >= 0 && indexActuel < tousLesNiveaux.length - 1
      ? tousLesNiveaux[indexActuel + 1]
      : null;

    const passe = derniereInscription.decision === 'ADMIS';

    return {
      inscription: derniereInscription,
      niveauActuel,
      niveauSuivant,
      decision: derniereInscription.decision,
      moyenneGenerale: derniereInscription.moyenneGenerale,
      passe,
    };
  }

  /**
   * Réinscrire un élève existant pour la nouvelle année scolaire
   * - Si ADMIS : inscrit au niveau supérieur (si disponible)
   * - Si REDOUBLE/EXCLU : inscrit au même niveau
   */
  async reinscriptionEleve(data: InscriptionEleveData & { forcerNiveauId?: number }): Promise<InscriptionResult> {
    try {
      // Récupérer les infos de l'année précédente
      const userId = data.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, eleve: true },
      });

      if (!user) throw new Error('Utilisateur introuvable');

      let finalEleveId = data.eleveId;
      if (user.role?.name === 'ELEVE') {
        if (!user.eleve) throw new Error('Aucun profil élève trouvé');
        finalEleveId = user.eleve.id;
      } else if ((user.role?.name === 'STAFF' || user.role?.name === 'ADMIN') && !finalEleveId) {
        throw new Error('eleveId est obligatoire pour un staff/admin');
      }

      const infos = await this.getInfosAnneePrecedente(finalEleveId!);

      // Déterminer le niveauId pour la réinscription
      let niveauIdFinal: number;
      if (data.forcerNiveauId) {
        niveauIdFinal = data.forcerNiveauId;
      } else if (infos.passe && infos.niveauSuivant) {
        niveauIdFinal = infos.niveauSuivant.id;
      } else {
        niveauIdFinal = infos.niveauActuel.id;
      }

      // Lancer l'inscription normale avec le bon niveau
      return await this.inscrireEleveAvecPaiement({
        ...data,
        eleveId: finalEleveId,
        niveauId: niveauIdFinal,
      });
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }
}

export default new InscriptionEleveService();
