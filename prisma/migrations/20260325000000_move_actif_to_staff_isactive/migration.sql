-- Migration pour déplacer User.actif vers Staff.isActive

-- Étape 1: Ajouter la colonne isActive au modèle Staff
ALTER TABLE "Staff" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Étape 2: Migrer les données de User.actif vers Staff.isActive pour tous les utilisateurs staff existants
UPDATE "Staff"
SET "isActive" = "User"."actif"
FROM "User"
WHERE "Staff"."userId" = "User"."id";

-- Étape 3: Supprimer la colonne actif du modèle User
ALTER TABLE "User" DROP COLUMN "actif";
