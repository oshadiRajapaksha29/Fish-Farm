// Backend/Model/Admin/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    number: {
      type: String,
    },
    NIC: {
      type: String,
    },
    role: {
      type: String,
      default: "farmer",
    },
    displayPicture: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

/**
 * Middleware: Generate a unique 4-digit userId before saving
 */
UserSchema.pre("save", async function (next) {
  if (this.isNew && !this.userId) {
    let unique = false;
    let generatedId;

    while (!unique) {
      // Generate random 4-digit number (1000–9999)
      generatedId = Math.floor(1000 + Math.random() * 9000);

      // Check if it already exists
      const existingUser = await mongoose.models.User.findOne({
        userId: generatedId,
      });

      if (!existingUser) {
        unique = true;
      }
    }

    this.userId = generatedId;
  }

  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
