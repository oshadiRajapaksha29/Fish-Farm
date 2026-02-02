// Controllers/fish/fish.js
const Fish = require("../../Model/fish/fish");

// helper to convert to numbers safely
const num = (v) =>
  v === undefined || v === null || v === "" ? undefined : Number(v);

// ✅ Get all fish (optionally filter by ?species=)
const getAllFish = async (req, res) => {
  try {
    const { species } = req.query;
    const filter = species ? { Species: species } : {};
    const fish = await Fish.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(fish);
  } catch (err) {
    console.error("GetAllFish Error:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving fish", error: err.message });
  }
};

// ✅ Add new fish stock (supports photo + extraPhoto)
const addfish = async (req, res) => {
  try {
    const {
      Species,
      subSpecies,
      Quantity,
      Stage,
      PricePerCouple,
      TankNumber,
      DateOfArrival,
      AverageWeight,
      PurchasePrice,
      aboutFish,
    } = req.body;

    let photo = null;
    let extraPhoto = null;

    if (req.files && (req.files.photo || req.files.extraPhoto)) {
      if (req.files.photo && req.files.photo[0]) {
        photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.extraPhoto && req.files.extraPhoto[0]) {
        extraPhoto = `/uploads/${req.files.extraPhoto[0].filename}`;
      }
    } else if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    const fish = new Fish({
      Species,
      subSpecies,
      Quantity: num(Quantity),
      Stage,
      PricePerCouple: num(PricePerCouple),
      TankNumber: num(TankNumber),
      DateOfArrival: new Date(DateOfArrival),
      AverageWeight: num(AverageWeight),
      PurchasePrice: num(PurchasePrice),
      photo,
      extraPhoto,
      aboutFish,
    });

    await fish.save();
    return res.status(201).json(fish);
  } catch (err) {
    console.error("AddFish Error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }
    return res
      .status(500)
      .json({ message: "Unable to add fish", error: err.message });
  }
};

// ✅ Get fish by ID
const getById = async (req, res) => {
  try {
    const fishData = await Fish.findById(req.params.id);
    if (!fishData)
      return res.status(404).json({ message: "Fish data not found" });
    return res.status(200).json(fishData);
  } catch (err) {
    console.error("GetById Error:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving fish by ID", error: err.message });
  }
};

// ✅ Update fish (also supports updating photo/extraPhoto)
const updatefishData = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.files && (req.files.photo || req.files.extraPhoto)) {
      if (req.files.photo && req.files.photo[0]) {
        updates.photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.extraPhoto && req.files.extraPhoto[0]) {
        updates.extraPhoto = `/uploads/${req.files.extraPhoto[0].filename}`;
      }
    } else if (req.file) {
      updates.photo = `/uploads/${req.file.filename}`;
    }

    const fishData = await Fish.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!fishData)
      return res.status(404).json({ message: "Unable to update fish details" });
    return res.status(200).json(fishData);
  } catch (err) {
    console.error("UpdateFish Error:", err);
    return res
      .status(500)
      .json({ message: "Error updating fish data", error: err.message });
  }
};

// ✅ Delete fish
const deletefishData = async (req, res) => {
  try {
    const fishData = await Fish.findByIdAndDelete(req.params.id);
    if (!fishData)
      return res.status(404).json({ message: "Unable to delete fish details" });
    return res
      .status(200)
      .json({ message: "Fish deleted successfully", deletedFish: fishData });
  } catch (err) {
    console.error("DeleteFish Error:", err);
    return res
      .status(500)
      .json({ message: "Error deleting fish data", error: err.message });
  }
};

// ✅ Get fish by species (case-insensitive match)
const getBySpecies = async (req, res) => {
  try {
    const decoded = decodeURIComponent(req.params.species);
    const fish = await Fish.find({
      Species: { $regex: new RegExp(`^${decoded}$`, "i") },
    }).sort({ createdAt: -1 });

    return res.status(200).json(fish);
  } catch (err) {
    console.error("GetBySpecies Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/* -------------------- 🔽 Stock mutations 🔽 -------------------- */

// Sell fish
const sellFish = async (req, res) => {
  const qty = Math.max(0, Number(req.body?.qty || 0));
  if (!qty) return res.status(400).json({ message: "qty must be > 0" });

  try {
    const fish = await Fish.findById(req.params.id);
    if (!fish) return res.status(404).json({ message: "Fish not found" });

    if (fish.Quantity < qty) {
      return res.status(409).json({
        message: `Not enough stock. Available: ${fish.Quantity}, Requested: ${qty}`,
      });
    }

    const result = await Fish.findByIdAndUpdate(
      req.params.id,
      { $inc: { Quantity: -qty, SoldCount: qty } },
      { new: true, runValidators: true }
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("SellFish Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to sell stock", error: err.message });
  }
};

// Mark dead
const markDead = async (req, res) => {
  const qty = Math.max(0, Number(req.body?.qty || 0));
  if (!qty) return res.status(400).json({ message: "qty must be > 0" });

  try {
    const result = await Fish.updateOne(
      { _id: req.params.id, Quantity: { $gte: qty } },
      { $inc: { Quantity: -qty, DeadCount: qty } }
    );

    if (result.matchedCount === 0) {
      return res.status(409).json({ message: "Not enough stock" });
    }

    const updated = await Fish.findById(req.params.id).lean();
    return res.status(200).json(updated);
  } catch (err) {
    console.error("MarkDead Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to mark dead", error: err.message });
  }
};

/* -------------------- 🔽 Dashboard stats endpoints 🔽 */

const getFishStats = async (req, res) => {
  try {
    const low = Math.max(0, Number(req.query.low ?? 10));

    const kpisAgg = await Fish.aggregate([
      {
        $group: {
          _id: null,
          speciesSet: { $addToSet: "$Species" },
          subSpeciesSet: { $addToSet: "$subSpecies" },
          totalQuantity: { $sum: "$Quantity" },
          totalInventoryValue: {
            $sum: { $multiply: ["$Quantity", "$PricePerCouple"] },
          },
          avgPricePerCouple: { $avg: "$PricePerCouple" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSpecies: { $size: "$speciesSet" },
          totalSubSpecies: { $size: "$subSpeciesSet" },
          totalQuantity: 1,
          totalInventoryValue: { $ifNull: ["$totalInventoryValue", 0] },
          avgPricePerCouple: { $ifNull: ["$avgPricePerCouple", 0] },
        },
      },
    ]);

    const kpis = kpisAgg[0] || {
      totalSpecies: 0,
      totalSubSpecies: 0,
      totalQuantity: 0,
      totalInventoryValue: 0,
      avgPricePerCouple: 0,
    };

    const lowStockCountAgg = await Fish.aggregate([
      { $match: { Quantity: { $lte: low } } },
      { $count: "count" },
    ]);
    const lowStockCount = lowStockCountAgg[0]?.count || 0;

    const bySpecies = await Fish.aggregate([
      { $group: { _id: "$Species", quantity: { $sum: "$Quantity" } } },
      { $project: { _id: 0, Species: "$_id", quantity: 1 } },
      { $sort: { quantity: -1, Species: 1 } },
    ]);

    const topLowStock = await Fish.find({})
      .select("Species subSpecies Quantity")
      .sort({ Quantity: 1, subSpecies: 1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      ...kpis,
      lowStockCount,
      lowStockThreshold: low,
      bySpecies,
      topLowStock,
    });
  } catch (err) {
    console.error("getFishStats Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute fish stats", error: err.message });
  }
};

const getFishTimeseries = async (req, res) => {
  try {
    const days = Math.max(1, Number(req.query.days ?? 30));
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const arrivalsPerDay = await Fish.aggregate([
      { $match: { DateOfArrival: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$DateOfArrival",
              format: "%Y-%m-%d",
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
    ]);

    const createdAgg = await Fish.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: "%Y-%m-%d",
              timezone: "UTC",
            },
          },
          createdCount: { $sum: 1 },
          quantityAdded: { $sum: "$Quantity" },
        },
      },
      {
        $project: { _id: 0, date: "$_id", createdCount: 1, quantityAdded: 1 },
      },
      { $sort: { date: 1 } },
    ]);

    return res.status(200).json({
      range: {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        days,
      },
      arrivalsPerDay,
      createdPerDay: createdAgg.map(({ date, createdCount }) => ({
        date,
        count: createdCount,
      })),
      quantityAddedPerDay: createdAgg.map(({ date, quantityAdded }) => ({
        date,
        quantity: quantityAdded,
      })),
    });
  } catch (err) {
    console.error("getFishTimeseries Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute timeseries", error: err.message });
  }
};

/* -------------------- 🔽 NEW ENDPOINTS for Dropdowns 🔽 */

// Get all unique main species
const getSpeciesList = async (req, res) => {
  try {
    const species = await Fish.distinct("Species");
    res.status(200).json(species.sort());
  } catch (err) {
    console.error("getSpeciesList Error:", err);
    res.status(500).json({ message: "Failed to fetch species list", error: err.message });
  }
};

// Get sub-species by main species
const getSubSpeciesByMain = async (req, res) => {
  try {
    const species = decodeURIComponent(req.params.species);
    const subs = await Fish.find({ Species: species }).distinct("subSpecies");
    res.status(200).json(subs.sort());
  } catch (err) {
    console.error("getSubSpeciesByMain Error:", err);
    res.status(500).json({ message: "Failed to fetch subspecies", error: err.message });
  }
};

// Get tanks by species
const getTankBySpecies = async (req, res) => {
  try {
    const species = decodeURIComponent(req.params.species);
    const tanks = await Fish.find({ Species: species }).distinct("TankNumber");
    res.status(200).json(tanks.sort((a, b) => a - b));
  } catch (err) {
    console.error("getTankBySpecies Error:", err);
    res.status(500).json({ message: "Failed to fetch tanks", error: err.message });
  }
};

// 🔹 Combined endpoint for frontend species/sub-species/tanks
const getSpeciesData = async (req, res) => {
  try {
    const speciesList = await Fish.distinct("Species");
    const data = await Promise.all(
      speciesList.map(async (sp) => {
        const subSpecies = await Fish.find({ Species: sp }).distinct("subSpecies");
        const tanks = await Fish.find({ Species: sp }).distinct("TankNumber");
        return {
          speciesName: sp,
          subSpecies: subSpecies.sort(),
          tanks: tanks.sort((a, b) => a - b),
        };
      })
    );
    res.status(200).json(data);
  } catch (err) {
    console.error("getSpeciesData Error:", err);
    res.status(500).json({ message: "Failed to fetch species data", error: err.message });
  }
};

module.exports = {
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
  getSpeciesData, // ✅ newly added
};
