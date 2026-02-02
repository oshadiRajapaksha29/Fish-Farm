//BACKEND/Controllers/Breeding/BabyControllers.js
const Baby = require('../../Model/Breeding/BabyModel');

// GET all baby records
const getAllBabies = async (req, res) => {
    try {
        const babyRecords = await Baby.find();
        res.status(200).json({ babyRecords });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// GET baby record by ID
const getBabyById = async (req, res) => {
    try {
        const babyRecord = await Baby.findById(req.params.id);
        if (!babyRecord) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ babyRecord });
    }   catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// POST add baby record
const addBaby = async (req, res) => {
    try {
        const { BabyTankID, BabyCount, BirthDate, BreedingID, Description } = req.body;
        const newBabyRecord = new Baby({
            BabyTankID,
            BabyCount,
            BirthDate,
            BreedingID,
            Description
        });
        await newBabyRecord.save();
        res.status(201).json({ message: "Baby record added", babyRecord: newBabyRecord });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
// PUT update baby record
const updateBaby = async (req, res) => {
    try {
        const updatedRecord = await Baby.findByIdAndUpdate(req.params
.id, req.body, { new: true });
        if (!updatedRecord) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Baby record updated", updatedRecord });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};

// DELETE baby record
const deleteBaby = async (req, res) => {
    try {
        const deletedRecord = await Baby.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Baby record deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};

module.exports = {
    getAllBabies,
    getBabyById,
    addBaby,
    updateBaby,
    deleteBaby
};

