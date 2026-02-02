// Component/Tank/Pages/AddTanks/UpdateAllTank.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllTankAdd.css";

const API_URL = "http://localhost:5000/tanksNew";

const UpdateAllTank = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    tankType: "",
    tankLocation: "",
    tankCode: "",
    height: "",
    width: "",
    length: "",
    inletValves: "",
    outletValves: "",
    description: "",
  });

  useEffect(() => {
    const fetchTank = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        const t = res?.data?.tank || {};

        // Accept either PascalCase or camelCase from backend
        setInputs({
          tankType: t.TankType ?? t.tankType ?? "",
          tankLocation: t.TankLocation ?? t.tankLocation ?? "",
          tankCode: t.TankCode ?? t.tankCode ?? "",
          height: String(t.Height ?? t.height ?? ""),
          width: String(t.Width ?? t.width ?? ""),
          length: String(t.Length ?? t.length ?? ""),
          inletValves: String(t.InletValves ?? t.inletValves ?? ""),
          outletValves: String(t.OutletValves ?? t.outletValves ?? ""),
          description: t.Description ?? t.description ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch tank:", err);
        alert("Failed to fetch tank details.");
      }
    };
    fetchTank();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const preventInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };
  const preventInvalidPaste = (e) => {
    const paste = e.clipboardData.getData("text");
    if (/[eE+\-]/.test(paste)) e.preventDefault();
  };
  const preventWheelChange = (e) => e.currentTarget.blur();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        // ✅ send PascalCase keys to match listing/backend
        TankType: inputs.tankType,
        TankLocation: inputs.tankLocation,
        TankCode: inputs.tankCode,
        Height: Number(inputs.height),
        Width: Number(inputs.width),
        Length: Number(inputs.length),
        InletValves: Number(inputs.inletValves),
        OutletValves: Number(inputs.outletValves),
        Description: inputs.description,
      };

      await axios.put(`${API_URL}/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Tank updated successfully!");
      navigate("/dashboard/tank/view-details"); // ✅ correct path
    } catch (err) {
      console.error("Failed to update tank:", err);
      alert("Failed to update tank.");
    }
  };

  const handleReset = () => {
    setInputs({
      tankType: "",
      tankLocation: "",
      tankCode: "",
      height: "",
      width: "",
      length: "",
      inletValves: "",
      outletValves: "",
      description: "",
    });
  };

  return (
    <div className="ANA-container">
      <h1>Update Tank</h1>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="ANA-section">
          <h2>Basic Information</h2>
          <label>Tank Type</label>
          <select
            name="tankType"
            value={inputs.tankType}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="Mud Puddles">Mud Puddles</option>
            <option value="Glass Tank">Glass Tank</option>
            <option value="CementTank">CementTank</option>
          </select>
        </div>

        {/* Location + Code */}
        <div className="ANA-section">
          <h2>Location & Code</h2>
          <label>Tank Location</label>
          <select
            name="tankLocation"
            value={inputs.tankLocation}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="North Field">North Field</option>
            <option value="South Field">South Field</option>
            <option value="Irrigation Station">Irrigation Station</option>
            <option value="Barn Side">Barn Side</option>
            <option value="Greenhouse Area">Greenhouse Area</option>
          </select>

          <label>Tank Code</label>
          <input
            type="text"
            name="tankCode"
            value={inputs.tankCode}
            onChange={handleChange}
            placeholder="Ex. TNK-A12"
            required
          />
        </div>

        {/* Size */}
        <div className="ANA-section">
          <h2>Tank Size (meters)</h2>
          <div className="ANA-row">
            <div>
              <label>Height (m)</label>
              <input
                type="number"
                name="height"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={inputs.height}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberKeys}
                onPaste={preventInvalidPaste}
                onWheel={preventWheelChange}
                required
              />
            </div>
            <div>
              <label>Width (m)</label>
              <input
                type="number"
                name="width"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={inputs.width}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberKeys}
                onPaste={preventInvalidPaste}
                onWheel={preventWheelChange}
                required
              />
            </div>
            <div>
              <label>Length (m)</label>
              <input
                type="number"
                name="length"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={inputs.length}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberKeys}
                onPaste={preventInvalidPaste}
                onWheel={preventWheelChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Valves */}
        <div className="ANA-section">
          <h2>Water Valves</h2>
          <div className="ANA-row">
            <div>
              <label>Inlet Valves</label>
              <input
                type="number"
                name="inletValves"
                min="0"
                step="1"
                inputMode="numeric"
                value={inputs.inletValves}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberKeys}
                onPaste={preventInvalidPaste}
                onWheel={preventWheelChange}
                required
              />
            </div>
            <div>
              <label>Outlet Valves</label>
              <input
                type="number"
                name="outletValves"
                min="0"
                step="1"
                inputMode="numeric"
                value={inputs.outletValves}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberKeys}
                onPaste={preventInvalidPaste}
                onWheel={preventWheelChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="ANA-section">
          <h2>Description</h2>
          <textarea
            name="description"
            value={inputs.description}
            onChange={handleChange}
            rows="4"
            placeholder="Short description of the tank..."
            required
          />
        </div>

        {/* Buttons */}
        <div className="ANA-buttons">
          <button type="submit" className="ANA-submit">Update Tank</button>
          <button type="button" className="ANA-reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAllTank;
