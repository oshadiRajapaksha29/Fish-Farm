// Controllers/diseaseReport/diseaseReport.js
const DiseaseReport = require("../../Model/diseaseReport/diseaseReport");

// helper to safely convert values to numbers
const num = (v) =>
  v === undefined || v === null || v === "" ? undefined : Number(v);

// ✅ Get all reports (optionally filter by ?tankNumber= & ?species=)
const getAllReports = async (req, res) => {
  try {
    const { tankNumber, species } = req.query;
    const filter = {};

    if (tankNumber && tankNumber !== "undefined") {
      const tn = num(tankNumber);
      if (tn !== undefined) filter.TankNumber = tn;
    }

    if (species && species !== "undefined") {
      filter.FishSpecies = { $regex: new RegExp(species, "i") };
    }

    const reports = await DiseaseReport.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(reports);
  } catch (err) {
    console.error("GetAllReports Error:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving disease reports", error: err.message });
  }
};

// ✅ Add a report
const addReport = async (req, res) => {
  try {
    const photos = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const report = new DiseaseReport({
      ...req.body,
      TankNumber: num(req.body.TankNumber),
      NumberOfSick: num(req.body.NumberOfSick),
      Photos: photos,
    });

    await report.save();
    return res.status(201).json(report);
  } catch (err) {
    console.error("AddReport Error:", err);
    return res
      .status(500)
      .json({ message: "Unable to add report", error: err.message });
  }
};

// ✅ Get a report by ID
const getById = async (req, res) => {
  try {
    const report = await DiseaseReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Disease report not found" });
    return res.status(200).json(report);
  } catch (err) {
    console.error("GetById Error:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving disease report", error: err.message });
  }
};

// ✅ Update a report
const updateReport = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.files && req.files.length > 0) {
      updates.Photos = req.files.map((file) => `/uploads/${file.filename}`);
    }

    if (updates.TankNumber !== undefined)
      updates.TankNumber = num(updates.TankNumber);
    if (updates.NumberOfSick !== undefined)
      updates.NumberOfSick = num(updates.NumberOfSick);

    const updatedReport = await DiseaseReport.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedReport)
      return res.status(404).json({ message: "Disease report not found" });

    return res.status(200).json(updatedReport);
  } catch (err) {
    console.error("UpdateReport Error:", err);
    return res
      .status(500)
      .json({ message: "Error updating disease report", error: err.message });
  }
};

// ✅ Delete a report
const deleteReport = async (req, res) => {
  try {
    const deleted = await DiseaseReport.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Disease report not found" });

    return res
      .status(200)
      .json({ message: "Report deleted successfully", deleted });
  } catch (err) {
    console.error("DeleteReport Error:", err);
    return res
      .status(500)
      .json({ message: "Error deleting disease report", error: err.message });
  }
};

// ✅ Dashboard stats endpoints
const getDiseaseReportStats = async (req, res) => {
  try {
    const totalReports = await DiseaseReport.countDocuments({});
    const totalSickFishAgg = await DiseaseReport.aggregate([
      { $group: { _id: null, total: { $sum: "$NumberOfSick" } } },
    ]);
    const totalSickFish = totalSickFishAgg[0]?.total || 0;

    const avgSickPerReport =
      totalReports > 0 ? (totalSickFish / totalReports).toFixed(2) : 0;

    const tanksAffectedAgg = await DiseaseReport.distinct("TankNumber");
    const tanksAffected = tanksAffectedAgg.length;

    const totalSpeciesAgg = await DiseaseReport.distinct("FishSpecies");
    const totalSpecies = totalSpeciesAgg.length;

    const latestReport = await DiseaseReport.findOne().sort({ createdAt: -1 });
    const latestReportDate = latestReport ? latestReport.createdAt : null;

    const bySpecies = await DiseaseReport.aggregate([
      { $group: { _id: "$FishSpecies", reports: { $sum: 1 } } },
      { $project: { _id: 0, Species: "$_id", reports: 1 } },
      { $sort: { reports: -1 } },
    ]);

    const topSymptoms = await DiseaseReport.aggregate([
      { $group: { _id: "$Symptoms", count: { $sum: 1 } } },
      { $project: { _id: 0, symptom: "$_id", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      totalReports,
      totalSickFish,
      avgSickPerReport,
      tanksAffected,
      totalSpecies,
      latestReportDate,
      bySpecies,
      topSymptoms,
    });
  } catch (err) {
    console.error("getDiseaseReportStats Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute disease report stats", error: err.message });
  }
};

// ✅ Time series
const getDiseaseReportTimeseries = async (req, res) => {
  try {
    const days = Math.max(1, Number(req.query.days ?? 30));
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const reportsPerDay = await DiseaseReport.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: "UTC" },
          },
          count: { $sum: 1 },
          sick: { $sum: "$NumberOfSick" },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1, sick: 1 } },
      { $sort: { date: 1 } },
    ]);

    return res.status(200).json({
      range: {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        days,
      },
      reportsPerDay: reportsPerDay.map(r => ({ date: r.date, count: r.count })),
      sickPerDay: reportsPerDay.map(r => ({ date: r.date, count: r.sick })),
    });
  } catch (err) {
    console.error("getDiseaseReportTimeseries Error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute timeseries", error: err.message });
  }
};

module.exports = {
  getAllReports,
  addReport,
  getById,
  updateReport,
  deleteReport,
  getDiseaseReportStats,
  getDiseaseReportTimeseries,
};
