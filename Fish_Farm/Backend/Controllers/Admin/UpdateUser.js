// Controller: updateUser.js
const User = require("../../Model/Admin/User.js"); // adjust path as needed

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId; // get userId from route param
    const { name, email } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use." });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
