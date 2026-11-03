# 🎓 Gestion École API

API REST complète pour la gestion d'établissement scolaire avec authentification, gestion des élèves, professeurs, paiements, notes et bien plus.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-orange)](https://www.prisma.io/)

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Démarrage rapide](#-démarrage-rapide)
- [Documentation](#-documentation)
- [Comptes de test](#-comptes-de-test)
- [Scripts disponibles](#-scripts-disponibles)
- [Contribuer](#-contribuer)

---

## ✨ Fonctionnalités

### 👥 Gestion des utilisateurs
- **Authentification JWT** avec refresh tokens
- **8 rôles** : Admin, Proviseur, Professeur, Économe, Surveillant, Secrétaire, Parent, Élève
- **143 permissions** granulaires (CRUD sur toutes les ressources)
- Gestion des profils et avatars

### 🎓 Gestion scolaire
- **Élèves** : Inscription, parcours scolaire, notes, absences, retards
- **Classes** : Niveaux (6ème à Terminale), filières, séries, spécialités
- **Matières** : Coefficients par niveau et série
- **Évaluations** : Notes, moyennes, bulletins
- **Années académiques** : Gestion multi-années

### 👨‍🏫 Gestion du personnel
- **Professeurs** : Matières enseignées, emploi du temps, cahier de texte
- **Staff** : Personnel administratif et technique
- **Congés** : Demandes et validations

### 💰 Gestion financière
- **Paiements** : Scolarité, frais divers
- **Intégration Moneroo** : Paiements mobiles (Orange Money, Wave, Free Money)
- **Suivi des impayés** et relances automatiques

### 📅 Événements et activités
- Calendrier scolaire
- Sorties et activités
- Gestion des présences

### 🌐 Site web public
- Page d'accueil personnalisable avec **logo** et **titre** de l'établissement
- Actualités et galeries photos
- Présentation de l'établissement
- Contact et inscriptions en ligne

### 📊 Tableaux de bord par rôle
- **Comptable** : trésorerie, flux mensuel 12 mois, budgets vs réalisé, recouvrement scolarités, alertes
- **Élève** : notes par matière, évolution par trimestre, absences, retards, paiements
- **Professeur** : séances, cahiers de texte, emploi du temps, évaluations, salaires

### 📄 Export de documents
- **Cahier de texte** : export en **PDF** et **Word** (par séance ou par classe)

---

## 🛠️ Technologies

### Backend
- **Node.js 20** avec TypeScript
- **Express.js** pour l'API REST
- **Prisma ORM** avec PostgreSQL
- **JWT** pour l'authentification
- **Bcrypt** pour le hashing des mots de passe

### Infrastructure
- **Docker & Docker Compose** pour la containerisation
- **PostgreSQL 16** comme base de données
- **Nginx** comme reverse proxy avec SSL
- **Let's Encrypt** pour les certificats SSL

### DevOps
- **Docker Hub** pour le registry d'images
- Scripts automatisés de déploiement
- Healthchecks et auto-restart

---

## 🏗️ Architecture

```
Internet
   ↓
   ↓ HTTPS (443) / HTTP (80)
   ↓
┌──────────────────────────────┐
│  Nginx (Container Docker)    │
│  - Reverse Proxy             │
│  - SSL/TLS Termination       │
│  - Gzip Compression          │
└──────────────────────────────┘
   ↓
   ↓ HTTP (Port 5000)
   ↓
┌──────────────────────────────┐
│  API Node.js (Container)     │
│  - Express + TypeScript      │
│  - Authentification JWT      │
│  - Business Logic            │
└──────────────────────────────┘
   ↓
   ↓ PostgreSQL Protocol (5432)
   ↓
┌──────────────────────────────┐
│  PostgreSQL 16 (Container)   │
│  - Base de données           │
│  - Volume persistant         │
└──────────────────────────────┘

Tous les services communiquent via un réseau Docker privé
```

---

## 🚀 Démarrage rapide

### Prérequis

- **Docker** et **Docker Compose** installés
- **Node.js 20+** (pour le développement local)
- **Git**

### Installation locale (développement)

```bash
# 1. Cloner le projet
git clone <repo-url>
cd api

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Configurer les variables dans .env
nano .env

# 5. Démarrer PostgreSQL avec Docker
docker compose up -d postgres

# 6. Exécuter les migrations et le seeder
npx prisma db push
npx tsx prisma/seed.ts

# 7. Lancer l'API en mode développement
npm run dev
```

L'API sera accessible sur `http://localhost:5000`
Documentation Swagger : `http://localhost:5000/api-docs`

---

## 📚 Documentation

- **[Guide de déploiement](./docs/DEPLOYMENT.md)** - Installation complète sur VPS
- **[Guide de maintenance](./docs/MAINTENANCE.md)** - Opérations courantes et troubleshooting
- **[CI/CD avec GitHub Actions](./docs/CI_CD.md)** - Déploiement automatique depuis GitHub
- **[Documentation API](https://admin.edutrackhub.cloud/api-docs)** - Swagger interactif
- **[Architecture détaillée](./docs/ARCHITECTURE.md)** - Schémas et explications

---

## 🔐 Comptes de test

Après l'exécution du seeder, ces comptes sont disponibles :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@ecole.com | admin123 |
| **Professeur** | marie.diallo@ecole.com | prof123 |
| **Parent** | moussa.sow@parent.com | parent123 |
| **Élève** | khalipha.toure@eleve.com | eleve123 |
| **Staff** | adama.ndiaye@staff.com | staff123 |

⚠️ **IMPORTANT** : Changez ces mots de passe en production !

---

## 📜 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance l'API en mode développement avec hot-reload |
| `npm start` | Lance l'API en mode production |
| `npm run seed` | Exécute le seeder pour créer les données de test |
| `./build-and-push.sh` | Build l'image Docker et la push sur Docker Hub |
| `./full-deploy.sh` | Déploiement complet sur le VPS (build + deploy) |
| `./full-deploy.sh --no-build` | Redéploiement rapide sans rebuild |
| `./generate-ssl.sh` | Génère les certificats SSL (première installation) |
| `./renew-ssl.sh` | Renouvelle les certificats SSL |

---

## 🌍 Environnement de production

L'application est déployée sur :
- **URL** : https://admin.edutrackhub.cloud
- **Swagger** : https://admin.edutrackhub.cloud/api-docs
- **Health Check** : https://admin.edutrackhub.cloud/health

### 🚀 Déploiement automatique (CI/CD)

L'application utilise GitHub Actions pour un déploiement automatique :

1. **Push sur `main` ou `dev`** → Déclenche automatiquement le workflow
2. **Build** de l'image Docker (sans cache)
3. **Push** vers Docker Hub
4. **Déploiement** automatique sur le VPS (`docker compose pull && up`)
5. **Migrations BDD** appliquées au démarrage du conteneur (voir ci-dessous)

```bash
# Pour déployer une nouvelle version :
git add .
git commit -m "feat: Nouvelle fonctionnalité"
git push origin main
# ✅ Le déploiement démarre automatiquement !
```

### 🗄️ Migrations de base de données au démarrage

Le script `docker-entrypoint.sh` s'exécute à chaque redémarrage du conteneur et **applique automatiquement les changements de schéma** :

```
1. Attente PostgreSQL (15 s)
2. npx prisma migrate deploy   ← applique les nouvelles migrations SQL
   └─ fallback : npx prisma db push --skip-generate
3. npx prisma generate         ← regénère le client Prisma
4. Seeder (ignoré si données déjà présentes)
5. npm start
```

> **Important** : tout nouveau champ ou table ajouté dans `prisma/schema.prisma` est **pris en compte automatiquement** lors du prochain push/déploiement. Aucune intervention manuelle sur le VPS n'est nécessaire.

Si vous avez ajouté une migration manuelle dans `prisma/migrations/`, elle sera détectée et jouée par `migrate deploy`. Sinon, `db push` se charge de synchroniser le schéma directement.

Consultez le **[Guide CI/CD](./docs/CI_CD.md)** pour la configuration complète.

---

## 📁 Structure du projet

```
api/
├── src/
│   ├── Routes/          # Routes de l'API
│   ├── middleware/      # Middlewares Express
│   └── types/           # Types TypeScript
├── prisma/
│   ├── schema.prisma    # Schéma de la base de données
│   ├── migrations/      # Migrations Prisma
│   └── seed.ts          # Script de seeding
├── utils/
│   └── swagger.ts       # Configuration Swagger
├── docs/                # Documentation
├── docker-compose.yml   # Configuration Docker
├── Dockerfile          # Image de l'API
├── nginx-gestion-ecole.conf  # Configuration Nginx
└── *.sh                # Scripts de déploiement
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 License

Ce projet est sous licence MIT.

---

## 👨‍💻 Auteur

**Sankara Sarata**
📧 saratasankara598@gmail.com

---

## 🙏 Remerciements

- [Prisma](https://www.prisma.io/) pour l'excellent ORM
- [Express.js](https://expressjs.com/) pour le framework web
- [Docker](https://www.docker.com/) pour la containerisation
- [Let's Encrypt](https://letsencrypt.org/) pour les certificats SSL gratuits
- [Moneroo](https://moneroo.com/) pour l'intégration des paiements mobiles

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**
