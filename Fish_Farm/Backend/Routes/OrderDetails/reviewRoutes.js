const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createReview,
  getProductReviews,
  getCustomerReviews,
  getAllReviews,
  updateReviewStatus,
  markReviewHelpful,
  deleteReview,
} = require("../../Controllers/OrderDetails/reviewController");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/reviews");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// Multer for review images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/reviews"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// Routes
router.post("/", upload.array("images", 3), createReview); // Allow up to 3 images
router.get("/", getAllReviews); // Admin: Get all
router.get("/customer", getCustomerReviews); // Customer: Get by email
router.get("/product/:productId/:productType", getProductReviews); // Get reviews for specific product
router.put("/:id/status", updateReviewStatus); // Admin: Update status
router.put("/:id/helpful", markReviewHelpful); // Mark review as helpful
router.delete("/:id", deleteReview);

module.exports = router;
