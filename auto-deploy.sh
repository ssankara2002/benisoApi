#!/bin/bash

# Script de déploiement automatique pour l'API
# Appelé par le webhook GitHub

set -e  # Arrêter en cas d'erreur

echo "========================================="
echo "🚀 DÉMARRAGE DU DÉPLOIEMENT AUTOMATIQUE"
echo "========================================="
echo "📅 Date: $(date)"
echo ""

# Répertoire de l'application
APP_DIR="/root/gestion-ecole-api"
DOCKER_IMAGE="${DOCKER_USERNAME:-sankara2002}/gestion-ecole-api1:latest"

cd "$APP_DIR" || exit 1

echo "📂 Répertoire: $APP_DIR"
echo "🐳 Image Docker: $DOCKER_IMAGE"
echo ""

# 1. Pull du code source (optionnel, car on utilise l'image Docker)
echo "📥 Pull du code source depuis Git..."
git pull origin main || git pull origin dev || echo "⚠️  Git pull échoué, on continue avec l'image Docker"
echo ""

# 2. Arrêt du container actuel
echo "🛑 Arrêt du container API..."
docker compose stop api || echo "⚠️  Aucun container à arrêter"
echo ""

# 3. Suppression de l'ancien container
echo "🗑️  Suppression de l'ancien container..."
docker compose rm -f api || echo "⚠️  Aucun container à supprimer"
echo ""

# 4. Suppression des anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker images | grep gestion-ecole-api | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || echo "⚠️  Aucune image à supprimer"
echo ""

# 5. Pull de la nouvelle image
echo "📥 Pull de la NOUVELLE image depuis Docker Hub..."
docker pull "$DOCKER_IMAGE"
echo ""

# 6. Vérification de l'image
echo "🔍 Vérification de l'image téléchargée..."
docker images "$DOCKER_IMAGE"
echo ""

# 7. Copie du fichier .env (si nécessaire)
if [ -f .env.production ]; then
    echo "📝 Copie de .env.production vers .env..."
    cp .env.production .env
fi
echo ""

# 8. Démarrage du nouveau container
echo "🚀 Démarrage du nouveau container..."
docker compose up -d api
echo ""

# 9. Attente du démarrage
echo "⏳ Attente du démarrage de l'API (30 secondes)..."
sleep 30
echo ""

# 10. Vérification du statut
echo "📊 Vérification du statut des containers..."
docker compose ps
echo ""

# 11. Logs
echo "📋 Logs de l'API (dernières 50 lignes)..."
docker compose logs --tail=50 api
echo ""

# 12. Health check
echo "🔍 Vérification de la santé de l'API..."
if curl -f http://localhost:5000/health --max-time 10; then
    echo "✅ API opérationnelle!"
else
    echo "⚠️  Health check échoué"
fi
echo ""

# 13. Nettoyage Docker
echo "🧹 Nettoyage des ressources Docker inutilisées..."
docker system prune -f --volumes 2>/dev/null || echo "⚠️  Nettoyage partiel"
echo ""

echo "========================================="
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
echo "========================================="
echo "📅 Date: $(date)"
echo "🌐 URL: https://admin.edutrackhub.cloud"
echo "📚 Swagger: https://admin.edutrackhub.cloud/api-docs"
echo "🔍 Health: https://admin.edutrackhub.cloud/health"
echo ""

exit 0
