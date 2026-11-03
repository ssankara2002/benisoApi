#!/bin/bash
# 🔍 Script de diagnostic à exécuter sur le VPS

echo "=========================================="
echo "🔍 DIAGNOSTIC DU BACKEND"
echo "=========================================="
echo ""

echo "1️⃣ État des containers"
echo "---"
docker ps -a --filter "name=gestion-ecole" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2️⃣ Logs du backend (50 dernières lignes)"
echo "---"
docker logs gestion-ecole-api --tail=50
echo ""

echo "3️⃣ Test de connexion interne (depuis le VPS)"
echo "---"
curl -s http://localhost:5000/health || echo "❌ Pas de réponse sur localhost:5000"
echo ""

echo "4️⃣ Test de connexion à la base de données"
echo "---"
docker exec gestion-ecole-api sh -c "nc -zv gestion-ecole-db 5432" 2>&1 || echo "❌ Impossible de se connecter à la DB"
echo ""

echo "5️⃣ Variables d'environnement du container"
echo "---"
docker exec gestion-ecole-api env | grep -E "NODE_ENV|DATABASE_URL|PORT|CORS_ORIGIN" | head -10
echo ""

echo "6️⃣ Processus Node.js dans le container"
echo "---"
docker exec gestion-ecole-api ps aux | grep node || echo "❌ Aucun processus Node.js trouvé"
echo ""

echo "7️⃣ Port 5000 en écoute ?"
echo "---"
docker exec gestion-ecole-api sh -c "netstat -tuln | grep 5000" || echo "❌ Port 5000 pas en écoute"
echo ""

echo "=========================================="
echo "🎯 ACTIONS RECOMMANDÉES"
echo "=========================================="
echo ""
echo "Si le processus Node.js n'existe pas :"
echo "  → docker logs gestion-ecole-api (voir l'erreur de démarrage)"
echo ""
echo "Si la DB n'est pas accessible :"
echo "  → docker-compose restart gestion-ecole-db"
echo ""
echo "Pour reconstruire complètement :"
echo "  → docker-compose down && docker-compose up -d --build"
echo ""
