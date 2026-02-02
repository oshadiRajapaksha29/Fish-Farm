//frontend/src/Component/Breading/Baby Tank/AddBabyTank.jsx 
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddBabyTank.css";

const API_URL = "http://localhost:5000";

const AddBabyTank = () => {
  // Form state
  const [formData, setFormData] = useState({
    BabyTankID: "",
    BabyCount: "",
    BirthDate: "",
    BreedingID: "",
    Description: ""
  });

  // UI state
  const [babyTanks, setBabyTanks] = useState([]);
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [existingBabyRecords, setExistingBabyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Starting to fetch data...");
      
      // Test each endpoint individually to find which one fails
      let tanksData = [];
      let breedingData = [];
      let babyData = [];

      try {
        console.log("Fetching tanks...");
        const tanksResponse = await axios.get(`${API_URL}/tanksNew`);
        tanksData = tanksResponse.data.tanks || tanksResponse.data || [];
        console.log("Tanks fetched successfully:", tanksData.length);
      } catch (tanksError) {
        console.error("Error fetching tanks:", tanksError);
        throw new Error(`Tanks: ${tanksError.message}`);
      }

      try {
        console.log("Fetching breeding records...");
        const breedingResponse = await axios.get(`${API_URL}/breeding`);
        breedingData = breedingResponse.data.breedingRecords || breedingResponse.data || [];
        console.log("Breeding records fetched successfully:", breedingData.length);
      } catch (breedingError) {
        console.error("Error fetching breeding records:", breedingError);
        throw new Error(`Breeding: ${breedingError.message}`);
      }

      try {
        console.log("Fetching baby records...");
        const babyResponse = await axios.get(`${API_URL}/babies`);
        babyData = babyResponse.data.babyRecords || babyResponse.data || [];
        console.log("Baby records fetched successfully:", babyData.length);
      } catch (babyError) {
        console.error("Error fetching baby records:", babyError);
        // Don't throw error for babies as it might not exist yet
        console.log("Baby endpoint might not be set up yet, continuing...");
      }

      setExistingBabyRecords(babyData);
      setBreedingRecords(breedingData);
      
      // Filter only available baby tanks (not in use)
      const availableBabyTanks = getAvailableBabyTanks(tanksData, babyData);
      
      setBabyTanks(availableBabyTanks);
      console.log("Data fetch completed successfully");
      
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBabyTanks = (tanks, babyRecords) => {
    // Get tank IDs that are currently in use for babies
    const inUseTankIds = new Set(babyRecords.map(record => record.BabyTankID));
    
    // Filter baby tanks that are not in use
    const availableTanks = tanks.filter(tank => 
      tank.TankLocation === "Baby Tank" && 
      !inUseTankIds.has(tank._id)
    );
    
    console.log("Available baby tanks:", availableTanks);
    console.log("In-use baby tank IDs:", Array.from(inUseTankIds));
    
    return availableTanks;
  };

  const getBreedingRecordInfo = (breedingId) => {
    const record = breedingRecords.find(record => record._id === breedingId);
    return record || { fishType: "Unknown", BreedingDate: "N/A" };
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
      BabyTankID: tankId
    }));
  };

  const handleBreedingSelect = (breedingId) => {
    setFormData(prev => ({
      ...prev,
      BreedingID: breedingId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.BabyTankID) {
      alert("Please select a baby tank");
      return;
    }

    if (!formData.BreedingID) {
      alert("Please select a breeding record");
      return;
    }

    // Check if selected tank is still available
    const isTankAvailable = babyTanks.some(tank => tank._id === formData.BabyTankID);
    if (!isTankAvailable) {
      alert("The selected tank is no longer available. Please refresh and select another tank.");
      fetchData(); // Refresh data
      return;
    }

    if (!formData.BabyCount || !formData.BirthDate) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      BabyTankID: formData.BabyTankID,
      BabyCount: parseInt(formData.BabyCount),
      BirthDate: formData.BirthDate,
      BreedingID: formData.BreedingID,
      Description: formData.Description
    };

    console.log("Submitting baby record:", payload);

    try {
      setSubmitting(true);
      
      const response = await axios.post(`${API_URL}/babies`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      
      console.log("Baby record added successfully:", response.data);
      
      alert("Baby record added successfully!");
      
      // Reset form and refresh data to update available tanks
      setFormData({
        BabyTankID: "",
        BabyCount: "",
        BirthDate: "",
        BreedingID: "",
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
      
      alert(`Failed to add baby record: ${errorMessage} (Status: ${err.response?.status})`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      BabyTankID: "",
      BabyCount: "",
      BirthDate: "",
      BreedingID: "",
      Description: ""
    });
  };

  const preventInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  const getSelectedTank = () => {
    return babyTanks.find(tank => tank._id === formData.BabyTankID);
  };

  const getSelectedBreeding = () => {
    return breedingRecords.find(record => record._id === formData.BreedingID);
  };

  // Test API connection on component mount
  useEffect(() => {
    testAPIEndpoints();
  }, []);

  const testAPIEndpoints = async () => {
    console.log("Testing API endpoints...");
    
    const endpoints = [
      { name: 'tanksNew', url: `${API_URL}/tanksNew` },
      { name: 'breeding', url: `${API_URL}/breeding` },
      { name: 'babies', url: `${API_URL}/babies` }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.url);
        console.log(`✅ ${endpoint.name}:`, response.status, response.data ? 'Data received' : 'No data');
      } catch (err) {
        console.error(`❌ ${endpoint.name}:`, err.response?.status, err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="add-baby-tank-container">
        <div className="loading">
          <div>Loading available baby tanks and breeding records...</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            Checking: Tanks ✅ Breeding ✅ Babies ✅
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-baby-tank-container">
      
      
      {error && (
        <div className="error-message">
          <div style={{ marginBottom: '10px' }}>
            <strong>Error Details:</strong> {error}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            Check browser console for detailed error information
          </div>
          <button onClick={fetchData} className="retry-btn">
            Retry Loading Data
          </button>
          <button 
            onClick={testAPIEndpoints} 
            className="retry-btn"
            style={{ marginLeft: '10px', background: '#6c757d' }}
          >
            Test API Endpoints
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="baby-tank-form">
        <h1 className="add-baby-tank-title">Add Baby Fish Record</h1>
        {/* Tank Selection Section */}
        <div className="form-section">
          <h2>1. Select Baby Tank</h2>
          <p className="section-description">
            Only baby tanks that are not currently in use are shown below
          </p>
          
          {babyTanks.length === 0 ? (
            <div className="no-tanks-message">
              <h3>No Available Baby Tanks</h3>
              <p>All baby tanks are currently in use or no baby tanks found with "Baby Tank" location.</p>
              <div className="tank-status-info">
                <p><strong>Found Tanks:</strong> {babyTanks.length} available</p>
                <p><strong>Total Baby Records:</strong> {existingBabyRecords.length} in system</p>
              </div>
            </div>
          ) : (
            <>
              <div className="availability-info">
                <p><strong>{babyTanks.length}</strong> baby tank(s) available</p>
              </div>
              
              <div className="tanks-grid">
                {babyTanks.map((tank) => (
                  <div
                    key={tank._id}
                    className={`tank-card ${
                      formData.BabyTankID === tank._id ? "selected" : ""
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
                      
                      <div className="tank-detail">
                        <span className="label">Location:</span>
                        <span className="value">{tank.TankLocation}</span>
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

          {formData.BabyTankID && (
            <div className="selected-tank-info">
              <strong>Selected Tank:</strong> {getSelectedTank()?.TankCode}
              <span className="tank-confirmation"> ✓ Ready for baby fish</span>
            </div>
          )}
        </div>

        {/* Breeding Record Selection */}
        <div className="form-section">
          <h2>2. Select Breeding Record</h2>
          <p className="section-description">
            Choose the breeding record that produced these baby fish
          </p>
          
          {breedingRecords.length === 0 ? (
            <div className="no-records-message">
              <h3>No Breeding Records Available</h3>
              <p>No breeding records found. Please add breeding records first.</p>
              <div className="tank-status-info">
                <p><strong>API Status:</strong> Breeding endpoint is accessible</p>
                <p><strong>Records Found:</strong> {breedingRecords.length}</p>
              </div>
            </div>
          ) : (
            <div className="breeding-records-grid">
              {breedingRecords.map((record) => {
                return (
                  <div
                    key={record._id}
                    className={`breeding-record-card ${
                      formData.BreedingID === record._id ? "selected" : ""
                    }`}
                    onClick={() => handleBreedingSelect(record._id)}
                  >
                    <div className="breeding-header">
                      <h3 className="fish-type">{record.fishType}</h3>
                      <span className="breeding-date">
                        {new Date(record.BreedingDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="breeding-details">
                      <div className="breeding-detail">
                        <span className="label">Parents:</span>
                        <span className="value">
                          {record.MotherCount}♀ {record.FatherCount}♂
                        </span>
                      </div>
                      
                      <div className="breeding-detail">
                        <span className="label">Tank:</span>
                        <span className="value">{record.tankId}</span>
                      </div>
                      
                      {record.Description && (
                        <div className="breeding-detail">
                          <span className="label">Notes:</span>
                          <span className="value description">{record.Description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {formData.BreedingID && (
            <div className="selected-breeding-info">
              <strong>Selected Breeding:</strong> {getSelectedBreeding()?.fishType} 
              <span className="breeding-confirmation"> ✓ Ready for baby assignment</span>
            </div>
          )}
        </div>

        {/* Baby Details Section */}
        <div className="form-section">
          <h2>3. Baby Fish Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="BabyCount">Number of Babies *</label>
              <input
                type="number"
                id="BabyCount"
                name="BabyCount"
                value={formData.BabyCount}
                onChange={handleInputChange}
                min="1"
                step="1"
                onKeyDown={preventInvalidNumberKeys}
                required
                disabled={!formData.BabyTankID || !formData.BreedingID}
              />
            </div>

            <div className="form-group">
              <label htmlFor="BirthDate">Birth Date *</label>
              <input
                type="date"
                id="BirthDate"
                name="BirthDate"
                value={formData.BirthDate}
                onChange={handleInputChange}
                required
                disabled={!formData.BabyTankID || !formData.BreedingID}
                max={new Date().toISOString().split('T')[0]}
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
              placeholder="Additional notes about these baby fish..."
              disabled={!formData.BabyTankID || !formData.BreedingID}
            />
          </div>
        </div>

        {/* Form Summary */}
        <div className="form-summary">
          <h3>Summary</h3>
          <div className="summary-content">
            <p><strong>Selected Tank:</strong> {getSelectedTank()?.TankCode || "None"}</p>
            <p><strong>Breeding Record:</strong> {getSelectedBreeding()?.fishType || "Not selected"}</p>
            <p><strong>Birth Date:</strong> {formData.BirthDate || "Not set"}</p>
            <p><strong>Baby Count:</strong> {formData.BabyCount || "0"} babies</p>
            <p><strong>Status:</strong> {formData.BabyTankID && formData.BreedingID ? "Ready to submit" : "Select tank and breeding record to continue"}</p>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || !formData.BabyTankID || !formData.BreedingID}
          >
            {submitting ? "Adding Baby Record..." : "Add Baby Record"}
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

export default AddBabyTank;