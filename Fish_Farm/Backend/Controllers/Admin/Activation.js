// Backend/Controllers/adminController.js
const User = require("../../Model/Admin/User.js");

// Deactivate accounts
exports.deactivateAccounts = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "No user IDs provided" });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: false } }
    );

    return res.json({ success: true, message: "Accounts deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating accounts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reactivate accounts
exports.reactivateAccounts = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "No user IDs provided" });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: true } }
    );

    return res.json({ success: true, message: "Accounts reactivated successfully" });
  } catch (error) {
    console.error("Error reactivating accounts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
