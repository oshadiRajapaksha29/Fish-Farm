const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios"); // To fetch images from URLs
const router = express.Router();

// POST /api/email/send
router.post("/send", async (req, res) => {
  const { doctorEmail, subject, message, photos } = req.body;

  // Nodemailer transporter using your email from .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // false for TLS
    auth: {
      user: process.env.MY_SMTP_USER, // your email
      pass: process.env.MY_SMTP_PASS, // your app password
    },
  });

  // ✅ Prepare attachments array for photos
  let attachments = [];
  if (photos && photos.length > 0) {
    for (let i = 0; i < photos.length; i++) {
      try {
        const response = await axios.get(photos[i], { responseType: "arraybuffer" });
        attachments.push({
          filename: `photo${i + 1}.jpg`,
          content: Buffer.from(response.data, "binary"),
        });
      } catch (err) {
        console.error(`Failed to fetch photo URL: ${photos[i]}`, err);
      }
    }
  }

  const mailOptions = {
    from: process.env.MY_SMTP_USER,
    to: doctorEmail,
    subject: subject || "Disease Report",
    text: message,
    attachments, // Attach photos
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully with photos!" });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

module.exports = router;
