const Tank = require("../../../Model/Tank/NewTank/TankModel");
const EventEmitter = require("events");

// --- SSE Broadcaster ---
const bus = new EventEmitter();
bus.setMaxListeners(0);
function broadcast(code, payload) {
  bus.emit(`update:${code}`, payload);
}

/* ====================== CRUD ====================== */

// GET all tanks
const getAllTanks = async (req, res) => {
  try {
    const tanks = await Tank.find();
    res.status(200).json({ tanks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET tank by Mongo ID
const getTankById = async (req, res) => {
  try {
    const tank = await Tank.findById(req.params.id);
    if (!tank) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ tank });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// POST add new tank
const addTank = async (req, res) => {
  try {
    const {
      TankType,
      TankLocation,
      TankCode,
      Height,
      Width,
      Length,
      InletValves,
      OutletValves,
      Description,
      SpecialWaterRequirement
    } = req.body;

    // Auto-configure special tanks
    const tankConfiguration = SpecialWaterRequirement ? {
      TankHeightCm: 8.0,
      IdealWaterHeightCm: 2.0,
      MinWaterHeightCm: 1.0,
      MaxWaterHeightCm: 3.0,
      IsDemoMode: true
    } : {
      TankHeightCm: Height * 100,
      IdealWaterHeightCm: (Height * 100) * 0.8,
      MinWaterHeightCm: (Height * 100) * 0.2,
      MaxWaterHeightCm: (Height * 100) * 0.95,
      IsDemoMode: false
    };

    const newTank = new Tank({
      TankType,
      TankLocation,
      TankCode,
      Height,
      Width,
      Length,
      InletValves,
      OutletValves,
      Description,
      SpecialWaterRequirement,
      TankConfiguration: tankConfiguration
    });

    await newTank.save();
    res.status(201).json({ message: "Tank added", tank: newTank });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// PUT update tank
const updateTank = async (req, res) => {
  try {
    const tank = await Tank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tank) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Tank updated", tank });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// DELETE tank
const deleteTank = async (req, res) => {
  try {
    const tank = await Tank.findByIdAndDelete(req.params.id);
    if (!tank) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Tank deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

/* ====================== EXTRAS ====================== */

// GET tank by TankCode
const getTankByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const tank = await Tank.findOne({ TankCode: code });
    if (!tank) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ tank });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// POST /:code/config - Update tank configuration
const updateTankConfig = async (req, res) => {
  try {
    const { code } = req.params;
    const {
      tank_height_cm,
      ideal_water_cm,
      min_water_cm,
      max_water_cm,
      demo_mode
    } = req.body;

    console.log(`🔄 Updating configuration for tank: ${code}`, req.body);

    const tank = await Tank.findOne({ TankCode: code });
    if (!tank) {
      console.log(`❌ Tank not found: ${code}`);
      return res.status(404).json({ message: "Tank not found" });
    }

    // Update tank configuration
    tank.TankConfiguration = {
      TankHeightCm: tank_height_cm || tank.TankConfiguration?.TankHeightCm || 8.0,
      IdealWaterHeightCm: ideal_water_cm || tank.TankConfiguration?.IdealWaterHeightCm || 2.0,
      MinWaterHeightCm: min_water_cm || tank.TankConfiguration?.MinWaterHeightCm || 1.0,
      MaxWaterHeightCm: max_water_cm || tank.TankConfiguration?.MaxWaterHeightCm || 3.0,
      IsDemoMode: demo_mode !== undefined ? demo_mode : (tank.TankConfiguration?.IsDemoMode || true)
    };

    await tank.save();

    console.log(`✅ Tank configuration updated for: ${code}`, tank.TankConfiguration);

    res.status(200).json({
      ok: true,
      message: "Tank configuration updated successfully",
      configuration: tank.TankConfiguration
    });
  } catch (err) {
    console.error("💥 Error updating tank config:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /:code/telemetry - ESP32 to server
const ingestTelemetry = async (req, res) => {
  try {
    const { code } = req.params;
    const { 
      distance_cm, 
      water_height_cm, 
      demo_percentage, 
      sinhala_status 
    } = req.body;

    if (typeof distance_cm !== "number" || Number.isNaN(distance_cm) || distance_cm <= 0) {
      return res.status(400).json({ message: "Bad payload: distance_cm must be a positive number" });
    }

    const tank = await Tank.findOne({ TankCode: code });
    if (!tank) return res.status(404).json({ message: "Tank not found" });

    // Use tank configuration from database
    const config = tank.TankConfiguration || {
      TankHeightCm: 8.0,
      IdealWaterHeightCm: 2.0,
      MinWaterHeightCm: 1.0,
      MaxWaterHeightCm: 3.0,
      IsDemoMode: true
    };
    
    const TANK_HEIGHT_CM = config.TankHeightCm;
    const IDEAL_WATER_CM = config.IdealWaterHeightCm;
    const MIN_WATER_CM = config.MinWaterHeightCm;
    const MAX_WATER_CM = config.MaxWaterHeightCm;
    const IS_DEMO_MODE = config.IsDemoMode;
    
    // Calculate water parameters
    let waterHeight = water_height_cm || (TANK_HEIGHT_CM - distance_cm);
    waterHeight = Math.max(0, Math.min(TANK_HEIGHT_CM, waterHeight));
    
    // Calculate percentages based on mode
    let displayPercentage, actualPercentage;
    
    if (IS_DEMO_MODE) {
      // Demo mode: Ideal water = 100%
      if (waterHeight >= IDEAL_WATER_CM) {
        displayPercentage = 100.0;
      } else {
        displayPercentage = Number(((waterHeight / IDEAL_WATER_CM) * 100).toFixed(1));
      }
      actualPercentage = Number(((waterHeight / TANK_HEIGHT_CM) * 100).toFixed(1));
    } else {
      // Normal mode: Full tank = 100%
      displayPercentage = Number(((waterHeight / TANK_HEIGHT_CM) * 100).toFixed(1));
      actualPercentage = displayPercentage;
    }

    // Determine status based on tank configuration
    let status = "GOOD";
    let displaySinhalaStatus = sinhala_status || "පරිපූර්ණයි";
    let ledStatus = "GREEN";
    
    if (waterHeight < MIN_WATER_CM) {
      status = "CRITICAL";
      displaySinhalaStatus = "ජලය අඩුයි";
      ledStatus = "RED";
    } else if (waterHeight > MAX_WATER_CM) {
      status = "WARN";
      displaySinhalaStatus = "ජලය වැඩියි";
      ledStatus = "BOTH";
    } else if (waterHeight >= IDEAL_WATER_CM) {
      status = "GOOD";
      displaySinhalaStatus = "පරිපූර්ණයි";
      ledStatus = "GREEN";
    } else {
      status = "LOW";
      displaySinhalaStatus = "සාමාන්‍යයි";
      ledStatus = "GREEN";
    }

    // Update tank realtime data
    tank.RealTime = {
      WaterLevelPercent: displayPercentage,
      DistanceCm: Number(distance_cm.toFixed(1)),
      FillHeightCm: Number(waterHeight.toFixed(1)),
      Status: status,
      SinhalaStatus: displaySinhalaStatus,
      LEDStatus: ledStatus,
      IsDemoMode: IS_DEMO_MODE,
      ActualWaterLevel: actualPercentage,
      TankHeightCm: TANK_HEIGHT_CM,
      IdealWaterHeightCm: IDEAL_WATER_CM,
      MinWaterHeightCm: MIN_WATER_CM,
      MaxWaterHeightCm: MAX_WATER_CM,
      IsSpecialTank: tank.SpecialWaterRequirement,
      UpdatedAt: new Date()
    };

    await tank.save();

    const payload = {
      tankCode: tank.TankCode,
      WaterLevelPercent: tank.RealTime.WaterLevelPercent,
      DistanceCm: tank.RealTime.DistanceCm,
      FillHeightCm: tank.RealTime.FillHeightCm,
      Status: tank.RealTime.Status,
      SinhalaStatus: tank.RealTime.SinhalaStatus,
      LEDStatus: tank.RealTime.LEDStatus,
      IsDemoMode: tank.RealTime.IsDemoMode,
      ActualWaterLevel: tank.RealTime.ActualWaterLevel,
      TankHeightCm: tank.RealTime.TankHeightCm,
      IdealWaterHeightCm: tank.RealTime.IdealWaterHeightCm,
      MinWaterHeightCm: tank.RealTime.MinWaterHeightCm,
      MaxWaterHeightCm: tank.RealTime.MaxWaterHeightCm,
      IsSpecialTank: tank.RealTime.IsSpecialTank,
      UpdatedAt: tank.RealTime.UpdatedAt
    };

    broadcast(code, payload);
    res.status(200).json({ ok: true, ...payload });
  } catch (err) {
    console.error("💥 Error in ingestTelemetry:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /:code/stream - SSE to browser
const streamTelemetry = async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`📡 Starting SSE stream for tank: ${code}`);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
    res.flushHeaders();

    // Send last known state immediately
    const tank = await Tank.findOne({ TankCode: code });
    if (tank?.RealTime?.UpdatedAt) {
      const initial = {
        tankCode: code,
        WaterLevelPercent: tank.RealTime.WaterLevelPercent,
        DistanceCm: tank.RealTime.DistanceCm,
        FillHeightCm: tank.RealTime.FillHeightCm,
        Status: tank.RealTime.Status,
        SinhalaStatus: tank.RealTime.SinhalaStatus,
        LEDStatus: tank.RealTime.LEDStatus,
        IsDemoMode: tank.RealTime.IsDemoMode,
        ActualWaterLevel: tank.RealTime.ActualWaterLevel,
        TankHeightCm: tank.RealTime.TankHeightCm,
        IdealWaterHeightCm: tank.RealTime.IdealWaterHeightCm,
        MinWaterHeightCm: tank.RealTime.MinWaterHeightCm,
        MaxWaterHeightCm: tank.RealTime.MaxWaterHeightCm,
        IsSpecialTank: tank.RealTime.IsSpecialTank,
        UpdatedAt: tank.RealTime.UpdatedAt
      };
      console.log(`📤 Sending snapshot for ${code}:`, initial);
      res.write(`event: snapshot\ndata: ${JSON.stringify(initial)}\n\n`);
      res.write(`data: ${JSON.stringify(initial)}\n\n`);
    }

    // Listen for live updates
    const onUpdate = (payload) => {
      console.log(`📤 Broadcasting live update for ${code}:`, payload);
      res.write(`event: update\ndata: ${JSON.stringify(payload)}\n\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };
    
    bus.on(`update:${code}`, onUpdate);

    // Keep-alive ping
    const ping = setInterval(() => {
      res.write(`: keepalive ${Date.now()}\n\n`);
    }, 30000);

    // Handle client disconnect
    req.on("close", () => {
      console.log(`❌ Client disconnected from SSE for tank: ${code}`);
      clearInterval(ping);
      bus.off(`update:${code}`, onUpdate);
      res.end();
    });

  } catch (err) {
    console.error("💥 Error setting up SSE stream:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

module.exports = {
  // CRUD
  getAllTanks,
  getTankById,
  addTank,
  updateTank,
  deleteTank,
  // Demo helpers
  getTankByCode,
  updateTankConfig,
  ingestTelemetry,
  streamTelemetry
};