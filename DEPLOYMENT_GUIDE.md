# Guide de Déploiement - API Gestion École

Ce guide explique comment déployer l'API sur un VPS via GitHub Actions.

## Table des matières
1. [Prérequis](#prérequis)
2. [Configuration du VPS](#configuration-du-vps)
3. [Configuration GitHub Actions](#configuration-github-actions)
4. [Configuration Nginx](#configuration-nginx)
5. [Configuration Docker](#configuration-docker)
6. [Déploiement](#déploiement)
7. [Dépannage](#dépannage)

---

## Prérequis

### Sur votre VPS
- Ubuntu/Debian (20.04 ou supérieur)
- Docker et Docker Compose installés (voir instructions ci-dessous)
- Nginx installé (voir instructions ci-dessous)
- Nom de domaine configuré (exemple: `admin.edutrackhub.cloud`)
- Certificat SSL Let's Encrypt configuré

### Installation des prérequis sur le VPS

#### 1. Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Installation de Docker

```bash
# Installer les dépendances
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Vérifier l'installation
docker --version

# Ajouter votre utilisateur au groupe docker (pour ne pas utiliser sudo)
sudo usermod -aG docker $USER

# Activer Docker au démarrage
sudo systemctl enable docker
sudo systemctl start docker
```

**Important** : Déconnectez-vous et reconnectez-vous pour que les changements de groupe prennent effet.

#### 3. Installation de Docker Compose

```bash
# Télécharger la dernière version de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre le binaire exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker-compose --version
```

#### 4. Installation de Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer et activer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier que Nginx fonctionne
sudo systemctl status nginx

# Vérifier la version
nginx -v
```

#### 5. Installation de Certbot (pour SSL Let's Encrypt)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL (remplacez par votre domaine)
sudo certbot --nginx -d admin.edutrackhub.cloud

# Renouvellement automatique (déjà configuré par défaut)
# Tester le renouvellement :
sudo certbot renew --dry-run
```

#### 6. Configuration du firewall (optionnel mais recommandé)

```bash
# Installer UFW si pas déjà installé
sudo apt install -y ufw

# Autoriser SSH (IMPORTANT : avant d'activer le firewall !)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### Sur GitHub
- Repository avec le code de l'API
- Accès aux paramètres du repository

---

## Configuration du VPS

### 1. Se connecter au VPS

```bash
ssh edutrack@195.35.24.88
```

### 2. Générer une paire de clés SSH pour GitHub Actions

Sur le VPS, exécutez :

```bash
# Générer la clé SSH (ed25519 recommandé)
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_api -N "" -C "github-actions-api"

# Ajouter la clé publique aux clés autorisées
cat ~/.ssh/github_deploy_api.pub >> ~/.ssh/authorized_keys

# Définir les bonnes permissions
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy_api
chmod 700 ~/.ssh
```

### 3. Récupérer la clé privée

```bash
cat ~/.ssh/github_deploy_api
```

**Important** : Copiez TOUT le contenu (de `-----BEGIN OPENSSH PRIVATE KEY-----` à `-----END OPENSSH PRIVATE KEY-----`). Vous en aurez besoin pour GitHub.

### 4. Vérifier les clés autorisées

```bash
# Vérifier que chaque clé est sur UNE SEULE ligne
cat ~/.ssh/authorized_keys

# Compter le nombre de lignes (= nombre de clés)
cat ~/.ssh/authorized_keys | wc -l
```

Chaque clé doit être sur **une seule ligne**, sans retour à la ligne au milieu.

### 5. Créer le répertoire de l'application

```bash
mkdir -p ~/gestion-ecole-api
cd ~/gestion-ecole-api
```

---

## Configuration GitHub Actions

### 1. Accéder aux secrets GitHub

1. Allez sur **GitHub.com** → votre repository
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu de gauche : **Secrets and variables** → **Actions**

### 2. Configurer les secrets

Créez ou mettez à jour ces secrets :

| Secret | Valeur | Description |
|--------|--------|-------------|
| `VPS_SSH_KEY` | Clé privée copiée à l'étape 2.3 | Clé SSH pour se connecter au VPS |
| `VPS_USERNAME` | `edutrack` | Nom d'utilisateur sur le VPS |
| `DOCKER_USERNAME` | Votre username Docker Hub | Pour push les images Docker |
| `DOCKER_PASSWORD` | Votre token Docker Hub | Token d'accès Docker Hub |

**Important pour VPS_SSH_KEY** :
- Collez la clé **complète** incluant les lignes BEGIN et END
- Pas d'espaces avant/après
- Pas de lignes vides au début ou à la fin

### 3. Workflow GitHub Actions

Le fichier `.github/workflows/deploy.yml` doit contenir :

```yaml
name: Build and Deploy to VPS

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/gestion-ecole-api:latest
            ${{ secrets.DOCKER_USERNAME }}/gestion-ecole-api:${{ github.sha }}

      - name: Copy configuration files to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: 195.35.24.88
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          timeout: 60s
          command_timeout: 10m
          source: ".env.production,docker-compose.yml"
          target: "~/gestion-ecole-api/"
          strip_components: 0

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: 195.35.24.88
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          timeout: 60s
          command_timeout: 10m
          script: |
            cd ~/gestion-ecole-api

            echo "📝 Copie de .env.production vers .env..."
            cp .env.production .env

            echo "🛑 Arrêt du container API..."
            docker compose stop api

            echo "🗑️  Suppression de l'ancien container..."
            docker compose rm -f api

            echo "🧹 Suppression de l'ancienne image..."
            docker rmi ${{ secrets.DOCKER_USERNAME }}/gestion-ecole-api:latest || true

            echo "📥 Pull de la nouvelle image..."
            docker pull ${{ secrets.DOCKER_USERNAME }}/gestion-ecole-api:latest

            echo "🚀 Démarrage du nouveau container..."
            docker compose up -d api

            echo "⏳ Attente du démarrage (20 secondes)..."
            sleep 20

            echo "📊 Vérification du statut..."
            docker compose ps api

            echo "📋 Logs récents..."
            docker compose logs --tail=20 api

            echo "✅ Déploiement terminé!"
```

---

## Configuration Nginx

### 1. Créer le fichier de configuration

Sur le VPS :

```bash
sudo nano /etc/nginx/sites-available/admin.edutrackhub.cloud
```

### 2. Configuration Nginx complète

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name admin.edutrackhub.cloud;

    # Location pour le challenge Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirection vers HTTPS
    location / {
        return 301 https://admin.edutrackhub.cloud$request_uri;
    }
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.edutrackhub.cloud;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/admin.edutrackhub.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.edutrackhub.cloud/privkey.pem;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # Logs
    access_log /var/log/nginx/gestion-ecole-api-access.log;
    error_log /var/log/nginx/gestion-ecole-api-error.log;

    # Taille maximale des uploads
    client_max_body_size 100M;

    # Reverse proxy vers l'API Docker
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;

        # Headers pour le proxy
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Compression Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 3. Activer le site et redémarrer Nginx

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/admin.edutrackhub.cloud /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## Configuration Docker

### 1. docker-compose.yml

Assurez-vous que votre `docker-compose.yml` contient :

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: gestion-ecole-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-gestion_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: ${DB_NAME:-gestion_ecole}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - gestion-ecole-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-gestion_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    image: ssarata/gestion-ecole-api:latest
    container_name: gestion-ecole-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public
    ports:
      - "5000:5000"  # IMPORTANT : utiliser "ports" et non "expose"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - gestion-ecole-network
    volumes:
      - ./uploads:/app/uploads

networks:
  gestion-ecole-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

**Points importants** :
- Utilisez `ports: - "5000:5000"` et **NON** `expose: - "5000"`
- Ceci permet à Nginx (qui tourne sur l'hôte) d'accéder au container

### 2. .env.production

Créez le fichier `.env.production` à la racine du projet :

```env
# Environnement
NODE_ENV=production
PORT=5000

# Base de données
DB_USER=gestion_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
DB_NAME=gestion_ecole
DATABASE_URL=postgresql://gestion_user:VOTRE_MOT_DE_PASSE@postgres:5432/gestion_ecole?schema=public

# API URL (avec le préfixe /api)
API_URL=https://admin.edutrackhub.cloud/api

# Docker Hub
DOCKER_USERNAME=votre_username_dockerhub

# JWT
JWT_SECRET=VOTRE_SECRET_JWT_ALEATOIRE

# CORS - Domaines autorisés (séparés par des virgules)
CORS_ORIGIN=https://votre-frontend.com,http://localhost:5173

# Moneroo API
MONEROO_SECRET_KEY=pvk_sandbox_VOTRE_CLE
```

---

## Déploiement

### Déploiement automatique

1. **Commitez et pushez** vos modifications sur la branche `main` :

```bash
git add .
git commit -m "Description des modifications"
git push origin main
```

2. **GitHub Actions** se déclenche automatiquement et :
   - Build l'image Docker
   - Push l'image sur Docker Hub
   - Se connecte au VPS via SSH
   - Copie les fichiers de configuration
   - Redémarre les containers
   - Vérifie que tout fonctionne

3. **Vérifiez le déploiement** :
   - Allez sur GitHub → Actions
   - Cliquez sur le workflow en cours
   - Suivez les logs en temps réel

### Déploiement manuel (workflow_dispatch)

1. Allez sur GitHub → Actions
2. Cliquez sur "Build and Deploy to VPS"
3. Cliquez sur "Run workflow"
4. Sélectionnez la branche et cliquez sur "Run workflow"

---

## Dépannage

### Erreur : "ssh: unable to authenticate"

**Cause** : La clé SSH dans GitHub ne correspond pas à celle autorisée sur le VPS.

**Solution** :
1. Sur le VPS, vérifiez `~/.ssh/authorized_keys` :
   ```bash
   cat ~/.ssh/authorized_keys
   ```
2. Chaque clé doit être sur **UNE SEULE ligne**
3. Extrayez la clé publique de la clé privée :
   ```bash
   ssh-keygen -y -f ~/.ssh/github_deploy_api
   ```
4. Vérifiez que cette clé publique est bien dans `authorized_keys`

### Erreur 502 Bad Gateway

**Cause** : Nginx ne peut pas se connecter au container Docker.

**Solutions** :

1. **Vérifiez que le container tourne** :
   ```bash
   docker compose ps
   docker compose logs api
   ```

2. **Vérifiez que le port est exposé** :
   ```bash
   docker compose ps api
   ```
   Vous devez voir : `0.0.0.0:5000->5000/tcp`

3. **Vérifiez docker-compose.yml** :
   - Utilisez `ports: - "5000:5000"` et NON `expose: - "5000"`

4. **Testez la connexion locale** :
   ```bash
   curl http://localhost:5000/health
   ```

### Erreur 404 Not Found

**Cause** : Le chemin de l'API est incorrect.

**Solutions** :

1. Vérifiez que votre API utilise le préfixe `/api` :
   ```javascript
   app.use('/api/auth', authRouter);
   ```

2. Vérifiez que le front-end utilise la bonne URL :
   - Correct : `https://admin.edutrackhub.cloud/api/auth/login`
   - Incorrect : `https://admin.edutrackhub.cloud/auth/login`

3. Testez sur Swagger :
   - Allez sur : `https://admin.edutrackhub.cloud/api-docs`

### Les modifications ne sont pas déployées

**Solutions** :

1. **Vérifiez que le workflow s'est bien exécuté** :
   - GitHub → Actions → Vérifiez qu'il n'y a pas d'erreurs

2. **Vérifiez que l'image Docker a été mise à jour** :
   ```bash
   docker compose pull api
   docker compose up -d api
   ```

3. **Vérifiez les logs du container** :
   ```bash
   docker compose logs --tail=50 api
   ```

### Vérifier les logs

Sur le VPS :

```bash
# Logs du container
docker compose logs --tail=100 -f api

# Logs Nginx
sudo tail -f /var/log/nginx/gestion-ecole-api-error.log
sudo tail -f /var/log/nginx/gestion-ecole-api-access.log

# Statut des containers
docker compose ps

# Utilisation des ressources
docker stats
```

---

## Commandes utiles

### Sur le VPS

```bash
# Se connecter au VPS
ssh edutrack@195.35.24.88

# Aller dans le dossier de l'application
cd ~/gestion-ecole-api

# Voir les containers en cours
docker compose ps

# Voir les logs en temps réel
docker compose logs -f api

# Redémarrer l'API
docker compose restart api

# Arrêter tous les containers
docker compose down

# Démarrer tous les containers
docker compose up -d

# Reconstruire et redémarrer
docker compose up -d --build api

# Nettoyer les images inutilisées
docker system prune -a

# Vérifier l'espace disque
df -h
```

### En local

```bash
# Tester la connexion SSH
ssh -i ~/.ssh/ma_cle edutrack@195.35.24.88

# Voir les workflows GitHub
gh run list

# Déclencher un workflow manuellement
gh workflow run deploy.yml
```

---

## Checklist de déploiement

Avant de déployer, vérifiez que :

- [ ] Les clés SSH sont configurées sur le VPS
- [ ] Les secrets GitHub sont correctement configurés
- [ ] Le fichier `.env.production` contient toutes les variables nécessaires
- [ ] `docker-compose.yml` utilise `ports` et non `expose`
- [ ] Nginx est configuré et pointe vers `localhost:5000`
- [ ] Le certificat SSL est valide
- [ ] Le nom de domaine pointe vers l'IP du VPS
- [ ] Docker et Docker Compose sont installés sur le VPS
- [ ] Les tests passent en local avant de déployer

---

## Sécurité

### Bonnes pratiques

1. **Changez les mots de passe par défaut** dans `.env.production`
2. **Utilisez des secrets forts** pour JWT_SECRET
3. **Limitez l'accès SSH** au VPS (fail2ban recommandé)
4. **Gardez Docker et Nginx à jour** :
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Activez le firewall** :
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

6. **Surveillez les logs** régulièrement
7. **Faites des backups** de la base de données :
   ```bash
   docker compose exec postgres pg_dump -U gestion_user gestion_ecole > backup.sql
   ```

---

## Support

En cas de problème :

1. Vérifiez les logs (voir section Dépannage)
2. Consultez la documentation GitHub Actions
3. Vérifiez la documentation Docker
4. Contactez le support de votre hébergeur VPS

---

**Date de création** : 20 février 2026
**Dernière mise à jour** : 20 février 2026
**Version** : 1.0
