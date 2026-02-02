// frontend/src/Component/Breading/EditBreedingRecord/EditBreedingRecord.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditBreedingRecord.css";

const API_URL = "http://localhost:5000";

const EditBreedingRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fishType: "",
    MotherCount: "",
    FatherCount: "",
    BreedingDate: "",
    tankId: "",
    Description: "",
    status: "active"
  });

  const [tanks, setTanks] = useState([]);
  const [babyRecords, setBabyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [breedingResponse, tanksResponse, babiesResponse] = await Promise.all([
        axios.get(`${API_URL}/breeding/${id}`),
        axios.get(`${API_URL}/tanksNew`),
        axios.get(`${API_URL}/babies`).catch(err => ({ data: [] }))
      ]);

      const breedingData = breedingResponse.data;
      const tanksData = tanksResponse.data.tanks || tanksResponse.data || [];
      const babiesData = babiesResponse.data.babyRecords || babiesResponse.data || [];

      // Set form data from existing record
      setFormData({
        fishType: breedingData.fishType || "",
        MotherCount: breedingData.MotherCount || "",
        FatherCount: breedingData.FatherCount || "",
        BreedingDate: breedingData.BreedingDate ? breedingData.BreedingDate.split('T')[0] : "",
        tankId: breedingData.tankId || "",
        Description: breedingData.Description || "",
        status: breedingData.status || "active"
      });

      setBabyRecords(babiesData);

      // Filter available tanks including current tank
      const inUseTankIds = new Set(
        tanksData
          .filter(tank => tank.TankLocation === "Breeding tanks")
          .map(tank => tank._id)
      );
      
      const availableTanks = tanksData.filter(tank => 
        tank.TankLocation === "Breeding tanks" && 
        (tank._id === breedingData.tankId || !inUseTankIds.has(tank._id))
      );
      
      setTanks(availableTanks);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load breeding record");
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
      Description: formData.Description,
      status: formData.status,
      lastUpdated: new Date().toISOString()
    };

    try {
      setSubmitting(true);
      
      const response = await axios.put(`${API_URL}/breeding/${id}`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      
      alert("Breeding record updated successfully!");
      navigate("/dashboard/Breeding/viewmother");
      
    } catch (err) {
      console.error("Error updating breeding record:", err);
      const errorMessage = err.response?.data?.message || "Failed to update breeding record";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/Breeding/viewmother");
  };

  const handleCompleteBreeding = async () => {
    const hasBabies = babyRecords.some(baby => baby.BreedingID === id);
    
    if (!hasBabies) {
      if (!window.confirm("This breeding has no baby records. Mark as completed anyway?")) {
        return;
      }
    }

    try {
      setSubmitting(true);
      await axios.put(`${API_URL}/breeding/${id}`, {
        ...formData,
        status: "completed",
        completionDate: new Date().toISOString()
      });
      
      alert("Breeding marked as completed!");
      navigate("/dashboard/Breeding/viewmother");
    } catch (err) {
      console.error("Error completing breeding:", err);
      alert("Failed to mark breeding as completed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!window.confirm("Mark this breeding as failed? This will free up the tank.")) {
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`${API_URL}/breeding/${id}`, {
        ...formData,
        status: "failed",
        completionDate: new Date().toISOString()
      });
      
      alert("Breeding marked as failed!");
      navigate("/dashboard/Breeding/viewmother");
    } catch (err) {
      console.error("Error marking breeding as failed:", err);
      alert("Failed to mark breeding as failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getBabyCountForBreeding = () => {
    return babyRecords
      .filter(baby => baby.BreedingID === id)
      .reduce((sum, baby) => sum + baby.BabyCount, 0);
  };

  if (loading) {
    return (
      <div className="edit-breeding-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading breeding record...</p>
        </div>
      </div>
    );
  }

  const babyCount = getBabyCountForBreeding();

  return (
    <div className="edit-breeding-container">
      <div className="edit-breeding-header">
        <h1>✏️ Edit Breeding Record</h1>
        <p>Update breeding information and manage status</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchData} className="retry-btn">
            Retry Loading
          </button>
        </div>
      )}

      <div className="breeding-summary">
        <div className="summary-card">
          <h3>Current Status</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span className="label">Fish Type:</span>
              <span className="value">{formData.fishType}</span>
            </div>
            <div className="summary-item">
              <span className="label">Baby Batches:</span>
              <span className="value">{babyRecords.filter(baby => baby.BreedingID === id).length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Babies:</span>
              <span className="value highlight">{babyCount}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current Status:</span>
              <span className={`status-badge ${formData.status}`}>
                {formData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-breeding-form">
        <div className="form-section">
          <h2>Breeding Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fishType">Fish Type *</label>
              <select
                id="fishType"
                name="fishType"
                value={formData.fishType}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Fish Type --</option>
                <option value="Guppy">Guppy</option>
                <option value="Goldfish">Goldfish</option>
                <option value="Betta">Betta</option>
                <option value="Angelfish">Angelfish</option>
                <option value="Molly">Molly</option>
                <option value="Platy">Platy</option>
                <option value="Swordtail">Swordtail</option>
                <option value="Tilapia">Tilapia</option>
                <option value="Catfish">Catfish</option>
                <option value="Koi">Koi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="BreedingDate">Breeding Date *</label>
              <input
                type="date"
                id="BreedingDate"
                name="BreedingDate"
                value={formData.BreedingDate}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tankId">Breeding Tank *</label>
              <select
                id="tankId"
                name="tankId"
                value={formData.tankId}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Tank --</option>
                {tanks.map(tank => (
                  <option key={tank._id} value={tank._id}>
                    {tank.TankCode} {tank._id === formData.tankId ? "(Current)" : ""}
                  </option>
                ))}
              </select>
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
                required
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
                required
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
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Breeding Record"}
          </button>
          
          {formData.status === "active" && (
            <>
              <button 
                type="button" 
                className="complete-btn"
                onClick={handleCompleteBreeding}
                disabled={submitting}
              >
                Mark as Completed
              </button>
              
              <button 
                type="button" 
                className="failed-btn"
                onClick={handleMarkFailed}
                disabled={submitting}
              >
                Mark as Failed
              </button>
            </>
          )}
          
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

export default EditBreedingRecord;