import nodemailer from 'nodemailer';

const getMailerConfig = () => {
  const { BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS, MAIL_FROM } = process.env;
  const port = Number(BREVO_SMTP_PORT);

  if (!BREVO_SMTP_HOST || !Number.isInteger(port) || !BREVO_SMTP_USER || !BREVO_SMTP_PASS || !MAIL_FROM) {
    throw new Error('Email delivery is not configured. Set the Brevo SMTP and MAIL_FROM environment variables.');
  }

  return { host: BREVO_SMTP_HOST, port, user: BREVO_SMTP_USER, pass: BREVO_SMTP_PASS, from: MAIL_FROM };
};

export const sendVerificationEmail = async ({ email, username, token, redirectOrigin }) => {
  const config = getMailerConfig();
  const apiBaseUrl = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) throw new Error('API_PUBLIC_URL is not configured.');

  const verificationUrl = new URL(`${apiBaseUrl}/api/auth/verify-email`);
  verificationUrl.searchParams.set('token', token);
  if (redirectOrigin) verificationUrl.searchParams.set('redirect_origin', redirectOrigin);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    auth: { user: config.user, pass: config.pass }
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: 'Verify your CelestiCare email',
    text: `Hi,\n\nVerify your email address by opening this link within 24 hours:\n${verificationUrl}\n\nIf you did not create this account, you can ignore this email.`,
    html: `<p>Hi,</p><p>Verify your email address by opening this link within 24 hours:</p><p><a href="${verificationUrl}">Verify email address</a></p><p>If you did not create this account, you can ignore this email.</p>`
  });
};