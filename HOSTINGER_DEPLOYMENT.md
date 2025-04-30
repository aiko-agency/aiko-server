# Guide de déploiement sur Hostinger

Ce guide vous explique comment déployer votre serveur Express et votre site Aiko sur Hostinger.

## Partie 1: Déploiement du site statique (React)

1. **Se connecter à votre compte Hostinger**
   - Accédez à votre panneau de contrôle Hostinger

2. **Créer un sous-domaine pour l'API (facultatif)**
   - Dans le panneau de contrôle, allez dans "Domaines" > "Sous-domaines"
   - Créez un sous-domaine comme `api.votredomaine.com` qui pointera vers votre API

3. **Uploader les fichiers du build React**
   - Utilisez le gestionnaire de fichiers de Hostinger ou FTP
   - Naviguez vers le dossier public de votre domaine principal (généralement `public_html`)
   - Uploadez tout le contenu du dossier `build` de votre projet React (`/Users/sofianemtimet/Desktop/aiko/windsurf-agency/build/`)

## Partie 2: Déploiement du serveur Node.js

Hostinger propose deux méthodes pour déployer des applications Node.js:

### Méthode 1: Via le panneau de contrôle Hostinger (recommandée)

1. **Accédez à la section Node.js**
   - Dans votre panneau de contrôle Hostinger, recherchez la section "Node.js"
   - Cliquez sur "Créer une nouvelle application Node.js"

2. **Configurez votre application**
   - Nom de l'application: `aiko-server`
   - Point d'entrée: `server.js`
   - Version de Node.js: Sélectionnez la version 14 ou supérieure
   - Domaine: Sélectionnez votre sous-domaine API si vous en avez créé un

3. **Uploader les fichiers du serveur**
   - Utilisez le gestionnaire de fichiers ou FTP pour accéder au dossier de votre application Node.js
   - Uploadez tous les fichiers du dossier `/Users/sofianemtimet/Desktop/aiko/server/`

4. **Configurer les variables d'environnement**
   - Dans les paramètres de l'application Node.js, recherchez la section "Variables d'environnement"
   - Ajoutez les variables suivantes:
     ```
     NODE_ENV=production
     EMAIL_SERVICE=gmail
     EMAIL_USER=votre-email@gmail.com
     EMAIL_PASS=votre-mot-de-passe-app
     RECIPIENT_EMAIL=contact@aiko.fr
     CLIENT_URL=https://votredomaine.com
     ```

5. **Démarrer l'application**
   - Cliquez sur le bouton "Démarrer" ou "Redémarrer" pour lancer votre application

### Méthode 2: Via SSH (pour utilisateurs avancés)

1. **Activer l'accès SSH** dans votre panneau de contrôle Hostinger

2. **Se connecter via SSH**
   ```bash
   ssh u123456789@votredomaine.com
   ```

3. **Naviguer vers le dossier de déploiement**
   ```bash
   cd ~/domains/votredomaine.com/public_html
   # ou pour un sous-domaine
   cd ~/domains/api.votredomaine.com/public_html
   ```

4. **Uploader les fichiers**
   - Utilisez SCP ou SFTP pour transférer les fichiers du serveur
   - Ou clonez directement depuis un dépôt Git si votre code est versionné

5. **Installer les dépendances**
   ```bash
   npm install --production
   ```

6. **Configurer PM2** (gestionnaire de processus pour Node.js)
   ```bash
   npm install -g pm2
   pm2 start server.js --name "aiko-server"
   pm2 save
   ```

## Partie 3: Mettre à jour le frontend pour pointer vers l'API déployée

Une fois votre API déployée, vous devrez mettre à jour les URL dans votre frontend:

1. **Modifiez les URL d'API** dans les fichiers suivants:
   - `/Users/sofianemtimet/Desktop/aiko/windsurf-agency/src/components/ContactSection.jsx`
   - `/Users/sofianemtimet/Desktop/aiko/windsurf-agency/src/components/HeroSection.jsx`

2. **Remplacez les URL locales** par l'URL de production:
   ```javascript
   // Remplacer
   const response = await fetch('http://localhost:5000/api/contact', {
   
   // Par
   const response = await fetch('https://api.votredomaine.com/api/contact', {
   // ou
   const response = await fetch('https://votredomaine.com/api/contact', {
   ```

3. **Reconstruisez votre application React**
   ```bash
   npm run build
   ```

4. **Uploadez à nouveau** les fichiers du build vers Hostinger

## Dépannage

- **Erreurs CORS**: Assurez-vous que la configuration CORS dans `server.js` autorise votre domaine
- **Problèmes d'email**: Vérifiez que les paramètres SMTP sont corrects et que le "mot de passe d'application" Gmail est valide
- **Erreurs 500**: Consultez les logs de l'application dans le panneau Hostinger pour identifier les problèmes

## Support

Si vous rencontrez des problèmes, le support Hostinger est généralement très réactif. Vous pouvez également consulter leur documentation spécifique sur le déploiement Node.js.
