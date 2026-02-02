// backend/Controllers/ai/ai.js
const { getAdvice } = require("../../ai/aiLogic");

exports.askAI = async (req, res) => {
  console.log("🧠 Received AI request:", req.body); // Debug log to confirm backend receives data

  try {
    const { fishSpecies, symptoms, waterTemp, behavior } = req.body;

    // Validate required fields
    if (!fishSpecies || !symptoms) {
      return res
        .status(400)
        .json({ error: "Missing required fields (fishSpecies or symptoms)." });
    }

    // Await advice from AI logic
    const response = await getAdvice({
      fishSpecies,
      symptoms,
      waterTemp,
      behavior,
    });

    // If the AI failed and fallback is used, log it clearly
    if (!response.diagnosis || !response.recommendation) {
      console.warn("⚠️ AI returned incomplete data, fallback applied:", response);
    }

    // Send the diagnosis and recommendation back
    res.json(response);
  } catch (error) {
    console.error("AI Error:", error.message || error);
    res.status(500).json({
      error: "AI assistant could not process this request.",
      details: error.message || error,
    });
  }
};
