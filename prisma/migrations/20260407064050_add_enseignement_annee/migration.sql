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

-- CreateIndex
CREATE INDEX "EnseignementAnnee_anneeId_classeId_matiereId_idx" ON "EnseignementAnnee"("anneeId", "classeId", "matiereId");

-- CreateIndex
CREATE UNIQUE INDEX "EnseignementAnnee_staffId_matiereId_classeId_anneeId_key" ON "EnseignementAnnee"("staffId", "matiereId", "classeId", "anneeId");

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnseignementAnnee" ADD CONSTRAINT "EnseignementAnnee_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "Annee"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
