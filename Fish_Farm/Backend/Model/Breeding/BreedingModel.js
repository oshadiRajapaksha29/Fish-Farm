//backend/Model/Breeding/BreedingModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BreedingSchema = new Schema({
    fishType: { type: String, required: true },
    MotherCount: { type: Number, required: true },
    FatherCount: { type: Number, required: true },
    BreedingDate: { type: Date, required: true },
    tankId:{type: String, required: true},
    Description: { type: String, required: true },
});

module.exports = mongoose.model("BreedingModel", BreedingSchema);
