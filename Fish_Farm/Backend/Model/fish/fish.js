const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fishSchema = new Schema({
  Species: { type: String, required: true },          // e.g., "Algae Eaters / Cory Fish"
  subSpecies: { type: String, required: true },       // e.g., "Golden Algae Eater"
  Quantity: { type: Number, required: true },

  // ✅ Customer-facing details
  Stage: { type: String, required: true },            // "Fry" | "Juvenile" | "Adult"
  PricePerCouple: { type: Number, required: true },   // selling price for customer

  // ✅ Batch / management details
  TankNumber: { type: Number, required: true },
  DateOfArrival: { type: Date, required: true },
  AverageWeight: { type: Number, required: true },    // grams
  PurchasePrice: { type: Number, required: true },    // supplier price

  // ✅ Media + description
  photo: { type: String },
  extraPhoto: { type: String },
  aboutFish: { type: String, default: "" } 
}, { timestamps: true });

module.exports = mongoose.model("Fish", fishSchema);
