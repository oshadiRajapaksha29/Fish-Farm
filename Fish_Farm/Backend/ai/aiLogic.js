// backend/ai/aiLogic.js
require("dotenv").config();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Async function to get fish health advice
async function getAdvice({ fishSpecies, symptoms, waterTemp, behavior }) {
  let diagnosis = "Unknown condition";
  let recommendation = "Please provide more details for accurate advice.";

  const symptomText = (symptoms || "").toLowerCase();
  const behaviorText = (behavior || "").toLowerCase();

  // --- Rule-based fallback logic ---
  if (symptomText.includes("white spots")) {
    diagnosis = "Ich (White Spot Disease)";
    recommendation =
      "Increase water temperature to around 28°C for 3 days and add aquarium salt. Treat with Ich medication if available.";
  } else if (symptomText.includes("red gills")) {
    diagnosis = "Ammonia Poisoning";
    recommendation =
      "Perform a 30% water change and use an ammonia neutralizer immediately. Check and clean the filter.";
  } else if (symptomText.includes("fungus")) {
    diagnosis = "Fungal Infection";
    recommendation =
      "Isolate infected fish and add antifungal medication such as methylene blue. Maintain clean water.";
  } else if (symptomText.includes("clamped fins")) {
    diagnosis = "Stress or Poor Water Quality";
    recommendation =
      "Check pH, ammonia, and nitrate levels. Improve aeration and reduce handling stress.";
  } else if (behaviorText.includes("lethargic") || behaviorText.includes("slow")) {
    diagnosis = "Possible bacterial infection or low oxygen.";
    recommendation =
      "Add an air stone or increase aeration, and consider mild antibacterial treatment.";
  }

  // Species-specific rule
  if (fishSpecies && fishSpecies.toLowerCase() === "guppy" && symptomText.includes("fin rot")) {
    diagnosis = "Fin Rot (common in guppies)";
    recommendation = "Use antibacterial medicine and keep tank temperature stable around 26°C.";
  }

  // --- Hugging Face Chat API Integration ---
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("Hugging Face API key not found in .env");
    }

    const prompt = `
You are an expert aquaculture veterinarian.
A fish species "${fishSpecies || "unknown"}" shows the following symptoms: ${symptoms || "none"}.
Water temperature: ${waterTemp || "unknown"}°C.
Behavior: ${behavior || "unknown"}.
Provide a concise diagnosis and treatment recommendation.
`;

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Hugging Face API returned status ${response.status}: ${text}`);
    }

    const data = await response.json();
    const aiMessage = data?.choices?.[0]?.message?.content;

    if (aiMessage) {
      return {
        diagnosis: "AI Suggestion",
        recommendation: aiMessage,
      };
    }
  } catch (err) {
    console.error("AI API error, using fallback rules:", err.message);
  }

  // Return fallback if AI fails
  return { diagnosis, recommendation };
}

module.exports = { getAdvice };
