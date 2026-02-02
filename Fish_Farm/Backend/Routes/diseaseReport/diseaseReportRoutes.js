const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({ storage });

const {
  getAllReports,
  addReport,
  getById,
  updateReport,
  deleteReport,
  getDiseaseReportStats,
  getDiseaseReportTimeseries,
} = require("../../Controllers/diseaseReport/diseaseReport");

router.get("/", getAllReports);
router.get("/stats", getDiseaseReportStats);
router.get("/stats/timeseries", getDiseaseReportTimeseries);
router.post("/", upload.array("Photos", 5), addReport);
router.get("/:id", getById);
router.put("/:id", upload.array("Photos", 5), updateReport);
router.delete("/:id", deleteReport);

module.exports = router;
