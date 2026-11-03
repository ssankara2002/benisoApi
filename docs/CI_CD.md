# 🚀 CI/CD avec GitHub Actions

Configuration du déploiement automatique depuis GitHub vers le VPS via Docker Hub.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Configuration GitHub](#configuration-github)
- [Configuration du VPS](#configuration-du-vps)
- [Workflow CI/CD](#workflow-cicd)
- [Utilisation](#utilisation)
- [Troubleshooting](#troubleshooting)

---

## 🌐 Vue d'ensemble

### Flux de déploiement automatique

```
1. Développeur
   ↓
   git push origin main
   ↓
2. GitHub
   ↓
   Détecte le push sur main
   ↓
3. GitHub Actions (CI/CD)
   ↓
   ┌─────────────────────────────────┐
   │ Job: build-and-deploy           │
   │                                 │
   │ 1. Checkout code                │
   │ 2. Setup Docker Buildx          │
   │ 3. Login Docker Hub             │
   │ 4. Build image Docker           │
   │ 5. Push vers Docker Hub         │
   │    - latest                     │
   │    - git SHA                    │
   │ 6. SSH vers VPS                 │
   │ 7. Pull nouvelle image          │
   │ 8. Redémarrer containers        │
   └─────────────────────────────────┘
   ↓
4. Docker Hub
   ↓
   Image: ssarata/gestion-ecole-api:latest
   ↓
5. VPS (195.35.24.88)
   ↓
   ┌─────────────────────────────────┐
   │ 1. Stop API container           │
   │ 2. Remove old container         │
   │ 3. Remove old image             │
   │ 4. Pull new image               │
   │ 5. Start new container          │
   │ 6. Verify deployment            │
   └─────────────────────────────────┘
   ↓
6. Application en production
   ↓
   https://admin.edutrackhub.cloud
```

### Avantages

✅ **Automatisation complète** - Un simple push déclenche tout le processus
✅ **Zéro downtime** - Remplacement rapide du container (~20 secondes)
✅ **Traçabilité** - Chaque déploiement est lié à un commit Git
✅ **Rollback facile** - Images taggées avec le SHA du commit
✅ **Logs centralisés** - Tout est visible dans GitHub Actions

---

## 🔧 Prérequis

### Sur votre machine locale

- [x] Compte GitHub avec accès au dépôt
- [x] Compte Docker Hub
- [x] Accès SSH au VPS

### Sur le VPS

- [x] Docker et Docker Compose installés
- [x] Application déjà déployée une première fois
- [x] Fichiers de configuration en place (.env, docker-compose.yml, nginx.conf)

---

## ⚙️ Configuration GitHub

### Étape 1 : Créer les secrets GitHub

Les secrets sont nécessaires pour que GitHub Actions puisse se connecter à Docker Hub et au VPS.

1. **Aller sur GitHub**
   - Ouvrir votre dépôt
   - Cliquer sur **Settings** (Paramètres)
   - Dans le menu latéral : **Secrets and variables** → **Actions**
   - Cliquer sur **New repository secret**

2. **Créer les 4 secrets suivants :**

#### Secret 1 : DOCKER_USERNAME

```
Nom: DOCKER_USERNAME
Valeur: ssarata
```

C'est votre nom d'utilisateur Docker Hub.

#### Secret 2 : DOCKER_PASSWORD

```
Nom: DOCKER_PASSWORD
Valeur: [Votre mot de passe Docker Hub ou Access Token]
```

**Recommandé** : Utilisez un Access Token plutôt qu'un mot de passe :
1. Aller sur https://hub.docker.com/settings/security
2. Cliquer sur **New Access Token**
3. Nom : "GitHub Actions"
4. Permissions : "Read & Write"
5. Copier le token généré
6. Utiliser ce token comme valeur du secret

#### Secret 3 : VPS_HOST

```
Nom: VPS_HOST
Valeur: 195.35.24.88
```

L'adresse IP de votre VPS.

#### Secret 4 : VPS_USER

```
Nom: VPS_USER
Valeur: edutrack
```

L'utilisateur SSH sur le VPS.

#### Secret 5 : VPS_SSH_KEY

```
Nom: VPS_SSH_KEY
Valeur: [Clé privée SSH]
```

**Comment obtenir la clé SSH ?**

**Option A : Utiliser une clé existante**

```bash
# Sur votre machine locale
cat ~/.ssh/id_rsa

# Copier TOUTE la sortie, incluant :
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----
```

**Option B : Créer une nouvelle clé dédiée pour GitHub Actions**

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions

# Afficher la clé privée
cat ~/.ssh/github-actions

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/github-actions.pub edutrack@195.35.24.88

# OU manuellement :
cat ~/.ssh/github-actions.pub
# Puis sur le VPS :
ssh edutrack@195.35.24.88
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Coller la clé publique, sauvegarder
chmod 600 ~/.ssh/authorized_keys
```

**Coller la clé privée dans le secret GitHub** (tout le contenu, avec les lignes BEGIN/END).

### Étape 2 : Vérifier les secrets

Une fois créés, vous devriez voir les 5 secrets dans la liste :

```
✅ DOCKER_USERNAME
✅ DOCKER_PASSWORD
✅ VPS_HOST
✅ VPS_USER
✅ VPS_SSH_KEY
```

---

## 🖥️ Configuration du VPS

### Vérifier la configuration SSH

```bash
# Se connecter au VPS
ssh edutrack@195.35.24.88

# Vérifier que Docker est accessible
docker ps

# Vérifier que l'application est en place
cd ~/gestion-ecole-api
ls -la

# Devrait contenir :
# - docker-compose.yml
# - .env
# - nginx-gestion-ecole.conf
# - certbot/
# - uploads/
```

### Permissions Docker (important !)

L'utilisateur `edutrack` doit pouvoir utiliser Docker sans `sudo` :

```bash
# Sur le VPS
sudo usermod -aG docker edutrack

# Déconnexion et reconnexion pour appliquer
exit
ssh edutrack@195.35.24.88

# Tester (ne devrait pas demander sudo)
docker ps
```

Si `docker ps` demande sudo, le CI/CD échouera !

---

## 🔄 Workflow CI/CD

Le fichier `.github/workflows/deploy.yml` définit le workflow.

### Déclencheurs

Le workflow se déclenche automatiquement sur :

1. **Push vers main**
   ```bash
   git push origin main
   ```

2. **Manuellement** (via l'interface GitHub)
   - Aller sur **Actions** dans GitHub
   - Sélectionner **Build and Deploy to VPS**
   - Cliquer sur **Run workflow**

### Étapes du workflow

#### 1. Checkout code
```yaml
- uses: actions/checkout@v4
```
Clone le code du dépôt GitHub.

#### 2. Setup Docker Buildx
```yaml
- uses: docker/setup-buildx-action@v3
```
Configure Docker pour builds multi-plateformes et cache.

#### 3. Login Docker Hub
```yaml
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```
Se connecte à Docker Hub avec vos credentials.

#### 4. Build and Push
```yaml
- uses: docker/build-push-action@v5
  with:
    push: true
    tags: |
      ssarata/gestion-ecole-api:latest
      ssarata/gestion-ecole-api:${{ github.sha }}
```
Build l'image et la push avec 2 tags :
- `latest` : Dernière version
- `<git-sha>` : Version spécifique (pour rollback)

#### 5. Deploy to VPS
```yaml
- uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      # Commandes SSH...
```
Se connecte au VPS et exécute le script de déploiement.

---

## 🚀 Utilisation

### Premier déploiement automatique

1. **Configurer les secrets GitHub** (voir ci-dessus)

2. **Créer le workflow** (si pas déjà fait)
   ```bash
   # Le fichier devrait déjà exister dans votre dépôt
   ls -la .github/workflows/deploy.yml
   ```

3. **Faire un commit et push**
   ```bash
   git add .
   git commit -m "feat: Enable CI/CD with GitHub Actions"
   git push origin main
   ```

4. **Suivre le déploiement**
   - Aller sur GitHub → **Actions**
   - Cliquer sur le workflow qui vient de démarrer
   - Suivre les logs en temps réel

### Déploiements suivants

À chaque fois que vous faites un push sur `main`, le déploiement se fait automatiquement :

```bash
# 1. Faire vos modifications
nano src/Routes/students.ts

# 2. Commit
git add .
git commit -m "fix: Correction validation élèves"

# 3. Push (déclenche le CI/CD)
git push origin main

# 4. Vérifier sur GitHub Actions
# Le workflow démarre automatiquement
```

### Déploiement manuel

Si vous voulez déclencher un déploiement sans faire de push :

1. Aller sur GitHub → **Actions**
2. Sélectionner **Build and Deploy to VPS**
3. Cliquer sur **Run workflow**
4. Sélectionner la branche `main`
5. Cliquer sur **Run workflow**

### Vérifier le déploiement

Une fois le workflow terminé (✅ vert) :

```bash
# 1. Vérifier que l'API répond
curl https://admin.edutrackhub.cloud/health

# 2. Tester Swagger
# Ouvrir https://admin.edutrackhub.cloud/api-docs

# 3. Vérifier les logs sur le VPS (optionnel)
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api
docker compose logs --tail=50 api
```

---

## 🔧 Troubleshooting

### Erreur : "Permission denied (publickey)"

**Cause** : La clé SSH dans `VPS_SSH_KEY` n'est pas valide ou pas autorisée.

**Solution** :

```bash
# 1. Vérifier que la clé publique est sur le VPS
ssh edutrack@195.35.24.88
cat ~/.ssh/authorized_keys

# 2. Vérifier les permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 3. Recréer le secret GitHub avec la bonne clé privée
cat ~/.ssh/id_rsa  # Sur votre machine locale
# Copier TOUTE la sortie dans VPS_SSH_KEY
```

### Erreur : "denied: requested access to the resource is denied"

**Cause** : Problème d'authentification Docker Hub.

**Solution** :

```bash
# 1. Vérifier vos credentials Docker Hub
docker login
# Tester avec vos identifiants

# 2. Créer un Access Token Docker Hub
# https://hub.docker.com/settings/security

# 3. Mettre à jour DOCKER_PASSWORD avec le token
```

### Erreur : "docker: permission denied"

**Cause** : L'utilisateur VPS n'a pas accès à Docker.

**Solution** :

```bash
# Sur le VPS
ssh edutrack@195.35.24.88

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker edutrack

# Déconnexion/reconnexion
exit
ssh edutrack@195.35.24.88

# Tester
docker ps  # Ne doit PAS demander sudo
```

### Le workflow est vert mais l'application ne change pas

**Cause** : Le container n'a pas été redémarré ou l'image n'a pas été pull.

**Solution** :

```bash
# Sur le VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api

# Vérifier l'image actuelle
docker images | grep gestion-ecole-api

# Vérifier quand le container a été créé
docker compose ps api

# Forcer la mise à jour
docker compose stop api
docker compose rm -f api
docker rmi ssarata/gestion-ecole-api:latest
docker pull ssarata/gestion-ecole-api:latest
docker compose up -d api
```

### Le build Docker échoue dans GitHub Actions

**Cause** : Erreur dans le Dockerfile ou dépendances manquantes.

**Solution** :

```bash
# Tester le build localement
docker build -t test-build .

# Vérifier les logs d'erreur dans GitHub Actions
# Corriger le problème
# Re-push
```

### Le container redémarre en boucle après déploiement

**Cause** : Erreur au démarrage de l'application.

**Solution** :

```bash
# Sur le VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api

# Voir les logs détaillés
docker compose logs --tail=100 api

# Vérifier les variables d'environnement
docker compose exec api env | grep -E "(DATABASE_URL|JWT_SECRET|API_URL)"

# Vérifier le fichier .env
cat .env
```

---

## 🔄 Rollback (retour en arrière)

Si un déploiement pose problème, vous pouvez revenir à une version précédente.

### Option 1 : Utiliser le tag git SHA

Chaque build est taggé avec le SHA du commit Git.

```bash
# 1. Trouver le SHA du commit qui fonctionnait
git log --oneline

# Exemple : 4fa713e était le dernier commit qui fonctionnait

# 2. Sur le VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api

# 3. Pull l'image avec ce SHA
docker pull ssarata/gestion-ecole-api:4fa713e

# 4. Modifier temporairement docker-compose.yml
nano docker-compose.yml
# Changer : image: ssarata/gestion-ecole-api:latest
# En : image: ssarata/gestion-ecole-api:4fa713e

# 5. Redémarrer
docker compose down
docker compose up -d

# 6. Vérifier
curl https://admin.edutrackhub.cloud/health
```

### Option 2 : Revert Git

```bash
# 1. Sur votre machine locale
git revert <commit-sha>
git push origin main

# 2. Le CI/CD rebuild et redéploie automatiquement
```

---

## 📊 Monitoring du CI/CD

### Voir l'historique des déploiements

1. GitHub → **Actions**
2. Voir tous les workflows exécutés
3. ✅ = Succès, ❌ = Échec

### Badges de statut (optionnel)

Ajouter un badge dans le README.md :

```markdown
![CI/CD](https://github.com/VOTRE_USERNAME/VOTRE_REPO/actions/workflows/deploy.yml/badge.svg)
```

Remplacer `VOTRE_USERNAME` et `VOTRE_REPO` par vos valeurs.

### Notifications (optionnel)

Pour recevoir des notifications par email en cas d'échec :

1. GitHub → **Settings** → **Notifications**
2. Activer **GitHub Actions**

---

## ✅ Checklist de configuration

### Configuration initiale

- [ ] Compte Docker Hub créé
- [ ] Secrets GitHub configurés (5 secrets)
- [ ] Clé SSH autorisée sur le VPS
- [ ] Utilisateur VPS dans le groupe docker
- [ ] Application déjà déployée une première fois sur le VPS
- [ ] Fichier `.github/workflows/deploy.yml` présent

### Avant chaque push

- [ ] Code testé localement (`npm run dev`)
- [ ] Aucune donnée sensible dans le code
- [ ] Commit message descriptif
- [ ] Branche main à jour

### Après chaque déploiement

- [ ] Workflow GitHub Actions terminé en vert ✅
- [ ] API répond : `curl https://admin.edutrackhub.cloud/health`
- [ ] Swagger accessible : https://admin.edutrackhub.cloud/api-docs
- [ ] Aucune erreur dans les logs VPS

---

## 🎯 Optimisations futures

### Build cache

Le workflow utilise déjà le cache Docker pour accélérer les builds :

```yaml
cache-from: type=registry,ref=ssarata/gestion-ecole-api:buildcache
cache-to: type=registry,ref=ssarata/gestion-ecole-api:buildcache,mode=max
```

### Tests automatisés

Ajouter des tests avant le déploiement :

```yaml
- name: Run tests
  run: |
    npm install
    npm test
```

### Déploiement sur plusieurs environnements

- `main` → Production
- `staging` → Environnement de test
- `dev` → Environnement de développement

### Notifications Slack/Discord

Recevoir des notifications dans Slack/Discord :

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📚 Ressources

- **GitHub Actions** : https://docs.github.com/en/actions
- **Docker Hub** : https://hub.docker.com/
- **SSH Action** : https://github.com/appleboy/ssh-action

---

**📧 Support** : saratasankara598@gmail.com

**📚 Autres guides** :
- [README principal](../README.md)
- [Guide de déploiement](./DEPLOYMENT.md)
- [Guide de maintenance](./MAINTENANCE.md)
- [Architecture](./ARCHITECTURE.md)
