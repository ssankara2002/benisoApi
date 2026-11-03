# Système de Licence API

Ce document explique le fonctionnement du système de licence API qui protège l'accès à l'API de gestion scolaire.

## Vue d'ensemble

Le système de licence permet de contrôler l'accès à l'API en exigeant une clé API valide pour chaque établissement. Chaque licence est valide pour **1 an** et doit être renouvelée annuellement.

## Caractéristiques

- ✅ **Licence annuelle** : Chaque licence est valide pour 1 an à partir de la date d'activation
- ✅ **Clé API unique** : Chaque établissement reçoit une clé API unique et sécurisée
- ✅ **Suivi des utilisations** : Compteur d'appels API et date de dernière utilisation
- ✅ **Activation/Désactivation** : Possibilité d'activer ou désactiver une licence
- ✅ **Renouvellement simple** : Renouvellement en un clic pour 1 an supplémentaire
- ✅ **Routes publiques** : Certaines routes restent accessibles sans licence (auth, webhooks, etc.)

## Routes Publiques (Sans Licence)

Les routes suivantes sont accessibles **sans clé API** :

- `/api/auth/*` - Authentification (login, register, reset password)
- `/api/licences/*` - Gestion des licences (pour les administrateurs)
- `/api/public/*` - Routes publiques
- `/api/webhooks/moneroo` - Webhook de paiement Moneroo
- `/api/uploads/*` - Fichiers statiques
- `/health` - Vérification de santé du serveur

## Routes Protégées (Avec Licence)

Toutes les autres routes nécessitent une **clé API valide** dans le header `X-API-Key` :

- `/api/users/*`
- `/api/eleves/*`
- `/api/notes/*`
- `/api/bulletins/*`
- `/api/paiements/*`
- ... et toutes les autres routes métier

## Utilisation

### 1. Créer une nouvelle licence (Admin uniquement)

**Endpoint:** `POST /api/licences`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "nomEcole": "École Sainte Anne",
  "emailContact": "contact@sainte-anne.edu",
  "telephoneContact": "+225 01 02 03 04 05"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Licence créée avec succès",
  "data": {
    "id": 1,
    "cleApi": "lic_abc123def456...",
    "nomEcole": "École Sainte Anne",
    "emailContact": "contact@sainte-anne.edu",
    "telephoneContact": "+225 01 02 03 04 05",
    "dateActivation": "2024-01-15T10:00:00.000Z",
    "dateExpiration": "2025-01-15T10:00:00.000Z",
    "estActif": true,
    "nombreAppels": 0,
    "derniereUtilisation": null
  }
}
```

### 2. Utiliser l'API avec une licence

Pour accéder aux routes protégées, ajoutez le header `X-API-Key` :

**Exemple avec curl:**
```bash
curl -X GET http://localhost:5000/api/eleves \
  -H "X-API-Key: lic_abc123def456..." \
  -H "Authorization: Bearer <user_token>"
```

**Exemple avec JavaScript/Fetch:**
```javascript
fetch('http://localhost:5000/api/eleves', {
  headers: {
    'X-API-Key': 'lic_abc123def456...',
    'Authorization': 'Bearer <user_token>'
  }
})
```

### 3. Vérifier une licence

**Endpoint:** `POST /api/licences/verify`

**Body:**
```json
{
  "cleApi": "lic_abc123def456..."
}
```

**Réponse (Licence valide):**
```json
{
  "success": true,
  "message": "Licence valide",
  "data": {
    "id": 1,
    "cleApi": "lic_abc123def456...",
    "nomEcole": "École Sainte Anne",
    "dateExpiration": "2025-01-15T10:00:00.000Z",
    "estActif": true
  }
}
```

**Réponse (Licence expirée):**
```json
{
  "success": false,
  "message": "Licence expirée",
  "data": {
    "nomEcole": "École Sainte Anne",
    "dateExpiration": "2024-01-15T10:00:00.000Z",
    "estActif": true
  }
}
```

### 4. Renouveler une licence (Admin uniquement)

**Endpoint:** `PATCH /api/licences/:id/renouveler`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Licence renouvelée avec succès",
  "data": {
    "id": 1,
    "dateExpiration": "2026-01-15T10:00:00.000Z",
    "estActif": true
  }
}
```

### 5. Liste de toutes les licences (Admin uniquement)

**Endpoint:** `GET /api/licences`

**Headers:**
```
Authorization: Bearer <admin_token>
```

### 6. Désactiver une licence (Admin uniquement)

**Endpoint:** `PATCH /api/licences/:id/desactiver`

**Headers:**
```
Authorization: Bearer <admin_token>
```

### 7. Réactiver une licence (Admin uniquement)

**Endpoint:** `PATCH /api/licences/:id/reactiver`

**Headers:**
```
Authorization: Bearer <admin_token>
```

## Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 401 | Clé API manquante | Le header `X-API-Key` n'a pas été fourni |
| 403 | Clé API invalide | La clé API n'existe pas dans la base de données |
| 403 | Licence expirée | La licence a dépassé sa date d'expiration |
| 403 | Licence désactivée | La licence a été désactivée par un administrateur |

## Gestion Frontend

### Configuration dans le fichier .env du frontend

```env
VITE_API_KEY=lic_abc123def456...
```

### Configuration dans Axios/Fetch

```javascript
// axios
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY
  }
});

// fetch
const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': import.meta.env.VITE_API_KEY
};
```

## Statistiques et Monitoring

Chaque utilisation de la licence met à jour :
- `nombreAppels` : Incrémenté à chaque appel API
- `derniereUtilisation` : Mise à jour avec la date/heure actuelle

Ces informations permettent de :
- Suivre l'activité d'un établissement
- Identifier les licences inutilisées
- Détecter les utilisations anormales

## Base de données

### Modèle Prisma

```prisma
model Licence {
  id                  Int       @id @default(autoincrement())
  cleApi              String    @unique
  nomEcole            String
  emailContact        String
  telephoneContact    String?
  dateActivation      DateTime  @default(now())
  dateExpiration      DateTime
  estActif            Boolean   @default(true)
  nombreAppels        Int       @default(0)
  derniereUtilisation DateTime?
  hasAssociation      Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

## Bonnes pratiques

1. **Sécurité** :
   - Ne jamais partager la clé API publiquement
   - Stocker la clé dans des variables d'environnement
   - Ne pas la commit dans Git

2. **Renouvellement** :
   - Prévoir un système d'alerte 30 jours avant expiration
   - Informer l'établissement par email

3. **Support** :
   - Garder un contact email pour chaque licence
   - Documenter les raisons de désactivation

4. **Monitoring** :
   - Surveiller les licences expirées
   - Vérifier les licences non utilisées depuis longtemps

## Migration depuis un système existant

Si vous avez déjà des établissements utilisant l'API, créez des licences pour chacun :

```bash
# Se connecter en tant qu'admin
# Créer une licence pour chaque établissement
# Distribuer les clés API
# Demander aux établissements de mettre à jour leur configuration
```

## Support

Pour toute question concernant les licences, contactez l'administrateur système.
