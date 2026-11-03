# 📚 Gestion des Enseignements - Documentation complète

## ✅ Ce qui a été fait

### 🔧 Backend (API)

#### 1. **Table `EnseignementAnnee` créée**
- **Localisation** : `prisma/schema.prisma`
- **Champs** :
  - `staffId` : ID du professeur
  - `matiereId` : ID de la matière
  - `classeId` : ID de la classe
  - `anneeId` : ID de l'année scolaire
  - `volumeHoraire` : Volume horaire hebdomadaire (optionnel)
- **Contraintes** :
  - Clé unique sur `(staffId, matiereId, classeId, anneeId)` pour éviter les doublons
  - Index sur `(anneeId, classeId, matiereId)` pour optimiser les requêtes

#### 2. **Service complet** (`src/Services/enseignementAnnee.service.ts`)
Fonctions disponibles :
- `getAllEnseignements(anneeId?)` - Récupérer tous les enseignements
- `getEnseignementById(id)` - Récupérer un enseignement spécifique
- `getEnseignementsByStaff(staffId, anneeId?)` - Enseignements d'un prof
- `getEnseignantByMatiereClasse(matiereId, classeId, anneeId)` - Trouver le prof d'une matière
- `getEnseignementsByClasse(classeId, anneeId)` - Tous les enseignements d'une classe
- `createEnseignement(data)` - Créer une assignation
- `updateEnseignement(id, data)` - Modifier le volume horaire
- `deleteEnseignement(id)` - Supprimer une assignation
- `getVolumeHoraireTotal(staffId, anneeId)` - Calculer le total d'heures

#### 3. **Contrôleur** (`src/Controllers/enseignementAnnee.controller.ts`)
Tous les endpoints HTTP avec gestion d'erreurs

#### 4. **Routes** (`src/Routes/enseignementAnnee.route.ts`)
```
GET    /api/enseignements                              - Liste complète
GET    /api/enseignements/:id                          - Détail
GET    /api/enseignements/staff/:staffId               - Par professeur
GET    /api/enseignements/classe/:classeId             - Par classe
GET    /api/enseignements/enseignant/matiere           - Trouver l'enseignant
GET    /api/enseignements/staff/:staffId/volume-horaire - Volume horaire total
POST   /api/enseignements                              - Créer
PUT    /api/enseignements/:id                          - Modifier
DELETE /api/enseignements/:id                          - Supprimer
```

#### 5. **Intégration automatique dans les bulletins** ✨
- **Fichier modifié** : `src/Services/bulletin.service.ts`
- **Ligne 332-362** : Récupération automatique du prof via `EnseignementAnnee`
- **Ligne 462-492** : Même logique dans `getBulletinData()`
- **Fallback** : Si pas de données dans `EnseignementAnnee`, utilise l'ancien système

---

### 🎨 Frontend (React)

#### 1. **Hook React** (`src/hooks/private/enseignementAnneeHook.ts`)
Hooks disponibles :
- `useAddEnseignement()` - Créer
- `useGetEnseignements(anneeId?)` - Liste
- `useGetEnseignement(id)` - Détail
- `useGetEnseignementsByStaff(staffId, anneeId?)` - Par prof
- `useGetEnseignementsByClasse(classeId, anneeId)` - Par classe
- `useGetEnseignantByMatiereClasse(matiereId, classeId, anneeId)` - Recherche
- `useGetVolumeHoraireTotal(staffId, anneeId)` - Volume horaire
- `useUpdateEnseignement()` - Modifier
- `useDeleteEnseignement()` - Supprimer

#### 2. **Composants**
- **`AddEnseignement.tsx`** : Formulaire de création avec dropdowns
- **`EditEnseignement.tsx`** : Modification du volume horaire
- **`ListeEnseignement.tsx`** : Tableau avec filtres et actions

#### 3. **Route** (`src/routes/_authenticated/dashboard/enseignement/index.tsx`)
Accessible via : `/dashboard/enseignement`

#### 4. **Menu ajouté** dans `app-sidebar.tsx`
Section "Académique" > "Enseignements"

---

## 🚀 Comment utiliser

### 1. **Ajouter un enseignement**
1. Aller sur `/dashboard/enseignement`
2. Cliquer sur le bouton "+" (Plus)
3. Sélectionner :
   - Professeur
   - Matière
   - Classe
   - Année scolaire
   - Volume horaire (optionnel, ex: 4h/semaine)
4. Valider

### 2. **Les bulletins afficheront automatiquement le bon enseignant**
Lorsqu'un bulletin est généré :
1. Le système cherche dans `EnseignementAnnee` qui enseigne la matière dans cette classe pour cette année
2. Si trouvé → Affiche le nom du prof
3. Sinon → Fallback sur l'ancien système (evaluation.staff)

**Exemple** :
```
Matière          | Moyenne | Enseignant
Mathématiques    | 15.50   | M. Diallo
Français         | 12.75   | M. Traoré
```

### 3. **Consulter les enseignements d'un prof**
```javascript
const { data } = useGetEnseignementsByStaff(staffId, anneeId);
// Retourne toutes les matières/classes du prof
```

### 4. **Calculer le volume horaire total**
```javascript
const { data: volumeTotal } = useGetVolumeHoraireTotal(staffId, anneeId);
// Ex: 24h/semaine
```

---

## 📊 Exemple de données

### Création d'un enseignement
```json
POST /api/enseignements
{
  "staffId": 5,
  "matiereId": 12,
  "classeId": 8,
  "anneeId": 3,
  "volumeHoraire": 4
}
```

### Réponse
```json
{
  "success": true,
  "data": {
    "id": 42,
    "staffId": 5,
    "matiereId": 12,
    "classeId": 8,
    "anneeId": 3,
    "volumeHoraire": 4,
    "staff": {
      "user": {
        "nom": "Diallo",
        "prenom": "Mamadou"
      }
    },
    "matiere": {
      "libelle": "Mathématiques"
    },
    "classe": {
      "nom": "6èmeA",
      "niveau": {
        "nomNiveau": "6ème"
      }
    }
  }
}
```

---

## 🔐 Permissions nécessaires

Pour utiliser les enseignements, créer ces permissions :
- `enseignement.read` - Voir les enseignements
- `enseignement.create` - Créer un enseignement
- `enseignement.update` - Modifier
- `enseignement.delete` - Supprimer

---

## ⚠️ Important : Migration des données

Si vous avez des données existantes, vous devez :

1. **Créer les enseignements pour l'année en cours**
   Pour chaque (Professeur + Matière + Classe), créer une entrée `EnseignementAnnee`

2. **Script de seed suggéré** (à créer) :
```typescript
// prisma/seed-enseignements.ts
async function seedEnseignements() {
  // Récupérer toutes les évaluations
  const evaluations = await prisma.evaluation.findMany({
    where: { anneeId: CURRENT_YEAR_ID },
    distinct: ['staffId', 'matiereId', 'classeId'],
  });

  // Créer les enseignements
  for (const eval of evaluations) {
    await prisma.enseignementAnnee.create({
      data: {
        staffId: eval.staffId,
        matiereId: eval.matiereId,
        classeId: eval.classeId,
        anneeId: eval.anneeId,
      }
    });
  }
}
```

---

## 🎯 Avantages du système

1. **Historique complet** : Conservation de qui enseignait quoi, quand
2. **Bulletins précis** : Bon enseignant affiché automatiquement
3. **Cahier du prof** : Génération possible avec les bonnes classes
4. **Planning** : Vision globale de l'emploi du temps
5. **Statistiques** : Calcul du volume horaire par prof

---

## 🐛 Troubleshooting

### Le nom du prof n'apparaît pas dans le bulletin
1. Vérifier que `EnseignementAnnee` existe pour cette (matière + classe + année)
2. Vérifier que `anneeId` et `classeId` sont bien renseignés dans l'évaluation
3. Si manquant, le système utilise `evaluation.staff` en fallback

### Erreur "Enseignement déjà existant"
Un prof ne peut pas enseigner 2 fois la même matière dans la même classe la même année

### Le volume horaire ne s'affiche pas
C'est normal, c'est un champ optionnel

---

## 📝 Prochaines améliorations possibles

1. **Emploi du temps graphique** : Visualisation des horaires
2. **Gestion des remplacements** : Prof absent → remplaçant
3. **Export cahier du prof** : PDF avec toutes ses classes
4. **Statistiques avancées** : Heures par discipline, par niveau
5. **Notifications** : Alerter quand un prof a trop/pas assez d'heures

---

## ✨ Résumé

Le système `EnseignementAnnee` est maintenant **100% fonctionnel** :
- ✅ Backend API complet
- ✅ Frontend CRUD complet
- ✅ Intégration automatique dans les bulletins
- ✅ Menu de navigation
- ✅ Gestion des permissions

**Les noms des enseignants apparaîtront automatiquement dans les bulletins** dès que vous aurez créé les enseignements pour l'année en cours ! 🎉
