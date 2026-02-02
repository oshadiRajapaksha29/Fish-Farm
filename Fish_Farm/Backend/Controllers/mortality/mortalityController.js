const Mortality = require("../../Model/mortality/mortalityModel");
const Fish = require("../../Model/fish/fish"); // ✅ import Fish model

// Get all records
const getAllMortality = async (req, res) => {
  try {
    const records = await Mortality.find();
    return res.status(200).json(records);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching mortality records", error: err.message });
  }
};

// Add new record and reduce fish stock
const addMortality = async (req, res) => {
  try {
    const { Species, subSpecies, TankNumber, DateOfDeath, QuantityDied, CauseOfDeath, Notes } = req.body;

    if (!Species || !subSpecies || !TankNumber || !DateOfDeath || !QuantityDied || !CauseOfDeath) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const newRecord = new Mortality({
      Species,
      subSpecies,
      TankNumber,
      DateOfDeath: new Date(DateOfDeath),
      QuantityDied,
      CauseOfDeath,
      Notes
    });

    await newRecord.save();

    // ✅ Reduce fish stock
    const fish = await Fish.findOne({ Species, subSpecies });
    if (fish) {
      fish.Quantity -= QuantityDied;
      if (fish.Quantity < 0) fish.Quantity = 0; // Avoid negative stock
      await fish.save();
    }

    return res.status(201).json(newRecord);
  } catch (err) {
    return res.status(500).json({ message: "Error adding record", error: err.message });
  }
};

// Get by ID
const getById = async (req, res) => {
  try {
    const record = await Mortality.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    return res.status(200).json(record);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching record", error: err.message });
  }
};

// Update
const updateMortality = async (req, res) => {
  try {
    if (req.body.DateOfDeath) {
      req.body.DateOfDeath = new Date(req.body.DateOfDeath);
    }
    const updated = await Mortality.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Record not found" });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Error updating record", error: err.message });
  }
};

// Delete
const deleteMortality = async (req, res) => {
  try {
    const deleted = await Mortality.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    return res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting record", error: err.message });
  }
};

// Dashboard KPIs
const getMortalityStats = async (req, res) => {
  try {
    const totalDeathsAgg = await Mortality.aggregate([
      { $group: { _id: null, total: { $sum: "$QuantityDied" } } }
    ]);
    const totalDeaths = totalDeathsAgg[0]?.total || 0;

    const speciesCount = await Mortality.distinct("Species");
    const tankCount = await Mortality.distinct("TankNumber");
    const totalReports = await Mortality.countDocuments();

    const topSpecies = await Mortality.aggregate([
      { $group: { _id: "$Species", deaths: { $sum: "$QuantityDied" } } },
      { $sort: { deaths: -1 } },
      { $limit: 5 }
    ]);

    const topTanksAgg = await Mortality.aggregate([
      { $group: { _id: "$TankNumber", deaths: { $sum: "$QuantityDied" } } },
      { $sort: { deaths: -1 } },
      { $limit: 5 }
    ]);
    const topTanks = topTanksAgg.map(t => ({ tank: t._id, deaths: t.deaths }));

    res.status(200).json({
      totalDeaths,
      totalReports,
      speciesAffected: speciesCount.length,
      tanksAffected: tankCount.length,
      topSpecies,
      topTanks
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};

// Dashboard Timeseries
const getMortalityTimeseries = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const raw = await Mortality.aggregate([
      { $match: { DateOfDeath: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateOfDeath" } },
          count: { $sum: "$QuantityDied" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const deathsPerDay = raw.map(r => ({
      date: r._id,
      count: r.count
    }));

    res.status(200).json({
      range: {
        start: since.toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
        days
      },
      deathsPerDay
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching timeseries", error: err.message });
  }
};

module.exports = {
  getAllMortality,
  addMortality,
  getById,
  updateMortality,
  deleteMortality,
  getMortalityStats,
  getMortalityTimeseries
};
