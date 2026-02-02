const VetReply = require("../../Model/diseaseReport/VetReply");
const mongoose = require("mongoose");

// Save a new vet reply
exports.createReply = async (req, res) => {
  try {
    // Ensure diseaseReportId is a valid ObjectId
    if (req.body.diseaseReportId) {
      req.body.diseaseReportId = new mongoose.Types.ObjectId(req.body.diseaseReportId);
    }

    const reply = new VetReply(req.body);
    await reply.save();

    res.status(201).json(reply);
  } catch (err) {
    console.error("Create reply error:", err);
    res.status(500).json({ error: "Failed to save reply" });
  }
};

// Fetch replies for a specific disease report
// Fetch replies for a specific disease report
exports.getReplies = async (req, res) => {
  try {
    const reportId = req.params.reportId;

    const replies = await VetReply.find({
      $or: [
        { diseaseReportId: reportId }, // match if stored as string
        { diseaseReportId: new mongoose.Types.ObjectId(reportId) } // match if stored as ObjectId
      ]
    }).sort({ date: 1 });

    res.json(replies);
  } catch (err) {
    console.error("Get replies error:", err);
    res.status(500).json({ error: "Failed to fetch replies" });
  }
};

