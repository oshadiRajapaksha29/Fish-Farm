const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        
        required: true,
      },
      productType: {
        type: String,
        enum: ["Food&MedicineModel", "Fish", "Accessory"],
        required: true,
        default: "Food&MedicineModel"
      },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true }, 
    },
  ],

  contact: {
    emailOrPhone: { type: String, required: true },
  },

  delivery: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
  },

  payment: {
    method: { type: String, enum: ["COD", "BANK_SLIP"], required: true },
    bankSlipImage: { type: String }, // uploaded slip path
  },

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },

  totalAmount: { type: Number, required: true }, // total price of order
  
  // Invoice information
  invoiceNumber: { 
    type: String, 
    unique: true, 
    sparse: true // allows null values but unique when set
  },
  invoiceDate: { type: Date },
  
  // Cancellation information
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
