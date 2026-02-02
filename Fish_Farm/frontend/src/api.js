import axios from 'axios';

// Configure axios defaults for the application
const baseURL = 'http://localhost:5000';

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log(`✅ API Response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    console.error(`❌ API Error Response: ${error.response?.status || 'Network Error'}`);
    console.error('Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Set global axios defaults as a fallback for direct axios usage
axios.defaults.baseURL = baseURL;

export default api;