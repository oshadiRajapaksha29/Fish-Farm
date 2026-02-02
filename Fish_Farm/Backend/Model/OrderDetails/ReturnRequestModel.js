const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  
  customerName: {
    type: String,
    required: true,
  },
  
  customerEmail: {
    type: String,
    required: true,
  },
  
  customerPhone: {
    type: String,
    required: true,
  },
  
  reason: {
    type: String,
    enum: [
      "Defective Product",
      "Wrong Item Received",
      "Product Not as Described",
      "Changed Mind",
      "Damaged During Shipping",
      "Other"
    ],
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },
  
  returnType: {
    type: String,
    enum: ["Refund", "Exchange"],
    required: true,
    default: "Refund",
  },
  
  // Items to return (can be partial order)
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
      },
      quantity: { type: Number, required: true, min: 1 },
      reason: { type: String },
    },
  ],
  
  // Images of the product (proof)
  images: [{ type: String }],
  
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Processing", "Completed"],
    default: "Pending",
  },
  
  // Admin response
  adminResponse: {
    message: { type: String },
    respondedBy: { type: String },
    respondedAt: { type: Date },
  },
  
  // Refund information
  refundAmount: { type: Number },
  refundMethod: {
    type: String,
    enum: ["Bank Transfer", "Store Credit", "Original Payment Method"],
  },
  refundedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
returnRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
