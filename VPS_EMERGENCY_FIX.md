# 🚨 URGENCE - Backend DOWN (Erreur 502)

## Problème détecté
Le backend retourne une erreur **502 Bad Gateway**, ce qui signifie que le serveur Node.js ne tourne pas ou a crashé.

## Solution immédiate

### 1️⃣ Connectez-vous au VPS
```bash
ssh utilisateur@admin.edutrackhub.cloud
```

### 2️⃣ Vérifiez l'état du backend

#### Si vous utilisez Docker :
```bash
docker ps
# Vous devriez voir un container "apiEcole" ou similaire

# Si le container n'apparaît pas :
docker ps -a  # Voir tous les containers, même arrêtés

# Voir les logs du container
docker logs apiEcole --tail=50

# Si le container a crashé, regarder pourquoi
docker logs apiEcole
```

#### Si vous utilisez PM2 :
```bash
pm2 list
# Cherchez "apiEcole" ou votre app

# Si elle est "stopped" ou absente :
pm2 logs apiEcole --lines 50
```

### 3️⃣ Redémarrer le backend

#### Avec Docker :
```bash
cd ~/gestion-ecole-api
# ou le chemin de votre projet

# Redémarrer
docker-compose restart

# Si ça ne fonctionne pas, reconstruire
docker-compose down
docker-compose up -d

# Suivre les logs
docker-compose logs -f
```

#### Avec PM2 :
```bash
pm2 restart apiEcole

# Si l'app n'existe pas
cd ~/gestion-ecole-api
npm start
# ou
pm2 start npm --name apiEcole -- start
```

### 4️⃣ Vérifier que ça fonctionne

```bash
# Depuis le VPS, tester l'API
curl http://localhost:5000/health

# Devrait retourner :
# {"status":"OK","timestamp":"...","environment":"production"}

# Tester depuis l'extérieur
curl https://admin.edutrackhub.cloud/health
```

### 5️⃣ Vérifier les logs en temps réel

```bash
# Docker
docker-compose logs -f --tail=100

# PM2
pm2 logs apiEcole --lines 100
```

## 🔍 Diagnostics courants

### Erreur 1 : Le container s'arrête immédiatement
**Cause** : Erreur dans le code ou variables d'environnement manquantes

**Solution** :
```bash
docker logs apiEcole
# Cherchez les erreurs
```

### Erreur 2 : "Cannot connect to database"
**Cause** : La base de données PostgreSQL n'est pas accessible

**Solution** :
```bash
# Vérifier que Postgres tourne
docker ps | grep postgres

# Redémarrer Postgres si nécessaire
docker-compose restart postgres
```

### Erreur 3 : Port 5000 déjà utilisé
**Cause** : Un autre processus utilise le port

**Solution** :
```bash
# Trouver le processus
sudo lsof -i :5000

# Tuer le processus
sudo kill -9 PID
```

## 📋 Checklist de vérification

- [ ] Container/Process backend est running
- [ ] Database PostgreSQL est accessible
- [ ] Port 5000 est ouvert et en écoute
- [ ] `/health` endpoint répond avec 200 OK
- [ ] Logs ne montrent pas d'erreur
- [ ] Fichier .env est présent et correct

## 🆘 Si rien ne fonctionne

### Option 1 : Redéployer manuellement
```bash
cd ~/gestion-ecole-api

# Récupérer les derniers changements
git pull origin dev

# Reconstruire et redémarrer
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Option 2 : Vérifier le workflow GitHub Actions
1. Allez sur https://github.com/ssankara2002/apiEcole/actions
2. Cliquez sur le dernier workflow
3. Vérifiez s'il y a des erreurs
4. Si le workflow a échoué, lisez les logs

### Option 3 : Vérifier Nginx
```bash
# Tester la config Nginx
sudo nginx -t

# Voir les logs Nginx
sudo tail -50 /var/log/nginx/error.log

# Redémarrer Nginx si nécessaire
sudo systemctl restart nginx
```

## 📞 Commandes de diagnostic rapide

```bash
# Tout vérifier en une fois
echo "=== Docker Containers ==="
docker ps -a

echo ""
echo "=== PM2 Processes ==="
pm2 list

echo ""
echo "=== Port 5000 ==="
sudo lsof -i :5000

echo ""
echo "=== Health Check ==="
curl -I http://localhost:5000/health

echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx

echo ""
echo "=== Recent Logs ==="
docker-compose logs --tail=30
```

## ⚡ Solution ultra-rapide

Si vous êtes pressé et que tout le reste a échoué :

```bash
cd ~/gestion-ecole-api
docker-compose down && docker-compose up -d --build
sleep 10
curl https://admin.edutrackhub.cloud/health
```

## 🎯 Résultat attendu

Une fois le backend redémarré, vous devriez voir :

```bash
$ curl https://admin.edutrackhub.cloud/health
{"status":"OK","timestamp":"2026-03-25T21:50:00.000Z","environment":"production"}
```

Et dans les logs au démarrage :
```
🚀 Server running on http://0.0.0.0:5000
🌐 CORS - Origines autorisées: [
  'https://admin.edutrackhub.cloud',
  'https://sainte-anne.edutrackhub.cloud',
  'http://localhost:5173'
]
```

À ce moment-là, l'erreur CORS disparaîtra car le backend sera accessible ! ✅
