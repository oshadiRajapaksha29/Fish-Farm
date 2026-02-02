// src/api/mortality.js
import axios from "axios";

// Base URL — use environment variable if available
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// axios instance just for mortality routes
const api = axios.create({
  baseURL: API_BASE,
  // withCredentials: true, // enable if backend uses cookies/sessions
});

/* ======================================================
   📊 Dashboard Endpoints (used in Mortality.jsx)
   ====================================================== */

/** 
 * GET /mortality/stats
 * Returns summary KPIs (total deaths, species affected, etc.)
 */
export const getMortalityStats = () => api.get("/mortality/stats");

/**
 * GET /mortality/stats/timeseries?days=30
 * Returns daily buckets for mortality reports and quantities
 */
export const getMortalityTimeseries = (days = 30) =>
  api.get("/mortality/stats/timeseries", { params: { days } });

/* ======================================================
   🔧 CRUD Endpoints (optional but useful in Mortality.jsx)
   ====================================================== */

/** List all mortality records */
export const listMortality = () => api.get("/mortality");

/** Create new mortality record */
export const createMortality = (payload) => api.post("/mortality", payload);

/** Get single mortality record by ID */
export const getMortalityById = (id) => api.get(`/mortality/${id}`);

/** Update mortality record by ID */
export const updateMortalityById = (id, payload) =>
  api.put(`/mortality/${id}`, payload);

/** Delete mortality record by ID */
export const deleteMortalityById = (id) => api.delete(`/mortality/${id}`);

export default {
  getMortalityStats,
  getMortalityTimeseries,
  listMortality,
  createMortality,
  getMortalityById,
  updateMortalityById,
  deleteMortalityById,
};
