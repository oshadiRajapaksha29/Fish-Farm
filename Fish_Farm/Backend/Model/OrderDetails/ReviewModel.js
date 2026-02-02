const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Reference to order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  
  // Product being reviewed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  productType: {
    type: String,
    enum: ["Food&MedicineModel", "Fish", "Accessory"],
    required: true,
  },
  
  // Customer information
  customerName: {
    type: String,
    required: true,
  },
  
  customerEmail: {
    type: String,
    required: true,
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  
  // Review title
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  
  // Review text
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  
  // Review images (optional)
  images: [{ type: String }],
  
  // Verification
  verified: {
    type: Boolean,
    default: true, // True if from actual purchase
  },
  
  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0,
  },
  
  // Admin moderation
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Approved", // Auto-approve by default
  },
  
  // Admin response (optional)
  adminResponse: {
    message: { type: String },
    respondedBy: { type: String },
    respondedAt: { type: Date },
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index to ensure one review per product per order
reviewSchema.index({ order: 1, product: 1 }, { unique: true });

// Index for querying reviews by product
reviewSchema.index({ product: 1, productType: 1 });

// Index for querying reviews by customer
reviewSchema.index({ customerEmail: 1 });

// Update timestamp before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
