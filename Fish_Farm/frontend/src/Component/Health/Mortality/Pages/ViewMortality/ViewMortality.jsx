import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./ViewMortality.css";

const API_BASE = "http://localhost:5000";
const ENDPOINT = `${API_BASE}/mortality/`;

export default function ViewMortality() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const pick = (obj, key, fallback = "") => {
    if (!obj) return fallback;
    const variants = [
      key,
      key.toLowerCase(),
      key.charAt(0).toUpperCase() + key.slice(1),
      key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`),
      key.replace(/_/g, "").toLowerCase(),
    ];
    for (const k of variants) {
      if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return fallback;
  };

  const normalize = (r) => ({
    _id: r._id || r.id,
    Species: pick(r, "Species"),
    subSpecies: pick(r, "subSpecies"),
    TankNumber: Number(pick(r, "TankNumber", 0)),
    DateOfDeath: pick(r, "DateOfDeath"),
    QuantityDied: Number(pick(r, "QuantityDied", 0)),
    CauseOfDeath: pick(r, "CauseOfDeath"),
    Notes: pick(r, "Notes", ""),
  });

  const unwrapList = (data) => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    const candidates = ["mortality","Mortality","records","data","items","list","result","results"];
    for (const k of candidates) if (Array.isArray(data[k])) return data[k];
    return [];
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ENDPOINT);
      const list = unwrapList(res.data).map(normalize);
      setItems(list);
    } catch (err) {
      console.error("Fetch mortality error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (_id) => {
    if (!window.confirm("Delete this mortality record?")) return;
    try {
      await axios.delete(`${ENDPOINT}${_id}`);
      setItems((prev) => prev.filter((r) => r._id !== _id));
    } catch (err) {
      console.error("Delete mortality error:", err);
      alert("Failed to delete. Check console for details.");
    }
  };

  const startEdit = (rec) => setEditing({ ...rec });
  const cancelEdit = () => setEditing(null);

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditing((p) => ({
      ...p,
      [name]: ["TankNumber", "QuantityDied"].includes(name)
        ? value === "" ? "" : Number(value)
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
        TankNumber: Number(editing.TankNumber),
        DateOfDeath: editing.DateOfDeath,
        QuantityDied: Number(editing.QuantityDied),
        CauseOfDeath: editing.CauseOfDeath,
        Notes: editing.Notes || "",
      };
      const res = await axios.put(`${ENDPOINT}${editing._id}`, payload);
      const updated = normalize(res.data || {});
      setItems((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setEditing(null);
    } catch (err) {
      console.error("Update mortality error:", err);
      alert("Failed to update. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((rec) =>
    rec.Species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.subSpecies.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="S_VM_container">
      <h1 className="S_VM_page-title">Mortality Reports</h1>

      {/* Search Bar */}
      <div className="S_VM_search-bar">
        <input
          type="text"
          placeholder="Search by Species or Sub Species..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="S_VM_list">
        {loading ? (
          <div className="S_VM_loading">Loading mortality...</div>
        ) : filteredItems.length === 0 ? (
          <div className="S_VM_empty">No mortality records found.</div>
        ) : (
          filteredItems.map((rec) => (
            <article className="S_VM_card" key={rec._id}>
              <header className="S_VM_top">
                <div className="S_VM_title">
                  <span className="S_VM_tank">Tank {rec.TankNumber}</span>{" "}
                  <span className="S_VM_sub">{rec.subSpecies}</span>{" "}
                  <span className="S_VM_species">({rec.Species})</span>
                </div>
                <time className="S_VM_date">
                  {rec.DateOfDeath ? new Date(rec.DateOfDeath).toLocaleDateString() : "-"}
                </time>
              </header>

              <section className="S_VM_section">
                <h3>Summary:</h3>
                <p className="S_VM_summary">
                  <strong>Quantity Died:</strong> {rec.QuantityDied} &nbsp;|&nbsp;
                  <strong> Cause:</strong> {rec.CauseOfDeath}
                </p>
              </section>

              {rec.Notes && (
                <section className="S_VM_section">
                  <h3>Notes:</h3>
                  <div className="S_VM_notes">{rec.Notes}</div>
                </section>
              )}

              <footer className="S_VM_actions">
                <button className="S_VM_btn secondary" onClick={() => startEdit(rec)}>
                  Edit
                </button>
                <button className="S_VM_btn danger" onClick={() => handleDelete(rec._id)}>
                  Delete
                </button>
              </footer>
            </article>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="S_VM_backdrop" onClick={cancelEdit}>
          <div className="S_VM_modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Mortality</h3>
            <form onSubmit={handleSave} className="S_VM_form">
              <div className="grid">
                <label>
                  Species
                  <input name="Species" value={editing.Species || ""} onChange={onEditChange} required />
                </label>
                <label>
                  Sub Species
                  <input name="subSpecies" value={editing.subSpecies || ""} onChange={onEditChange} required />
                </label>
                <label>
                  Tank Number
                  <input type="number" name="TankNumber" value={editing.TankNumber ?? ""} onChange={onEditChange} required />
                </label>
                <label>
                  Date Of Death
                  <input type="date" name="DateOfDeath" value={editing.DateOfDeath ? new Date(editing.DateOfDeath).toISOString().slice(0,10) : ""} onChange={onEditChange} required />
                </label>
                <label>
                  Quantity Died
                  <input type="number" name="QuantityDied" value={editing.QuantityDied ?? ""} onChange={onEditChange} required />
                </label>
                <label>
                  Cause Of Death
                  <input name="CauseOfDeath" value={editing.CauseOfDeath || ""} onChange={onEditChange} required />
                </label>
                <label className="S_VM_col-span-2">
                  Notes
                  <textarea name="Notes" rows={3} value={editing.Notes || ""} onChange={onEditChange} />
                </label>
              </div>

              <div className="S_VM_modal-actions">
                <button type="button" className="S_VM_btn secondary" onClick={cancelEdit}>Cancel</button>
                <button type="submit" className="S_VM_btn primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
