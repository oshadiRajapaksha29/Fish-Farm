// Model/Admin/LoginHistory.js
const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    ipAddress: { type: String },
    location: {
      country: String,
      region: String,
      city: String,
    },
    userAgent: { type: String },
    loginTime: { type: Date, default: Date.now },
    status: { type: String, enum: ["Success", "Failed"], default: "Success" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
