// // Backend/emailService.js
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.ALERT_EMAIL,
//     pass: process.env.ALERT_EMAIL_PASS,
//   },
// });

// const sendLowStockAlert = async (product, stock) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.ALERT_EMAIL,
//       to: process.env.ADMIN_EMAIL,
//       subject: "⚠️ Low Stock Alert",
//       text: `Product "${product}" is low on stock. Current stock: ${stock}`,
//     });
//     console.log(`✅ Low-stock email sent for ${product}`);
//   } catch (err) {
//     console.error("❌ Failed to send email:", err);
//   }
// };

// module.exports = { sendLowStockAlert };
