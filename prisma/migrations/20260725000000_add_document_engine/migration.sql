-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('GENERE', 'SIGNE', 'DELIVRE', 'ANNULE');

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

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "DocumentType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVariable_variable_key" ON "DocumentVariable"("variable");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCompteur_templateId_documentTypeId_anneeId_key" ON "DocumentCompteur"("templateId", "documentTypeId", "anneeId");

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
