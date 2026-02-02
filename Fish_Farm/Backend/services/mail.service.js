// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email with HTML content.
 * @param {Object} params
 * @param {string|string[]} params.to
 * @param {string} params.subject
 * @param {string} params.html
 * @param {string|string[]} [params.cc]
 * @param {string|string[]} [params.bcc]
 * @param {string} [params.from]
 * @param {string} [params.replyTo]
 * @returns {Promise<{messageId: string}>}
 */
async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,            
  });

  return { messageId: info.messageId };
}

module.exports = { sendEmail };
