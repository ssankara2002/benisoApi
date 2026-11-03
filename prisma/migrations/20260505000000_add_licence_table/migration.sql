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

-- CreateIndex
CREATE UNIQUE INDEX "Licence_cleApi_key" ON "Licence"("cleApi");
