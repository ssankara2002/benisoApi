import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AQILAS_URL = 'https://www.aqilas.com/api/v1/sms';

const sendSms = async (to: string, message: string): Promise<void> => {
  const authToken = process.env.AQILAS_AUTH_TOKEN;
  const senderId = process.env.AQILAS_SENDER_ID || 'EduTrack';

  if (!authToken) {
    console.warn('⚠️  AQILAS_AUTH_TOKEN non configuré. SMS non envoyé à:', to);
    return;
  }

  try {
    await axios.post(
      AQILAS_URL,
      { from: senderId, text: message, to: [to] },
      { headers: { 'X-AUTH-TOKEN': authToken, 'Content-Type': 'application/json' } },
    );
    console.log('✅ SMS Aqilas envoyé à:', to);
  } catch (err: any) {
    console.error('❌ SMS Aqilas échoué vers', to, ':', err?.response?.data || err.message);
    throw err;
  }
};

export const sendAbsenceNotificationSms = async (
  parentPhone: string,
  parentNom: string,
  elevePrenom: string,
  eleveNom: string,
  matiere: string,
  dateDebut: Date,
) => {
  const date = new Date(dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const message = `Bonjour ${parentNom}, une absence a été enregistrée pour ${elevePrenom} ${eleveNom} en ${matiere} le ${date}. Contactez l'administration pour plus d'infos.`;
  return sendSms(parentPhone, message);
};

export const sendRetardNotificationSms = async (
  parentPhone: string,
  parentNom: string,
  elevePrenom: string,
  eleveNom: string,
  matiere: string,
  date: Date,
) => {
  const dateStr = new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const message = `Bonjour ${parentNom}, un retard a été enregistré pour ${elevePrenom} ${eleveNom} en ${matiere} le ${dateStr}. Contactez l'administration pour plus d'infos.`;
  return sendSms(parentPhone, message);
};

export const sendRappelTrancheSms = async (
  parentPhone: string,
  parentNom: string,
  elevePrenom: string,
  eleveNom: string,
  libelleTranche: string,
  montantRestant: number,
  dateEcheance: Date,
  joursRestants: number,
) => {
  const dateStr = new Date(dateEcheance).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const message = joursRestants < 0
    ? `Bonjour ${parentNom}, l'échéance de la ${libelleTranche} pour ${elevePrenom} ${eleveNom} est dépassée. Reste à payer: ${montantRestant.toLocaleString('fr-FR')} FCFA. Contactez l'administration.`
    : `Bonjour ${parentNom}, rappel: la ${libelleTranche} pour ${elevePrenom} ${eleveNom} est due le ${dateStr}. Reste à payer: ${montantRestant.toLocaleString('fr-FR')} FCFA.`;
  return sendSms(parentPhone, message);
};

export default { sendAbsenceNotificationSms, sendRetardNotificationSms, sendRappelTrancheSms };
