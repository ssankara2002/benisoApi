# 🚀 Guide de déploiement complet

Ce guide détaille la procédure complète pour déployer l'API Gestion École sur un VPS depuis votre environnement de développement local.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Configuration initiale du VPS](#configuration-initiale-du-vps)
- [Configuration DNS](#configuration-dns)
- [Premier déploiement](#premier-déploiement)
- [Génération des certificats SSL](#génération-des-certificats-ssl)
- [Déploiements ultérieurs](#déploiements-ultérieurs)
- [Vérification du déploiement](#vérification-du-déploiement)
- [Résolution des problèmes](#résolution-des-problèmes)

---

## 🔧 Prérequis

### Sur votre machine locale

- **Docker** et **Docker Compose** installés
- **Node.js 20+** et **npm**
- **Git**
- **Compte Docker Hub** (pour pousser les images)
- **Accès SSH** au VPS

### Sur le VPS

- **Ubuntu 20.04+** ou **Debian 11+**
- **Docker** et **Docker Compose** installés
- **Certbot** installé pour les certificats SSL
- **Accès root** ou utilisateur avec droits sudo
- **Ports ouverts** : 80 (HTTP), 443 (HTTPS), 22 (SSH)

### Vérification des prérequis VPS

```bash
# Connexion au VPS
ssh edutrack@195.35.24.88

# Vérifier Docker
docker --version
docker compose version

# Vérifier Certbot
certbot --version

# Vérifier les ports ouverts
sudo netstat -tulpn | grep -E ':(80|443|22)'
```

---

## ⚙️ Configuration initiale du VPS

### 1. Créer l'utilisateur et les répertoires

```bash
# Connexion en tant que root
ssh root@195.35.24.88

# Créer un utilisateur dédié
adduser edutrack
usermod -aG sudo edutrack
usermod -aG docker edutrack

# Se connecter avec le nouvel utilisateur
su - edutrack

# Créer le répertoire du projet
mkdir -p ~/gestion-ecole-api
cd ~/gestion-ecole-api
```

### 2. Installer Docker (si nécessaire)

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Vérifier l'installation
docker --version
docker compose version
```

### 3. Installer Certbot (pour SSL)

```bash
sudo apt install certbot -y
certbot --version
```

---

## 🌐 Configuration DNS

Avant de déployer, configurez votre DNS pour pointer vers le VPS.

### Configuration requise

Ajoutez les enregistrements DNS suivants chez votre registrar (ex: Hostinger) :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| **A** | admin | 195.35.24.88 | 3600 |
| **A** | @ | 195.35.24.88 | 3600 |
| **AAAA** | admin | [IPv6 du VPS] | 3600 |

### Vérification DNS

```bash
# Depuis votre machine locale
dig +short admin.edutrackhub.cloud

# Devrait retourner : 195.35.24.88
```

⏱️ **Attention** : La propagation DNS peut prendre de 5 minutes à 48 heures.

---

## 🎯 Premier déploiement

### 1. Configuration locale

```bash
# Dans le répertoire du projet local
cd /home/sankara-sarata/Documents/gesCo/gestionEcole/api

# Créer le fichier .env.production
nano .env.production
```

Contenu de `.env.production` :

```env
NODE_ENV=production
PORT=5000
API_URL=https://admin.edutrackhub.cloud

# Base de données
DB_USER=gestion_user
DB_PASSWORD=VotreMotDePasseSecurise123!
DB_NAME=gestion_ecole

# JWT
JWT_SECRET=VotreSecretJWTTresLongEtSecurise

# CORS
CORS_ORIGIN=https://admin.edutrackhub.cloud,https://www.edutrackhub.cloud

# Moneroo (optionnel)
MONEROO_SECRET_KEY=votre_cle_moneroo
```

### 2. Build et push de l'image Docker

```bash
# Construire et pousser l'image vers Docker Hub
./build-and-push.sh
```

Ce script :
1. Build l'image Docker localement
2. Tag l'image comme `ssarata/gestion-ecole-api:latest`
3. Push l'image vers Docker Hub

### 3. Copie des fichiers de configuration

```bash
# Copier les fichiers nécessaires vers le VPS
scp docker-compose.yml edutrack@195.35.24.88:~/gestion-ecole-api/
scp .env.production edutrack@195.35.24.88:~/gestion-ecole-api/.env
scp nginx-gestion-ecole.conf edutrack@195.35.24.88:~/gestion-ecole-api/
```

### 4. Démarrage initial (sans SSL)

```bash
# Connexion au VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api

# Créer le répertoire pour les uploads
mkdir -p uploads

# Démarrer PostgreSQL et l'API uniquement (sans nginx)
docker compose up -d postgres api

# Vérifier les logs
docker compose logs -f api

# Vous devriez voir :
# ✅ Schéma synchronisé!
# ✅ Seeder exécuté avec succès
# 🚀 Serveur démarré sur http://localhost:5000
```

---

## 🔐 Génération des certificats SSL

Une fois que l'API fonctionne et que le DNS est configuré, générez les certificats SSL.

### 1. Arrêter nginx s'il tourne

```bash
# Sur le VPS
docker compose stop nginx 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
```

### 2. Copier et exécuter le script SSL

```bash
# Depuis votre machine locale
scp generate-ssl.sh edutrack@195.35.24.88:~/gestion-ecole-api/

# Sur le VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api
chmod +x generate-ssl.sh

# Générer le certificat
./generate-ssl.sh saratasankara598@gmail.com
```

Le script va :
1. Vérifier que le DNS pointe vers le serveur
2. Arrêter les services utilisant le port 80
3. Générer le certificat avec Certbot
4. Copier les certificats dans `~/gestion-ecole-api/certbot/conf/`
5. Redémarrer tous les services (y compris nginx)

### 3. Vérification SSL

```bash
# Tester le certificat
curl https://admin.edutrackhub.cloud/health

# Devrait retourner : {"status":"healthy","timestamp":"..."}
```

---

## 🔄 Déploiements ultérieurs

Pour les mises à jour de code après le premier déploiement :

### Option 1 : Déploiement complet (avec rebuild)

```bash
# Depuis votre machine locale
cd /home/sankara-sarata/Documents/gesCo/gestionEcole/api

# Build, push et déploie
./full-deploy.sh
```

Ce script :
1. Build l'image localement
2. Push vers Docker Hub
3. Copie les configs vers le VPS
4. Pull la nouvelle image sur le VPS
5. Redémarre les containers

**Durée** : ~5-10 minutes

### Option 2 : Déploiement rapide (sans rebuild)

Si vous avez seulement modifié les fichiers de configuration (nginx, .env, docker-compose.yml) :

```bash
# Depuis votre machine locale
./full-deploy.sh --no-build
```

Ce script :
1. Copie les configs vers le VPS
2. Redémarre les containers avec l'image existante

**Durée** : ~1-2 minutes

### Option 3 : Déploiement manuel

```bash
# 1. Build et push depuis local
./build-and-push.sh

# 2. Sur le VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api

# 3. Arrêter l'API
docker compose stop api

# 4. Supprimer l'ancien container et image
docker compose rm -f api
docker rmi ssarata/gestion-ecole-api:latest

# 5. Pull la nouvelle image
docker pull ssarata/gestion-ecole-api:latest

# 6. Redémarrer
docker compose up -d

# 7. Vérifier
docker compose ps
docker compose logs -f api
```

---

## ✅ Vérification du déploiement

### 1. Vérifier l'état des containers

```bash
# Sur le VPS
cd ~/gestion-ecole-api
docker compose ps

# Tous les containers doivent être "healthy"
```

Résultat attendu :
```
NAME                  STATUS              PORTS
gestion-ecole-api     Up 2 minutes (healthy)
gestion-ecole-db      Up 2 minutes (healthy)
gestion-ecole-nginx   Up 2 minutes (healthy)  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 2. Vérifier les logs

```bash
# Logs de l'API
docker compose logs --tail=50 api

# Logs de Nginx
docker compose logs --tail=50 nginx

# Logs de PostgreSQL
docker compose logs --tail=50 postgres
```

### 3. Tester les endpoints

```bash
# Health check
curl https://admin.edutrackhub.cloud/health

# Swagger UI
curl -I https://admin.edutrackhub.cloud/api-docs

# Login (test)
curl -X POST https://admin.edutrackhub.cloud/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecole.com","password":"admin123"}'
```

### 4. Vérifier dans le navigateur

- **API Health** : https://admin.edutrackhub.cloud/health
- **Swagger** : https://admin.edutrackhub.cloud/api-docs
- **Certificat SSL** : Cliquer sur le cadenas dans la barre d'adresse

---

## 🔧 Résolution des problèmes

### Problème : "Port 80 already in use"

```bash
# Trouver le processus
sudo netstat -tulpn | grep :80

# Arrêter nginx système
sudo systemctl stop nginx
sudo systemctl disable nginx

# Redémarrer les containers
docker compose restart
```

### Problème : "API unhealthy"

```bash
# Vérifier les logs détaillés
docker compose logs --tail=100 api

# Vérifier la connexion à la DB
docker compose exec api npx prisma db execute --stdin <<< "SELECT 1;"

# Redémarrer l'API
docker compose restart api
```

### Problème : "Database connection failed"

```bash
# Vérifier que PostgreSQL est démarré
docker compose ps postgres

# Tester la connexion
docker compose exec postgres psql -U gestion_user -d gestion_ecole -c "SELECT version();"

# Vérifier les variables d'environnement
docker compose exec api env | grep DATABASE_URL
```

### Problème : "SSL certificate expired"

```bash
# Vérifier l'expiration
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew

# Copier les nouveaux certificats
sudo cp -r /etc/letsencrypt/* ~/gestion-ecole-api/certbot/conf/
sudo chown -R edutrack:edutrack ~/gestion-ecole-api/certbot/

# Redémarrer nginx
docker compose restart nginx
```

### Problème : "Swagger still shows localhost"

```bash
# Vérifier la variable API_URL
docker compose exec api env | grep API_URL

# Si vide, vérifier le fichier .env sur le VPS
cat ~/gestion-ecole-api/.env

# Redémarrer l'API après correction
docker compose restart api
```

### Problème : "502 Bad Gateway"

```bash
# Vérifier que l'API répond
docker compose exec nginx nc -z api 5000

# Vérifier la config nginx
docker compose exec nginx nginx -t

# Vérifier les logs nginx
docker compose logs nginx | grep error
```

---

## 📊 Checklist de déploiement

### Avant le déploiement

- [ ] DNS configuré et propagé
- [ ] Fichier `.env.production` créé avec les bonnes valeurs
- [ ] Docker Hub accessible (docker login)
- [ ] Accès SSH au VPS vérifié
- [ ] Ports 80 et 443 ouverts sur le VPS

### Premier déploiement

- [ ] Image Docker buildée et pushée
- [ ] Fichiers de config copiés sur le VPS
- [ ] PostgreSQL démarré et healthy
- [ ] API démarrée et healthy
- [ ] Certificat SSL généré
- [ ] Nginx démarré et healthy
- [ ] HTTPS fonctionnel

### Déploiements suivants

- [ ] Code local testé (`npm run dev`)
- [ ] Image Docker buildée et pushée
- [ ] Configs mises à jour si nécessaire
- [ ] Containers redémarrés
- [ ] Tests de fumée effectués

---

## 🎯 Prochaines étapes

Après un déploiement réussi :

1. **Sécurité** : Changez tous les mots de passe par défaut
2. **Monitoring** : Configurez des alertes (UptimeRobot, etc.)
3. **Sauvegardes** : Mettez en place des backups PostgreSQL automatiques
4. **Logs** : Configurez la rotation des logs Docker
5. **Updates** : Planifiez les mises à jour de sécurité

Consultez le [Guide de maintenance](./MAINTENANCE.md) pour plus de détails.

---

**📧 Support** : saratasankara598@gmail.com
