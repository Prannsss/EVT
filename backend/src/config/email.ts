import * as brevo from '@getbrevo/brevo';
import { env } from './env.js';

// Initialize Brevo API client
let brevoClient: brevo.TransactionalEmailsApi | null = null;

if (env.BREVO_API_KEY) {
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
  brevoClient = apiInstance;
}

// Send email using Brevo API
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  from?: { email: string; name: string };
}): Promise<boolean> => {
  if (!brevoClient) {
    console.error('❌ Brevo API client not initialized');
    return false;
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = options.from || { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME };
    sendSmtpEmail.to = [{ email: options.to }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html;

    await brevoClient.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.error('❌ Brevo email error:', error);
    return false;
  }
};

export const verifyEmailConfig = async () => {
  try {
    if (!brevoClient) {
      console.error('❌ Brevo API key not configured');
      return false;
    }
    console.log('✅ Email service ready (Brevo API)');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};
