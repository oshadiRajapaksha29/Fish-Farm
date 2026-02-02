// backend/Routes/ai/aiRoute.js
const express = require("express");
const router = express.Router();
const { askAI } = require("../../Controllers/ai/ai");

// POST request to get fish health advice
router.post("/advice", askAI);

module.exports = router;
