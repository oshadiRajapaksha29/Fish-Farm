// Backend/Model/mortality/mortalityModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mortalitySchema = new Schema({
  Species: { type: String, required: true },
  subSpecies: { type: String, required: true },
  TankNumber: { type: Number, required: true },
  DateOfDeath: { type: Date, required: true },
  QuantityDied: { type: Number, required: true },
  CauseOfDeath: { type: String, required: true },
  Notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Mortality", mortalitySchema);
