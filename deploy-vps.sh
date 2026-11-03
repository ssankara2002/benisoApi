#!/bin/bash

# Script de déploiement VPS
# Usage: ./deploy-vps.sh

echo "🚀 Déploiement sur le VPS..."

# Connexion SSH et déploiement
ssh root@195.35.24.88 << 'ENDSSH'
cd ~/gestion-ecole-api
echo "📥 Pull des dernières modifications..."
git pull origin dev

echo "🛑 Arrêt des conteneurs..."
docker compose down

echo "🔨 Rebuild de l'image API (sans cache)..."
docker compose build --no-cache api

echo "▶️  Démarrage des conteneurs..."
docker compose up -d

echo "⏳ Attente du démarrage (30s)..."
sleep 30

echo "📋 Logs de l'API:"
docker compose logs --tail=50 api

echo "✅ Déploiement terminé!"
ENDSSH

echo "🎉 Déploiement VPS terminé!"
