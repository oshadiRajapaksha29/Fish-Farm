// AccessoriesRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const AccessoriesControllers = require("../../../Controllers/Tank/Accessories/AccessoriesControllers");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Routes
router.get("/", AccessoriesControllers.getAllAccessories);
router.get("/:id", AccessoriesControllers.getById);
router.post(
  "/",
  upload.fields([
    { name: "imageProduct", maxCount: 1 },
    { name: "buyerImagesProduct", maxCount: 5 }
  ]),
  AccessoriesControllers.addAccessories
);
router.put(
  "/:id",
  upload.fields([
    { name: "imageProduct", maxCount: 1 },
    { name: "buyerImagesProduct", maxCount: 5 }
  ]),
  AccessoriesControllers.updateAccessories
);
router.delete("/:id", AccessoriesControllers.deleteAccessories);

module.exports = router;
