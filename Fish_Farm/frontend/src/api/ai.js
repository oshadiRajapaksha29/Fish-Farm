// frontend/src/api/ai.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const askAI = (payload) => axios.post(`${API_BASE}/api/ai/ask`, payload);
