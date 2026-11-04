-- CreateEnum
CREATE TYPE "StatutEvenement" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'TERMINE');

-- CreateEnum
CREATE TYPE "StatutPaiementSalaire" AS ENUM ('EN_ATTENTE', 'PAYE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'VALIDE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('GENERE', 'SIGNE', 'DELIVRE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('CAISSE', 'BANQUE');

-- CreateEnum
CREATE TYPE "TypeEnseignementEnum" AS ENUM ('GENERAL', 'TECHNIQUE', 'PRIMAIRE', 'MATERNELLE', 'CRECHE');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('RECETTE', 'DEPENSE');

-- CreateTable
CREATE TABLE "Absence" (
    "id" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT NOT NULL,
    "justification" BOOLEAN NOT NULL,
    "eleveId" INTEGER,
    "staffId" INTEGER,
    "matiereId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accueil" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "logoEcole" TEXT,
    "images" TEXT[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accueil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actualite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "imageIllustration" TEXT,
    "typeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Actualite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annee" (
    "id" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Annee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "montantPrevu" DOUBLE PRECISION NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "anneeId" INTEGER,
    "categorieId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorieComptable" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategorieComptable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classe" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "capacite" INTEGER,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "niveauId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigurationTranche" (
    "id" SERIAL NOT NULL,
    "niveauId" INTEGER NOT NULL,
    "numeroTranche" INTEGER NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),

    CONSTRAINT "ConfigurationTranche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoeficientNiveau" (
    "id" SERIAL NOT NULL,
    "valeur" INTEGER NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "niveauId" INTEGER NOT NULL,
    "matiereId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoeficientNiveau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoeficientSerie" (
    "id" SERIAL NOT NULL,
    "valeur" INTEGER NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "matiereId" INTEGER NOT NULL,
    "serieId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "niveauId" INTEGER,

    CONSTRAINT "CoeficientSerie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteBancaire" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "type" "TypeCompte" NOT NULL,
    "soldeInitial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompteBancaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "email" TEXT NOT NULL,
    "typeSujet" TEXT,
    "message" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cours" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "file" TEXT,
    "userId" INTEGER NOT NULL,
    "niveauId" INTEGER,
    "matiereId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eleve" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "acteNaissance" TEXT NOT NULL,
    "bulletin" TEXT[],
    "attestation" TEXT,
    "photo" TEXT,
    "filiereId" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "motifRejet" TEXT,
    "dateValidation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matricule" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estHandicape" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Eleve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnseignementAnnee" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "matiereId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,
    "anneeId" INTEGER NOT NULL,
    "volumeHoraire" INTEGER,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnseignementAnnee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bareme" DOUBLE PRECISION,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "staffId" INTEGER,
    "matiereId" INTEGER,
    "classeId" INTEGER,
    "trimestreId" INTEGER,
    "anneeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evenement" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "lieu" TEXT,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "statut" "StatutEvenement" NOT NULL DEFAULT 'EN_ATTENTE',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filiere" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscription" (
    "id" SERIAL NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "anneeId" INTEGER NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "niveauId" INTEGER NOT NULL,
    "classeId" INTEGER,
    "modePaiement" TEXT NOT NULL DEFAULT 'COMPLET',
    "decision" TEXT,
    "estRedoublant" BOOLEAN NOT NULL DEFAULT false,
    "moyenneGenerale" DOUBLE PRECISION,
    "nombreBulletinsTelecharges" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cycleActuel" TEXT,
    "nombreRedoublementsCycle" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePermission" (
    "id" SERIAL NOT NULL,
    "motif" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'en attente',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeavePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneTransaction" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "transactionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LigneTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matiere" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "typeMatiereId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niveau" (
    "id" SERIAL NOT NULL,
    "nomNiveau" TEXT NOT NULL,
    "cycle" TEXT,
    "scolarite" INTEGER,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "typeEnseignementId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Niveau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "evaluationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "modePaiement" TEXT,
    "montant" DOUBLE PRECISION NOT NULL,
    "eleveId" INTEGER,
    "moneroTxHash" TEXT,
    "moneroAddress" TEXT,
    "moneroAmount" TEXT,
    "moneroStatus" TEXT DEFAULT 'pending',
    "moneroBlockHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "recu" TEXT,
    "dateEcheance" TIMESTAMP(3),
    "inscriptionId" INTEGER,
    "libelleTranche" TEXT,
    "montantAttendu" DOUBLE PRECISION,
    "numeroTranche" INTEGER,
    "totalTranches" INTEGER,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presentation" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "histoire" TEXT,
    "mission" TEXT,
    "phone" TEXT,
    "reseau" JSONB,
    "email" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retard" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "autorisation" TEXT,
    "justification" BOOLEAN NOT NULL,
    "confProf" BOOLEAN NOT NULL,
    "eleveId" INTEGER NOT NULL,
    "matiereId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Retard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salaire" (
    "id" SERIAL NOT NULL,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "heuresNormales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "heuresSupplementaires" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tauxHoraire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tauxHoraireSupp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montantBrut" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montantNet" DOUBLE PRECISION NOT NULL,
    "statut" "StatutPaiementSalaire" NOT NULL DEFAULT 'EN_ATTENTE',
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "staffId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serie" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "niveauId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Serie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteEleve" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteEleve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "filiereId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tauxHoraire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'EN_ATTENTE',
    "date" TIMESTAMP(3) NOT NULL,
    "dateEcheance" TIMESTAMP(3),
    "pieceJustificative" TEXT,
    "note" TEXT,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "categorieId" INTEGER,
    "compteId" INTEGER,
    "anneeId" INTEGER,
    "userId" INTEGER NOT NULL,
    "paiementId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trimestre" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "anneeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invalide" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Trimestre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Type" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeEnseignement" (
    "id" SERIAL NOT NULL,
    "nom" "TypeEnseignementEnum" NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeEnseignement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeMatiere" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeMatiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "adresse" TEXT,
    "phone" TEXT,
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "roleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sexe" TEXT,
    "photoUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "fileVideo" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "niveauId" INTEGER,
    "matiereId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploiDuTemps" (
    "id" SERIAL NOT NULL,
    "classeId" INTEGER NOT NULL,
    "anneeId" INTEGER NOT NULL,
    "trimestreId" INTEGER,
    "jour" INTEGER NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "matiereId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "couleur" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploiDuTemps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" SERIAL NOT NULL,
    "emploiDuTempsId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "motifAnnulation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CahierTexte" (
    "id" SERIAL NOT NULL,
    "seanceId" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "devoirs" TEXT,
    "dateRemise" TIMESTAMP(3),
    "observations" TEXT,
    "fichiers" TEXT[],
    "staffId" INTEGER NOT NULL,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateSignature" TIMESTAMP(3),
    "signatureProf" TEXT,

    CONSTRAINT "CahierTexte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licence" (
    "id" SERIAL NOT NULL,
    "cleApi" TEXT NOT NULL,
    "nomEcole" TEXT NOT NULL,
    "emailContact" TEXT NOT NULL,
    "telephoneContact" TEXT,
    "dateActivation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "nombreAppels" INTEGER NOT NULL DEFAULT 0,
    "derniereUtilisation" TIMESTAMP(3),
    "hasAssociation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigurationEcole" (
    "id" SERIAL NOT NULL,
    "nomEcole" TEXT NOT NULL,
    "ville" TEXT,
    "devise" TEXT,
    "ministere" TEXT,
    "directionRegionale" TEXT,
    "directionProvinciale" TEXT,
    "codeRegion" TEXT,
    "codeProvince" TEXT,
    "codeEcole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigurationEcole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" SERIAL NOT NULL,
    "documentTypeId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "contenuCorps" TEXT NOT NULL,
    "formatNumero" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateEnTete" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL,
    "libelle" TEXT NOT NULL,
    "separateur" TEXT NOT NULL DEFAULT '*********',

    CONSTRAINT "TemplateEnTete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateSignataire" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL,
    "fonction" TEXT NOT NULL,
    "userId" INTEGER,
    "nomParDefaut" TEXT,
    "gradeParDefaut" TEXT,
    "imageSignature" TEXT,

    CONSTRAINT "TemplateSignataire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVariable" (
    "id" SERIAL NOT NULL,
    "documentTypeId" INTEGER,
    "categorie" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "description" TEXT,
    "exemple" TEXT,
    "obligatoire" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentCompteur" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "documentTypeId" INTEGER NOT NULL,
    "anneeId" INTEGER NOT NULL,
    "dernierNumero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DocumentCompteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentGenere" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "eleveId" INTEGER,
    "inscriptionId" INTEGER,
    "numero" TEXT NOT NULL,
    "donneesBrutes" JSONB NOT NULL,
    "fichierPdf" TEXT,
    "fichierDocx" TEXT,
    "statut" "StatutDocument" NOT NULL DEFAULT 'GENERE',
    "genereParId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentGenere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EleveCours" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EleveCours_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EleveMatieres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EleveMatieres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ParentEleves" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ParentEleves_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SpecialiteMatieres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SpecialiteMatieres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RolesOnPermissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RolesOnPermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategorieComptable_libelle_key" ON "CategorieComptable"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigurationTranche_niveauId_numeroTranche_key" ON "ConfigurationTranche"("niveauId", "numeroTranche");

-- CreateIndex
CREATE UNIQUE INDEX "CoeficientNiveau_niveauId_matiereId_key" ON "CoeficientNiveau"("niveauId", "matiereId");

-- CreateIndex
CREATE UNIQUE INDEX "CoeficientSerie_matiereId_serieId_key" ON "CoeficientSerie"("matiereId", "serieId");

-- CreateIndex
CREATE UNIQUE INDEX "Eleve_userId_key" ON "Eleve"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Eleve_matricule_key" ON "Eleve"("matricule");

-- CreateIndex
CREATE INDEX "EnseignementAnnee_anneeId_classeId_matiereId_idx" ON "EnseignementAnnee"("anneeId", "classeId", "matiereId");

-- CreateIndex
CREATE UNIQUE INDEX "EnseignementAnnee_staffId_matiereId_classeId_anneeId_key" ON "EnseignementAnnee"("staffId", "matiereId", "classeId", "anneeId");

-- CreateIndex
CREATE UNIQUE INDEX "Filiere_nom_key" ON "Filiere"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Matiere_libelle_key" ON "Matiere"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "Niveau_nomNiveau_key" ON "Niveau"("nomNiveau");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userId_key" ON "Parent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Serie_nom_key" ON "Serie"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Specialite_nom_key" ON "Specialite"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_paiementId_key" ON "Transaction"("paiementId");

-- CreateIndex
CREATE UNIQUE INDEX "TypeEnseignement_nom_key" ON "TypeEnseignement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "EmploiDuTemps_classeId_anneeId_idx" ON "EmploiDuTemps"("classeId", "anneeId");

-- CreateIndex
CREATE INDEX "EmploiDuTemps_staffId_anneeId_idx" ON "EmploiDuTemps"("staffId", "anneeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmploiDuTemps_classeId_jour_heureDebut_trimestreId_key" ON "EmploiDuTemps"("classeId", "jour", "heureDebut", "trimestreId");

-- CreateIndex
CREATE UNIQUE INDEX "Seance_emploiDuTempsId_date_key" ON "Seance"("emploiDuTempsId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CahierTexte_seanceId_key" ON "CahierTexte"("seanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Licence_cleApi_key" ON "Licence"("cleApi");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "DocumentType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVariable_variable_key" ON "DocumentVariable"("variable");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCompteur_templateId_documentTypeId_anneeId_key" ON "DocumentCompteur"("templateId", "documentTypeId", "anneeId");

-- CreateIndex
CREATE INDEX "_EleveCours_B_index" ON "_EleveCours"("B");

-- CreateIndex
CREATE INDEX "_EleveMatieres_B_index" ON "_EleveMatieres"("B");

-- CreateIndex
CREATE INDEX "_ParentEleves_B_index" ON "_ParentEleves"("B");

-- CreateIndex
CREATE INDEX "_SpecialiteMatieres_B_index" ON "_SpecialiteMatieres"("B");

-- CreateIndex
CREATE INDEX "_RolesOnPermissions_B_index" ON "_RolesOnPermissions"("B");

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accueil" ADD CONSTRAINT "Accueil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actualite" ADD CONSTRAINT "Actualite_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actualite" ADD CONSTRAINT "Actualite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieComptable"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigurationTranche" ADD CONSTRAINT "ConfigurationTranche_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoeficientNiveau" ADD CONSTRAINT "CoeficientNiveau_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoeficientNiveau" ADD CONSTRAINT "CoeficientNiveau_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoeficientSerie" ADD CONSTRAINT "CoeficientSerie_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoeficientSerie" ADD CONSTRAINT "CoeficientSerie_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoeficientSerie" ADD CONSTRAINT "CoeficientSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_trimestreId_fkey" FOREIGN KEY ("trimestreId") REFERENCES "Trimestre"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evenement" ADD CONSTRAINT "Evenement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePermission" ADD CONSTRAINT "LeavePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneTransaction" ADD CONSTRAINT "LigneTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matiere" ADD CONSTRAINT "Matiere_typeMatiereId_fkey" FOREIGN KEY ("typeMatiereId") REFERENCES "TypeMatiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Niveau" ADD CONSTRAINT "Niveau_typeEnseignementId_fkey" FOREIGN KEY ("typeEnseignementId") REFERENCES "TypeEnseignement"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retard" ADD CONSTRAINT "Retard_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retard" ADD CONSTRAINT "Retard_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retard" ADD CONSTRAINT "Retard_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retard" ADD CONSTRAINT "Retard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salaire" ADD CONSTRAINT "Salaire_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salaire" ADD CONSTRAINT "Salaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteEleve" ADD CONSTRAINT "SiteEleve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite" ADD CONSTRAINT "Specialite_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieComptable"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "CompteBancaire"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paiementId_fkey" FOREIGN KEY ("paiementId") REFERENCES "Paiement"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trimestre" ADD CONSTRAINT "Trimestre_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploiDuTemps" ADD CONSTRAINT "EmploiDuTemps_trimestreId_fkey" FOREIGN KEY ("trimestreId") REFERENCES "Trimestre"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_emploiDuTempsId_fkey" FOREIGN KEY ("emploiDuTempsId") REFERENCES "EmploiDuTemps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CahierTexte" ADD CONSTRAINT "CahierTexte_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CahierTexte" ADD CONSTRAINT "CahierTexte_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateEnTete" ADD CONSTRAINT "TemplateEnTete_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSignataire" ADD CONSTRAINT "TemplateSignataire_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSignataire" ADD CONSTRAINT "TemplateSignataire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVariable" ADD CONSTRAINT "DocumentVariable_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCompteur" ADD CONSTRAINT "DocumentCompteur_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCompteur" ADD CONSTRAINT "DocumentCompteur_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCompteur" ADD CONSTRAINT "DocumentCompteur_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenere" ADD CONSTRAINT "DocumentGenere_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenere" ADD CONSTRAINT "DocumentGenere_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "Eleve"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenere" ADD CONSTRAINT "DocumentGenere_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentGenere" ADD CONSTRAINT "DocumentGenere_genereParId_fkey" FOREIGN KEY ("genereParId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EleveCours" ADD CONSTRAINT "_EleveCours_A_fkey" FOREIGN KEY ("A") REFERENCES "Cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EleveCours" ADD CONSTRAINT "_EleveCours_B_fkey" FOREIGN KEY ("B") REFERENCES "Eleve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EleveMatieres" ADD CONSTRAINT "_EleveMatieres_A_fkey" FOREIGN KEY ("A") REFERENCES "Eleve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EleveMatieres" ADD CONSTRAINT "_EleveMatieres_B_fkey" FOREIGN KEY ("B") REFERENCES "Matiere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentEleves" ADD CONSTRAINT "_ParentEleves_A_fkey" FOREIGN KEY ("A") REFERENCES "Eleve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentEleves" ADD CONSTRAINT "_ParentEleves_B_fkey" FOREIGN KEY ("B") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpecialiteMatieres" ADD CONSTRAINT "_SpecialiteMatieres_A_fkey" FOREIGN KEY ("A") REFERENCES "Matiere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpecialiteMatieres" ADD CONSTRAINT "_SpecialiteMatieres_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolesOnPermissions" ADD CONSTRAINT "_RolesOnPermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolesOnPermissions" ADD CONSTRAINT "_RolesOnPermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
