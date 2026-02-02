const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodAndMedicineSchema = new Schema({
   productName: { type: String, required: true },
   category: { type: String, enum: ["food", "medicine"], required: true },

   size: { type: String, required: true },
   price: { type: Number, required: true },
   stock: { type: Number, required: true },
   description: { type: String, required: true },
   image: { type: String, required: true },
   isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Food&MedicineModel', FoodAndMedicineSchema);

