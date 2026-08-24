const nodemailer = require('nodemailer');
const config = require('../config/env');

const sendPasswordResetEmail = async (email, token) => {
  if (!config.mail.user || !config.mail.appPassword) {
    const err = new Error('Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.');
    err.statusCode = 503;
    throw err;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mail.user,
      pass: config.mail.appPassword,
    },
  });

  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `Agentflow_AI <${config.mail.user}>`,
    to: email,
    subject: 'Reset your Agentflow_AI password',
    text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
    html: `<p>We received a request to reset your Agentflow_AI password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`,
  });
};

module.exports = { sendPasswordResetEmail };
