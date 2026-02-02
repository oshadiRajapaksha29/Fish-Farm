const express = require("express");
const {
  exportOrderHistoryCSV,
  exportOrderHistoryJSON,
  getOrderStatistics,
} = require("../../Controllers/OrderDetails/orderExportController");

const router = express.Router();

// Routes
router.get("/csv", exportOrderHistoryCSV); // Export as CSV
router.get("/json", exportOrderHistoryJSON); // Export as JSON
router.get("/statistics", getOrderStatistics); // Get order statistics

module.exports = router;
