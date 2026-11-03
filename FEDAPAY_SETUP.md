# Configuration FedaPay pour Mobile Money Togo

Ce guide explique comment configurer le paiement Mobile Money (Flooz et TMoney) via FedaPay.

## 📋 Prérequis

- Un compte FedaPay : https://fedapay.com
- Une entreprise togolaise (RCCM requis pour le mode production)
- Un numéro de téléphone togolais

## 🔧 Configuration

### 1. Créer un compte FedaPay

1. Rendez-vous sur https://fedapay.com
2. Cliquez sur "S'inscrire" ou "Créer un compte"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email

### 2. Obtenir les clés API

#### Mode Sandbox (Test)

1. Connectez-vous à votre dashboard FedaPay
2. Allez dans **Paramètres** > **Clés API**
3. Vous verrez deux clés :
   - **Clé publique** : `pk_sandbox_...`
   - **Clé secrète** : `sk_sandbox_...`
4. Copiez la **clé secrète** (commençant par `sk_sandbox_`)

#### Mode Production (Réel)

⚠️ **IMPORTANT** : Le mode production nécessite :
- Un compte vérifié (pièce d'identité)
- Un RCCM (Registre de Commerce)
- Une validation manuelle par FedaPay

1. Soumettez vos documents KYC dans le dashboard
2. Attendez la validation (1-3 jours ouvrés)
3. Une fois validé, activez le mode production
4. Récupérez vos clés de production :
   - **Clé publique** : `pk_live_...`
   - **Clé secrète** : `sk_live_...`

### 3. Configurer le fichier .env

Créez ou modifiez votre fichier `.env` :

```bash
# Mode: "sandbox" pour test, "production" pour réel
FEDAPAY_MODE=sandbox

# Votre clé secrète FedaPay
FEDAPAY_SECRET_KEY="sk_sandbox_votre_cle_ici"

# URLs de votre application
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"
```

### 4. Configurer les Webhooks (Optionnel mais recommandé)

Les webhooks permettent à FedaPay de notifier votre serveur des changements de statut de paiement.

1. Dans le dashboard FedaPay, allez dans **Paramètres** > **Webhooks**
2. Ajoutez une nouvelle URL de webhook :
   ```
   https://votre-domaine.com/api/webhooks/fedapay
   ```
3. Sélectionnez les événements :
   - `transaction.approved` (paiement réussi)
   - `transaction.declined` (paiement échoué)
   - `transaction.canceled` (paiement annulé)

## 📱 Opérateurs Mobile Money supportés

### Flooz (Moov Togo)
- **Préfixes** : 90, 91, 96, 97
- **Format** : 228 9X XX XX XX

### TMoney (Togocom)
- **Préfixes** : 92, 93, 98, 99
- **Format** : 228 9X XX XX XX

## 🧪 Mode Test (Sandbox)

En mode sandbox :
- ✅ Aucun argent réel n'est débité
- ✅ Vous pouvez tester tous les scénarios
- ✅ Utilisez n'importe quel numéro de téléphone
- ✅ Pas besoin de vérification KYC

### Tester un paiement

```javascript
// Le paiement sera automatiquement approuvé en sandbox
{
  "amount": 5000,
  "phoneNumber": "22890123456",
  "description": "Test inscription"
}
```

### Statuts en mode test

FedaPay crée automatiquement des transactions avec différents statuts :
- `pending` : En attente
- `approved` : Approuvé (succès)
- `declined` : Refusé
- `canceled` : Annulé

## 🚀 Mode Production

En mode production :
- ⚠️ Les paiements sont **RÉELS**
- 💰 L'argent est **EFFECTIVEMENT** débité
- 📱 Les clients reçoivent des vraies notifications
- 🔐 KYC et RCCM requis

### Commissions FedaPay

- **Flooz (Moov)** : 2% + 100 FCFA par transaction
- **TMoney** : 2% + 100 FCFA par transaction
- **Minimum** : 100 FCFA
- **Pas de frais d'abonnement**

### Délai de règlement

- **J+2 ouvrés** : Les fonds sont disponibles 2 jours ouvrés après le paiement
- **Virement bancaire** : Gratuit vers votre compte bancaire togolais

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer votre clé secrète** :
   - ❌ Ne la commitez JAMAIS dans Git
   - ❌ Ne la partagez JAMAIS publiquement
   - ✅ Utilisez toujours des variables d'environnement

2. **Vérifier les webhooks** :
   ```javascript
   // FedaPay signe les webhooks avec votre clé secrète
   const signature = req.headers['x-fedapay-signature'];
   // Vérifiez la signature pour éviter les faux webhooks
   ```

3. **Utiliser HTTPS en production** :
   - Les webhooks nécessitent HTTPS
   - Utilisez un certificat SSL valide

## 📞 Support

- **Documentation** : https://docs.fedapay.com
- **Email** : support@fedapay.com
- **Téléphone** : +228 XX XX XX XX
- **Dashboard** : https://app.fedapay.com

## 🐛 Résolution des problèmes

### Erreur : "Invalid API key"
- Vérifiez que votre clé commence par `sk_sandbox_` ou `sk_live_`
- Assurez-vous d'utiliser la clé **secrète**, pas la clé publique

### Erreur : "Transaction declined"
En mode sandbox :
- C'est normal, testez avec différents montants
En mode production :
- Le client n'a peut-être pas assez de solde
- Le numéro est peut-être invalide
- Le client a annulé le paiement

### Webhook non reçu
- Vérifiez que votre URL est accessible publiquement
- Testez avec ngrok en développement : `ngrok http 3000`
- Vérifiez les logs FedaPay dans le dashboard

## 📊 Monitoring

Dans le dashboard FedaPay, vous pouvez :
- Voir toutes les transactions en temps réel
- Télécharger des rapports CSV
- Suivre vos revenus
- Gérer les remboursements
- Voir les statistiques de conversion

## ✅ Checklist de mise en production

- [ ] Compte FedaPay créé et vérifié
- [ ] Documents KYC soumis et approuvés
- [ ] RCCM fourni et validé
- [ ] Mode production activé
- [ ] Clés de production obtenues
- [ ] Variables d'environnement configurées
- [ ] Webhooks configurés avec HTTPS
- [ ] Tests de paiement réussis
- [ ] Compte bancaire lié pour les retraits
