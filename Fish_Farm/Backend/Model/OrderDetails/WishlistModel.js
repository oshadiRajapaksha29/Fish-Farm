const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  // Customer identifier (email or user ID)
  customerEmail: {
    type: String,
    required: true,
    index: true,
  },
  
  customerName: {
    type: String,
  },
  
  // Wishlist items
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
      
      addedAt: {
        type: Date,
        default: Date.now,
      },
      
      // Optional: desired quantity
      desiredQuantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      
      // Optional: price when added (to track price changes)
      priceWhenAdded: {
        type: Number,
      },
    },
  ],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure one wishlist per customer
wishlistSchema.index({ customerEmail: 1 }, { unique: true });

// Compound index for quick item lookup
wishlistSchema.index({ "items.product": 1, "items.productType": 1 });

// Update timestamp before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
