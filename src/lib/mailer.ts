import nodemailer from 'nodemailer';
import { env } from './env';

type MailAddress = { name?: string; address: string };

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

// Templates HTML complets
export const emailTemplates = {
  // Notification à l'admin pour nouveau message de contact
  newContactNotification: (data: {
    fullName: string;
    email: string;
    company?: string;
    service?: string;
    message: string;
  }) => ({
    subject: ` Nouveau message de contact - ${data.fullName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau message de contact</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #ff6b35; }
          .message { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CyberShield Africa</h1>
            <p>Nouveau message de contact reçu</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Nom complet:</div>
              <div class="value">${data.fullName}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.company ? `
            <div class="field">
              <div class="label">Entreprise:</div>
              <div class="value">${data.company}</div>
            </div>
            ` : ''}
            ${data.service ? `
            <div class="field">
              <div class="label">Service intéressé:</div>
              <div class="value">${data.service}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Message:</div>
              <div class="message">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${data.email}" class="btn">Répondre au client</a>
            </div>
          </div>
          <div class="footer">
            <p>Ce message a été envoyé depuis le formulaire de contact de CyberShield Africa</p>
            <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Nouveau message de contact - CyberShield Africa
      
      De: ${data.fullName} (${data.email})
      ${data.company ? `Entreprise: ${data.company}` : ''}
      ${data.service ? `Service: ${data.service}` : ''}
      
      Message:
      ${data.message}
      
      ---
      Envoyé le: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}
    `
  }),

  // Confirmation à l'utilisateur que le message a été reçu
  contactConfirmation: (data: {
    fullName: string;
    email: string;
    service?: string;
  }) => ({
    subject: 'Votre message a bien été reçu - CyberShield Africa',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de réception</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CyberShield Africa</h1>
            <p>Votre message a été reçu avec succès!</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.fullName},</h2>
            <p>Nous vous confirmons la bonne réception de votre message concernant${data.service ? ` le service "${data.service}"` : ' nos services de cybersécurité'}.</p>
            <p><strong>Nos actions immédiates :</strong></p>
            <ul style="margin-left: 20px;">
              <li>Votre message a été enregistré dans notre système</li>
              <li>Une notification a été envoyée à notre équipe</li>
              <li>Votre demande est maintenant en cours de traitement</li>
            </ul>
            <p><strong>Prochaines étapes :</strong></p>
            <ul style="margin-left: 20px;">
              <li> Analyse de votre demande par notre équipe experte</li>
              <li> Envoi d'une réponse personnalisée sous 24-48h</li>
              <li> Contact téléphonique si nécessaire</li>
            </ul>
            <p>Nous vous remercions de votre confiance dans CyberShield Africa pour la protection de vos actifs numériques.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://cybershield-africa.vercel.app" class="btn">Visiter notre site</a>
            </div>
          </div>
          <div class="footer">
            <p>Ce message est une confirmation automatique. Merci de ne pas y répondre.</p>
            <p>Si vous n'avez pas envoyé ce message, veuillez nous contacter immédiatement.</p>
            <p>CyberShield Africa - Votre partenaire de confiance en cybersécurité</p>
            <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Confirmation de réception - CyberShield Africa
      
      Bonjour ${data.fullName},
      
      Nous vous confirmons la bonne réception de votre message concernant${data.service ? ` le service "${data.service}"` : ' nos services de cybersécurité'}.
      
      Nos actions immédiates :
        Votre message a été enregistré dans notre système
        Une notification a été envoyée à notre équipe
        Votre demande est maintenant en cours de traitement
      
      Prochaines étapes :
        Analyse de votre demande par notre équipe experte
        Envoi d'une réponse personnalisée sous 24-48h
        Contact téléphonique si nécessaire
      
      Nous vous remercions de votre confiance dans CyberShield Africa.
      
      ---
      CyberShield Africa - Votre partenaire de confiance en cybersécurité
      Envoyé le: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}
    `
  }),

  // Notification à l'utilisateur lorsque l'admin a répondu
  adminResponseNotification: (data: {
    fullName: string;
    email: string;
    adminResponse: string;
  }) => ({
    subject: ' Réponse de CyberShield Africa à votre message',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réponse à votre message</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .response { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> CyberShield Africa</h1>
            <p>Vous avez reçu une réponse!</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.fullName},</h2>
            <p>Nous avons le plaisir de vous informer qu'une réponse a été apportée à votre message.</p>
            
            <div class="response">
              <h3> Réponse de notre équipe:</h3>
              <p>${data.adminResponse.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p><strong>Actions recommandées :</strong></p>
            <ul style="margin-left: 20px;">
              <li> Lisez attentivement la réponse ci-dessus</li>
              <li> Répondez directement à cet email pour toute question complémentaire</li>
              <li> N'hésitez pas à nous appeler pour une discussion plus détaillée</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:contact@cybershield-africa.com" class="btn"> Nous contacter</a>
            </div>
          </div>
          <div class="footer">
            <p>Nous restons à votre disposition pour tout besoin complémentaire.</p>
            <p>CyberShield Africa - Votre partenaire de confiance en cybersécurité</p>
            <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Réponse à votre message - CyberShield Africa
      
      Bonjour ${data.fullName},
      
      Nous avons le plaisir de vous informer qu'une réponse a été apportée à votre message.
      
      Réponse de notre équipe:
      ${data.adminResponse}
      
      Actions recommandées :
      Lisez attentivement la réponse ci-dessus
      Répondez directement à cet email pour toute question complémentaire
      N'hésitez pas à nous appeler pour une discussion plus détaillée
      
      Nous restons à votre disposition pour tout besoin complémentaire.
      
      ---
      CyberShield Africa - Votre partenaire de confiance en cybersécurité
      Envoyé le: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}
    `
  })
};

// Template pour la réinitialisation du mot de passe
export const passwordResetTemplate = (data: {
  firstName: string;
  resetToken: string;
}) => ({
  subject: 'Réinitialisation de votre mot de passe - CyberShield Africa',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation du mot de passe</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CyberShield Africa</h1>
          <p>Réinitialisation de votre mot de passe</p>
        </div>
        <div class="content">
          <h2>Bonjour ${data.firstName},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte CyberShield Africa.</p>
          
          <div class="alert">
            <strong>⚠️ Important:</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
          </div>
          
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${data.resetToken}" class="btn">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${data.resetToken}
          </p>
          
          <p><strong>Si vous n'avez pas demandé cette réinitialisation :</strong></p>
          <ul style="margin-left: 20px;">
            <li>Ignorez cet email</li>
            <li>Votre mot de passe restera inchangé</li>
            <li>Si vous recevez plusieurs emails de ce type, contactez notre support</li>
          </ul>
        </div>
        <div class="footer">
          <p>Cet email est expiré après 1 heure pour votre sécurité.</p>
          <p>CyberShield Africa - Votre partenaire de confiance en cybersécurité</p>
          <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Réinitialisation de votre mot de passe - CyberShield Africa
    
    Bonjour ${data.firstName},
    
    Vous avez demandé la réinitialisation de votre mot de passe pour votre compte CyberShield Africa.
    
    ⚠️ Important: Ce lien expirera dans 1 heure pour des raisons de sécurité.
    
    Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
    ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${data.resetToken}
    
    Si le lien ne fonctionne pas, copiez-le et collez-le dans votre navigateur.
    
    Si vous n'avez pas demandé cette réinitialisation :
    - Ignorez cet email
    - Votre mot de passe restera inchangé
    - Si vous recevez plusieurs emails de ce type, contactez notre support
    
    ---
    CyberShield Africa - Votre partenaire de confiance en cybersécurité
    Envoyé le: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}
  `
});

function getMailConfig() {
  return {
    enabled: env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    emailUser: env.EMAIL_USER,
    clientId: env.GMAIL_CLIENT_ID,
    clientSecret: env.GMAIL_CLIENT_SECRET,
    refreshToken: env.GMAIL_REFRESH_TOKEN,
  };
}

async function getGmailAccessToken() {
  const { clientId, clientSecret, refreshToken } = getMailConfig();
  if (!clientId || !clientSecret || !refreshToken) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

async function getTransport() {
  const { emailUser } = getMailConfig();
  const accessToken = await getGmailAccessToken();
  if (!emailUser || !accessToken) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: emailUser,
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });
}

// Fonction principale d'envoi d'email
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const info = await nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.EMAIL_USER,
        pass: env.GMAIL_CLIENT_SECRET,
      },
    }).sendMail({
      from: options.from || `"CyberShield Africa" <${env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Service d'email complet avec templates HTML
export const emailService = {
  // Notifier l'admin d'un nouveau message
  async notifyNewMessage(data: {
    fullName: string;
    email: string;
    company?: string;
    service?: string;
    message: string;
  }) {
    const cfg = getMailConfig();
    if (!cfg.enabled) return { success: false, error: 'Email notifications disabled' };
    if (!cfg.emailUser) return { success: false, error: 'Email configuration missing' };

    const template = emailTemplates.newContactNotification(data);
    return await sendEmail({
      to: cfg.emailUser, // Envoyer à l'admin
      ...template
    });
  },

  // Confirmer la réception à l'utilisateur
  async confirmReceipt(data: {
    fullName: string;
    email: string;
    service?: string;
  }) {
    const cfg = getMailConfig();
    if (!cfg.enabled) return { success: false, error: 'Email notifications disabled' };
    if (!cfg.emailUser) return { success: false, error: 'Email configuration missing' };

    const template = emailTemplates.contactConfirmation(data);
    return await sendEmail({
      to: data.email,
      ...template
    });
  },

  // Notifier de la réponse de l'admin
  async notifyAdminResponse(data: {
    fullName: string;
    email: string;
    adminResponse: string;
  }) {
    const cfg = getMailConfig();
    if (!cfg.enabled) return { success: false, error: 'Email notifications disabled' };
    if (!cfg.emailUser) return { success: false, error: 'Email configuration missing' };

    const template = emailTemplates.adminResponseNotification(data);
    return await sendEmail({
      to: data.email,
      ...template
    });
  },

  // Envoyer l'email de réinitialisation de mot de passe
  async sendPasswordReset(data: {
    firstName: string;
    to: string;
    resetToken: string;
  }) {
    const cfg = getMailConfig();
    if (!cfg.enabled) return { success: false, error: 'Email notifications disabled' };
    if (!cfg.emailUser) return { success: false, error: 'Email configuration missing' };

    const template = passwordResetTemplate(data);
    return await sendEmail({
      to: data.to,
      ...template
    });
  }
};

// Garder les anciennes fonctions pour compatibilité
export async function notifyAdminNewContactMessage(input: {
  senderEmail: string;
  senderName?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
}) {
  return emailService.notifyNewMessage({
    fullName: input.senderName || 'Non renseigné',
    email: input.senderEmail,
    company: input.company || undefined,
    service: input.service || undefined,
    message: input.message
  });
}

export async function notifySenderAdminReply(input: {
  to: string;
  senderName?: string | null;
  adminResponse: string;
}) {
  return emailService.notifyAdminResponse({
    fullName: input.senderName || 'Client',
    email: input.to,
    adminResponse: input.adminResponse
  });
}

// Fonction pour envoyer l'email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(input: {
  to: string;
  firstName: string;
  resetToken: string;
}) {
  return emailService.sendPasswordReset({
    firstName: input.firstName,
    to: input.to,
    resetToken: input.resetToken
  });
}

