const express = require("express");
const router = express.Router();
const BreedingControllers = require("../../Controllers/Breeding/BreedingControllers");

// Routes
router.get("/", BreedingControllers.getAllBreeding);
router.get("/:id", BreedingControllers.getById);
router.post("/", BreedingControllers.addBreeding);
router.put("/:id", BreedingControllers.updateBreeding);
router.delete("/:id", BreedingControllers.deleteBreeding);

module.exports = router;