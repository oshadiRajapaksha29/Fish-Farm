import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const api = axios.create({ baseURL: API_BASE });

// Dashboard stats
export const getMedicineStats = (lowThreshold = 10) =>
  api.get("/medicine/stats", { params: { low: lowThreshold } });

// Timeseries for dashboard (last N days)
export const getMedicineTimeseries = (days = 30) =>
  api.get("/medicine/stats/timeseries", { params: { days } });

// CRUD
export const listMedicine = () => api.get("/medicine");
export const createMedicine = (payload) => api.post("/medicine", payload);
export const getMedicineById = (id) => api.get(`/medicine/${id}`);
export const updateMedicineById = (id, payload) => api.put(`/medicine/${id}`, payload);
export const deleteMedicineById = (id) => api.delete(`/medicine/${id}`);

export default {
  getMedicineStats,
  getMedicineTimeseries,
  listMedicine,
  createMedicine,
  getMedicineById,
  updateMedicineById,
  deleteMedicineById
};
