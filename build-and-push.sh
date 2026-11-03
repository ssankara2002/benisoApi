#!/bin/bash

echo "🔐 Login à Docker Hub..."
docker login -u ssarata

echo "🏗️  Build de l'image Docker..."
docker build -t ssarata/gestion-ecole-api:latest .

echo "🚀 Push vers Docker Hub..."
docker push ssarata/gestion-ecole-api:latest

echo "✅ Image poussée avec succès!"
echo "📦 Image: ssarata/gestion-ecole-api:latest"
