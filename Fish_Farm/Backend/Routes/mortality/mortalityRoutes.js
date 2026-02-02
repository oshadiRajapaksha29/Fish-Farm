// Routes/mortality/mortality.js
const express = require("express");
const router = express.Router();

const {
  getAllMortality,
  addMortality,
  getById,
  updateMortality,
  deleteMortality,
  getMortalityStats,
  getMortalityTimeseries,
} = require("../../Controllers/mortality/mortalityController");

// ✅ Core CRUD
router.get("/", getAllMortality);
router.post("/", addMortality);

// 📊 Dashboard stats (must be BEFORE "/:id")
router.get("/stats", getMortalityStats);
router.get("/stats/timeseries", getMortalityTimeseries);

router.get("/:id", getById);
router.put("/:id", updateMortality);
router.delete("/:id", deleteMortality);

module.exports = router;
