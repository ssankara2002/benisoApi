# 🛠️ Guide de maintenance

Ce guide couvre toutes les opérations de maintenance courantes pour l'API Gestion École en production.

---

## 📋 Table des matières

- [Opérations quotidiennes](#opérations-quotidiennes)
- [Gestion des containers](#gestion-des-containers)
- [Gestion de la base de données](#gestion-de-la-base-de-données)
- [Gestion des logs](#gestion-des-logs)
- [Certificats SSL](#certificats-ssl)
- [Monitoring et surveillance](#monitoring-et-surveillance)
- [Sauvegardes](#sauvegardes)
- [Mises à jour](#mises-à-jour)
- [Problèmes courants](#problèmes-courants)
- [Procédures d'urgence](#procédures-durgence)

---

## 📅 Opérations quotidiennes

### Vérifier l'état des services

```bash
# Connexion au VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api

# Vérifier l'état de tous les containers
docker compose ps

# Vérifier l'uptime
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.State}}"
```

### Vérifier les logs récents

```bash
# Logs de l'API (20 dernières lignes)
docker compose logs --tail=20 api

# Logs de toutes les erreurs des dernières 24h
docker compose logs --since 24h | grep -i error

# Suivre les logs en temps réel
docker compose logs -f
```

### Tester les endpoints critiques

```bash
# Health check
curl https://admin.edutrackhub.cloud/health

# Vérifier Swagger
curl -I https://admin.edutrackhub.cloud/api-docs

# Tester l'authentification
curl -X POST https://admin.edutrackhub.cloud/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecole.com","password":"admin123"}'
```

---

## 🐳 Gestion des containers

### Démarrer/Arrêter les services

```bash
# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Arrêter sans supprimer les containers
docker compose stop

# Redémarrer tous les services
docker compose restart

# Redémarrer un service spécifique
docker compose restart api
docker compose restart nginx
docker compose restart postgres
```

### Mettre à jour un container

```bash
# Arrêter le container
docker compose stop api

# Supprimer le container
docker compose rm -f api

# Supprimer l'ancienne image
docker rmi ssarata/gestion-ecole-api:latest

# Télécharger la nouvelle image
docker pull ssarata/gestion-ecole-api:latest

# Recréer et démarrer le container
docker compose up -d api

# Vérifier les logs
docker compose logs -f api
```

### Inspecter un container

```bash
# Voir les processus dans le container
docker compose top api

# Voir l'utilisation des ressources
docker stats --no-stream

# Entrer dans le container
docker compose exec api sh

# Exécuter une commande dans le container
docker compose exec api env
docker compose exec api ps aux
```

### Nettoyer Docker

```bash
# Nettoyer les images non utilisées
docker image prune -a

# Nettoyer les volumes non utilisés
docker volume prune

# Nettoyer tout (ATTENTION : supprime tout ce qui n'est pas utilisé)
docker system prune -a --volumes

# Voir l'espace disque utilisé
docker system df
```

---

## 💾 Gestion de la base de données

### Connexion à PostgreSQL

```bash
# Se connecter à la base de données
docker compose exec postgres psql -U gestion_user -d gestion_ecole

# Exécuter une requête SQL
docker compose exec postgres psql -U gestion_user -d gestion_ecole -c "SELECT COUNT(*) FROM users;"

# Lister toutes les tables
docker compose exec postgres psql -U gestion_user -d gestion_ecole -c "\dt"
```

### Sauvegardes manuelles

```bash
# Créer un répertoire pour les backups
mkdir -p ~/backups

# Backup complet de la base de données
docker compose exec postgres pg_dump -U gestion_user gestion_ecole > ~/backups/backup-$(date +%Y%m%d-%H%M%S).sql

# Backup compressé (recommandé)
docker compose exec postgres pg_dump -U gestion_user gestion_ecole | gzip > ~/backups/backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Vérifier la taille du backup
ls -lh ~/backups/
```

### Restauration depuis une sauvegarde

```bash
# Arrêter l'API pour éviter les connexions actives
docker compose stop api

# Restaurer depuis un backup non compressé
cat ~/backups/backup-20250215-120000.sql | docker compose exec -T postgres psql -U gestion_user -d gestion_ecole

# Restaurer depuis un backup compressé
gunzip -c ~/backups/backup-20250215-120000.sql.gz | docker compose exec -T postgres psql -U gestion_user -d gestion_ecole

# Redémarrer l'API
docker compose start api
```

### Réinitialiser la base de données

```bash
# ⚠️ ATTENTION : Cette opération supprime TOUTES les données !

# Arrêter tous les services
docker compose down

# Supprimer le volume de la base de données
docker volume rm gestion-ecole-api_postgres_data

# Redémarrer les services (créera une nouvelle base vide)
docker compose up -d

# Le seeder s'exécute automatiquement au démarrage de l'API
docker compose logs -f api
```

### Exécuter les migrations Prisma

```bash
# Synchroniser le schéma avec la base
docker compose exec api npx prisma db push

# Générer le client Prisma
docker compose exec api npx prisma generate

# Réinitialiser complètement (⚠️ perte de données)
docker compose exec api npx prisma db push --force-reset
```

### Exécuter le seeder manuellement

```bash
# Exécuter le seeder
docker compose exec api npx tsx prisma/seed.ts

# Voir les logs
docker compose logs api | grep -i seed
```

---

## 📋 Gestion des logs

### Consulter les logs

```bash
# Logs de tous les services
docker compose logs

# Logs d'un service spécifique
docker compose logs api
docker compose logs nginx
docker compose logs postgres

# Dernières 50 lignes
docker compose logs --tail=50 api

# Logs depuis une durée
docker compose logs --since 1h api
docker compose logs --since 24h

# Suivre en temps réel
docker compose logs -f api

# Rechercher dans les logs
docker compose logs api | grep -i error
docker compose logs api | grep -i "prisma"
docker compose logs api | grep "POST /auth/login"
```

### Rotation des logs Docker

Par défaut, Docker peut accumuler beaucoup de logs. Configurez la rotation :

```bash
# Créer/modifier le fichier de config Docker
sudo nano /etc/docker/daemon.json
```

Ajouter :

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Redémarrer Docker
sudo systemctl restart docker

# Redémarrer les containers
cd ~/gestion-ecole-api
docker compose down
docker compose up -d
```

### Exporter les logs

```bash
# Exporter les logs d'aujourd'hui
docker compose logs --since $(date +%Y-%m-%d) > ~/logs-$(date +%Y%m%d).txt

# Exporter et compresser
docker compose logs > logs.txt && gzip logs.txt
```

---

## 🔐 Certificats SSL

### Vérifier l'expiration

```bash
# Voir les détails du certificat
sudo certbot certificates

# Tester le certificat en ligne
curl -vI https://admin.edutrackhub.cloud 2>&1 | grep -i "expire"

# Vérifier avec openssl
echo | openssl s_client -servername admin.edutrackhub.cloud -connect admin.edutrackhub.cloud:443 2>/dev/null | openssl x509 -noout -dates
```

### Renouveler manuellement

```bash
# Tester le renouvellement (dry-run)
sudo certbot renew --dry-run

# Renouveler le certificat
sudo certbot renew

# Copier les nouveaux certificats dans le projet
sudo cp -r /etc/letsencrypt/* ~/gestion-ecole-api/certbot/conf/
sudo chown -R edutrack:edutrack ~/gestion-ecole-api/certbot/

# Redémarrer nginx
cd ~/gestion-ecole-api
docker compose restart nginx
```

### Renouvellement automatique

Certbot installe automatiquement un cron job. Vérifiez :

```bash
# Voir les tâches cron de Certbot
sudo systemctl status certbot.timer

# Voir les logs de renouvellement
sudo journalctl -u certbot.timer
```

### Créer un script de renouvellement

```bash
# Créer le script
nano ~/gestion-ecole-api/renew-ssl.sh
```

Contenu :

```bash
#!/bin/bash
set -e

echo "🔄 Renouvellement du certificat SSL"
sudo certbot renew --quiet

echo "📋 Copie des certificats"
sudo cp -r /etc/letsencrypt/* ~/gestion-ecole-api/certbot/conf/
sudo chown -R edutrack:edutrack ~/gestion-ecole-api/certbot/

echo "🔄 Redémarrage de Nginx"
cd ~/gestion-ecole-api
docker compose restart nginx

echo "✅ Renouvellement terminé"
```

```bash
# Rendre exécutable
chmod +x ~/gestion-ecole-api/renew-ssl.sh

# Tester
./renew-ssl.sh
```

---

## 📊 Monitoring et surveillance

### Vérifier l'utilisation des ressources

```bash
# CPU et RAM en temps réel
docker stats

# Espace disque
df -h

# Espace utilisé par Docker
docker system df

# Espace des volumes
docker volume ls -q | xargs docker volume inspect | grep Mountpoint
du -sh /var/lib/docker/volumes/*
```

### Monitoring avec Netdata (optionnel)

```bash
# Installer Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Accéder à Netdata
# http://195.35.24.88:19999
```

### Monitoring avec UptimeRobot (recommandé)

1. Créer un compte sur https://uptimerobot.com
2. Ajouter un moniteur HTTP(s) :
   - URL : https://admin.edutrackhub.cloud/health
   - Intervalle : 5 minutes
   - Alerte : email

### Vérifier les connexions actives

```bash
# Connexions actives sur le port 443
sudo netstat -an | grep :443 | grep ESTABLISHED | wc -l

# Voir toutes les connexions
sudo netstat -tulpn | grep -E ':(80|443|5432)'
```

---

## 💾 Sauvegardes

### Stratégie de sauvegarde recommandée

1. **Quotidienne** : Base de données (30 jours)
2. **Hebdomadaire** : Fichiers uploadés (12 semaines)
3. **Mensuelle** : Backup complet (12 mois)

### Automatiser les sauvegardes avec Cron

```bash
# Créer le script de backup
nano ~/backup-db.sh
```

Contenu :

```bash
#!/bin/bash
BACKUP_DIR=~/backups
DB_NAME=gestion_ecole
DB_USER=gestion_user
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

# Créer le répertoire
mkdir -p $BACKUP_DIR

# Backup de la base de données
cd ~/gestion-ecole-api
docker compose exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Supprimer les backups de plus de 30 jours
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Afficher l'espace utilisé
du -sh $BACKUP_DIR
```

```bash
# Rendre exécutable
chmod +x ~/backup-db.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e

# Ajouter cette ligne :
0 2 * * * /home/edutrack/backup-db.sh >> /home/edutrack/backup.log 2>&1
```

### Sauvegarder les uploads

```bash
# Backup des fichiers uploadés
tar -czf ~/backups/uploads-$(date +%Y%m%d).tar.gz ~/gestion-ecole-api/uploads/

# Liste des backups
ls -lh ~/backups/
```

### Restaurer les uploads

```bash
# Extraire le backup
tar -xzf ~/backups/uploads-20250215.tar.gz -C ~/gestion-ecole-api/

# Vérifier les permissions
sudo chown -R edutrack:edutrack ~/gestion-ecole-api/uploads/
```

---

## 🔄 Mises à jour

### Mettre à jour l'API

```bash
# Option 1 : Depuis votre machine locale
cd /path/to/local/api
./full-deploy.sh

# Option 2 : Manuellement sur le VPS
ssh edutrack@195.35.24.88
cd ~/gestion-ecole-api
docker compose pull api
docker compose up -d api
```

### Mettre à jour PostgreSQL

```bash
# ⚠️ Faire un backup avant !
~/backup-db.sh

# Modifier docker-compose.yml pour changer la version
nano docker-compose.yml
# Changer postgres:16-alpine en postgres:17-alpine

# Arrêter tous les services
docker compose down

# Redémarrer avec la nouvelle version
docker compose up -d

# Vérifier
docker compose exec postgres psql -U gestion_user -d gestion_ecole -c "SELECT version();"
```

### Mettre à jour le système

```bash
# Mettre à jour les paquets
sudo apt update
sudo apt upgrade -y

# Mettre à jour Docker
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Redémarrer si nécessaire
sudo reboot
```

---

## 🔧 Problèmes courants

### "Cannot connect to database"

**Symptômes** : L'API ne démarre pas, logs montrent des erreurs de connexion Prisma.

**Solutions** :

```bash
# 1. Vérifier que PostgreSQL tourne
docker compose ps postgres

# 2. Vérifier la connexion
docker compose exec postgres psql -U gestion_user -d gestion_ecole -c "SELECT 1;"

# 3. Vérifier DATABASE_URL
docker compose exec api env | grep DATABASE_URL

# 4. Redémarrer PostgreSQL
docker compose restart postgres

# 5. Attendre 15 secondes puis redémarrer l'API
sleep 15
docker compose restart api
```

### "502 Bad Gateway"

**Symptômes** : Nginx renvoie une erreur 502.

**Solutions** :

```bash
# 1. Vérifier que l'API répond
docker compose exec nginx nc -z api 5000

# 2. Vérifier les logs de l'API
docker compose logs --tail=50 api

# 3. Vérifier la config nginx
docker compose exec nginx nginx -t

# 4. Redémarrer nginx
docker compose restart nginx

# 5. Si ça ne marche pas, redémarrer l'API
docker compose restart api
```

### "Container keeps restarting"

**Symptômes** : Un container redémarre en boucle.

**Solutions** :

```bash
# 1. Voir les logs détaillés
docker compose logs --tail=100 api

# 2. Vérifier l'erreur de démarrage
docker compose ps

# 3. Essayer de démarrer manuellement
docker compose up api

# 4. Vérifier les variables d'environnement
cat .env

# 5. Vérifier l'image
docker images | grep gestion-ecole-api
```

### "Out of disk space"

**Symptômes** : Erreurs d'écriture, services qui plantent.

**Solutions** :

```bash
# 1. Vérifier l'espace disque
df -h

# 2. Nettoyer Docker
docker system prune -a --volumes

# 3. Supprimer les vieux backups
find ~/backups -mtime +90 -delete

# 4. Nettoyer les logs Docker (voir section Gestion des logs)

# 5. Nettoyer les logs système
sudo journalctl --vacuum-time=7d
```

### "SSL certificate expired"

**Symptômes** : Erreur SSL dans le navigateur.

**Solutions** :

```bash
# 1. Vérifier l'expiration
sudo certbot certificates

# 2. Renouveler
sudo certbot renew

# 3. Copier les certificats
sudo cp -r /etc/letsencrypt/* ~/gestion-ecole-api/certbot/conf/
sudo chown -R edutrack:edutrack ~/gestion-ecole-api/certbot/

# 4. Redémarrer nginx
docker compose restart nginx
```

### "API is slow"

**Symptômes** : Temps de réponse élevés.

**Solutions** :

```bash
# 1. Vérifier l'utilisation CPU/RAM
docker stats

# 2. Vérifier les logs pour des erreurs
docker compose logs api | grep -i error

# 3. Vérifier les connexions PostgreSQL
docker compose exec postgres psql -U gestion_user -d gestion_ecole -c "SELECT count(*) FROM pg_stat_activity;"

# 4. Redémarrer l'API
docker compose restart api

# 5. Vérifier l'espace disque
df -h
```

---

## 🚨 Procédures d'urgence

### L'application est complètement down

```bash
# 1. Se connecter au VPS
ssh edutrack@195.35.24.88

# 2. Vérifier l'état
cd ~/gestion-ecole-api
docker compose ps

# 3. Voir les logs
docker compose logs --tail=100

# 4. Redémarrer tous les services
docker compose down
docker compose up -d

# 5. Vérifier
curl https://admin.edutrackhub.cloud/health
```

### Restauration d'urgence depuis un backup

```bash
# 1. Arrêter les services
docker compose down

# 2. Supprimer le volume corrompu
docker volume rm gestion-ecole-api_postgres_data

# 3. Recréer les services
docker compose up -d postgres

# 4. Attendre que PostgreSQL démarre
sleep 15

# 5. Restaurer le backup le plus récent
gunzip -c ~/backups/backup-$(ls -t ~/backups/*.sql.gz | head -1) | docker compose exec -T postgres psql -U gestion_user -d gestion_ecole

# 6. Démarrer l'API
docker compose up -d api

# 7. Vérifier
docker compose logs -f api
```

### Rollback vers une version précédente

```bash
# 1. Arrêter l'API
docker compose stop api

# 2. Supprimer le container
docker compose rm -f api

# 3. Pull une version spécifique (si taggée)
docker pull ssarata/gestion-ecole-api:v1.2.0

# 4. Modifier docker-compose.yml temporairement
# image: ssarata/gestion-ecole-api:v1.2.0

# 5. Redémarrer
docker compose up -d api
```

### Contact en cas de problème critique

**Email** : saratasankara598@gmail.com

**Informations à fournir** :
1. Logs récents : `docker compose logs --tail=100 > logs.txt`
2. État des containers : `docker compose ps`
3. Espace disque : `df -h`
4. Description du problème et étapes pour le reproduire

---

## 📋 Checklist de maintenance hebdomadaire

- [ ] Vérifier l'état de tous les containers
- [ ] Consulter les logs pour des erreurs
- [ ] Tester les endpoints principaux
- [ ] Vérifier l'espace disque
- [ ] Vérifier l'expiration SSL (< 30 jours)
- [ ] Vérifier que les backups fonctionnent
- [ ] Nettoyer les images Docker non utilisées
- [ ] Mettre à jour le système (`apt update && apt upgrade`)

## 📋 Checklist de maintenance mensuelle

- [ ] Tester la restauration d'un backup
- [ ] Vérifier les performances (temps de réponse)
- [ ] Analyser les logs pour des patterns suspects
- [ ] Revoir les métriques d'utilisation
- [ ] Vérifier les certificats SSL
- [ ] Nettoyer les vieux backups
- [ ] Mettre à jour Docker et Docker Compose
- [ ] Documenter les incidents du mois

---

**📚 Autres guides** :
- [Guide de déploiement](./DEPLOYMENT.md)
- [README principal](../README.md)

**📧 Support** : saratasankara598@gmail.com
