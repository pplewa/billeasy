import { Locale } from '@/i18n/routing';
import nodemailer, { TransportOptions } from 'nodemailer';

// Get email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';

// Validate SMTP configuration
function validateSmtpConfig(): void {
  if (!SMTP_HOST) {
    throw new Error('SMTP_HOST environment variable is not defined');
  }
  if (!SMTP_USER) {
    throw new Error('SMTP_USER environment variable is not defined');
  }
  if (!SMTP_PASS) {
    throw new Error('SMTP_PASS environment variable is not defined');
  }
}

// Create a reusable transporter
function createTransporter() {
  validateSmtpConfig();

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  } as TransportOptions);
}

type EmailContent = {
  [key in Locale]: string;
};

/**
 * Send a magic link email to the user
 */
export async function sendMagicLinkEmail(to: string, url: string, locale: Locale = 'en') {
  const transporter = createTransporter();

  // Validate and normalize locale
  const supportedLocales: Locale[] = ['en', 'es', 'fr', 'de', 'pl', 'pt', 'zh'];
  const normalizedLocale = supportedLocales.includes(locale) ? locale : 'en';

  // Get subject and text based on locale
  const subjects: EmailContent = {
    en: 'Your Sign-In Link for Bill Easy',
    es: 'Tu Enlace de Inicio de Sesión para Bill Easy',
    fr: 'Votre Lien de Connexion pour Bill Easy',
    de: 'Ihr Anmeldelink für Bill Easy',
    pl: 'Twój Link Logowania do Bill Easy',
    pt: 'Seu Link de Início de Sessão para Bill Easy',
    zh: 'Bill Easy 的登录链接',
  };

  const texts: EmailContent = {
    en: `Hello,\n\nClick the link below to sign in to your account:\n\n${url}\n\nThis link will expire in 30 minutes.\n\nIf you did not request this email, please ignore it.\n\nThanks,\nThe Bill Easy Team`,
    es: `Hola,\n\nHaz clic en el enlace de abajo para iniciar sesión en tu cuenta:\n\n${url}\n\nEste enlace caducará en 30 minutos.\n\nSi no has solicitado este correo, por favor ignóralo.\n\nGracias,\nEl Equipo de Bill Easy`,
    fr: `Bonjour,\n\nCliquez sur le lien ci-dessous pour vous connecter à votre compte:\n\n${url}\n\nCe lien expirera dans 30 minutes.\n\nSi vous n'avez pas demandé cet e-mail, veuillez l'ignorer.\n\nCordialement,\nL'équipe Bill Easy`,
    de: `Hallo,\n\nKlicken Sie auf den untenstehenden Link, um sich in Ihrem Konto anzumelden:\n\n${url}\n\nDieser Link läuft in 30 Minuten ab.\n\nWenn Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.\n\nDanke,\nDas Bill Easy-Team`,
    pl: `Cześć,\n\nKliknij poniższy link, aby zalogować się do swojego konta:\n\n${url}\n\nTen link wygaśnie za 30 minut.\n\nJeśli nie prosiłeś o tę wiadomość, proszę ją zignorować.\n\nPozdrowienia,\nZespół Bill Easy`,
    pt: `Olá,\n\nClique no link abaixo para iniciar sessão na sua conta:\n\n${url}\n\nEste link expirará em 30 minutos.\n\nSe não solicitou este e-mail, ignore-o.\n\nSaudações,\nA Equipa Bill Easy`,
    zh: `你好，\n\n点击下面的链接登录您的账户：\n\n${url}\n\n此链接将在30分钟内过期。\n\n如果您没有请求此电子邮件，请忽略它。\n\n谢谢，\nBill Easy团队`,
  };

  const htmls: EmailContent = {
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sign in to Bill Easy</h2>
        <p>Hello,</p>
        <p>Click the button below to sign in to your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Sign In</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 30 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you did not request this email, please ignore it.</p>
        <p>Thanks,<br>The Bill Easy Team</p>
      </div>
    `,
    es: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Inicia sesión en Bill Easy</h2>
        <p>Hola,</p>
        <p>Haz clic en el botón de abajo para iniciar sesión en tu cuenta:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Iniciar Sesión</a>
        </div>
        <p style="color: #666; font-size: 14px;">Este enlace caducará en 30 minutos.</p>
        <p style="color: #666; font-size: 14px;">Si no has solicitado este correo, por favor ignóralo.</p>
        <p>Gracias,<br>El Equipo de Bill Easy</p>
      </div>
    `,
    fr: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Connectez-vous à Bill Easy</h2>
        <p>Bonjour,</p>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre compte:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se Connecter</a>
        </div>
        <p style="color: #666; font-size: 14px;">Ce lien expirera dans 30 minutes.</p>
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cet e-mail, veuillez l'ignorer.</p>
        <p>Cordialement,<br>L'équipe Bill Easy</p>
      </div>
    `,
    de: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Melden Sie sich bei Bill Easy an</h2>
        <p>Hallo,</p>
        <p>Klicken Sie auf die Schaltfläche unten, um sich in Ihrem Konto anzumelden:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Anmelden</a>
        </div>
        <p style="color: #666; font-size: 14px;">Dieser Link läuft in 30 Minuten ab.</p>
        <p style="color: #666; font-size: 14px;">Wenn Sie diese E-Mail nicht angefordert haben, ignorieren Sie sie bitte.</p>
        <p>Danke,<br>Das Bill Easy-Team</p>
      </div>
    `,
    pl: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Zaloguj się do Bill Easy</h2>
        <p>Cześć,</p>
        <p>Kliknij poniższy przycisk, aby zalogować się do swojego konta:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Zaloguj się</a>
        </div>
        <p style="color: #666; font-size: 14px;">Ten link wygaśnie za 30 minut.</p>
        <p style="color: #666; font-size: 14px;">Jeśli nie prosiłeś o tę wiadomość, proszę ją zignorować.</p>
        <p>Pozdrowienia,<br>Zespół Bill Easy</p>
      </div>
    `,
    pt: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Inicie sessão no Bill Easy</h2>
        <p>Olá,</p>
        <p>Clique no botão abaixo para iniciar sessão na sua conta:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Iniciar Sessão</a>
        </div>
        <p style="color: #666; font-size: 14px;">Este link expirará em 30 minutos.</p>
        <p style="color: #666; font-size: 14px;">Se não solicitou este e-mail, ignore-o.</p>
        <p>Saudações,<br>A Equipa Bill Easy</p>
      </div>
    `,
    zh: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">登录 Bill Easy</h2>
        <p>你好，</p>
        <p>点击下面的按钮登录您的账户：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">登录</a>
        </div>
        <p style="color: #666; font-size: 14px;">此链接将在30分钟内过期。</p>
        <p style="color: #666; font-size: 14px;">如果您没有请求此电子邮件，请忽略它。</p>
        <p>谢谢，<br>Bill Easy团队</p>
      </div>
    `,
  };

  const subject = subjects[normalizedLocale] || subjects.en;
  const text = texts[normalizedLocale] || texts.en;
  const html = htmls[normalizedLocale] || htmls.en;

  // Send the email
  const info = await transporter.sendMail({
    from: `"Bill Easy" <${EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  });

  console.log(`Message sent: ${info.messageId}`);
  return info;
}
