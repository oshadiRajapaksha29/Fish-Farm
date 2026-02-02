import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllTankAdd.css";

const API_URL = "http://localhost:5000";
const NEXT_PATH = "/dashboard/tank/view-live";

const AllTankAdd = () => {
  const navigate = useNavigate();

  // State for form inputs
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
    specialWaterRequirement: false
  });

  const [submitting, setSubmitting] = useState(false);

  // Prevent invalid characters in number inputs
  const preventInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  // Prevent invalid paste in number inputs
  const preventInvalidPaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (/[eE+\-]/.test(text)) e.preventDefault();
  };

  // Prevent number change on scroll wheel
  const preventWheelChange = (e) => e.currentTarget.blur();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload for API
    const payload = {
      TankType: inputs.tankType,
      TankLocation: inputs.tankLocation,
      TankCode: inputs.tankCode,
      Height: Number(inputs.height),
      Width: Number(inputs.width),
      Length: Number(inputs.length),
      InletValves: Number(inputs.inletValves),
      OutletValves: Number(inputs.outletValves),
      Description: inputs.description,
      SpecialWaterRequirement: inputs.specialWaterRequirement
    };

    // Validate all fields
    for (const [k, v] of Object.entries(payload)) {
      if (v === "" || v === null || (typeof v === "number" && Number.isNaN(v))) {
        alert(`Please provide a valid value for ${k}.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      // Send POST request to create new tank
      await axios.post(`${API_URL}/tanksNew`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Tank added successfully!");
      navigate(NEXT_PATH); // Redirect to tank view page
    } catch (err) {
      console.error("Error adding tank:", err?.response?.data || err.message);
      alert(
        `Failed to add tank${
          err?.response?.data?.message ? `: ${err.response.data.message}` : "."
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to initial state
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
      specialWaterRequirement: false
    });
  };

  // Check if special fish tank is selected
  const isSpecialTank = inputs.tankType === "Special Fish Tank";

  return (
    <div className="TA-page-container">
      {/* Header Section */}
      <div className="TA-header">
        <h1>🏗️ Add New Tank</h1>
        <p>Create a new tank configuration for your water management system</p>
      </div>

      <div className="TA-two-column-layout">
        {/* Left Column - Form */}
        <div className="TA-form-column">
          <form onSubmit={handleSubmit} className="TA-form">
            
            {/* Basic Information Section */}
            <div className="TA-form-section">
              <h2>📋 Basic Information</h2>
              <div className="TA-form-group">
                <label>Tank Type *</label>
                <select
                  name="tankType"
                  value={inputs.tankType}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Tank Type --</option>
                  <option value="Mud Puddles">Mud Puddles</option>
                  <option value="Glass Tank">Glass Tank</option>
                  <option value="CementTank">Cement Tank</option>
                  <option value="Special Fish Tank">Special Fish Tank</option>
                </select>
              </div>

              <div className="TA-form-group">
                <label>Tank Location *</label>
                <select
                  name="tankLocation"
                  value={inputs.tankLocation}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Location --</option>
                  <option value="Baby Tank">Baby Tank</option>
                  <option value="Breeding tanks">Breeding Tanks</option>
                  <option value="Normal Tank">Normal Tank</option>
                  <option value="Special Care Tank">Special Care Tank</option>
                </select>
              </div>

              <div className="TA-form-group">
                <label>Tank Code *</label>
                <input
                  type="text"
                  name="tankCode"
                  value={inputs.tankCode}
                  onChange={handleChange}
                  placeholder="Enter unique tank code (e.g., TNK-A12)"
                  required
                />
              </div>
            </div>

            {/* Tank Dimensions Section */}
            <div className="TA-form-section">
              <h2>📏 Tank Dimensions (meters)</h2>
              <div className="TA-dimensions-grid">
                <div className="TA-form-group">
                  <label>Height (m) *</label>
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
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="TA-form-group">
                  <label>Width (m) *</label>
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
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="TA-form-group">
                  <label>Length (m) *</label>
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
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Water Valves Section */}
            <div className="TA-form-section">
              <h2>🚰 Water Valves</h2>
              <div className="TA-valves-grid">
                <div className="TA-form-group">
                  <label>Inlet Valves *</label>
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
                    placeholder="0"
                    required
                  />
                </div>
                <div className="TA-form-group">
                  <label>Outlet Valves *</label>
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
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Special Requirements Section */}
            <div className="TA-form-section">
              <h2>⚡ Special Requirements</h2>
              <div className="TA-checkbox-group">
                <label className="TA-checkbox-label">
                  <input
                    type="checkbox"
                    name="specialWaterRequirement"
                    checked={inputs.specialWaterRequirement}
                    onChange={handleChange}
                  />
                  <span className="TA-checkbox-custom"></span>
                  Enable special water requirements
                </label>
                <small>2cm water level = 100% full capacity</small>
              </div>
            </div>

            {/* Description Section */}
            <div className="TA-form-section">
              <h2>📝 Description</h2>
              <div className="TA-form-group">
                <textarea
                  name="description"
                  value={inputs.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter tank description, special notes, or maintenance instructions..."
                  className="TA-textarea"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="TA-action-buttons">
              <button 
                type="submit" 
                className="TA-btn TA-btn-primary" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="TA-spinner"></span>
                    Adding Tank...
                  </>
                ) : (
                  "✅ Add Tank"
                )}
              </button>
              <button
                type="button"
                className="TA-btn TA-btn-secondary"
                onClick={handleReset}
                disabled={submitting}
              >
                🔄 Reset Form
              </button>
              <button
                type="button"
                className="TA-btn TA-btn-outline"
                onClick={() => navigate(NEXT_PATH)}
              >
                ← Back to Dashboard
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Information & Preview */}
        <div className="TA-info-column">
          {/* Special Tank Notice */}
          {isSpecialTank && (
            <div className="TA-info-card TA-special-notice">
              <div className="TA-info-header">
                <span className="TA-info-icon">🎯</span>
                <h3>Special Tank Configuration</h3>
              </div>
              <div className="TA-info-content">
                <p><strong>This tank requires special setup:</strong></p>
                <ul>
                  <li>✅ Total tank height: 8.2cm</li>
                  <li>✅ Required water level: 2cm</li>
                  <li>✅ 2cm water = 100% full capacity</li>
                  <li>⚠️ Below 1cm: Red LED warning</li>
                  <li>🚨 Above 3cm: Overflow warning</li>
                </ul>
              </div>
            </div>
          )}

          {/* Special Requirements Info */}
          {inputs.specialWaterRequirement && (
            <div className="TA-info-card TA-requirements-info">
              <div className="TA-info-header">
                <span className="TA-info-icon">🔧</span>
                <h3>Active Special Requirements</h3>
              </div>
              <div className="TA-info-content">
                <p><strong>Current Configuration:</strong></p>
                <div className="TA-config-list">
                  <div className="TA-config-item">
                    <span className="TA-config-label">Water Level Range:</span>
                    <span className="TA-config-value">1cm - 3cm</span>
                  </div>
                  <div className="TA-config-item">
                    <span className="TA-config-label">Optimal Level:</span>
                    <span className="TA-config-value">2cm (100%)</span>
                  </div>
                  <div className="TA-config-item">
                    <span className="TA-config-label">Warning Threshold:</span>
                    <span className="TA-config-value">Below 1cm</span>
                  </div>
                  <div className="TA-config-item">
                    <span className="TA-config-label">Danger Threshold:</span>
                    <span className="TA-config-value">Above 3cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tank Preview */}
          <div className="TA-info-card TA-preview-card">
            <div className="TA-info-header">
              <span className="TA-info-icon">👁️</span>
              <h3>Tank Preview</h3>
            </div>
            <div className="TA-info-content">
              <div className="TA-preview-details">
                <div className="TA-preview-item">
                  <span className="TA-preview-label">Tank Type:</span>
                  <span className="TA-preview-value">{inputs.tankType || "Not set"}</span>
                </div>
                <div className="TA-preview-item">
                  <span className="TA-preview-label">Location:</span>
                  <span className="TA-preview-value">{inputs.tankLocation || "Not set"}</span>
                </div>
                <div className="TA-preview-item">
                  <span className="TA-preview-label">Code:</span>
                  <span className="TA-preview-value">{inputs.tankCode || "Not set"}</span>
                </div>
                <div className="TA-preview-item">
                  <span className="TA-preview-label">Dimensions:</span>
                  <span className="TA-preview-value">
                    {inputs.length && inputs.width && inputs.height 
                      ? `${inputs.length}m × ${inputs.width}m × ${inputs.height}m`
                      : "Not set"
                    }
                  </span>
                </div>
                <div className="TA-preview-item">
                  <span className="TA-preview-label">Valves:</span>
                  <span className="TA-preview-value">
                    {inputs.inletValves || inputs.outletValves 
                      ? `In: ${inputs.inletValves}, Out: ${inputs.outletValves}`
                      : "Not set"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Information */}
          <div className="TA-info-card TA-help-card">
            <div className="TA-info-header">
              <span className="TA-info-icon">💡</span>
              <h3>Quick Tips</h3>
            </div>
            <div className="TA-info-content">
              <ul>
                <li>Ensure tank code is unique across all tanks</li>
                <li>Double-check dimensions for accuracy</li>
                <li>Special fish tanks require precise water levels</li>
                <li>Contact support for complex configurations</li>
              </ul>
            </div>
          </div>

          {/* Volume Calculator */}
          {(inputs.length && inputs.width && inputs.height) && (
            <div className="TA-info-card TA-volume-card">
              <div className="TA-info-header">
                <span className="TA-info-icon">📊</span>
                <h3>Volume Calculation</h3>
              </div>
              <div className="TA-info-content">
                <div className="TA-volume-result">
                  <span className="TA-volume-label">Total Volume:</span>
                  <span className="TA-volume-value">
                    {(parseFloat(inputs.length) * parseFloat(inputs.width) * parseFloat(inputs.height)).toFixed(2)} m³
                  </span>
                </div>
                <div className="TA-volume-equivalent">
                  <small>≈ {((parseFloat(inputs.length) * parseFloat(inputs.width) * parseFloat(inputs.height)) * 1000).toFixed(0)} liters</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTankAdd;