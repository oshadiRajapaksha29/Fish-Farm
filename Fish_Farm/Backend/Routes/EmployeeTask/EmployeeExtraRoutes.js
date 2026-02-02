// Backend/Routes/EmployeeTask/EmployeeExtraRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../../Model/Admin/User.js"); // Employee model

// GET all employee emails
router.get("/all-emails", async (req, res) => {
  try {
    // Fetch only email field from all employees
    const employees = await User.find({}, "email");
    res.status(200).json(employees);
  } catch (err) {
    console.error("Failed to fetch employee emails:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
