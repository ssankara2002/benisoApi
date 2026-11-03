# 🚀 Mise à jour CORS sur le VPS

## Problème
L'erreur CORS apparaît uniquement en production (VPS) car le fichier `.env` sur le VPS n'inclut pas le domaine `sainte-anne.edutrackhub.cloud`.

## Solution

### 1️⃣ Se connecter au VPS

```bash
ssh utilisateur@votre-vps-ip
# ou si vous avez un nom de domaine
ssh utilisateur@admin.edutrackhub.cloud
```

### 2️⃣ Aller dans le dossier du projet backend

```bash
cd /chemin/vers/apiEcole
# Exemple possible :
# cd /var/www/apiEcole
# cd /home/utilisateur/apiEcole
# cd ~/apiEcole
```

### 3️⃣ Modifier le fichier .env

```bash
nano .env
# ou
vim .env
```

### 4️⃣ Modifier la ligne CORS_ORIGIN

**Cherchez la ligne :**
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5000,https://admin.edutrackhub.cloud
```

**Remplacez par :**
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5000,https://admin.edutrackhub.cloud,https://sainte-anne.edutrackhub.cloud
```

**Avec nano :**
- Ctrl+X pour quitter
- Y pour confirmer
- Entrée pour sauvegarder

**Avec vim :**
- Appuyez sur `i` pour éditer
- Modifiez la ligne
- Appuyez sur `Esc`
- Tapez `:wq` puis Entrée

### 5️⃣ Redémarrer le serveur backend

#### Si vous utilisez PM2 (recommandé) :
```bash
pm2 restart apiEcole
# Vérifier le statut
pm2 list
pm2 logs apiEcole --lines 20
```

#### Si vous utilisez systemd :
```bash
sudo systemctl restart apiEcole
# ou
sudo systemctl restart backend
```

#### Si vous utilisez Docker :
```bash
docker-compose restart
# ou
docker restart nom-du-container-backend
```

#### Si vous lancez avec npm/node directement :
```bash
# Trouver le processus
ps aux | grep node
# Tuer le processus
kill -9 PID_DU_PROCESSUS
# Relancer
npm start
# ou en mode production
NODE_ENV=production npm start
```

### 6️⃣ Vérifier que ça fonctionne

**Dans les logs du serveur, vous devriez voir :**
```
🚀 Server running on http://0.0.0.0:5000
📘 Swagger Docs: http://0.0.0.0:5000/api-docs
🌍 Environment: production
```

**Testez dans le navigateur :**
1. Ouvrez https://sainte-anne.edutrackhub.cloud
2. Ouvrez la console (F12)
3. Les erreurs CORS devraient avoir disparu ! ✅

### 7️⃣ Si ça ne fonctionne toujours pas

**Vérifiez que le serveur backend écoute bien :**
```bash
# Vérifier les ports ouverts
sudo netstat -tulpn | grep :5000
# ou
sudo lsof -i :5000
```

**Vérifiez les logs :**
```bash
# Avec PM2
pm2 logs apiEcole --lines 50

# Avec systemd
sudo journalctl -u apiEcole -n 50 -f

# Avec Docker
docker logs nom-du-container
```

**Tester directement l'API :**
```bash
curl -I https://admin.edutrackhub.cloud/api/accueils
# Vous devriez voir :
# Access-Control-Allow-Origin: https://sainte-anne.edutrackhub.cloud
```

## 🔒 Configuration Nginx (si vous utilisez un reverse proxy)

Si vous utilisez Nginx comme reverse proxy, vérifiez aussi la config :

```bash
sudo nano /etc/nginx/sites-available/admin.edutrackhub.cloud
```

Assurez-vous que Nginx ne bloque pas les headers CORS :

```nginx
server {
    listen 443 ssl;
    server_name admin.edutrackhub.cloud;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Important : ne pas écraser les headers CORS
        proxy_pass_header Access-Control-Allow-Origin;
        proxy_pass_header Access-Control-Allow-Methods;
        proxy_pass_header Access-Control-Allow-Headers;
    }
}
```

Puis redémarrer Nginx :
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 📝 Mémo rapide

```bash
# Connexion VPS
ssh user@vps

# Éditer .env
cd /chemin/vers/apiEcole
nano .env
# Ajouter: ,https://sainte-anne.edutrackhub.cloud

# Redémarrer
pm2 restart apiEcole

# Vérifier
pm2 logs apiEcole
```

## ✅ Checklist

- [ ] Connexion SSH au VPS réussie
- [ ] Fichier .env modifié avec le bon domaine
- [ ] Serveur backend redémarré
- [ ] Logs vérifiés (pas d'erreur)
- [ ] Test dans le navigateur
- [ ] Erreurs CORS disparues

## 🆘 Besoin d'aide ?

Si vous avez toujours des problèmes :
1. Vérifiez que le backend est bien accessible : `curl https://admin.edutrackhub.cloud/health`
2. Vérifiez les certificats SSL : `curl -I https://admin.edutrackhub.cloud`
3. Vérifiez les logs en temps réel : `pm2 logs apiEcole --lines 100`
