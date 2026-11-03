#!/bin/sh

# Script d'entrée simplifié

echo "⏳ Attente de PostgreSQL (15 secondes)..."
sleep 15

echo "🔄 Synchronisation de la base de données..."
for i in 1 2 3 4 5; do
  echo "Tentative $i/5..."
  # Essayer d'abord migrate deploy, sinon fallback sur db push
  if npx prisma migrate deploy 2>/dev/null || npx prisma db push --skip-generate; then
    echo "✅ Base de données synchronisée!"
    break
  fi
  if [ $i -lt 5 ]; then
    echo "⏳ Nouvelle tentative dans 5 secondes..."
    sleep 5
  else
    echo "❌ Échec de la synchronisation après 5 tentatives"
    exit 1
  fi
done

echo "🔧 Génération du client Prisma (basé sur le nouveau schéma)..."
npx prisma generate

if [ "$NODE_ENV" != "production" ]; then
  echo "🌱 Exécution du seeder (développement uniquement)..."
  npx tsx prisma/seed.ts || echo "⚠️  Seeder ignoré (données déjà présentes ou erreur)"
else
  echo "⏭️  Seeder ignoré en production"
fi

echo "🚀 Démarrage de l'application..."
exec npm start
