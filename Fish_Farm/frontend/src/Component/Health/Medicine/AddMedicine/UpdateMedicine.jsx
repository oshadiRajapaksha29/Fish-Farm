import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateMedicine.css";

const API_BASE = "http://localhost:5000";

export default function UpdateMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    quantity: "",
    expiryDate: "",
    description: "",
    photo: "",
  });
  const [loading, setLoading] = useState(true);

  // ✅ Toast state
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });
  const showToast = (text, type = "success", delay = 1400, after = null) => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type });
      if (after) after();
    }, delay);
  };

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await axios.get(`${API_BASE}/medicine/${id}`);
        const src = (res.data && (res.data.medicine || res.data)) || {};
        const pick = (k, fallback = "") =>
          src[k] ?? src[k.charAt(0).toUpperCase() + k.slice(1)] ?? fallback;
        const rawExpiry = pick("expiryDate") || pick("expiry_date") || pick("expiry");

        setFormData({
          name: String(pick("name")),
          unit: String(pick("unit")),
          quantity: String(pick("quantity")),
          expiryDate: rawExpiry ? String(rawExpiry).split("T")[0] : "",
          description: String(pick("description")),
          photo: String(pick("photo")),
        });
      } catch (err) {
        console.error("Error fetching medicine:", err);
        showToast("Failed to load medicine", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/medicine/${id}`, formData);

      showToast("Medicine updated successfully", "success", 1300, () =>
        navigate("/dashboard/medicine/View")
      );

      // ✅ Instant low-stock notification if backend flagged it
      if (res.data.notifiedLowStock) {
        showToast(
          `⚠️ Low stock alert for "${res.data.name}". Quantity: ${res.data.quantity}`,
          "error",
          3000
        );
      }
    } catch (err) {
      console.error("Error updating medicine:", err.response || err);
      showToast("Failed to update medicine", "error");
    }
  };

  if (loading) {
    return (
      <div className="update-medicine-container">
        <div className="update-box">
          <h2>Edit Medicine</h2>
          <div style={{ opacity: 0.7 }}>Loading previous details…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="update-medicine-container">
      {/* ✅ Toast */}
      {toast.show && <div className={`toast ${toast.type}`}>{toast.text}</div>}

      <div className="update-box">
        <h2>Edit Medicine</h2>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="grid">
            <label>
              Name
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Unit
              <input
                type="text"
                name="unit"
                value={formData.unit || ""}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                name="quantity"
                value={formData.quantity || ""}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Expiry Date
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate || ""}
                onChange={handleChange}
              />
            </label>

            <label className="full">
              Description
              <textarea
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleChange}
              />
            </label>

            <label className="full">
              Photo (File path)
              <input
                type="text"
                name="photo"
                value={formData.photo || ""}
                onChange={handleChange}
              />
              {formData.photo ? (
                <img
                  className="preview-img"
                  src={`${API_BASE}${formData.photo}`}
                  alt="preview"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : null}
            </label>
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate("/dashboard/medicine/View")}
            >
              Cancel
            </button>
            <button type="submit" className="btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
