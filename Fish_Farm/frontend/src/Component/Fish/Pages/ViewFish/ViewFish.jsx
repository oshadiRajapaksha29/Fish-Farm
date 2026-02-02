import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ViewFish.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function S_VF_ViewFish() {
  const [fishData, setFishData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchFishData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/fish`);
      const list = Array.isArray(res.data) ? res.data : res.data.fish;
      setFishData(list || []);
    } catch (err) {
      console.error("Error fetching fish data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFishData();
  }, [fetchFishData]);

  // NEW: Listen for cart updates to refresh data
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log("[ViewFish] Cart update detected, refreshing fish data...");
      fetchFishData();
    };

    // Listen for custom event when cart is updated
    window.addEventListener('cart-updated', handleCartUpdate);
    
    // Also set up periodic refresh every 30 seconds to catch external changes
    const interval = setInterval(fetchFishData, 30000);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      clearInterval(interval);
    };
  }, [fetchFishData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_BASE}/fish/${id}`);
      setFishData((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. Check console for details.");
    }
  };

  const startEdit = (fish) => setEditing({ ...fish });
  const cancelEdit = () => setEditing(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditing((prev) => ({
      ...prev,
      [name]: [
        "Quantity",
        "TankNumber",
        "AverageWeight",
        "PurchasePrice",
        "PricePerCouple",
      ].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing?._id) return;

    try {
      setSaving(true);
      const payload = {
        Species: editing.Species,
        subSpecies: editing.subSpecies,
        Stage: editing.Stage,
        DateOfArrival: editing.DateOfArrival,
        Quantity: Number(editing.Quantity),
        TankNumber: Number(editing.TankNumber),
        AverageWeight: Number(editing.AverageWeight),
        PurchasePrice: Number(editing.PurchasePrice),
        PricePerCouple: Number(editing.PricePerCouple),
        photo: editing.photo,
        extraPhoto: editing.extraPhoto,
        aboutFish: editing.aboutFish,
      };

      const res = await axios.put(`${API_BASE}/fish/${editing._id}`, payload);
      const updated = res.data;

      setFishData((prev) =>
        prev.map((f) => (f._id === updated._id ? updated : f))
      );
      setEditing(null);
      
      // NEW: Trigger dashboard refresh
      window.dispatchEvent(new Event('fish-data-updated'));
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const filteredFish = fishData.filter(
    (fish) =>
      fish.subSpecies.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fish.Species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // NEW: Function to manually refresh data
  const handleRefresh = () => {
    fetchFishData();
  };

  if (loading) return <div className="S_VF_loading">Loading fish data...</div>;

  return (
    <div className="S_VF_view-fish-container">
      <div className="S_VF_view-header">
        <h1>Fish Details</h1>
        <button 
          className="S_VF_btn refresh" 
          onClick={handleRefresh}
          title="Refresh data"
        >
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      <div className="S_VF_search-bar">
        <input
          type="text"
          placeholder="Search by Species or Sub Species..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredFish.length === 0 ? (
        <p>No fish records found.</p>
      ) : (
        <div className="S_VF_fish-boxes">
          {filteredFish.map((fish) => (
            <div className="S_VF_fish-box" key={fish._id}>
              <div className="S_VF_fish-box-head">
                <div className="S_VF_title">
                  <h2 className="S_VF_subspecies">{fish.subSpecies}</h2>
                  <span className="S_VF_species">({fish.Species})</span>
                </div>
                <div className="S_VF_header-right">
                  <span className="S_VF_badge">{fish.Stage}</span>
                  <span className="S_VF_quantity-badge">
                    Qty: {fish.Quantity}
                    {fish.SoldCount > 0 && (
                      <span className="S_VF_sold-count"> (Sold: {fish.SoldCount})</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="S_VF_fish-images">
                {fish.photo && (
                  <div className="S_VF_fish-image">
                    <img src={`${API_BASE}${fish.photo}`} alt={fish.subSpecies} />
                  </div>
                )}
                {fish.extraPhoto && (
                  <div className="S_VF_fish-image">
                    <img
                      src={`${API_BASE}${fish.extraPhoto}`}
                      alt={`${fish.subSpecies} extra`}
                    />
                  </div>
                )}
              </div>

              <div className="S_VF_rows">
                <div className="S_VF_row">
                  <span>
                    <strong>Quantity:</strong> 
                    <span className={fish.Quantity <= 5 ? "S_VF_low-stock" : ""}>
                      {fish.Quantity}
                    </span>
                  </span>
                  <span>
                    <strong>Tank No:</strong> {fish.TankNumber}
                  </span>
                  <span>
                    <strong>Avg Wt (g):</strong> {fish.AverageWeight}
                  </span>
                </div>
                <div className="S_VF_row">
                  <span>
                    <strong>Purchase price (Couple): Rs.</strong> {fish.PurchasePrice}
                  </span>
                  <span>
                    <strong>Selling price (Couple): Rs.</strong> {fish.PricePerCouple}
                  </span>
                  <span>
                    <strong>Arrived:</strong>{" "}
                    {fish.DateOfArrival
                      ? new Date(fish.DateOfArrival).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                {(fish.SoldCount > 0 || fish.DeadCount > 0) && (
                  <div className="S_VF_row S_VF_stats-row">
                    {fish.SoldCount > 0 && (
                      <span>
                        <strong>Total Sold:</strong> {fish.SoldCount}
                      </span>
                    )}
                    {fish.DeadCount > 0 && (
                      <span>
                        <strong>Deceased:</strong> {fish.DeadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="S_VF_actions">
                <button className="S_VF_btn secondary" onClick={() => startEdit(fish)}>
                  Edit
                </button>
                <button className="S_VF_btn danger" onClick={() => handleDelete(fish._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="S_VF_modal-backdrop" onClick={cancelEdit}>
          <div className="S_VF_modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Fish</h3>
            <form onSubmit={handleSave} className="S_VF_edit-form">
              <div className="S_VF_grid">
                <label>
                  Species
                  <input
                    name="Species"
                    value={editing.Species || ""}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Sub Species
                  <input
                    name="subSpecies"
                    value={editing.subSpecies || ""}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Stage
                  <select
                    name="Stage"
                    value={editing.Stage || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select stage</option>
                    <option value="Fry">Fry</option>
                    <option value="Juvenile">Juvenile</option>
                    <option value="Adult">Adult</option>
                  </select>
                </label>
                <label>
                  About Fish
                  <input
                    name="aboutFish"
                    value={editing.aboutFish || ""}
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Date Of Arrival
                  <input
                    type="date"
                    name="DateOfArrival"
                    value={
                      editing.DateOfArrival
                        ? new Date(editing.DateOfArrival).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={handleEditChange}
                    required
                  />
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    name="Quantity"
                    value={editing.Quantity ?? ""}
                    onChange={handleEditChange}
                    required
                    min="0"
                  />
                </label>
                <label>
                  Tank Number
                  <input
                    type="number"
                    name="TankNumber"
                    value={editing.TankNumber ?? ""}
                    onChange={handleEditChange}
                    required
                    min="1"
                    max="8"
                  />
                </label>
                <label>
                  Average Weight
                  <input
                    type="number"
                    step="0.01"
                    name="AverageWeight"
                    value={editing.AverageWeight ?? ""}
                    onChange={handleEditChange}
                    required
                    min="0"
                  />
                </label>
                <label>
                  Purchase Price
                  <input
                    type="number"
                    step="0.01"
                    name="PurchasePrice"
                    value={editing.PurchasePrice ?? ""}
                    onChange={handleEditChange}
                    required
                    min="0"
                  />
                </label>
                <label>
                  Price Per Couple
                  <input
                    type="number"
                    step="0.01"
                    name="PricePerCouple"
                    value={editing.PricePerCouple ?? ""}
                    onChange={handleEditChange}
                    required
                    min="0"
                  />
                </label>
                <label>
                  Image URL
                  <input
                    name="photo"
                    value={editing.photo || ""}
                    onChange={handleEditChange}
                  />
                </label>
                <label>
                  Extra Image URL
                  <input
                    name="extraPhoto"
                    value={editing.extraPhoto || ""}
                    onChange={handleEditChange}
                  />
                </label>
              </div>

              <div className="S_VF_modal-actions">
                <button type="button" className="S_VF_btn secondary" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="S_VF_btn">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}