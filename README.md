# Serveur Aiko

Ce serveur gère les formulaires de contact et d'inscription à la newsletter pour le site Aiko.

## Configuration

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Un compte SendGrid pour l'envoi d'emails

### Installation

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

### Configuration des variables d'environnement

1. Copiez le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

2. Modifiez le fichier `.env` avec vos propres informations :

```
PORT=5002
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=SG.votre-cle-api-sendgrid
RECIPIENT_EMAIL=contact@aiko-agency.fr
FROM_EMAIL=no-reply@aiko-agency.fr
CLIENT_URL=https://aiko-agency.fr
```

### Configuration de SendGrid

Pour que l'envoi d'emails fonctionne correctement, vous devez configurer SendGrid :

1. Créez un compte sur [SendGrid](https://sendgrid.com/) (ils offrent un plan gratuit)
2. Créez une clé API dans la section "API Keys" du dashboard SendGrid
3. Vérifiez votre domaine d'envoi dans la section "Sender Authentication"
   - Pour le domaine `aiko-agency.fr`, suivez les instructions pour vérifier ce domaine
   - Alternativement, vous pouvez vérifier une adresse email individuelle
4. Mettez à jour votre fichier `.env` avec votre clé API et votre adresse d'expédition vérifiée

## Démarrage du serveur

### En développement

```bash
npm run dev
```

### En production

```bash
npm start
```

## Déploiement sur Hostinger

### Préparation du serveur

1. Connectez-vous à votre compte Hostinger
2. Accédez à la section "Hébergement Web" et sélectionnez votre domaine `aiko-agency.fr`
3. Allez dans "Avancé" > "Node.js"
4. Activez Node.js pour votre domaine
5. Notez le point d'entrée (généralement `server.js`) et le port attribué

### Configuration DNS pour l'API

Pour que l'API soit accessible via `api.aiko-agency.fr`, vous devez configurer un sous-domaine :

1. Dans votre panneau Hostinger, allez dans "DNS / Nameservers"
2. Ajoutez un nouvel enregistrement A ou CNAME :
   - Type: A ou CNAME
   - Nom: api
   - Valeur: Pointez vers l'adresse IP de votre serveur ou utilisez un CNAME vers votre domaine principal
   - TTL: Automatique ou 14400

### Téléchargement des fichiers

1. Utilisez FTP ou le gestionnaire de fichiers de Hostinger pour télécharger les fichiers du serveur
2. Créez un dossier séparé pour l'API, par exemple `/api` à la racine de votre hébergement
3. Téléchargez tous les fichiers du serveur dans ce dossier, sauf `node_modules` et `.env`
4. Créez un fichier `.env` directement sur le serveur avec vos variables d'environnement de production

### Configuration de l'environnement de production

1. Mettez à jour le fichier `.env` sur le serveur avec les valeurs de production :
   ```
   PORT=5002 # ou le port attribué par Hostinger
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASS=SG.votre-cle-api-sendgrid-reelle
   RECIPIENT_EMAIL=contact@aiko-agency.fr
   FROM_EMAIL=no-reply@aiko-agency.fr
   CLIENT_URL=https://aiko-agency.fr
   NODE_ENV=production
   ```

2. Installez les dépendances sur le serveur :

```bash
npm install --production
```

3. Démarrez le serveur :

```bash
npm start
```

4. Configurez un processus de gestion comme PM2 pour maintenir le serveur en fonctionnement :

```bash
npm install -g pm2
pm2 start server.js --name "aiko-api"
pm2 save
pm2 startup
```

## Mise à jour du frontend

Assurez-vous que le frontend pointe vers la bonne URL d'API en production :

1. Dans le fichier `ContactForm.jsx`, l'URL de l'API est déjà configurée pour utiliser `https://api.aiko-agency.fr` en production
2. Vérifiez que cette URL correspond à votre configuration DNS

## Endpoints API

### Test du serveur
- `GET /` : Vérifie que le serveur fonctionne

### Test d'envoi d'email
- `GET /api/test-email` : Teste l'envoi d'email

### Formulaire de contact
- `POST /api/contact` : Traite les soumissions du formulaire de contact
  - Corps de la requête : `{ email, phone, service, message }`

### Inscription à la newsletter
- `POST /api/newsletter` : Traite les inscriptions à la newsletter
  - Corps de la requête : `{ email }`

## Sécurité

- Le fichier `.env` contient des informations sensibles et ne doit jamais être partagé ou commité dans Git
- Utilisez toujours HTTPS en production
- Les requêtes CORS sont configurées pour accepter uniquement les origines spécifiées (`aiko-agency.fr` et les domaines de développement)
