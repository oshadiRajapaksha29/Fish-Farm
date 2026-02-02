const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  updateWishlistItem,
} = require("../../Controllers/OrderDetails/wishlistController");

const router = express.Router();

// Routes
router.get("/", getWishlist); // Get wishlist by email query param
router.post("/add", addToWishlist); // Add item to wishlist
router.post("/remove", removeFromWishlist); // Remove item from wishlist
router.post("/clear", clearWishlist); // Clear entire wishlist
router.put("/update", updateWishlistItem); // Update item quantity

module.exports = router;
