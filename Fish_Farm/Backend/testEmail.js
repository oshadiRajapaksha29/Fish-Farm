// Test Email Configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Email Configuration Test\n');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
console.log('\n');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable debug output
  logger: true // Log information
});

// Verify connection
console.log('🔍 Testing SMTP connection...\n');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
    console.error('\nFull error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
    
    // Try sending a test email
    console.log('\n📨 Sending test email...\n');
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: 'Test Email from Aqua Peak',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from Aqua Peak Fish Farm.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p>If you received this, your email configuration is working correctly!</p>
      `
    }, (err, info) => {
      if (err) {
        console.error('❌ Failed to send test email:', err.message);
        console.error('\nFull error:', err);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
      }
      process.exit(err ? 1 : 0);
    });
  }
});
