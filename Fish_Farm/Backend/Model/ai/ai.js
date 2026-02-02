// backend/Models/ai/ai.js

const mongoose = require("mongoose");

const aiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional: link to your system’s user model if available
      default: null,
    },
    fishSpecies: {
      type: String,
      required: true,
      trim: true,
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    waterTemp: {
      type: Number,
      default: null,
    },
    behavior: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    recommendation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("AIChat", aiSchema);
