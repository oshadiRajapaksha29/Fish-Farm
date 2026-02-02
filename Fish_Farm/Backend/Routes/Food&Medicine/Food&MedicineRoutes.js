const multer = require("multer");
const express = require("express");
const router = express.Router();
const FoodAndMedicine = require("../../Controllers/Food&Medicine/Food&MedicineController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Routes
router.post("/", upload.single("image"), FoodAndMedicine.insertFoodAndMedicine);
router.get("/public/list", FoodAndMedicine.getPublicProducts); // specific route first
router.get("/reports", FoodAndMedicine.getFoodMedicineReports); // reports endpoint
router.get("/", FoodAndMedicine.getAllFoodAndMedicine);
router.get("/:id", FoodAndMedicine.getFoodAndMedicineById);
router.put("/:id", upload.single("image"), FoodAndMedicine.updateFoodAndMedicine);
router.delete("/:id", FoodAndMedicine.deleteFoodAndMedicine);

module.exports = router;
