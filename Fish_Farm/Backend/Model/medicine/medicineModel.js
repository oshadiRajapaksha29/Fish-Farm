// models/medicineModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
  name: { type: String, required: true },           // Medicine name
  description: { type: String },                    // Description or usage
  quantity: { type: Number, required: true },       // Current stock quantity
  unit: { type: String, default: "mg" },            // Measurement unit
  expiryDate: { type: Date },                       // Expiry date
  addedDate: { type: Date, default: Date.now },     // Date added
  photo: { type: String },                          // Photo file path or filename

  // 🔽 Added fields for low-stock notifications
  reorderLevel: { type: Number, default: 10 },      // Minimum safe quantity before alert
  notifiedLowStock: { type: Boolean, default: false } // Track if low-stock email already sent
});

module.exports = mongoose.model("Medicine", medicineSchema);
