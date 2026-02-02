const express = require("express");
const router = express.Router();
const { createReply, getReplies } = require("../../controllers/diseaseReport/vetReplyController");



// POST /api/vetReplies — to create a new reply
router.post("/", createReply);

// GET /api/vetReplies/:reportId — to fetch replies for a report
router.get("/:reportId", getReplies);

module.exports = router;
