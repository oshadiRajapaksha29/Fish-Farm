const Notification = require("../../Model/Notification/NotificationModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_SMTP_USER,
    pass: process.env.MY_SMTP_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Mail transporter is ready");
  }
});

// ------------------ CRUD Operations ------------------

// GET all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// CREATE notification
const createNotification = async (req, res) => {
  try {
    const { message, type, recipients, meta } = req.body;
    const newNotification = new Notification({ message, type, recipients, meta });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error });
  }
};

// UPDATE notification
const updateNotification = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error });
  }
};

// DELETE notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error });
  }
};

// ------------------ Low-stock Email ------------------

const sendLowStockEmail = async (req, res) => {
  try {
    const { medicineName, quantity, receiverEmail } = req.body;

    const mailOptions = {
      from: process.env.MY_SMTP_USER,
      to: receiverEmail,
      subject: `Low Stock Alert: ${medicineName}`,
      text: `The stock for medicine "${medicineName}" is running low. Remaining quantity: ${quantity}. Please restock soon.`,
    };

    await transporter.sendMail(mailOptions);

    // Save notification to DB
    const newNotification = new Notification({
      type: "low-stock",
      message: `Low stock alert for "${medicineName}"`,
      recipients: [receiverEmail],
      meta: { medicineName, quantity },
      sent: true,
    });
    await newNotification.save();

    res.status(200).json({ message: "Low stock email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  sendLowStockEmail,
};
