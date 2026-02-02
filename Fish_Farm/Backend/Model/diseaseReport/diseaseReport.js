// Model/diseaseReport/diseaseReport.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const diseaseReportSchema = new Schema(
  {
    DateReported: { type: Date, required: true, default: Date.now },
    ReportedBy: { type: String, required: true }, // Employee name

    FishSpecies: { type: String, required: true }, // Main species (e.g., Angel)
    SubSpecies: { type: String }, // Optional subspecies (e.g., Golden Angel)
    TankNumber: { type: Number, required: true },

    // ✅ Removed NumberOfFish field completely
    NumberOfSick: { type: Number, required: true, min: 1 },

    Symptoms: { type: String, required: true }, // Observed symptoms
    Photos: [{ type: String }], // Uploaded image file paths
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiseaseReport", diseaseReportSchema);
