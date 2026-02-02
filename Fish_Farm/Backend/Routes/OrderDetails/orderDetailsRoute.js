
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  cancelOrderByCustomer,
  debugGetAllProducts,
  debugGetRawOrder,
  debugCheckSpecificProducts,
} = require("../../Controllers/OrderDetails/orderDetailsController");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/slips");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created upload directory:", uploadDir);
}

// Multer for bank slip upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/slips"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  }
});

// Add file filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// CRUD Routes
router.post("/", upload.single("bankSlipImage"), createOrder);
router.get("/", getOrders);
router.get("/debug/products", debugGetAllProducts); // Debug route
router.get("/debug/check-products", debugCheckSpecificProducts); // Debug route for specific products
router.get("/debug/raw/:id", debugGetRawOrder); // Debug route for raw order data
router.get("/:id", getOrderById);
router.put("/:id", upload.single("bankSlipImage"), updateOrder);
router.put("/:id/status", updateOrderStatus); // ✅ new clean status endpoint
router.put("/:id/cancel", cancelOrderByCustomer); // ✅ Customer cancel order
router.delete("/:id", deleteOrder);

module.exports = router;

