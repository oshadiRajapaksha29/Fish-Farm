// Controllers/Admin/UserData.js

const express = require('express');
const mongoose = require('mongoose');
const User = require('../../Model/Admin/User.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// multer storage config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ------------------ Controllers ------------------

const FindUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const userDataToSend = {
      userId: user._id,
      email: user.email,
      name: user.name,
      number: user.number,
      role: user.role,
      displayPicture: user.displayPicture,
      status: user.status,
      NIC: user.NIC,
    };

    res.status(200).json({ user: userDataToSend });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const filterUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        let query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (status && status.toLowerCase() !== 'all') {
            query.status = status.toLowerCase() === 'active';
        }

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search, 'i');
            // Build an array for the $or conditions.
            const orConditions = [
                { name: { $regex: searchRegex } },
                { NIC: { $regex: searchRegex } },
                { number: { $regex: searchRegex } }
            ];
            // Only include _id if the search is a valid ObjectId.
            if (mongoose.Types.ObjectId.isValid(search)) {
                orConditions.push({ _id: search });
            }
            query.$or = orConditions;
        }

        const users = await User.find(query);
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Error filtering users' });
    }
};

// Get all employees (only id + name)
const getAllEmployees = async (req, res) => {
  try {
    // Filter only users with role = "employee"
    const employees = await User.find({ role: "employee" }, "_id name userId");
    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ error: "Error fetching employees" });
  }
};

module.exports = {
  FindUserById,
  filterUsers,
  getAllEmployees   // ✅ add this export
};
