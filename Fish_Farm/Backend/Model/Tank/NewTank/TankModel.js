const mongoose = require("mongoose");

const TankSchema = new mongoose.Schema({
  TankType: {
    type: String,
    required: true,
    enum: ["Mud Puddles", "Glass Tank", "CementTank", "Special Fish Tank"]
  },
  TankLocation: {
    type: String,
    required: true,
    enum: ["Baby Tank", "Breeding tanks", "Normal Tank", "Special Care Tank"]
  },
  TankCode: {
    type: String,
    required: true,
    unique: true
  },
  Height: {
    type: Number,
    required: true
  },
  Width: {
    type: Number,
    required: true
  },
  Length: {
    type: Number,
    required: true
  },
  InletValves: {
    type: Number,
    required: true
  },
  OutletValves: {
    type: Number,
    required: true
  },
  Description: {
    type: String,
    default: ""
  },
  SpecialWaterRequirement: {
    type: Boolean,
    default: false
  },
  TankConfiguration: {
    TankHeightCm: { type: Number, default: 8.0 },
    IdealWaterHeightCm: { type: Number, default: 2.0 },
    MinWaterHeightCm: { type: Number, default: 1.0 },
    MaxWaterHeightCm: { type: Number, default: 3.0 },
    IsDemoMode: { type: Boolean, default: true }
  },
  RealTime: {
    WaterLevelPercent: Number,
    DistanceCm: Number,
    FillHeightCm: Number,
    Status: String,
    SinhalaStatus: String,
    IsDemoMode: Boolean,
    ActualWaterLevel: Number,
    TankHeightCm: Number,
    IdealWaterHeightCm: Number,
    MinWaterHeightCm: Number,
    MaxWaterHeightCm: Number,
    LEDStatus: String,
    IsSpecialTank: Boolean,
    UpdatedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Tank", TankSchema);