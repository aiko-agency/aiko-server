require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === 'production';

// Configuration CORS plus permissive en production pour résoudre les problèmes d'accès
if (isProduction) {
  // En production, accepter toutes les origines
  app.use(cors());
  console.log('Modes production: CORS configuré pour accepter toutes les origines');
} else {
  // En développement, limiter aux origines spécifiques
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5002',
      'https://aiko-agency.fr',
      'https://www.aiko-agency.fr'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  console.log('Mode développement: CORS limité aux origines spécifiques');
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('Vérification de la configuration email:');
console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE ? 'Configuré ✓' : 'Non configuré ✗');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Configuré ✓' : 'Non configuré ✗');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configuré ✓' : 'Non configuré ✗');
console.log('- RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? 'Configuré ✓' : 'Non configuré ✗');
console.log('- FROM_EMAIL:', process.env.FROM_EMAIL ? 'Configuré ✓' : 'Non configuré ✗');

let emailConfigured = false;

try {
  if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith('SG.')) {
    console.log('Configuration de SendGrid avec la clé API fournie');
    
    sgMail.setApiKey(process.env.EMAIL_PASS);
    
    if (process.env.FROM_EMAIL) {
      emailConfigured = true;
      console.log('SendGrid configuré avec succès');
    } else {
      console.error('FROM_EMAIL manquant dans le fichier .env');
      emailConfigured = false;
    }
  } else {
    console.log('Clé API SendGrid non configurée ou invalide. Mode de simulation activé.');
    emailConfigured = false;
  }
} catch (error) {
  console.error('Erreur lors de la configuration de SendGrid:', error);
  emailConfigured = false;
}

app.get('/', (req, res) => {
  res.send('Serveur Aiko fonctionnel !');
});

app.get('/api/test-email', async (req, res) => {
  if (!emailConfigured) {
    console.log('Mode de simulation: simulation d\'un email de test');
    return res.status(200).json({ 
      success: true, 
      message: 'Email de test simulé avec succès (mode de simulation)',
      simulated: true
    });
  }
  
  try {
    const msg = {
      to: process.env.RECIPIENT_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: 'Test d\'envoi d\'email - Aiko',
      html: '<h2>Ceci est un test d\'envoi d\'email</h2><p>Si vous recevez cet email, la configuration est correcte.</p>'
    };
    
    console.log('Tentative d\'envoi d\'un email de test à:', process.env.RECIPIENT_EMAIL);
    
    await sgMail.send(msg);
    console.log('Email de test envoyé avec succès');
    
    res.status(200).json({ 
      success: true, 
      message: 'Email de test envoyé avec succès !',
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email de test.',
      error: error.response ? error.response.body : error.message
    });
  }
});

app.post('/api/contact', async (req, res) => {
  const { email, phone, service, message } = req.body;
  
  if (!email || !service || !message) {
    return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs obligatoires.' });
  }
  
  if (!emailConfigured) {
    console.log('Mode de simulation: demande de contact reçue de', email);
    console.log('Détails:', { email, phone, service, message: message.substring(0, 100) + '...' });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Votre message a été reçu avec succès ! (Mode de simulation - email non envoyé)',
      simulated: true
    });
  }
  
  try {
    console.log('Tentative d\'envoi d\'un email de contact de:', email);
    
    const msg = {
      to: process.env.RECIPIENT_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `Nouvelle demande de contact - ${service}`,
      html: `
        <h2>Nouvelle demande de contact</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    await sgMail.send(msg);
    console.log('Email de contact envoyé avec succès');
    
    const confirmationMsg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Confirmation de votre demande - Aiko',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://aiko-development.fr/logo.png" alt="Aiko Logo" style="max-width: 150px; height: auto;">
            </div>
            <div style="padding: 20px; background-color: #ffffff;">
              <h2 style="color: #333333; margin-bottom: 20px; text-align: center;">Merci pour votre demande !</h2>
              <p style="color: #666666; margin-bottom: 15px;">Bonjour,</p>
              <p style="color: #666666; margin-bottom: 15px;">Nous avons bien reçu votre demande concernant <strong style="color: #333333;">"${service}"</strong>. Notre équipe va l'examiner et vous répondra dans les plus brefs délais.</p>
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #333333; margin-bottom: 10px;">Récapitulatif de votre message :</h3>
                <p style="color: #666666; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #666666; margin-bottom: 15px;">À bientôt,</p>
              <p style="color: #666666; margin-bottom: 15px; font-weight: bold;">L'équipe Aiko</p>
            </div>
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px;">${new Date().getFullYear()} Aiko. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await sgMail.send(confirmationMsg);
    console.log('Email de confirmation envoyé avec succès');
    
    res.status(200).json({ success: true, message: 'Votre message a été envoyé avec succès !' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'envoi de votre message.',
      error: error.response ? error.response.body : error.message
    });
  }
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Veuillez fournir une adresse email.' });
  }
  
  if (!emailConfigured) {
    console.log('Mode de simulation: inscription newsletter reçue de', email);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Inscription à la newsletter réussie ! (Mode de simulation - email non envoyé)',
      simulated: true
    });
  }
  
  try {
    console.log('Tentative d\'inscription à la newsletter pour:', email);
    
    const msg = {
      to: process.env.RECIPIENT_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: 'Nouvelle inscription à la newsletter',
      html: `
        <h2>Nouvelle inscription à la newsletter</h2>
        <p><strong>Email:</strong> ${email}</p>
      `
    };
    
    await sgMail.send(msg);
    console.log('Email d\'inscription newsletter envoyé avec succès');
    
    const confirmationMsg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Bienvenue à la newsletter d\'Aiko !',
      html: `
        <h2>Bienvenue à notre newsletter !</h2>
        <p>Bonjour,</p>
        <p>Merci de vous être inscrit à la newsletter d'Aiko. Vous recevrez désormais nos actualités et nos conseils pour optimiser votre présence en ligne.</p>
        <p>À bientôt,</p>
        <p>L'équipe Aiko</p>
      `
    };
    
    await sgMail.send(confirmationMsg);
    console.log('Email de confirmation newsletter envoyé avec succès');
    
    res.status(200).json({ success: true, message: 'Inscription à la newsletter réussie !' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à la newsletter:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de votre inscription.',
      error: error.response ? error.response.body : error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  console.log(`Mode d'envoi d'emails: ${emailConfigured ? 'RÉEL' : 'SIMULATION'}`);
});
