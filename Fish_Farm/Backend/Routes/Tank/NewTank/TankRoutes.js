const express = require("express");
const router = express.Router();
const TankControllers = require("../../../Controllers/Tank/NewTank/TankControllers");

// Simple device key check for demo
const verifyDeviceKey = (req, res, next) => {
  const deviceKey = req.header("x-device-key");
  const valid = process.env.DEVICE_KEY || "demo-device-key";
  if (deviceKey !== valid) {
    return res.status(401).json({ message: "Unauthorized device" });
  }
  next();
};

// CRUD
router.get("/", TankControllers.getAllTanks);
router.get("/:id", TankControllers.getTankById);
router.post("/", TankControllers.addTank);
router.put("/:id", TankControllers.updateTank);
router.delete("/:id", TankControllers.deleteTank);

// NEW helpers
router.get("/byCode/:code", TankControllers.getTankByCode);
router.post("/:code/config", verifyDeviceKey, TankControllers.updateTankConfig);
router.post("/:code/telemetry", verifyDeviceKey, TankControllers.ingestTelemetry);
router.get("/:code/stream", TankControllers.streamTelemetry);

module.exports = router;