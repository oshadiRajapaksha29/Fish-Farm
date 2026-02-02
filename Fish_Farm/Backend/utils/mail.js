const nodemailer = require('nodemailer');
require('dotenv').config();  // make sure to load .env

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',   // Gmail SMTP
  auth: {
    user: process.env.MY_SMTP_USER,
    pass: process.env.MY_SMTP_PASS
  }
});

// Optional: verify connection at startup
transporter.verify()
  .then(() => console.log('Mail transporter is ready'))
  .catch(err => console.error('Mail transporter error:', err));

/**
 * Send an email
 * @param {string | string[]} to - recipient email or array of emails
 * @param {string} subject - email subject
 * @param {string} html - email HTML content
 * @param {string} [text] - optional plain text
 */
async function sendEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: process.env.NOTIFICATION_FROM,
    to,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
