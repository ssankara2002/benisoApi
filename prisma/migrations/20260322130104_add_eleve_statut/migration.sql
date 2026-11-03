-- AlterTable
ALTER TABLE "Eleve" ADD COLUMN     "dateValidation" TIMESTAMP(3),
ADD COLUMN     "motifRejet" TEXT,
ADD COLUMN     "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE';
