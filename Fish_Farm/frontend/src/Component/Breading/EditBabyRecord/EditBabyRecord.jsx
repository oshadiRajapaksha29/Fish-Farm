// frontend/src/Component/Breading/EditBabyRecord/EditBabyRecord.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditBabyRecord.css";

const API_URL = "http://localhost:5000";

const EditBabyRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    BabyCount: "",
    BirthDate: "",
    BabyTankID: "",
    BreedingID: "",
    Description: "",
    currentCount: "",
    mortalityCount: "0",
    healthStatus: "healthy"
  });

  const [babyTanks, setBabyTanks] = useState([]);
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [currentTank, setCurrentTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [babyResponse, tanksResponse, breedingResponse] = await Promise.all([
        axios.get(`${API_URL}/babies/${id}`),
        axios.get(`${API_URL}/tanksNew`),
        axios.get(`${API_URL}/breeding`)
      ]);

      const babyData = babyResponse.data;
      const tanksData = tanksResponse.data.tanks || tanksResponse.data || [];
      const breedingData = breedingResponse.data.breedingRecords || breedingResponse.data || [];

      // Set form data from existing record
      setFormData({
        BabyCount: babyData.BabyCount || "",
        currentCount: babyData.currentCount || babyData.BabyCount || "",
        BirthDate: babyData.BirthDate ? babyData.BirthDate.split('T')[0] : "",
        BabyTankID: babyData.BabyTankID || "",
        BreedingID: babyData.BreedingID || "",
        Description: babyData.Description || "",
        mortalityCount: babyData.mortalityCount || "0",
        healthStatus: babyData.healthStatus || "healthy"
      });

      // Find current tank info
      const currentTankInfo = tanksData.find(tank => tank._id === babyData.BabyTankID);
      setCurrentTank(currentTankInfo);

      // Filter available baby tanks including current tank
      const inUseBabyTankIds = new Set(
        tanksData
          .filter(tank => tank.TankLocation === "Baby Tank")
          .map(tank => tank._id)
      );
      
      const availableBabyTanks = tanksData.filter(tank => 
        tank.TankLocation === "Baby Tank" && 
        (tank._id === babyData.BabyTankID || !inUseBabyTankIds.has(tank._id))
      );
      
      setBabyTanks(availableBabyTanks);
      setBreedingRecords(breedingData);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load baby record");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.BabyCount || !formData.BirthDate || !formData.BabyTankID || !formData.BreedingID) {
      alert("Please fill in all required fields");
      return;
    }

    // Calculate current count based on mortality
    const currentCount = Math.max(0, parseInt(formData.BabyCount) - parseInt(formData.mortalityCount || 0));

    const payload = {
      BabyCount: parseInt(formData.BabyCount),
      currentCount: currentCount,
      BirthDate: formData.BirthDate,
      BabyTankID: formData.BabyTankID,
      BreedingID: formData.BreedingID,
      Description: formData.Description,
      mortalityCount: parseInt(formData.mortalityCount || 0),
      healthStatus: formData.healthStatus,
      lastUpdated: new Date().toISOString()
    };

    try {
      setSubmitting(true);
      
      const response = await axios.put(`${API_URL}/babies/${id}`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      
      alert("Baby record updated successfully!");
      navigate("/dashboard/Breeding/viewmother");
      
    } catch (err) {
      console.error("Error updating baby record:", err);
      const errorMessage = err.response?.data?.message || "Failed to update baby record";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTankTransfer = async () => {
    if (babyTanks.length <= 1) {
      alert("No other baby tanks available for transfer.");
      return;
    }

    const newTankId = prompt(`Enter new tank ID for transfer. Available tanks:\n${
      babyTanks
        .filter(tank => tank._id !== formData.BabyTankID)
        .map(tank => `${tank.TankCode} (${tank._id})`)
        .join('\n')
    }`);

    if (newTankId && newTankId !== formData.BabyTankID) {
      const selectedTank = babyTanks.find(tank => tank._id === newTankId);
      if (!selectedTank) {
        alert("Invalid tank ID selected.");
        return;
      }

      try {
        setSubmitting(true);
        await axios.put(`${API_URL}/babies/${id}`, {
          ...formData,
          BabyTankID: newTankId,
          previousTankID: formData.BabyTankID,
          tankTransferDate: new Date().toISOString()
        });
        
        alert(`Baby tank transfer to ${selectedTank.TankCode} completed!`);
        fetchData(); // Refresh data
      } catch (err) {
        alert("Failed to transfer tank");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleAddMortality = () => {
    const mortality = prompt("Enter number of mortalities to add:");
    if (mortality && !isNaN(mortality)) {
      const newMortalityCount = parseInt(formData.mortalityCount || 0) + parseInt(mortality);
      setFormData(prev => ({
        ...prev,
        mortalityCount: newMortalityCount.toString()
      }));
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/Breeding/viewmother");
  };

  const calculateAge = () => {
    if (!formData.BirthDate) return 0;
    const birth = new Date(formData.BirthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAgeCategory = (ageInDays) => {
    if (ageInDays < 7) return { category: "Newborn", color: "#e74c3c" };
    if (ageInDays < 30) return { category: "Juvenile", color: "#f39c12" };
    if (ageInDays < 90) return { category: "Young", color: "#3498db" };
    return { category: "Mature", color: "#27ae60" };
  };

  if (loading) {
    return (
      <div className="edit-baby-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading baby record...</p>
        </div>
      </div>
    );
  }

  const ageInDays = calculateAge();
  const ageInfo = getAgeCategory(ageInDays);
  const currentLiveCount = Math.max(0, parseInt(formData.BabyCount) - parseInt(formData.mortalityCount || 0));
  const mortalityRate = ((parseInt(formData.mortalityCount || 0) / parseInt(formData.BabyCount)) * 100).toFixed(1);

  return (
    <div className="edit-baby-container">
      <div className="edit-baby-header">
        <h1>👶 Edit Baby Fish Record</h1>
        <p>Update baby fish information and track growth</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchData} className="retry-btn">
            Retry Loading
          </button>
        </div>
      )}

      <div className="baby-summary">
        <div className="summary-card">
          <h3>Baby Fish Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span className="label">Current Age:</span>
              <span className="value age-indicator" style={{ color: ageInfo.color }}>
                {ageInDays} days ({ageInfo.category})
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Original Count:</span>
              <span className="value">{formData.BabyCount}</span>
            </div>
            <div className="summary-item">
              <span className="label">Mortality Count:</span>
              <span className="value mortality">{formData.mortalityCount || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current Live Count:</span>
              <span className="value highlight">{currentLiveCount}</span>
            </div>
            <div className="summary-item">
              <span className="label">Mortality Rate:</span>
              <span className="value mortality-rate">{mortalityRate}%</span>
            </div>
            <div className="summary-item">
              <span className="label">Health Status:</span>
              <span className={`health-status ${formData.healthStatus}`}>
                {formData.healthStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-baby-form">
        <div className="form-section">
          <h2>Baby Fish Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="BirthDate">Birth Date *</label>
              <input
                type="date"
                id="BirthDate"
                name="BirthDate"
                value={formData.BirthDate}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="BabyTankID">Baby Tank *</label>
              <select
                id="BabyTankID"
                name="BabyTankID"
                value={formData.BabyTankID}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Baby Tank --</option>
                {babyTanks.map(tank => (
                  <option key={tank._id} value={tank._id}>
                    {tank.TankCode} {tank._id === formData.BabyTankID ? "(Current)" : ""}
                  </option>
                ))}
              </select>
              {currentTank && (
                <div className="tank-info">
                  Current: {currentTank.TankCode} ({currentTank.TankType}) - 
                  {currentTank.Length}m × {currentTank.Width}m × {currentTank.Height}m
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="BabyCount">Original Baby Count *</label>
              <input
                type="number"
                id="BabyCount"
                name="BabyCount"
                value={formData.BabyCount}
                onChange={handleInputChange}
                min="1"
                step="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mortalityCount">
                Mortality Count
                <button 
                  type="button" 
                  className="add-mortality-btn"
                  onClick={handleAddMortality}
                  title="Add mortality count"
                >
                  +
                </button>
              </label>
              <input
                type="number"
                id="mortalityCount"
                name="mortalityCount"
                value={formData.mortalityCount}
                onChange={handleInputChange}
                min="0"
                step="1"
                max={formData.BabyCount}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="healthStatus">Health Status</label>
              <select
                id="healthStatus"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleInputChange}
              >
                <option value="healthy">Healthy</option>
                <option value="concern">Some Concern</option>
                <option value="sick">Sick</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="BreedingID">Breeding Record *</label>
              <select
                id="BreedingID"
                name="BreedingID"
                value={formData.BreedingID}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Breeding Record --</option>
                {breedingRecords.map(record => (
                  <option key={record._id} value={record._id}>
                    {record.fishType} - {new Date(record.BreedingDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
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
              placeholder="Growth notes, health observations, feeding patterns, etc..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Baby Record"}
          </button>
          
          <button 
            type="button" 
            className="transfer-btn"
            onClick={handleTankTransfer}
            disabled={submitting || babyTanks.length <= 1}
          >
            Transfer to New Tank
          </button>
          
          <button 
            type="button" 
            className="cancel-btn"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBabyRecord;