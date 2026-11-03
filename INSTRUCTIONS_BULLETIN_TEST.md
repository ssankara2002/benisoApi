# 📝 Instructions pour tester le bulletin PDF

## ✅ Données créées

Les données suivantes ont été insérées dans la base de données :

### 📊 Informations de l'élève
- **Nom complet** : COMPAORE ABDOUL AZIZ
- **Date de naissance** : 22/08/2007
- **Matricule** : 2020/G20083
- **Classe** : 3èmeA Test
- **Année scolaire** : 2023/2024
- **Trimestre** : 3ème Trimestre

### 📚 Notes insérées (identiques au modèle)

#### MATIÈRES LITTÉRAIRES
| Matière | Coef | Interro | Devoir | Compo | Enseignant |
|---------|------|---------|--------|-------|------------|
| EXPRESSION | 2.0 | 7.38 | 8.00 | 7.69 | M. DIARRA |
| DICTEE-ORTHOGRAPHE | 1.0 | 4.00 | 0.00 | 2.00 | M. DIARRA |
| LANGUE | 2.0 | 8.13 | 3.75 | 5.94 | M. DIARRA |
| HISTOIRE GEOGRAPHIE-C.M.C | 3.0 | 7.00 | 10.50 | 8.75 | M. BAZONGO |
| ANGLAIS | 3.0 | 6.00 | 7.75 | 6.88 | M. PONTI |

**Moyenne littéraire** : ~06.92 (calculée par le système)

#### MATIÈRES SCIENTIFIQUES
| Matière | Coef | Interro | Devoir | Compo | Enseignant |
|---------|------|---------|--------|-------|------------|
| MATHEMATIQUES GENERALES | 5.0 | 9.25 | 8.50 | 8.88 | M. DADJA |
| SCIENCES DE LA VIE ET DE LA TERRE | 3.0 | 6.50 | 10.00 | 8.25 | M. TALI B |
| SCIENCES PHYSIQUES | 4.0 | 6.63 | 9.00 | 7.81 | M. DOGBO |

**Moyenne scientifique** : ~08.37 (calculée par le système)

#### AUTRES MATIÈRES
| Matière | Coef | Interro | Devoir | Compo | Enseignant |
|---------|------|---------|--------|-------|------------|
| EDUCATION PHYSIQUE ET SPORTIVE | 2.0 | 11.75 | 11.75 | 11.75 | M. CHECHE |
| EDUCATION CIVIQUE ET CULTURE RELIGI | 1.0 | 8.50 | 5.50 | 7.00 | M. JONAS |

---

## 🚀 Étapes pour générer le bulletin PDF

### 1. Démarrer le serveur API

```bash
cd /home/sankara-sarata/Documents/gesCo/apiEcole
npm run dev
# ou
npm start
```

Le serveur devrait démarrer sur `http://localhost:5000`

### 2. Télécharger le bulletin PDF

**Option A : Via le script bash**
```bash
cd /home/sankara-sarata/Documents/gesCo/apiEcole
./test-bulletin-download.sh
```

**Option B : Via curl directement**
```bash
curl -X GET "http://localhost:5000/api/bulletins/eleve/9/trimestre/993/pdf" \
  -o bulletin_test.pdf
```

**Option C : Via le navigateur**
Ouvrez cette URL dans votre navigateur :
```
http://localhost:5000/api/bulletins/eleve/9/trimestre/993/pdf
```

**Option D : Via Postman/Insomnia**
```
GET http://localhost:5000/api/bulletins/eleve/9/trimestre/993/pdf
```

### 3. Voir les données JSON brutes (optionnel)

Pour déboguer ou voir les données avant génération PDF :
```bash
curl http://localhost:5000/api/bulletins/eleve/9/trimestre/993
```

---

## 📁 IDs importants

Si vous devez refaire des tests ou des modifications :

- **Élève ID** : `9`
- **Trimestre ID** : `993` (3ème trimestre)
- **Année ID** : `999` (2023/2024)
- **Classe ID** : `91` (3èmeA Test)
- **Niveau ID** : `4` (3ème)

---

## 🔍 Ce qui devrait apparaître dans le bulletin

### ✅ Points à vérifier

1. **En-tête**
   - Logo de l'école (si configuré)
   - Informations de l'établissement
   - Année scolaire 2023/2024
   - 3ème Trimestre

2. **Informations élève**
   - Nom : COMPAORE ABDOUL AZIZ
   - Matricule : 2020/G20083
   - Classe : 3èmeA Test
   - Né(e) le : 22/08/2007

3. **Tableau des notes**
   - **Matières littéraires** (5 matières)
   - **Matières scientifiques** (3 matières)
   - **Autres** (2 matières)
   - **Total** : 10 matières

4. **Colonnes**
   - Matières
   - Coef
   - Interro (1)
   - Dev (2)
   - Compo
   - Moy
   - Notes pondérées
   - Appréciations et signatures

5. **Bilan trimestriel**
   - Total coefficient : 26.0
   - Total notes pondérées : ~207
   - Moyenne sur 20 : ~07.96
   - Rang du trimestre
   - Nombre d'heures d'absence (si applicable)

6. **Statistiques**
   - Meilleure moyenne
   - Moyenne la plus basse
   - Moyenne annuelle
   - Avertissement (si applicable)

7. **Signatures**
   - Directeur (Fr Jonas BARY)
   - Cachet de l'école
   - Date d'impression

---

## 🐛 En cas de problème

### Erreur "Cannot find module"
```bash
cd /home/sankara-sarata/Documents/gesCo/apiEcole
npm install
```

### Erreur de connexion à la base de données
Vérifiez le fichier `.env` :
```bash
cat /home/sankara-sarata/Documents/gesCo/apiEcole/.env | grep DATABASE_URL
```

### PDF vide ou données manquantes
Vérifiez que les données ont bien été insérées :
```bash
# Via psql
psql -d ecole -c "SELECT * FROM \"Eleve\" WHERE id = 9;"
psql -d ecole -c "SELECT COUNT(*) FROM \"Note\" WHERE \"eleveId\" = 9;"
psql -d ecole -c "SELECT COUNT(*) FROM \"EnseignementAnnee\" WHERE \"classeId\" = 91;"
```

### Le serveur ne démarre pas
```bash
# Vérifier les logs
cd /home/sankara-sarata/Documents/gesCo/apiEcole
npm run dev 2>&1 | head -50
```

---

## 📝 Modifications à apporter après test

Après avoir téléchargé et visualisé le bulletin, notez les différences avec le modèle :

1. **Mise en page**
   - [ ] Taille des polices
   - [ ] Espacement entre les lignes
   - [ ] Largeur des colonnes

2. **Contenu**
   - [ ] Format des noms des enseignants
   - [ ] Calcul des moyennes
   - [ ] Appréciations automatiques
   - [ ] Format des dates

3. **Graphismes**
   - [ ] Logo de l'école
   - [ ] Bordures des tableaux
   - [ ] En-tête et pied de page
   - [ ] Cachet et signature

4. **Données**
   - [ ] Noms des enseignants (doit afficher automatiquement via EnseignementAnnee)
   - [ ] Rang du trimestre
   - [ ] Statistiques de classe

---

## 🎯 Prochaines étapes

1. **Télécharger le bulletin** avec les instructions ci-dessus
2. **Comparer** avec le modèle (image fournie)
3. **Lister** les différences dans un document
4. **Ajuster** le service `bulletin.service.ts` en conséquence

---

## ℹ️ Informations additionnelles

- Le bulletin PDF est généré par `src/Services/bulletin.service.ts`
- La route est définie dans `src/Routes/bulletin.route.ts`
- Le contrôleur est dans `src/Controllers/bulletin.controller.ts`

**Bon test ! 🚀**
