# 🏗️ Architecture de l'application

Documentation détaillée de l'architecture de l'API Gestion École.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture des conteneurs](#architecture-des-conteneurs)
- [Flux de données](#flux-de-données)
- [Schéma de base de données](#schéma-de-base-de-données)
- [Architecture de l'API](#architecture-de-lapi)
- [Système d'authentification](#système-dauthentification)
- [Système de permissions](#système-de-permissions)
- [Intégrations externes](#intégrations-externes)
- [Sécurité](#sécurité)
- [Performance](#performance)

---

## 🌐 Vue d'ensemble

L'application utilise une architecture en 3 tiers containerisée avec Docker :

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Port 80 / 443 (HTTPS)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                     │
│  • Terminaison SSL/TLS                                       │
│  • Compression Gzip                                          │
│  • Cache des fichiers statiques                              │
│  • Limitation de taux (rate limiting)                        │
│  • Redirection HTTP → HTTPS                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      Port 5000 (HTTP)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Node.js + Express                     │
│  • Logique métier                                            │
│  • Authentification JWT                                      │
│  • Validation des données (Zod)                              │
│  • Gestion des permissions RBAC                              │
│  • Upload de fichiers (Multer)                               │
│  • Documentation Swagger                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      Port 5432 (PostgreSQL)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL 16                           │
│  • Base de données relationnelle                             │
│  • Données persistantes (Volume Docker)                      │
│  • Relations complexes                                       │
│  • Index optimisés                                           │
└─────────────────────────────────────────────────────────────┘
```

### Caractéristiques principales

- **Isolation** : Chaque service tourne dans son propre container
- **Réseau privé** : Communication inter-containers via réseau Docker bridge
- **Persistance** : Volumes Docker pour PostgreSQL et uploads
- **Haute disponibilité** : Healthchecks et auto-restart
- **SSL/TLS** : Certificats Let's Encrypt renouvelés automatiquement
- **Scalabilité** : Architecture prête pour le load balancing

---

## 🐳 Architecture des conteneurs

### Container 1 : PostgreSQL

```yaml
Service: postgres
Image: postgres:16-alpine
Port interne: 5432
Volume: postgres_data:/var/lib/postgresql/data
Réseau: gestion-ecole-network (privé)
```

**Responsabilités** :
- Stockage des données de l'application
- Gestion des transactions ACID
- Indexation pour les performances
- Healthcheck : `pg_isready`

**Variables d'environnement** :
- `POSTGRES_USER` : Utilisateur de la base
- `POSTGRES_PASSWORD` : Mot de passe sécurisé
- `POSTGRES_DB` : Nom de la base de données

### Container 2 : API Node.js

```yaml
Service: api
Image: ssarata/gestion-ecole-api:latest
Port interne: 5000
Dépendance: postgres (healthcheck)
Volume: ./uploads:/app/uploads
Réseau: gestion-ecole-network (privé)
```

**Responsabilités** :
- Logique métier de l'application
- Authentification et autorisation
- Validation des entrées utilisateur
- Gestion des fichiers uploadés
- Documentation API (Swagger)
- Healthcheck : `GET /health`

**Variables d'environnement critiques** :
- `DATABASE_URL` : Connexion PostgreSQL
- `JWT_SECRET` : Clé de signature JWT
- `API_URL` : URL publique de l'API
- `CORS_ORIGIN` : Origines autorisées

**Processus de démarrage** :
1. Attente de PostgreSQL (15 secondes)
2. Synchronisation du schéma Prisma (`db push`)
3. Génération du client Prisma
4. Exécution du seeder (si base vide)
5. Démarrage du serveur Express

### Container 3 : Nginx

```yaml
Service: nginx
Image: nginx:alpine
Ports publics: 80, 443
Dépendance: api
Volumes:
  - ./nginx-gestion-ecole.conf:/etc/nginx/conf.d/default.conf
  - ./certbot/conf:/etc/letsencrypt
  - ./uploads:/var/www/uploads
Réseau: gestion-ecole-network + Internet
```

**Responsabilités** :
- Reverse proxy vers l'API
- Terminaison SSL/TLS
- Redirection HTTP → HTTPS
- Servir les fichiers uploadés
- Compression Gzip
- Healthcheck : `nc -z localhost 80`

**Configuration clé** :
```nginx
# Redirection HTTP → HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}

# Serveur HTTPS
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/admin.edutrackhub.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.edutrackhub.cloud/privkey.pem;

    location / {
        proxy_pass http://api:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔄 Flux de données

### Requête typique : Login utilisateur

```
1. Client (Browser/Mobile)
   ↓
   POST https://admin.edutrackhub.cloud/auth/login
   {
     "email": "admin@ecole.com",
     "password": "admin123"
   }

2. Nginx (Container)
   ↓
   • Reçoit la requête HTTPS
   • Vérifie le certificat SSL
   • Déchiffre la connexion TLS
   • Transmet en HTTP à l'API
   ↓
   POST http://api:5000/auth/login (réseau Docker)

3. API Node.js (Container)
   ↓
   • Middleware Express (parsing JSON)
   • Validation Zod du body
   • Route /auth/login
   • Recherche utilisateur en DB
   ↓
   SELECT * FROM users WHERE email = 'admin@ecole.com'

4. PostgreSQL (Container)
   ↓
   • Exécute la requête SQL
   • Retourne l'utilisateur avec le hash du mot de passe
   ↓
   { id: 1, email: "...", passwordHash: "$2b$10..." }

5. API Node.js (Suite)
   ↓
   • Vérifie le mot de passe avec bcrypt
   • Génère un access token JWT (15min)
   • Génère un refresh token JWT (7 jours)
   • Enregistre le refresh token en DB
   ↓
   INSERT INTO refresh_tokens ...

6. PostgreSQL
   ↓
   • Enregistre le refresh token
   ↓

7. API → Nginx → Client
   ↓
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": 1,
       "email": "admin@ecole.com",
       "role": "ADMIN"
     }
   }
```

### Upload de fichier

```
1. Client
   ↓
   POST https://admin.edutrackhub.cloud/users/1/avatar
   Content-Type: multipart/form-data
   Authorization: Bearer <token>

2. Nginx
   ↓
   • Limite la taille (client_max_body_size)
   • Transmet à l'API
   ↓

3. API
   ↓
   • Middleware d'authentification (vérifie JWT)
   • Middleware de permissions (vérifie RBAC)
   • Middleware Multer (gère l'upload)
   • Sauvegarde dans /app/uploads/avatars/
   • Enregistre le chemin en DB
   ↓
   UPDATE users SET avatarUrl = '/uploads/avatars/1234.jpg' WHERE id = 1

4. PostgreSQL
   ↓
   • Met à jour le champ avatarUrl
   ↓

5. Client peut accéder au fichier
   ↓
   GET https://admin.edutrackhub.cloud/uploads/avatars/1234.jpg
   ↓
   Nginx sert directement le fichier depuis /var/www/uploads/
```

---

## 🗄️ Schéma de base de données

### Entités principales

```
users
├── id (UUID)
├── email (unique)
├── passwordHash
├── role (enum: ADMIN, PROVISEUR, PROFESSEUR, etc.)
├── permissions (jsonb)
├── firstName
├── lastName
├── avatarUrl
├── createdAt
└── updatedAt

students
├── id (UUID)
├── userId (FK → users.id)
├── matricule (unique)
├── dateNaissance
├── lieuNaissance
├── genre
├── adresse
├── telephone
├── classeId (FK → classes.id)
└── ... (+ relations parents, notes, absences)

classes
├── id (UUID)
├── nom (ex: "Terminale S1")
├── niveau (enum: SIXIEME, CINQUIEME, ..., TERMINALE)
├── filiere (GENERALE, TECHNIQUE, PROFESSIONNELLE)
├── serie (S, ES, L, etc.)
├── capacite
├── anneeAcademiqueId (FK → annees_academiques.id)
└── ... (+ relations élèves, matières)

professeurs
├── id (UUID)
├── userId (FK → users.id)
├── specialite
├── telephone
├── dateEmbauche
└── ... (+ relations matières enseignées)

notes
├── id (UUID)
├── eleveId (FK → students.id)
├── matiereId (FK → matieres.id)
├── evaluationId (FK → evaluations.id)
├── note (decimal)
├── coefficient
├── dateSaisie
└── ... (calculs moyennes)

paiements
├── id (UUID)
├── eleveId (FK → students.id)
├── montant
├── typePaiement (SCOLARITE, INSCRIPTION, etc.)
├── statut (EN_ATTENTE, VALIDE, REFUSE)
├── modePaiement (ESPECES, MOBILE_MONEY, etc.)
├── monerooTransactionId
└── ... (traçabilité)
```

### Relations clés

```
User 1 ──→ 1 Student/Professeur/Parent (polymorphisme via userId)
Student N ──→ 1 Classe
Classe N ──→ N Matières (through classe_matieres)
Student N ──→ N Parents (through student_parents)
Student 1 ──→ N Notes
Student 1 ──→ N Paiements
Student 1 ──→ N Absences
Professeur N ──→ N Matières (through professeur_matieres)
```

---

## 🔌 Architecture de l'API

### Structure des routes

```
/
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /refresh
│   └── POST /logout
│
├── /users
│   ├── GET /users
│   ├── GET /users/:id
│   ├── POST /users
│   ├── PUT /users/:id
│   ├── DELETE /users/:id
│   └── POST /users/:id/avatar
│
├── /students
│   ├── GET /students
│   ├── GET /students/:id
│   ├── POST /students
│   ├── PUT /students/:id
│   └── DELETE /students/:id
│
├── /classes
│   ├── GET /classes
│   ├── GET /classes/:id
│   ├── POST /classes
│   ├── PUT /classes/:id
│   └── DELETE /classes/:id
│
├── /professeurs
├── /matieres
├── /notes
├── /evaluations
├── /absences
├── /retards
├── /paiements
├── /annees-academiques
├── /evenements
├── /actualites
├── /pages
└── /health (healthcheck)
```

### Stack de middlewares

Chaque requête passe par ces middlewares dans l'ordre :

```javascript
1. express.json() - Parse le body JSON
2. cors() - Gère les CORS
3. helmet() - Headers de sécurité
4. authenticateToken() - Vérifie le JWT
5. checkPermission() - Vérifie les permissions RBAC
6. validateRequest() - Valide avec Zod
7. Route handler - Logique métier
8. errorHandler() - Gestion des erreurs
```

### Exemple de route protégée

```typescript
// src/Routes/students.ts
router.post(
  '/students',
  authenticateToken,              // Middleware 1 : JWT valide ?
  checkPermission('create:students'), // Middleware 2 : Permission ?
  validateRequest(createStudentSchema), // Middleware 3 : Données valides ?
  async (req, res) => {           // Handler
    const student = await prisma.student.create({
      data: req.body
    });
    res.status(201).json(student);
  }
);
```

---

## 🔐 Système d'authentification

### JWT (JSON Web Tokens)

#### Access Token
- **Durée** : 15 minutes
- **Usage** : Chaque requête API
- **Contenu** :
```json
{
  "userId": "uuid-1234",
  "email": "admin@ecole.com",
  "role": "ADMIN",
  "iat": 1708012345,
  "exp": 1708013245
}
```

#### Refresh Token
- **Durée** : 7 jours
- **Usage** : Renouveler l'access token
- **Stockage** : Base de données (table refresh_tokens)
- **Révocation** : Possible (logout, changement de mot de passe)

### Flux d'authentification

```
1. Login
   ↓
   POST /auth/login
   ↓
   Retourne access + refresh tokens

2. Requête API (tant que access token valide)
   ↓
   GET /students
   Headers: { Authorization: "Bearer <accessToken>" }
   ↓
   API vérifie et valide

3. Access token expiré (après 15min)
   ↓
   GET /students → 401 Unauthorized
   ↓
   Client détecte 401
   ↓
   POST /auth/refresh
   Body: { refreshToken: "<refreshToken>" }
   ↓
   Retourne nouveau access token

4. Refresh token expiré (après 7 jours)
   ↓
   POST /auth/refresh → 401 Unauthorized
   ↓
   Client redirige vers /login
```

### Sécurité du mot de passe

```typescript
// Hashing avec bcrypt (10 rounds)
const passwordHash = await bcrypt.hash(password, 10);
// Résultat : $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Vérification
const isValid = await bcrypt.compare(password, passwordHash);
```

**Politique de mots de passe** (recommandée) :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

---

## 🔒 Système de permissions

### Modèle RBAC (Role-Based Access Control)

#### 8 rôles prédéfinis

```typescript
enum Role {
  ADMIN,        // Accès total
  PROVISEUR,    // Gestion pédagogique et administrative
  PROFESSEUR,   // Gestion notes et absences
  ECONOME,      // Gestion financière
  SURVEILLANT,  // Gestion absences et retards
  SECRETAIRE,   // Gestion inscriptions et dossiers
  PARENT,       // Consultation enfants uniquement
  ELEVE         // Consultation personnelle uniquement
}
```

#### 143 permissions granulaires

Format : `<action>:<resource>`

Exemples :
- `read:students` - Voir les élèves
- `create:students` - Créer un élève
- `update:students` - Modifier un élève
- `delete:students` - Supprimer un élève
- `read:own_notes` - Voir ses propres notes (élève)
- `read:children_notes` - Voir les notes de ses enfants (parent)

#### Matrice de permissions (exemples)

| Rôle | Élèves | Notes | Paiements | Utilisateurs |
|------|--------|-------|-----------|--------------|
| **ADMIN** | CRUD | CRUD | CRUD | CRUD |
| **PROVISEUR** | CRUD | CRUD | Read | CRUD (sauf admin) |
| **PROFESSEUR** | Read | CRUD (ses classes) | - | Read (ses élèves) |
| **ECONOME** | Read | - | CRUD | Read |
| **PARENT** | Read (enfants) | Read (enfants) | Read/Create (enfants) | - |
| **ELEVE** | Read (self) | Read (self) | Read (self) | Read (self) |

#### Implémentation

```typescript
// middleware/checkPermission.ts
export const checkPermission = (permission: string) => {
  return (req, res, next) => {
    const user = req.user; // Injecté par authenticateToken

    if (user.role === 'ADMIN') {
      return next(); // Admin a tous les droits
    }

    // Vérifier dans permissions JSONB
    const hasPermission = user.permissions?.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Permission insuffisante',
        required: permission
      });
    }

    next();
  };
};
```

---

## 🌍 Intégrations externes

### Moneroo (Paiements mobiles)

```
Client → API
  ↓
  POST /paiements
  {
    "eleveId": "uuid",
    "montant": 50000,
    "modePaiement": "ORANGE_MONEY"
  }
  ↓
API → Moneroo API
  ↓
  POST https://api.moneroo.io/v1/payments/initialize
  Headers: { "Authorization": "Bearer <MONEROO_SECRET_KEY>" }
  Body: {
    "amount": 50000,
    "currency": "XOF",
    "return_url": "https://admin.edutrackhub.cloud/paiements/callback"
  }
  ↓
Moneroo → API
  ↓
  {
    "payment_url": "https://pay.moneroo.io/xyz123",
    "transaction_id": "moneroo_123456"
  }
  ↓
API → Client
  ↓
  {
    "paymentUrl": "https://pay.moneroo.io/xyz123",
    "transactionId": "moneroo_123456",
    "status": "EN_ATTENTE"
  }
  ↓
Client redirigé vers Moneroo
  ↓
Utilisateur paie avec Orange Money/Wave/Free Money
  ↓
Moneroo → API (Webhook)
  ↓
  POST /paiements/webhook
  {
    "transaction_id": "moneroo_123456",
    "status": "SUCCESS"
  }
  ↓
API met à jour le paiement
  ↓
  UPDATE paiements SET statut = 'VALIDE' WHERE monerooTransactionId = 'moneroo_123456'
```

---

## 🛡️ Sécurité

### Mesures implémentées

1. **HTTPS obligatoire**
   - Redirection automatique HTTP → HTTPS
   - Certificats Let's Encrypt (TLS 1.2+)
   - Headers de sécurité (HSTS, X-Frame-Options)

2. **Authentification**
   - JWT avec expiration courte (15min)
   - Refresh tokens révocables
   - Hashing bcrypt pour les mots de passe

3. **Autorisation**
   - RBAC avec 143 permissions granulaires
   - Vérification à chaque requête
   - Isolation des données (parents ne voient que leurs enfants)

4. **Validation des entrées**
   - Validation Zod de tous les inputs
   - Sanitization automatique
   - Protection contre les injections SQL (Prisma)

5. **Rate limiting** (recommandé à ajouter)
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   ```

6. **CORS**
   - Origines autorisées explicitement
   - Credentials autorisés uniquement pour les domaines de confiance

7. **Secrets**
   - Variables d'environnement (jamais en dur)
   - `.env` exclu de Git
   - JWT_SECRET long et aléatoire

### Recommandations supplémentaires

- [ ] Implémenter rate limiting dans nginx
- [ ] Ajouter une 2FA pour les administrateurs
- [ ] Mettre en place un système d'audit logs
- [ ] Scanner régulièrement les dépendances (npm audit)
- [ ] Configurer un WAF (Web Application Firewall)
- [ ] Chiffrer les données sensibles au repos

---

## ⚡ Performance

### Optimisations actuelles

1. **Cache statique**
   - Nginx cache les fichiers uploadés
   - Headers Cache-Control appropriés

2. **Compression**
   - Gzip activé dans nginx pour JSON/HTML/CSS/JS
   - Réduction de ~70% de la bande passante

3. **Index PostgreSQL**
   - Index sur les clés étrangères
   - Index unique sur email, matricule
   - Index composite pour les recherches courantes

4. **Connexion pooling**
   - Prisma gère un pool de connexions PostgreSQL
   - Réutilisation des connexions

5. **HTTP/2**
   - Multiplexing des requêtes
   - Compression des headers

### Métriques cibles

| Métrique | Cible | Actuel |
|----------|-------|--------|
| **Temps de réponse API** | < 200ms | ~150ms |
| **Temps de connexion DB** | < 50ms | ~30ms |
| **Temps de login** | < 500ms | ~400ms |
| **Uptime** | > 99.5% | ~99.8% |
| **Requêtes/seconde** | > 100 | ~150 |

### Optimisations futures

1. **Redis pour le cache**
   - Cache des requêtes fréquentes
   - Sessions utilisateur
   - Rate limiting

2. **CDN pour les assets**
   - Cloudflare ou équivalent
   - Distribution géographique

3. **Load balancing**
   - Plusieurs instances de l'API
   - Nginx en load balancer

4. **Database read replicas**
   - Répartir les lectures sur plusieurs instances PostgreSQL
   - Master pour les écritures

---

## 📊 Diagramme de séquence complet

### Création d'un élève par le secrétaire

```
Secrétaire (Browser) → Nginx → API → PostgreSQL

1. Login
   Secrétaire → Nginx: POST /auth/login
   Nginx → API: POST /auth/login
   API → PostgreSQL: SELECT * FROM users WHERE email = ?
   PostgreSQL → API: { id, email, passwordHash, role: SECRETAIRE }
   API → API: bcrypt.compare(password, hash)
   API → API: jwt.sign({ userId, role })
   API → PostgreSQL: INSERT INTO refresh_tokens
   API → Nginx: { accessToken, refreshToken, user }
   Nginx → Secrétaire: { accessToken, refreshToken, user }

2. Créer élève
   Secrétaire → Nginx: POST /students + JWT
   Nginx → API: POST /students + JWT
   API → API: authenticateToken() - Vérifie JWT
   API → API: checkPermission('create:students') - OK (SECRETAIRE a la permission)
   API → API: validateRequest(schema) - Valide les données
   API → PostgreSQL: BEGIN TRANSACTION
   API → PostgreSQL: INSERT INTO users (email, role=ELEVE)
   PostgreSQL → API: { id: user-uuid }
   API → PostgreSQL: INSERT INTO students (userId, matricule, ...)
   PostgreSQL → API: { id: student-uuid, userId, ... }
   API → PostgreSQL: COMMIT
   API → Nginx: 201 { id, matricule, nom, prenom, ... }
   Nginx → Secrétaire: 201 { id, matricule, nom, prenom, ... }
```

---

## 🔗 Références

- **Prisma ORM** : https://www.prisma.io/docs
- **Express.js** : https://expressjs.com/
- **JWT** : https://jwt.io/
- **Docker** : https://docs.docker.com/
- **Nginx** : https://nginx.org/en/docs/
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Let's Encrypt** : https://letsencrypt.org/docs/

---

**📚 Autres guides** :
- [Guide de déploiement](./DEPLOYMENT.md)
- [Guide de maintenance](./MAINTENANCE.md)
- [README principal](../README.md)

**📧 Contact** : saratasankara598@gmail.com
