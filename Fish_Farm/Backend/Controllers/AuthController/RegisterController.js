// controllers/registerUser.js
const User = require('../../Model/Admin/User.js');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

// 👇 import your existing Nodemailer wrapper
// adjust the path if your email service lives elsewhere
const { sendEmail } = require('../../services/mail.service.js');

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const registerUser = async (req, res) => {
  try {
    const { email, name, password, role = "customer", status } = req.body;
    const displayPicture = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password for storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role,
      displayPicture,
      status
    });
    await newUser.save();

    // ---- Send credentials email (HTML) ----
    // consider using a temp password / reset link in production
    const appUrl = process.env.APP_URL || 'https://yourapp.example.com/login';
    const subject = `Welcome to Our App, ${name || ''}`.trim();

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 12px">Welcome${name ? `, ${name}` : ''}! 🎉</h2>
        <p>Your account has been created. Here are your credentials:</p>
        <table role="presentation" cellpadding="8" cellspacing="0" style="background:#f7f7f8;border-radius:8px">
          <tr>
            <td><strong>Email</strong></td>
            <td>${email}</td>
          </tr>
          <tr>
            <td><strong>Password</strong></td>
            <td>${password}</td>
          </tr>
        </table>
        <p style="margin:16px 0">
          You can sign in here:
          <a href="${appUrl}" style="color:#2563eb;text-decoration:none">${appUrl}</a>
        </p>
        <p style="font-size:12px;color:#666">
          For security, we recommend changing your password after your first login.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject,
        html
      });
    } catch (emailErr) {
      console.error('Failed to send credential email:', emailErr);
      // Still return created status but note email failure
      return res.status(201).json({
        message: "User registered, but failed to send credentials email.",
        user: newUser,
      });
    }

    return res.status(201).json({
      message: "User registered successfully. Credentials emailed.",
      user: newUser,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Operation unsuccessful.", error: e.message });
  }
};

const uploadMiddleware = upload.single("displayPicture");

module.exports = {
  registerUser,
  uploadMiddleware
};
