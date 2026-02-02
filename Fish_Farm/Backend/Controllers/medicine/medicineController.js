const Medicine = require("../../Model/medicine/medicineModel");
const { sendEmail } = require("../../utils/mail"); // ✅ helper for email
require("dotenv").config();

// Helper
const num = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));

// ✅ LOW STOCK HELPER FUNCTION
const checkLowStock = async (medicine) => {
  if (medicine.quantity <= medicine.reorderLevel && !medicine.notifiedLowStock) {
    const subject = `Low Stock Alert: ${medicine.name}`;
    const html = `
      <h3>Low Stock Medicine Alert 🚨</h3>
      <p>The following medicine is running low:</p>
      <ul>
        <li><strong>Name:</strong> ${medicine.name}</li>
        <li><strong>Quantity:</strong> ${medicine.quantity}</li>
        <li><strong>Reorder Level:</strong> ${medicine.reorderLevel}</li>
      </ul>
      <p>Please restock as soon as possible.</p>
    `;
    const recipients = process.env.LOW_STOCK_RECIPIENTS || process.env.MY_SMTP_USER;

    try {
      await sendEmail({ to: recipients, subject, html });
      medicine.notifiedLowStock = true;
      await medicine.save();
      console.log(`📧 Low-stock email sent for ${medicine.name}`);
    } catch (emailErr) {
      console.error("❌ Error sending low-stock email:", emailErr);
    }
  }

  // ✅ Reset flag if restocked
  if (medicine.quantity > medicine.reorderLevel && medicine.notifiedLowStock) {
    medicine.notifiedLowStock = false;
    await medicine.save();
    console.log(`✅ ${medicine.name} restocked — notification flag reset`);
  }
};

// Get all medicines
const getAllMedicine = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const meds = await Medicine.find(filter).sort({ createdAt: -1 });
    res.status(200).json(meds || []);
  } catch (err) {
    console.error("❌ Error in getAllMedicine:", err);
    res.status(500).json({ message: "Error retrieving medicines", error: err.message });
  }
};

// Add new medicine
const addMedicine = async (req, res) => {
  try {
    const {
      name, type, quantity, unitPrice, supplier,
      dateOfArrival, expiryDate, description
    } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const medicine = new Medicine({
      name,
      type,
      quantity: num(quantity) || 0,
      unitPrice: num(unitPrice) || 0,
      supplier,
      dateOfArrival: dateOfArrival ? new Date(dateOfArrival) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      description,
      photo,
    });

    await medicine.save();

    // ✅ Check low stock after adding
    await checkLowStock(medicine);

    res.status(201).json(medicine);
  } catch (err) {
    console.error("❌ Error in addMedicine:", err);
    res.status(500).json({ message: "Unable to add medicine", error: err.message });
  }
};

// Get medicine by ID
const getById = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.status(200).json(med);
  } catch (err) {
    console.error("❌ Error in getById:", err);
    res.status(500).json({ message: "Error retrieving medicine", error: err.message });
  }
};

// Update medicine
const updateMedicine = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;

    const med = await Medicine.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    // ✅ Check low stock after update
    await checkLowStock(med);

    res.status(200).json(med);
  } catch (err) {
    console.error("❌ Error in updateMedicine:", err);
    res.status(500).json({ message: "Error updating medicine", error: err.message });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndDelete(req.params.id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.status(200).json({ message: "Medicine deleted", deleted: med });
  } catch (err) {
    console.error("❌ Error in deleteMedicine:", err);
    res.status(500).json({ message: "Error deleting medicine", error: err.message });
  }
};

// Dashboard stats
const getMedicineStats = async (req, res) => {
  try {
    const low = Math.max(0, Number(req.query.low ?? 5));
    const allMeds = await Medicine.find({});

    const totalQuantity = allMeds.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalInventoryValue = allMeds.reduce(
      (sum, m) => sum + ((m.quantity || 0) * (m.unitPrice || 0)), 0
    );

    const typesSet = new Set(allMeds.map(m => m.type?.trim() || "-"));
    const totalTypes = typesSet.size;

    const lowStockMeds = allMeds.filter(m => (m.quantity || 0) <= low);
    const topLowStock = lowStockMeds
      .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
      .slice(0, 5)
      .map(m => ({
        name: m.name,
        type: m.type?.trim() || "-",
        quantity: m.quantity || 0
      }));

    const byTypeMap = {};
    allMeds.forEach(m => {
      const t = m.type?.trim() || "-";
      if (!byTypeMap[t]) byTypeMap[t] = 0;
      byTypeMap[t] += m.quantity || 0;
    });
    const byType = Object.entries(byTypeMap).map(([type, quantity]) => ({ type, quantity }));

    const byMedicine = allMeds.map(m => ({
      name: m.name,
      quantity: m.quantity || 0
    }));

    res.status(200).json({
      totalQuantity,
      totalInventoryValue,
      totalTypes,
      lowStockCount: lowStockMeds.length,
      lowStockThreshold: low,
      topLowStock,
      byType,
      byMedicine,
    });
  } catch (err) {
    console.error("❌ Error in getMedicineStats:", err);
    res.status(500).json({ message: "Failed to compute stats", error: err.message });
  }
};

// Timeseries endpoint
const getMedicineTimeseries = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);

    const medicines = await Medicine.find({ createdAt: { $gte: start, $lte: end } });

    const addedPerDay = {};
    medicines.forEach(m => {
      const d = m.createdAt.toISOString().slice(0, 10);
      addedPerDay[d] = (addedPerDay[d] || 0) + (m.quantity || 0);
    });

    const series = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      series.push({ date: dateStr, quantity: addedPerDay[dateStr] || 0 });
    }

    res.status(200).json({
      range: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) },
      addedPerDay: series
    });
  } catch (err) {
    console.error("❌ Error in getMedicineTimeseries:", err);
    res.status(500).json({ message: "Failed to compute timeseries", error: err.message });
  }
};

module.exports = {
  getAllMedicine,
  addMedicine,
  getById,
  updateMedicine,
  deleteMedicine,
  getMedicineStats,
  getMedicineTimeseries,
};
