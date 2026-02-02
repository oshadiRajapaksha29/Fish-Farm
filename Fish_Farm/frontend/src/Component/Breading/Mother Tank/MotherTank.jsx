//frontend/src/Component/Breading/Mother Tank/MotherTank.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MotherTank.css";

const API_URL = "http://localhost:5000";

const MotherTank = () => {
  // Form state
  const [formData, setFormData] = useState({
    fishType: "",
    MotherCount: "",
    FatherCount: "",
    BreedingDate: "",
    tankId: "",
    Description: ""
  });

  // UI state
  const [breedingTanks, setBreedingTanks] = useState([]);
  const [existingBreedingRecords, setExistingBreedingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both tanks and existing breeding records simultaneously
      const [tanksResponse, breedingResponse] = await Promise.all([
        axios.get(`${API_URL}/tanksNew`),
        axios.get(`${API_URL}/breeding`)
      ]);

      const tanksData = tanksResponse.data.tanks || tanksResponse.data || [];
      const breedingData = breedingResponse.data.breedingRecords || breedingResponse.data || [];

      setExistingBreedingRecords(breedingData);
      
      // Filter only available breeding tanks (not in use)
      const availableBreedingTanks = getAvailableBreedingTanks(tanksData, breedingData);
      
      setBreedingTanks(availableBreedingTanks);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBreedingTanks = (tanks, breedingRecords) => {
    // Get tank IDs that are currently in use for breeding
    const inUseTankIds = new Set(breedingRecords.map(record => record.tankId));
    
    // Filter breeding tanks that are not in use
    const availableTanks = tanks.filter(tank => 
      tank.TankLocation === "Breeding tanks" && 
      !inUseTankIds.has(tank._id)
    );
    
    console.log("Available breeding tanks:", availableTanks);
    console.log("In-use tank IDs:", Array.from(inUseTankIds));
    
    return availableTanks;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTankSelect = (tankId) => {
    setFormData(prev => ({
      ...prev,
      tankId: tankId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.tankId) {
      alert("Please select a breeding tank");
      return;
    }

    // Check if selected tank is still available
    const isTankAvailable = breedingTanks.some(tank => tank._id === formData.tankId);
    if (!isTankAvailable) {
      alert("The selected tank is no longer available. Please refresh and select another tank.");
      fetchData(); // Refresh data
      return;
    }

    if (!formData.fishType || !formData.MotherCount || !formData.FatherCount || !formData.BreedingDate) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      fishType: formData.fishType,
      MotherCount: parseInt(formData.MotherCount),
      FatherCount: parseInt(formData.FatherCount),
      BreedingDate: formData.BreedingDate,
      tankId: formData.tankId,
      Description: formData.Description
    };

    console.log("Submitting breeding record:", payload);

    try {
      setSubmitting(true);
      
      const response = await axios.post(`${API_URL}/breeding`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      
      console.log("Breeding record added successfully:", response.data);
      
      alert("Breeding record added successfully!");
      
      // Reset form and refresh data to update available tanks
      setFormData({
        fishType: "",
        MotherCount: "",
        FatherCount: "",
        BreedingDate: "",
        tankId: "",
        Description: ""
      });
      
      // Refresh data to update available tanks list
      fetchData();
      
    } catch (err) {
      console.error("Full error object:", err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.statusText || 
                          err.message || 
                          "Unknown error occurred";
      
      alert(`Failed to add breeding record: ${errorMessage} (Status: ${err.response?.status})`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fishType: "",
      MotherCount: "",
      FatherCount: "",
      BreedingDate: "",
      tankId: "",
      Description: ""
    });
  };

  const preventInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  const getSelectedTank = () => {
    return breedingTanks.find(tank => tank._id === formData.tankId);
  };

  if (loading) {
    return (
      <div className="mother-tank-container">
        <div className="loading">Loading available breeding tanks...</div>
      </div>
    );
  }

  return (
    <div className="mother-tank-container">
     
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="breeding-form">
         <h1 className="mother-tank-title">Add Mother Fish</h1>
        {/* Tank Selection Section */}
        <div className="form-section">
          <h2>1. Select Available Breeding Tank</h2>
          <p className="section-description">
            Only breeding tanks that are not currently in use are shown below
          </p>
          
          {breedingTanks.length === 0 ? (
            <div className="no-tanks-message">
              <h3>No Available Breeding Tanks</h3>
              <p>All breeding tanks are currently in use. Please wait for existing breeding cycles to complete or add more breeding tanks.</p>
              <div className="tank-status-info">
                <p><strong>Total Breeding Tanks:</strong> {existingBreedingRecords.length} in use</p>
              </div>
            </div>
          ) : (
            <>
              <div className="availability-info">
                <p><strong>{breedingTanks.length}</strong> breeding tank(s) available out of <strong>{existingBreedingRecords.length + breedingTanks.length}</strong> total breeding tanks</p>
              </div>
              
              <div className="tanks-grid">
                {breedingTanks.map((tank) => (
                  <div
                    key={tank._id}
                    className={`tank-card ${
                      formData.tankId === tank._id ? "selected" : ""
                    }`}
                    onClick={() => handleTankSelect(tank._id)}
                  >
                    <div className="tank-header">
                      <h3 className="tank-code">{tank.TankCode}</h3>
                      <span className="tank-type">{tank.TankType}</span>
                    </div>
                    
                    <div className="tank-details">
                      <div className="tank-detail">
                        <span className="label">Size:</span>
                        <span className="value">
                          {tank.Length}m × {tank.Width}m × {tank.Height}m
                        </span>
                      </div>
                      
                      <div className="tank-detail">
                        <span className="label">Valves:</span>
                        <span className="value">
                          In: {tank.InletValves} | Out: {tank.OutletValves}
                        </span>
                      </div>
                      
                      {tank.Description && (
                        <div className="tank-detail">
                          <span className="label">Description:</span>
                          <span className="value description">{tank.Description}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="tank-status available">
                      Available
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {formData.tankId && (
            <div className="selected-tank-info">
              <strong>Selected Tank:</strong> {getSelectedTank()?.TankCode}
              <span className="tank-confirmation"> ✓ Ready for breeding</span>
            </div>
          )}
        </div>

        {/* Breeding Details Section */}
        <div className="form-section">
          <h2>2. Breeding Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fishType">Fish Type *</label>
              <select
                id="fishType"
                name="fishType"
                value={formData.fishType}
                onChange={handleInputChange}
                required
                disabled={!formData.tankId}
              >
                <option value="">-- Select Fish Type --</option>
                <option value="Guppy">Guppy</option>
                <option value="Goldfish">Goldfish</option>
                <option value="Betta">Betta</option>
                <option value="Angelfish">Angelfish</option>
                <option value="Molly">Molly</option>
                <option value="Platy">Platy</option>
                <option value="Swordtail">Swordtail</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="BreedingDate">Breeding Date *</label>
              <input
                type="date"
                id="BreedingDate"
                name="BreedingDate"
                value={formData.BreedingDate}
                onChange={handleInputChange}
                required
                disabled={!formData.tankId}
                max={new Date().toISOString().split('T')[0]} // Cannot select future dates
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="MotherCount">Number of Mothers *</label>
              <input
                type="number"
                id="MotherCount"
                name="MotherCount"
                value={formData.MotherCount}
                onChange={handleInputChange}
                min="1"
                step="1"
                onKeyDown={preventInvalidNumberKeys}
                required
                disabled={!formData.tankId}
              />
            </div>

            <div className="form-group">
              <label htmlFor="FatherCount">Number of Fathers *</label>
              <input
                type="number"
                id="FatherCount"
                name="FatherCount"
                value={formData.FatherCount}
                onChange={handleInputChange}
                min="1"
                step="1"
                onKeyDown={preventInvalidNumberKeys}
                required
                disabled={!formData.tankId}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="Description">Description / Notes</label>
            <textarea
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Additional notes about this breeding record..."
              disabled={!formData.tankId}
            />
          </div>
        </div>

        {/* Form Summary */}
        <div className="form-summary">
          <h3>Summary</h3>
          <div className="summary-content">
            <p><strong>Selected Tank:</strong> {getSelectedTank()?.TankCode || "None"}</p>
            <p><strong>Fish Type:</strong> {formData.fishType || "Not selected"}</p>
            <p><strong>Breeding Date:</strong> {formData.BreedingDate || "Not set"}</p>
            <p><strong>Parents:</strong> {formData.MotherCount || "0"} Mothers, {formData.FatherCount || "0"} Fathers</p>
            <p><strong>Status:</strong> {formData.tankId ? "Ready to submit" : "Select a tank to continue"}</p>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || !formData.tankId}
          >
            {submitting ? "Adding Breeding Record..." : "Add Breeding Record"}
          </button>
          
          <button 
            type="button" 
            className="reset-btn"
            onClick={handleReset}
            disabled={submitting}
          >
            Reset Form
          </button>

          <button 
            type="button" 
            className="refresh-btn"
            onClick={fetchData}
            disabled={submitting}
          >
            Refresh Availability
          </button>
        </div>
      </form>
    </div>
  );
};

export default MotherTank;