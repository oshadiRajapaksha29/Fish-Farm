//AccessoriesControllers.js

const Accessories = require("../../../Model/Tank/Accessories/AccessoriesModel");

// GET all
const getAllAccessories = async (req, res) => {
  try {
    const accessories = await Accessories.find();
    res.status(200).json({ accessories });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET by ID
const getById = async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ accessory });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// POST add accessory
const addAccessories = async (req, res) => {
  try {
    const {
      product,
      category,
      price,
      specialPrice,
      stock,
      description,
      weight,
      length,
      width,
      height
    } = req.body;

    const imageProduct = req.files["imageProduct"]
      ? req.files["imageProduct"][0].path
      : "";
    const buyerImagesProduct = req.files["buyerImagesProduct"]
      ? req.files["buyerImagesProduct"].map(file => file.path)
      : [];

    const newAccessory = new Accessories({
      product,
      category,
      price,
      specialPrice,
      stock,
      description,
      weight,
      length,
      width,
      height,
      imageProduct,
      buyerImagesProduct
    });

    await newAccessory.save();
    res.status(201).json({ message: "Accessory added successfully", newAccessory });
  } catch (err) {
    res.status(500).json({ message: "Failed to add accessory", error: err });
  }
};

// PUT update accessory
const updateAccessories = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };

    if (req.files["imageProduct"]) {
      updateData.imageProduct = req.files["imageProduct"][0].path;
    }
    if (req.files["buyerImagesProduct"]) {
      updateData.buyerImagesProduct = req.files["buyerImagesProduct"].map(f => f.path);
    }

    const updatedAccessory = await Accessories.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Accessory updated", updatedAccessory });
  } catch (err) {
    res.status(500).json({ message: "Failed to update accessory", error: err });
  }
};

// DELETE accessory
const deleteAccessories = async (req, res) => {
  try {
    const deleted = await Accessories.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Accessory deleted", deleted });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete accessory", error: err });
  }
};

module.exports = {
  getAllAccessories,
  getById,
  addAccessories,
  updateAccessories,
  deleteAccessories
};
