const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BabySchema = new Schema({
    BabyTankID: { type: String, required: true },
    BabyCount: { type: Number, required: true },
    BirthDate: { type: Date, required: true },
    BreedingID: { type: String, required: true },
    Description: { type: String, required: true },

});

module.exports = mongoose.model("Baby", BabySchema);