const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload config
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const {
  getAllMedicine,
  addMedicine,
  getById,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
  getMedicineTimeseries
} = require("../../Controllers/medicine/medicineController");

// Routes
router.get("/", getAllMedicine);
router.get("/stats", getMedicineStats);
router.get("/stats/timeseries", getMedicineTimeseries); // ✅ new
router.get("/:id", getById);
router.post("/", upload.single("photo"), addMedicine);
router.put("/:id", upload.single("photo"), updateMedicine);
router.delete("/:id", deleteMedicine);

module.exports = router;
