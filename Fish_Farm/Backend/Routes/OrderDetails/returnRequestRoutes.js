const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createReturnRequest,
  getAllReturnRequests,
  getCustomerReturnRequests,
  getReturnRequestById,
  updateReturnRequestStatus,
  deleteReturnRequest,
} = require("../../Controllers/OrderDetails/returnRequestController");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/returns");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// Multer for return request images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/returns"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  }
});

const fileFilter = (req, file, cb) => {
  console.log("File filter checking file:", file.originalname);
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    console.error("Invalid file type:", file.originalname);
    return cb(new Error("Only image files (jpg, jpeg, png, gif, webp, avif) are allowed!"), false);
  }
  console.log("File accepted:", file.originalname);
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// Add error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File is too large. Maximum size is 10MB per file.",
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 images.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    console.error("File upload error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Error uploading files",
    });
  }
  next();
};

// Routes
router.post("/", upload.array("images", 5), handleMulterError, createReturnRequest); // Allow up to 5 images
router.get("/", getAllReturnRequests); // Admin: Get all
router.get("/customer", getCustomerReturnRequests); // Customer: Get by email
router.get("/:id", getReturnRequestById);
router.put("/:id/status", updateReturnRequestStatus); // Admin: Update status
router.delete("/:id", deleteReturnRequest);

module.exports = router;
