//backend/Controllers/Breeding/BreedingControllers.js
const Breeding = require("../../Model/Breeding/BreedingModel");

// GET all
const getAllBreeding = async (req, res) => {
  try {
    const breedingRecords = await Breeding.find();
    res.status(200).json({ breedingRecords });
  }
    catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }};

// GET by ID
const getById = async (req, res) => {
  try {
    const breedingRecord = await Breeding.findById(req.params.id);
    if (!breedingRecord) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ breedingRecord });
  }
    catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }};

// POST add breeding record
const addBreeding = async (req, res) => {
    try {
        const { fishType, MotherCount, FatherCount, BreedingDate, tankId, Description } = req.body;
        const newBreedingRecord = new Breeding({
            fishType,
            MotherCount,
            FatherCount,
            BreedingDate,
            tankId,
            Description
        });
        await newBreedingRecord.save();
        res.status(201).json({ message: "Breeding record added", breedingRecord: newBreedingRecord });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }};

// PUT update breeding record
const updateBreeding = async (req, res) => {
    try {
        const updatedRecord = await Breeding.findByIdAndUpdate(req
.params.id, req.body, { new: true });
        if (!updatedRecord) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Breeding record updated", updatedRecord });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }};

// DELETE breeding record
const deleteBreeding = async (req, res) => {
    try {
        const deletedRecord = await Breeding.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Breeding record deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }};
module.exports = {
  getAllBreeding,
  getById,
    addBreeding,
    updateBreeding,
    deleteBreeding
};
