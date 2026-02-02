// Routes/fish/fish.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ ensure uploads dir exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ✅ configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

const {
  getAllFish,
  addfish,
  getById,
  updatefishData,
  deletefishData,
  getBySpecies,
  sellFish,
  markDead,
  getFishStats,
  getFishTimeseries,
  getSpeciesList,
  getSubSpeciesByMain,
  getTankBySpecies,
  getSpeciesData, // ✅ newly added controller
} = require("../../Controllers/fish/fish");

// -------------------- 🔽 NEW HELPER ROUTES for frontend dropdowns 🔽 --------------------

// Get all unique main species
router.get("/species-list", getSpeciesList);

// Get sub-species by main species
router.get("/subspecies/:species", getSubSpeciesByMain);

// Get tank numbers related to a main species
router.get("/tanks/:species", getTankBySpecies);

// Combined route for frontend (species + subSpecies + tanks)
router.get("/species-data", getSpeciesData);

// -------------------- 🔽 Core CRUD Routes 🔽 --------------------

// Get all fish (optional filter by ?species=)
router.get("/", getAllFish);

// Dashboard stats routes
router.get("/stats", getFishStats);
router.get("/stats/timeseries", getFishTimeseries);

// Get fish by species (case-insensitive)
router.get("/species/:species", getBySpecies);

// Create new fish with optional photo uploads
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "extraPhoto", maxCount: 1 },
  ]),
  addfish
);

// Get fish by ID
router.get("/:id", getById);

// Update existing fish (with optional photo/extraPhoto)
router.put(
  "/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "extraPhoto", maxCount: 1 },
  ]),
  updatefishData
);

// Mark fish as sold
router.post("/:id/sell", sellFish);

// Mark fish as dead (used by mortality auto-update)
router.post("/:id/dead", markDead);

// Delete fish
router.delete("/:id", deletefishData);

module.exports = router;
