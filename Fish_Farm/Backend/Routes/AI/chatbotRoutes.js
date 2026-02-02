// AI Chatbot Routes
const express = require('express');
const router = express.Router();
const chatbotController = require('../../Controllers/AI/chatbotController');

// POST /api/chatbot/chat - Send message and get AI response
router.post('/chat', chatbotController.chat);

// GET /api/chatbot/suggestions - Get conversation suggestions
router.get('/suggestions', chatbotController.getSuggestions);

// GET /api/chatbot/health - Health check
router.get('/health', chatbotController.healthCheck);

module.exports = router;
