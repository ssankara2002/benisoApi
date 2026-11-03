import { Resend } from 'resend';
import dotenv from 'dotenv';
import { SendEmailParams } from '../interface/allInterface';

dotenv.config();

// Initialisation lazy de Resend pour éviter les crashes si la clé n'est pas définie
let resend: Resend | null = null;

const getResendClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  const client = getResendClient();

  if (!client) {
    console.warn('⚠️  Service email non configuré (RESEND_API_KEY manquante). Email non envoyé à:', to);
    return { id: 'mock-email-id', message: 'Email service not configured' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
    }

    console.log('Email envoyé avec succès:', data);
    return data;
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string, name: string) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation du mot de passe</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f4f4f4;
          border-radius: 10px;
          padding: 30px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réinitialisation du mot de passe</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>

          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur notre plateforme de gestion scolaire.</p>

          <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>

          <p>Ou copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #4CAF50;">${resetUrl}</p>

          <div class="warning">
            <strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure seulement.
          </div>

          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.</p>

          <p>Cordialement,<br>L'équipe de gestion scolaire</p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>&copy; ${new Date().getFullYear()} Système de Gestion Scolaire. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html,
  });
};

export const sendPasswordResetConfirmationEmail = async (email: string, name: string) => {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de réinitialisation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f4f4f4;
          border-radius: 10px;
          padding: 30px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .success {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Mot de passe réinitialisé</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>

          <div class="success">
            <strong>Succès !</strong> Votre mot de passe a été réinitialisé avec succès.
          </div>

          <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>

          <p>Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement l'administrateur système pour sécuriser votre compte.</p>

          <p>Cordialement,<br>L'équipe de gestion scolaire</p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>&copy; ${new Date().getFullYear()} Système de Gestion Scolaire. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Votre mot de passe a été réinitialisé',
    html,
  });
};

export const sendAbsenceNotificationEmail = async (
  parentEmail: string,
  parentNom: string,
  eleveNom: string,
  elevePrenom: string,
  dateDebut: Date,
  dateFin: Date,
  matiere: string,
  motif?: string,
  justification?: boolean
) => {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
        .info-box { background-color: #fdf2f2; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
        .info-row { display: flex; margin: 8px 0; }
        .label { font-weight: bold; min-width: 120px; color: #555; }
        .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header"><h2>🔔 Absence signalée</h2></div>
      <div class="content">
        <p>Bonjour <strong>${parentNom}</strong>,</p>
        <p>Nous vous informons qu'une absence a été enregistrée pour votre enfant :</p>
        <div class="info-box">
          <div class="info-row"><span class="label">Élève :</span><span>${elevePrenom} ${eleveNom}</span></div>
          <div class="info-row"><span class="label">Matière :</span><span>${matiere}</span></div>
          <div class="info-row"><span class="label">Du :</span><span>${formatDate(dateDebut)}</span></div>
          <div class="info-row"><span class="label">Au :</span><span>${formatDate(dateFin)}</span></div>
          ${motif ? `<div class="info-row"><span class="label">Motif :</span><span>${motif}</span></div>` : ''}
          <div class="info-row"><span class="label">Justifiée :</span><span>${justification ? '✅ Oui' : '❌ Non'}</span></div>
        </div>
        <p>Si vous avez des questions, veuillez contacter l'administration de l'école.</p>
        <p>Cordialement,<br>L'équipe de gestion scolaire</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        <p>&copy; ${new Date().getFullYear()} Système de Gestion Scolaire. Tous droits réservés.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: parentEmail,
    subject: `🔔 Absence signalée pour ${elevePrenom} ${eleveNom}`,
    html,
  });
};

export const sendRetardNotificationEmail = async (
  parentEmail: string,
  parentNom: string,
  eleveNom: string,
  elevePrenom: string,
  date: Date,
  matiere: string,
  justification?: string,
  autorisation?: boolean
) => {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
        .info-box { background-color: #fffbf0; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
        .info-row { display: flex; margin: 8px 0; }
        .label { font-weight: bold; min-width: 120px; color: #555; }
        .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header"><h2>⏰ Retard signalé</h2></div>
      <div class="content">
        <p>Bonjour <strong>${parentNom}</strong>,</p>
        <p>Nous vous informons qu'un retard a été enregistré pour votre enfant :</p>
        <div class="info-box">
          <div class="info-row"><span class="label">Élève :</span><span>${elevePrenom} ${eleveNom}</span></div>
          <div class="info-row"><span class="label">Matière :</span><span>${matiere}</span></div>
          <div class="info-row"><span class="label">Date :</span><span>${formatDate(date)}</span></div>
          ${justification ? `<div class="info-row"><span class="label">Motif :</span><span>${justification}</span></div>` : ''}
          <div class="info-row"><span class="label">Autorisé :</span><span>${autorisation ? '✅ Oui' : '❌ Non'}</span></div>
        </div>
        <p>Si vous avez des questions, veuillez contacter l'administration de l'école.</p>
        <p>Cordialement,<br>L'équipe de gestion scolaire</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        <p>&copy; ${new Date().getFullYear()} Système de Gestion Scolaire. Tous droits réservés.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: parentEmail,
    subject: `⏰ Retard signalé pour ${elevePrenom} ${eleveNom}`,
    html,
  });
};

export const sendRappelTrancheEmail = async (
  parentEmail: string,
  parentNom: string,
  eleveNom: string,
  elevePrenom: string,
  libelleTranche: string,
  montantAttendu: number,
  montantPaye: number,
  dateEcheance: Date,
  joursRestants: number
) => {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const montantRestant = montantAttendu - montantPaye;
  const isEchu = joursRestants < 0;
  const headerColor = isEchu ? '#c0392b' : joursRestants <= 3 ? '#e74c3c' : '#f39c12';
  const titre = isEchu
    ? `⚠️ Échéance dépassée - ${libelleTranche}`
    : `🔔 Rappel de paiement - ${libelleTranche}`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
        .info-box { background-color: #fffbf0; border-left: 4px solid ${headerColor}; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
        .info-row { display: flex; margin: 8px 0; }
        .label { font-weight: bold; min-width: 160px; color: #555; }
        .montant { font-size: 1.2em; font-weight: bold; color: ${headerColor}; }
        .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header"><h2>${titre}</h2></div>
      <div class="content">
        <p>Bonjour <strong>${parentNom}</strong>,</p>
        <p>${isEchu
          ? `L'échéance de paiement pour votre enfant <strong>${elevePrenom} ${eleveNom}</strong> est <strong>dépassée</strong>.`
          : `Nous vous rappelons qu'un paiement est attendu pour votre enfant <strong>${elevePrenom} ${eleveNom}</strong> dans <strong>${joursRestants} jour(s)</strong>.`
        }</p>
        <div class="info-box">
          <div class="info-row"><span class="label">Élève :</span><span>${elevePrenom} ${eleveNom}</span></div>
          <div class="info-row"><span class="label">Tranche :</span><span>${libelleTranche}</span></div>
          <div class="info-row"><span class="label">Échéance :</span><span>${formatDate(dateEcheance)}</span></div>
          <div class="info-row"><span class="label">Montant attendu :</span><span>${montantAttendu.toLocaleString('fr-FR')} FCFA</span></div>
          ${montantPaye > 0 ? `<div class="info-row"><span class="label">Déjà payé :</span><span>${montantPaye.toLocaleString('fr-FR')} FCFA</span></div>` : ''}
          <div class="info-row"><span class="label">Reste à payer :</span><span class="montant">${montantRestant.toLocaleString('fr-FR')} FCFA</span></div>
        </div>
        <p>Veuillez vous rapprocher de l'administration pour effectuer votre paiement.</p>
        <p>Cordialement,<br>L'équipe de gestion scolaire</p>
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        <p>&copy; ${new Date().getFullYear()} Système de Gestion Scolaire. Tous droits réservés.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: parentEmail, subject: titre, html });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendAbsenceNotificationEmail,
  sendRetardNotificationEmail,
  sendRappelTrancheEmail,
};
