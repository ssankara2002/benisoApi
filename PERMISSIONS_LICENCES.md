# Permissions pour la Gestion des Licences

## 📋 Liste des permissions créées

Le système de licences utilise les permissions suivantes, ajoutées dans le seed :

### **Permission principale** (recommandée)

```typescript
{
  key: 'licence.manage',
  description: 'Gestion complète des licences API (toutes actions)'
}
```

**Donne accès à** :
- ✅ Voir toutes les licences
- ✅ Créer des licences
- ✅ Modifier des licences
- ✅ Supprimer des licences
- ✅ Renouveler des licences
- ✅ Activer/Désactiver des licences

---

### **Permissions granulaires** (optionnelles)

Si vous voulez un contrôle plus fin :

```typescript
{ key: 'licence.read', description: 'Consulter les licences API' }
{ key: 'licence.create', description: 'Créer des licences API' }
{ key: 'licence.update', description: 'Modifier les licences API' }
{ key: 'licence.delete', description: 'Supprimer des licences API' }
{ key: 'licence.renew', description: 'Renouveler des licences API' }
{ key: 'licence.activate', description: 'Activer/Désactiver des licences API' }
```

---

## 🔐 Attribution des permissions

### **Rôle ADMIN**

Par défaut, le rôle **ADMIN** reçoit **TOUTES les permissions**, donc automatiquement `licence.manage`.

Aucune action supplémentaire nécessaire pour les admins.

---

### **Autres rôles** (si nécessaire)

Si vous voulez donner l'accès aux licences à d'autres rôles :

#### Option 1 : Via l'interface (recommandé)

1. Se connecter en tant qu'admin
2. Aller dans **Rôles et Permissions**
3. Sélectionner le rôle (ex: PROVISEUR)
4. Cocher la permission `licence.manage`
5. Enregistrer

#### Option 2 : Via SQL

```sql
-- Donner la permission licence.manage au rôle PROVISEUR
INSERT INTO "_RolesOnPermissions" ("A", "B")
SELECT
  (SELECT id FROM "Permission" WHERE key = 'licence.manage'),
  (SELECT id FROM "Role" WHERE name = 'PROVISEUR')
WHERE NOT EXISTS (
  SELECT 1 FROM "_RolesOnPermissions"
  WHERE "A" = (SELECT id FROM "Permission" WHERE key = 'licence.manage')
  AND "B" = (SELECT id FROM "Role" WHERE name = 'PROVISEUR')
);
```

---

## 🚀 Exécution du seed

### **Première fois** (créer les permissions)

```bash
cd /home/sankara-sarata/Documents/gesCo/apiEcole

# Exécuter le seed
npm run seed
```

**Résultat attendu** :
```
🌱 Démarrage du seed complet...
🗑️ Nettoyage des données existantes...
✅ Données nettoyées

📝 Création des rôles...
✅ Rôles créés

🔐 Création des permissions...
✅ [NOMBRE] permissions créées

✅ ADMIN: [NOMBRE] permissions assignées
...
```

---

### **Mise à jour** (ajouter les nouvelles permissions)

Si vous avez déjà des données et voulez juste ajouter les permissions de licence :

#### Option A : Seed complet (réinitialise tout)

```bash
npm run seed
```

⚠️ **Attention** : Cela supprime toutes les données existantes !

#### Option B : Script SQL uniquement pour les permissions

```sql
-- Ajouter les permissions de licence
INSERT INTO "Permission" (key, description, "hasAssociation", "createdAt", "updatedAt")
VALUES
  ('licence.read', 'Consulter les licences API', false, NOW(), NOW()),
  ('licence.create', 'Créer des licences API', false, NOW(), NOW()),
  ('licence.update', 'Modifier les licences API', false, NOW(), NOW()),
  ('licence.delete', 'Supprimer des licences API', false, NOW(), NOW()),
  ('licence.renew', 'Renouveler des licences API', false, NOW(), NOW()),
  ('licence.activate', 'Activer/Désactiver des licences API', false, NOW(), NOW()),
  ('licence.manage', 'Gestion complète des licences API (toutes actions)', false, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Assigner toutes les permissions de licence au rôle ADMIN
INSERT INTO "_RolesOnPermissions" ("A", "B")
SELECT
  p.id,
  (SELECT id FROM "Role" WHERE name = 'ADMIN')
FROM "Permission" p
WHERE p.key LIKE 'licence.%'
ON CONFLICT DO NOTHING;
```

Exécuter avec :
```bash
psql -h localhost -U bcef -d ecole -f add_licence_permissions.sql
```

---

## ✅ Vérification

### Vérifier que les permissions existent

```sql
SELECT * FROM "Permission" WHERE key LIKE 'licence.%';
```

**Résultat attendu** : 7 permissions

---

### Vérifier que l'ADMIN a les permissions

```sql
SELECT
  r.name AS role_name,
  p.key AS permission_key,
  p.description
FROM "Role" r
JOIN "_RolesOnPermissions" rp ON r.id = rp."B"
JOIN "Permission" p ON rp."A" = p.id
WHERE r.name = 'ADMIN' AND p.key LIKE 'licence.%'
ORDER BY p.key;
```

**Résultat attendu** : 7 lignes (toutes les permissions de licence)

---

### Vérifier qu'un utilisateur admin a accès

```sql
SELECT
  u.email,
  r.name AS role_name,
  p.key AS permission_key
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
JOIN "_RolesOnPermissions" rp ON r.id = rp."B"
JOIN "Permission" p ON rp."A" = p.id
WHERE u.email = 'votre@email.com' AND p.key LIKE 'licence.%';
```

---

## 🎯 Cas d'usage

### Scénario 1 : Admin complet

```
Utilisateur : admin@example.com
Rôle : ADMIN
Permissions : Toutes (dont licence.manage)
Accès : ✅ Bouton flottant visible + Page accessible
```

### Scénario 2 : Proviseur avec gestion des licences

```
Utilisateur : proviseur@example.com
Rôle : PROVISEUR
Permissions : + licence.manage (ajoutée manuellement)
Accès : ✅ Bouton flottant visible + Page accessible
```

### Scénario 3 : Professeur sans accès

```
Utilisateur : prof@example.com
Rôle : PROFESSEUR
Permissions : Aucune permission de licence
Accès : ❌ Bouton flottant invisible + Page bloquée
```

---

## 🔧 Dépannage

### Le bouton flottant ne s'affiche pas pour l'admin

**Vérifier** :

1. **Que l'utilisateur est bien admin** :
```sql
SELECT u.email, r.name
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email = 'votre@email.com';
```

2. **Que les permissions existent** :
```sql
SELECT COUNT(*) FROM "Permission" WHERE key LIKE 'licence.%';
-- Doit retourner : 7
```

3. **Que l'admin a les permissions** :
```sql
SELECT COUNT(*)
FROM "_RolesOnPermissions" rp
JOIN "Permission" p ON rp."A" = p.id
WHERE rp."B" = (SELECT id FROM "Role" WHERE name = 'ADMIN')
AND p.key LIKE 'licence.%';
-- Doit retourner : 7
```

---

### Erreur "Accès refusé" sur la page

**Frontend vérifie** :
```javascript
// Console du navigateur
console.log(useAuthStore.getState().user?.role?.permissions);
// Doit contenir licence.manage ou licence.create
```

**Si la permission n'apparaît pas** :
1. Se déconnecter
2. Se reconnecter
3. Le token JWT est régénéré avec les nouvelles permissions

---

## 📝 Recommandations

### ✅ À FAIRE

- **Utiliser `licence.manage`** pour simplifier
- **Assigner uniquement aux admins système** par défaut
- **Documenter** qui a accès aux licences
- **Tester** après chaque modification de permission

### ❌ À ÉVITER

- Donner `licence.manage` à des rôles non-administratifs
- Créer trop de permissions granulaires (complexité)
- Oublier de réassigner après un seed complet

---

## 📚 Résumé

**Nom de la permission** : `licence.manage`
**Description** : Gestion complète des licences API (toutes actions)
**Par défaut assignée à** : ADMIN
**Utilisée par** :
- `/admin-licences` (page)
- `AdminLicenceButton` (bouton flottant)
- Routes backend `/api/licences` (avec middleware ensureAdmin)

**Pour l'activer** :
```bash
npm run seed
```

Ou exécuter le script SQL fourni ci-dessus.
