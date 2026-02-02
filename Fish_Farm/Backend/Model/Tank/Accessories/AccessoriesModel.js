//AccessoriesModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccessoriesSchema = new Schema({
  product: { type: String, required: true },
  category: { type: String, required: true },
  imageProduct: { type: String, required: true },
  buyerImagesProduct: { type: [String], required: true },
  price: { type: Number, required: true },
  specialPrice: { type: Number },
  stock: { type: Number, required: true },
  description: { type: String, required: true },
  weight: { type: Number, required: true },
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

module.exports = mongoose.model("AccessoriesModel", AccessoriesSchema);
