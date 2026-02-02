// src/api/fish.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// axios instance just for fish routes
const api = axios.create({
  baseURL: API_BASE,
});

/* ======================================================
   📊 Dashboard Endpoints (used in FishDashboardHome.jsx)
   ====================================================== */

/** 
 * GET /fish/stats
 * Returns summary KPIs (total fish, species counts, etc.)
 */
export const getFishStats = (lowThreshold = 10) =>
  api.get("/fish/stats", { params: { low: lowThreshold } });

/**
 * GET /fish/stats/timeseries?days=30
 * Returns daily activity (fish added, batches created, etc.)
 */
export const getFishTimeseries = (days = 30) =>
  api.get("/fish/stats/timeseries", { params: { days } });

/* ======================================================
   🔧 CRUD Endpoints (optional, if you want full fish module)
   ====================================================== */

/** List all fish records */
export const listFish = () => api.get("/fish");

/** Create new fish record */
export const createFish = (payload) => api.post("/fish", payload);

/** Get single fish record by ID */
export const getFishById = (id) => api.get(`/fish/${id}`);

/** Update fish record by ID */
export const updateFishById = (id, payload) => api.put(`/fish/${id}`, payload);

/** Delete fish record by ID */
export const deleteFishById = (id) => api.delete(`/fish/${id}`);

/* ======================================================
   🐟 Mortality Form: Species Data Endpoint
   ====================================================== */

/**
 * GET /fish/species-data
 * Returns all species with their sub-species and tanks.
 * Example response:
 * [
 *   { speciesName: "Angel", subSpecies: ["Golden Angel"], tanks: [1,3] },
 *   { speciesName: "Guppy", subSpecies: ["Red Guppy", "Blue Guppy"], tanks: [2,4] }
 * ]
 * NOTE: Frontend expects `speciesName` instead of `_id` for display/value
 */
export const getSpeciesData = () => api.get("/fish/species-data");

export default {
  getFishStats,
  getFishTimeseries,
  listFish,
  createFish,
  getFishById,
  updateFishById,
  deleteFishById,
  getSpeciesData,
};
