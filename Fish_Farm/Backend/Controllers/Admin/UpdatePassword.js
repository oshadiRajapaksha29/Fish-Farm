// Controller: changePassword.js
const User = require("../../Model/Admin/User.js"); // adjust path
const bcrypt = require("bcryptjs");

exports.changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, password } = req.body;

    if (!userId || !currentPassword || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(402).json({ success: false, message: "Current password is incorrect." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
