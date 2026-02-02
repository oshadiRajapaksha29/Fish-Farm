import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddMedicine.css";

const API_BASE = "http://localhost:5000";

export default function AddMedicine() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    expiryDate: "",
    quantity: "",
    description: "",
  });
  const [photo, setPhoto] = useState(null);

  // toast state
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });
  const showToast = (text, type = "success", delay = 1400, after = null) => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type });
      if (after) after();
    }, delay);
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => setPhoto(e.target.files?.[0] || null);

  const handleReset = () => {
    setFormData({
      name: "",
      unit: "",
      expiryDate: "",
      quantity: "",
      description: "",
    });
    setPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("unit", formData.unit);
      data.append("expiryDate", formData.expiryDate);
      data.append("quantity", formData.quantity);
      data.append("description", formData.description);
      if (photo) data.append("photo", photo);

      const res = await axios.post(`${API_BASE}/medicine`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 201) {
        showToast("Medicine added successfully!", "success", 1200, () =>
          navigate("/dashboard/medicine/View") // ✅ Correct route
        );
        handleReset();

        // ✅ Instant low-stock notification if backend flagged it
        if (res.data.notifiedLowStock) {
          showToast(
            `⚠️ Low stock alert for "${res.data.name}". Quantity: ${res.data.quantity}`,
            "error",
            3000
          );
        }
      } else {
        showToast("Unexpected server response", "error");
      }
    } catch (err) {
      console.error("Add medicine error:", err.response || err);
      showToast("Failed to add medicine. Please try again.", "error");
    }
  };

  return (
    <div className="S_AM_medicine-form-page">
      <div className="S_AM_medicine-form-container">
        <div className="S_AM_medicine-form-wrapper">
          <h1 className="S_AM_form-title">Add Medicine</h1>

          {/* Toast */}
          {toast.show && (
            <div className={`S_AM_toast ${toast.type}`}>{toast.text}</div>
          )}

          <form
            onSubmit={handleSubmit}
            className="S_AM_medicine-form"
            encType="multipart/form-data"
          >
            {/* Basic Information */}
            <div className="S_AM_form-box">
              <h2 className="S_AM_form-section-title">Basic Information</h2>
              <div className="S_AM_form-grid">
                <label>
                  Medicine Name
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter medicine name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Unit
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="tablets">tablets</option>
                    <option value="capsules">capsules</option>
                  </select>
                </label>

                <label>
                  Expiry Date
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Stock Information */}
            <div className="S_AM_form-box">
              <h2 className="S_AM_form-section-title">Stock Information</h2>
              <div className="S_AM_form-grid">
                <label>
                  Quantity
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </label>
              </div>
            </div>

            {/* Description & Photo */}
            <div className="S_AM_form-box">
              <h2 className="S_AM_form-section-title">Description & Photo</h2>
              <div className="S_AM_form-grid">
                <label className="S_AM_full-width">
                  Description
                  <textarea
                    name="description"
                    placeholder="Enter usage notes, dosage instructions, storage requirements, precautions..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </label>

                <label>
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="S_AM_form-buttons">
              <button type="button" onClick={handleReset} className="S_AM_btn-reset">
                <i className="fas fa-redo"></i> Reset
              </button>
              <button type="submit" className="S_AM_btn-submit">
                <i className="fas fa-plus-circle"></i> Add Medicine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
