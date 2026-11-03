#!/bin/bash

# Script de déploiement complet - Local vers VPS
# Usage: ./full-deploy.sh [--no-build]
# --no-build : Skip le build de l'image (redéploiement rapide)

set -e

# Variables
VPS_USER="edutrack"
VPS_HOST="195.35.24.88"
VPS_DIR="~/gestion-ecole-api"
SKIP_BUILD=false

# Parser les arguments
if [ "$1" == "--no-build" ]; then
    SKIP_BUILD=true
fi

echo "🚀 Déploiement complet - Local vers VPS"
echo "========================================"
echo ""

# Étape 1 : Build et push de l'image (optionnel)
if [ "$SKIP_BUILD" = false ]; then
    echo "📦 ÉTAPE 1/4 : Build et push de l'image Docker"
    echo "----------------------------------------------"
    ./build-and-push.sh
    echo ""
else
    echo "⏭️  ÉTAPE 1/4 : Build ignoré (--no-build)"
    echo "----------------------------------------------"
    echo "L'image existante sera utilisée"
    echo ""
fi

# Étape 2 : Copie des fichiers de configuration
echo "📤 ÉTAPE 2/4 : Copie des fichiers de config vers le VPS"
echo "-------------------------------------------------------"
scp docker-compose.yml ${VPS_USER}@${VPS_HOST}:${VPS_DIR}/
scp .env.production ${VPS_USER}@${VPS_HOST}:${VPS_DIR}/.env
scp nginx-gestion-ecole.conf ${VPS_USER}@${VPS_HOST}:${VPS_DIR}/
echo "✅ Fichiers de configuration copiés"
echo ""

# Étape 3 : Nettoyage sur le VPS
echo "🧹 ÉTAPE 3/4 : Nettoyage du VPS"
echo "-------------------------------"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd ~/gestion-ecole-api

echo "🛑 Arrêt du container API..."
docker compose stop api 2>/dev/null || true

echo "🗑️  Suppression de l'ancien container..."
docker compose rm -f api 2>/dev/null || true

echo "🧹 Suppression de l'ancienne image..."
docker rmi ssarata/gestion-ecole-api:latest 2>/dev/null || true

echo "🧼 Nettoyage Docker..."
docker system prune -f
ENDSSH
echo ""

# Étape 4 : Redémarrage avec la nouvelle image
echo "▶️  ÉTAPE 4/4 : Redémarrage des services"
echo "----------------------------------------"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd ~/gestion-ecole-api

echo "📥 Pull de la nouvelle image API..."
docker pull ssarata/gestion-ecole-api:latest

echo "🚀 Démarrage de tous les services..."
docker compose up -d

echo "⏳ Attente du démarrage complet..."
sleep 20

echo ""
echo "📊 Statut des containers:"
docker compose ps

echo ""
echo "📋 Logs récents de l'API:"
docker compose logs --tail=20 api | grep -E "(✅|🚀|❌|⚠️)" || docker compose logs --tail=20 api

echo ""
echo "✅ Services démarrés!"
ENDSSH

echo ""
echo "=============================================================="
echo "🎉 Déploiement complet réussi!"
echo "=============================================================="
echo ""
echo "🌐 Accès à l'application :"
echo "  • API : https://admin.edutrackhub.cloud"
echo "  • Swagger : https://admin.edutrackhub.cloud/api-docs"
echo "  • Health : https://admin.edutrackhub.cloud/health"
echo ""
echo "🔍 Vérifier les logs :"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_DIR} && docker compose logs -f'"
echo ""
echo "📊 Vérifier l'état :"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'cd ${VPS_DIR} && docker compose ps'"
echo ""
