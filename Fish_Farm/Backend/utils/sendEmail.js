// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.ALERT_EMAIL,
//     pass: process.env.ALERT_EMAIL_PASS, // Do not remove spaces unless your password actually has them
//   },
// });

// // Optional: verify transporter at startup
// transporter.verify(function(error, success) {
//   if (error) {
//     console.error('❌ Email transporter error:', error.message, error.response);
//   } else {
//     console.log('✅ Email transporter is ready');
//   }
// });

// async function sendEmail(to, subject, text) {
//   const mailOptions = {
//     from: `"Aqua Peak" <${process.env.ALERT_EMAIL}>`,
//     to,
//     subject,
//     text,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent');
//     return true;
//   } catch (error) {
//     console.error('❌ Email send error:', error.message, error.response);
//     return false;
//   }
// }

// module.exports = sendEmail;