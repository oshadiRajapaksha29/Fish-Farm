import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MedicineList.css";

const API_BASE = "http://localhost:5000";

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // <-- search state

  // ✅ Toast state
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });
  const showToast = (text, type = "success", delay = 1400) => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type }), delay);
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/medicine`);
      setMedicines(res.data || []);
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // ------- Delete -------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await axios.delete(`${API_BASE}/medicine/${id}`);
      setMedicines((prev) => prev.filter((med) => med._id !== id));
      showToast("Medicine deleted successfully", "success");
    } catch (err) {
      console.error("Delete medicine error:", err);
      showToast("Failed to delete medicine", "error");
    }
  };

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.unit && med.unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="S_VM_loading">Loading medicines...</div>;

  return (
    <div className="S_VM_view-medicine-container">
      <div className="S_VM_view-header">
        <h1>Medicine Inventory</h1>
        <button className="S_VM_btn" onClick={fetchMedicines}>Refresh</button>
      </div>

      {/* Search Bar */}
      <div className="S_VM_medicine-search-bar">
        <input
          type="text"
          placeholder="Search by name or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Toast */}
      {toast.show && <div className={`S_VM_toast ${toast.type}`}>{toast.text}</div>}

      {filteredMedicines.length === 0 ? (
        <p>No medicines found.</p>
      ) : (
        <div className="S_VM_medicine-boxes">
          {filteredMedicines.map((med) => (
            <div className="S_VM_medicine-box" key={med._id}>
              <div className="S_VM_medicine-box-head">
                <h2 className="S_VM_medicine-name">{med.name}</h2>
                <span className="S_VM_badge">{med.unit}</span>
              </div>

              {med.photo ? (
                <div className="S_VM_medicine-image">
                  <img src={`${API_BASE}/uploads/${med.photo}`} alt={med.name} />
                </div>
              ) : (
                <div className="S_VM_medicine-image-placeholder">No Photo</div>
              )}

              <div className="S_VM_rows">
                <div className="S_VM_row"><strong>Quantity:</strong> {med.quantity}</div>
                <div className="S_VM_row"><strong>Expiry:</strong> {med.expiryDate ? med.expiryDate.split("T")[0] : "N/A"}</div>
                <div className="S_VM_row"><strong>Description:</strong> {med.description || "N/A"}</div>
              </div>

              <div className="S_VM_actions">
                <button
                  className="S_VM_btn S_VM_secondary"
                  onClick={() => (window.location.href = `/dashboard/medicine/Edit/${med._id}`)}
                >
                  Edit
                </button>
                <button className="S_VM_btn S_VM_danger" onClick={() => handleDelete(med._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}