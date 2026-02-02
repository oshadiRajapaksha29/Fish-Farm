// Frontend API helper for Disease Reports dashboard

import axios from "axios";

// Base URL — update if you use a different env variable
const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

/** 🔹 Dashboard stats (KPIs, groupings) */
export function getDiseaseStats() {
  // GET /diseaseReports/stats
  return api.get("/diseaseReports/stats");
}

/** 🔹 Dashboard timeseries (reports/sick/species per day) */
export function getDiseaseTimeseries(days = 30) {
  // GET /diseaseReports/stats/timeseries?days=30
  return api.get("/diseaseReports/stats/timeseries", { params: { days } });
}

/** 🔹 Optional: list & detail */
export function getAllDiseaseReports(params = {}) {
  // GET /diseaseReports
  return api.get("/diseaseReports", { params });
}

export function getDiseaseReportById(id) {
  // GET /diseaseReports/:id
  return api.get(`/diseaseReports/${id}`);
}

export default {
  getDiseaseStats,
  getDiseaseTimeseries,
  getAllDiseaseReports,
  getDiseaseReportById,
};
