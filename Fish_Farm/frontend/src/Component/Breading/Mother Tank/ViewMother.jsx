//frontend/src/Component/Breading/Mother Tank/ViewMother.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewMother.css";

const API_URL = "http://localhost:5000";

const ViewMother = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [babyRecords, setBabyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    fishType: "",
    tankId: "",
    dateFrom: "",
    dateTo: ""
  });
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("breeding");
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingBaby, setEditingBaby] = useState(null);
  const [editForm, setEditForm] = useState({
    fishType: "",
    MotherCount: "",
    FatherCount: "",
    Description: "",
    BreedingDate: ""
  });
  const [editBabyForm, setEditBabyForm] = useState({
    BabyCount: "",
    BirthDate: "",
    Description: "",
    BabyTankID: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [breedingResponse, tanksResponse, babiesResponse] = await Promise.all([
        axios.get(`${API_URL}/breeding`),
        axios.get(`${API_URL}/tanksNew`),
        axios.get(`${API_URL}/babies`).catch(err => ({ data: [] }))
      ]);

      const breedingData = breedingResponse.data.breedingRecords || breedingResponse.data || [];
      const tanksData = tanksResponse.data.tanks || tanksResponse.data || [];
      const babiesData = babiesResponse.data.babyRecords || babiesResponse.data || [];

      setBreedingRecords(breedingData);
      setTanks(tanksData);
      setBabyRecords(babiesData);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load breeding records");
    } finally {
      setLoading(false);
    }
  };

  const getTankInfo = (tankId) => {
    const tank = tanks.find(t => t._id === tankId);
    return tank || { TankCode: "Unknown", TankType: "N/A" };
  };

  const getBabyTankInfo = (babyTankId) => {
    const tank = tanks.find(t => t._id === babyTankId);
    return tank || { TankCode: "Unknown", TankType: "N/A" };
  };

  const getBabiesForBreeding = (breedingId) => {
    return babyRecords.filter(baby => baby.BreedingID === breedingId);
  };

  const getAvailableBreedingTanks = () => {
    const inUseTankIds = new Set(breedingRecords.map(record => record.tankId));
    return tanks.filter(tank => 
      tank.TankLocation === "Breeding tanks" && 
      !inUseTankIds.has(tank._id)
    );
  };

  const getAvailableBabyTanks = () => {
    const inUseBabyTankIds = new Set(babyRecords.map(baby => baby.BabyTankID));
    return tanks.filter(tank => 
      tank.TankLocation === "Baby Tank" && 
      !inUseBabyTankIds.has(tank._id)
    );
  };

  const getInUseTanks = () => {
    const inUseTankIds = new Set(breedingRecords.map(record => record.tankId));
    return tanks.filter(tank => inUseTankIds.has(tank._id));
  };

  const getInUseBabyTanks = () => {
    const inUseBabyTankIds = new Set(babyRecords.map(baby => baby.BabyTankID));
    return tanks.filter(tank => inUseBabyTankIds.has(tank._id));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateBabyAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBabyAgeCategory = (ageInDays) => {
    if (ageInDays < 7) return "Newborn";
    if (ageInDays < 30) return "Juvenile";
    if (ageInDays < 90) return "Young";
    return "Mature";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      fishType: "",
      tankId: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  // Parent Update Functions
  const startEditParent = (record) => {
    setEditingRecord(record._id);
    setEditForm({
      fishType: record.fishType || "",
      MotherCount: record.MotherCount || "",
      FatherCount: record.FatherCount || "",
      Description: record.Description || "",
      BreedingDate: record.BreedingDate ? record.BreedingDate.split('T')[0] : ""
    });
  };

  const cancelEditParent = () => {
    setEditingRecord(null);
    setEditForm({
      fishType: "",
      MotherCount: "",
      FatherCount: "",
      Description: "",
      BreedingDate: ""
    });
  };

  const handleParentEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateParentRecord = async (recordId) => {
    try {
      const updatedData = {
        ...editForm,
        MotherCount: parseInt(editForm.MotherCount),
        FatherCount: parseInt(editForm.FatherCount)
      };

      await axios.put(`${API_URL}/breeding/${recordId}`, updatedData);
      alert("Breeding record updated successfully!");
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      console.error("Error updating breeding record:", err);
      alert("Failed to update breeding record");
    }
  };

  // Baby Update Functions
  const startEditBaby = (babyRecord) => {
    setEditingBaby(babyRecord._id);
    setEditBabyForm({
      BabyCount: babyRecord.BabyCount || "",
      BirthDate: babyRecord.BirthDate ? babyRecord.BirthDate.split('T')[0] : "",
      Description: babyRecord.Description || "",
      BabyTankID: babyRecord.BabyTankID || ""
    });
  };

  const cancelEditBaby = () => {
    setEditingBaby(null);
    setEditBabyForm({
      BabyCount: "",
      BirthDate: "",
      Description: "",
      BabyTankID: ""
    });
  };

  const handleBabyEditChange = (e) => {
    const { name, value } = e.target;
    setEditBabyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateBabyRecord = async (babyId) => {
    try {
      const updatedData = {
        ...editBabyForm,
        BabyCount: parseInt(editBabyForm.BabyCount)
      };

      await axios.put(`${API_URL}/babies/${babyId}`, updatedData);
      alert("Baby record updated successfully!");
      setEditingBaby(null);
      fetchData();
    } catch (err) {
      console.error("Error updating baby record:", err);
      alert("Failed to update baby record");
    }
  };

  const filteredRecords = breedingRecords.filter(record => {
    const matchesFishType = !filter.fishType || record.fishType === filter.fishType;
    const matchesTank = !filter.tankId || record.tankId === filter.tankId;
    
    const recordDate = new Date(record.BreedingDate);
    const fromDate = filter.dateFrom ? new Date(filter.dateFrom) : null;
    const toDate = filter.dateTo ? new Date(filter.dateTo) : null;
    
    const matchesDateFrom = !fromDate || recordDate >= fromDate;
    const matchesDateTo = !toDate || recordDate <= toDate;
    
    return matchesFishType && matchesTank && matchesDateFrom && matchesDateTo;
  });

  const deleteBreedingRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this breeding record? This will also delete all associated baby records and free up the tank.")) {
      return;
    }

    try {
      const associatedBabies = babyRecords.filter(baby => baby.BreedingID === id);
      for (const baby of associatedBabies) {
        await axios.delete(`${API_URL}/babies/${baby._id}`);
      }
      
      await axios.delete(`${API_URL}/breeding/${id}`);
      alert("Breeding record and associated baby records deleted successfully! The tank is now available for new breeding activities.");
      fetchData();
    } catch (err) {
      console.error("Error deleting breeding record:", err);
      alert("Failed to delete breeding record");
    }
  };

  const deleteBabyRecord = async (babyId, breedingId) => {
    if (!window.confirm("Are you sure you want to delete this baby record? This will free up the baby tank.")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/babies/${babyId}`);
      alert("Baby record deleted successfully! The baby tank is now available.");
      fetchData();
    } catch (err) {
      console.error("Error deleting baby record:", err);
      alert("Failed to delete baby record");
    }
  };

  const getUniqueFishTypes = () => {
    const fishTypes = breedingRecords.map(record => record.fishType);
    return [...new Set(fishTypes)].filter(Boolean);
  };

  const availableBreedingTanks = getAvailableBreedingTanks();
  const availableBabyTanks = getAvailableBabyTanks();
  const inUseBreedingTanks = getInUseTanks();
  const inUseBabyTanks = getInUseBabyTanks();

  const totalBabies = babyRecords.reduce((sum, baby) => sum + baby.BabyCount, 0);
  const totalBreedingRecords = breedingRecords.length;
  const successRate = totalBreedingRecords > 0 
    ? Math.round((babyRecords.length / totalBreedingRecords) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="view-mother-container">
        <div className="loading">Loading breeding records and baby data...</div>
      </div>
    );
  }

  return (
    <div className="view-mother-container">
      <div className="view-mother-header">
        <h1 className="view-mother-title">Breeding & Baby Tank Management</h1>
        <p className="view-mother-subtitle">
          Monitor breeding activities, baby fish development, and tank utilization
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button 
          className={`tab-button ${activeTab === 'breeding' ? 'active' : ''}`}
          onClick={() => setActiveTab('breeding')}
        >
          🐟 Breeding Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'babyTanks' ? 'active' : ''}`}
          onClick={() => setActiveTab('babyTanks')}
        >
          🐠 Baby Tank Management
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="statistics-section">
        <h2>Breeding Overview</h2>
        <div className="statistics-grid">
          <div className="stat-card total-breeding">
            <div className="stat-icon">🐟</div>
            <div className="stat-content">
              <span className="stat-number">{totalBreedingRecords}</span>
              <span className="stat-label">Total Breeding Records</span>
            </div>
          </div>
          <div className="stat-card total-babies">
            <div className="stat-icon">🐠</div>
            <div className="stat-content">
              <span className="stat-number">{babyRecords.length}</span>
              <span className="stat-label">Baby Batches</span>
            </div>
          </div>
          <div className="stat-card baby-count">
            <div className="stat-icon">🔢</div>
            <div className="stat-content">
              <span className="stat-number">{totalBabies}</span>
              <span className="stat-label">Total Baby Fish</span>
            </div>
          </div>
          <div className="stat-card success-rate">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <span className="stat-number">{successRate}%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tank Utilization Summary */}
      <div className="utilization-section">
        <h2>Tank Utilization Summary</h2>
        <div className="utilization-stats">
          <div className="utilization-card available-breeding">
            <h3>Available Breeding Tanks</h3>
            <span className="utilization-number">{availableBreedingTanks.length}</span>
            <p>Ready for new breeding</p>
          </div>
          <div className="utilization-card in-use-breeding">
            <h3>Breeding Tanks in Use</h3>
            <span className="utilization-number">{inUseBreedingTanks.length}</span>
            <p>Active breeding records</p>
          </div>
          <div className="utilization-card available-baby">
            <h3>Available Baby Tanks</h3>
            <span className="utilization-number">{availableBabyTanks.length}</span>
            <p>Ready for new babies</p>
          </div>
          <div className="utilization-card in-use-baby">
            <h3>Baby Tanks in Use</h3>
            <span className="utilization-number">{inUseBabyTanks.length}</span>
            <p>Active baby batches</p>
          </div>
        </div>
      </div>

      {/* Breeding Records Tab */}
      {activeTab === 'breeding' && (
        <>
          {/* Filters Section */}
          <div className="filters-section">
            <h3>Filter Breeding Records</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Fish Type</label>
                <select
                  name="fishType"
                  value={filter.fishType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  {getUniqueFishTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Tank</label>
                <select
                  name="tankId"
                  value={filter.tankId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Tanks</option>
                  {inUseBreedingTanks.map(tank => (
                    <option key={tank._id} value={tank._id}>
                      {tank.TankCode} (In Use)
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label>Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Breeding Records Section - TWO COLUMNS LAYOUT */}
          <div className="records-section">
            <div className="section-header">
              <h2>Active Breeding Records ({filteredRecords.length})</h2>
              <div className="section-actions">
                <button onClick={fetchData} className="refresh-btn">
                  Refresh
                </button>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="no-records">
                {breedingRecords.length === 0 
                  ? "No active breeding records found. Start by adding a new breeding record."
                  : "No records match your current filters."
                }
              </div>
            ) : (
              <div className="records-grid-two-columns">
                {filteredRecords.map(record => {
                  const tankInfo = getTankInfo(record.tankId);
                  const babyRecordsForThisBreeding = getBabiesForBreeding(record._id);
                  const hasBabies = babyRecordsForThisBreeding.length > 0;
                  const totalBabiesFromRecord = babyRecordsForThisBreeding.reduce((sum, baby) => sum + baby.BabyCount, 0);
                  const isExpanded = expandedRecord === record._id;
                  const isEditing = editingRecord === record._id;
                  
                  return (
                    <div key={record._id} className="record-card">
                      <div className="record-header">
                        <div className="record-title">
                          {isEditing ? (
                            <input
                              type="text"
                              name="fishType"
                              value={editForm.fishType}
                              onChange={handleParentEditChange}
                              className="edit-input"
                              placeholder="Fish Type"
                            />
                          ) : (
                            <h3>{record.fishType}</h3>
                          )}
                          <span className="record-date">
                            Started: {formatDate(record.BreedingDate)}
                          </span>
                        </div>
                        <div className="record-actions">
                          <button 
                            className="expand-btn"
                            onClick={() => toggleRecordExpansion(record._id)}
                            title={isExpanded ? "Collapse details" : "Expand details"}
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                          {isEditing ? (
                            <>
                              <button 
                                className="save-btn"
                                onClick={() => updateParentRecord(record._id)}
                                title="Save changes"
                              >
                                ✓
                              </button>
                              <button 
                                className="cancel-btn"
                                onClick={cancelEditParent}
                                title="Cancel editing"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button 
                              className="edit-btn"
                              onClick={() => startEditParent(record)}
                              title="Edit record"
                            >
                              ✎
                            </button>
                          )}
                          <button 
                            className="delete-btn"
                            onClick={() => deleteBreedingRecord(record._id)}
                            title="Delete record and free up tank"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div className="record-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-label">Tank</span>
                            <span className="detail-value tank-code">
                              {tankInfo.TankCode} 
                              <span className="tank-type">({tankInfo.TankType})</span>
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Parents</span>
                            {isEditing ? (
                              <div className="edit-parents-count">
                                <input
                                  type="number"
                                  name="MotherCount"
                                  value={editForm.MotherCount}
                                  onChange={handleParentEditChange}
                                  className="edit-input small"
                                  placeholder="♀"
                                  min="0"
                                />
                                <span>♀</span>
                                <input
                                  type="number"
                                  name="FatherCount"
                                  value={editForm.FatherCount}
                                  onChange={handleParentEditChange}
                                  className="edit-input small"
                                  placeholder="♂"
                                  min="0"
                                />
                                <span>♂</span>
                              </div>
                            ) : (
                              <span className="detail-value parents-count">
                                {record.MotherCount}♀ {record.FatherCount}♂
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-label">Total Fish</span>
                            <span className="detail-value highlight">
                              {record.MotherCount + record.FatherCount}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Status</span>
                            <span className={`status-badge ${hasBabies ? 'has-babies' : 'in-use'}`}>
                              {hasBabies ? `Has Babies (${totalBabiesFromRecord})` : "In Use"}
                            </span>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="edit-description">
                            <label>Description</label>
                            <textarea
                              name="Description"
                              value={editForm.Description}
                              onChange={handleParentEditChange}
                              className="edit-textarea"
                              placeholder="Add notes about this breeding record..."
                              rows="3"
                            />
                            <div className="edit-date">
                              <label>Breeding Date</label>
                              <input
                                type="date"
                                name="BreedingDate"
                                value={editForm.BreedingDate}
                                onChange={handleParentEditChange}
                                className="edit-input"
                              />
                            </div>
                          </div>
                        ) : (
                          record.Description && (
                            <div className="description-section">
                              <span className="detail-label">Notes</span>
                              <p className="description-text">{record.Description}</p>
                            </div>
                          )
                        )}

                        {/* Baby Records Section */}
                        {hasBabies && (
                          <div className="baby-records-section">
                            <div className="baby-records-header">
                              <h4>Baby Fish Records ({babyRecordsForThisBreeding.length} batches)</h4>
                              <span className="total-babies-badge">
                                Total Babies: {totalBabiesFromRecord}
                              </span>
                            </div>
                            
                            {isExpanded && (
                              <div className="baby-records-grid">
                                {babyRecordsForThisBreeding.map(baby => {
                                  const babyTankInfo = getBabyTankInfo(baby.BabyTankID);
                                  const babyAge = calculateBabyAge(baby.BirthDate);
                                  const ageCategory = getBabyAgeCategory(babyAge);
                                  const isBabyEditing = editingBaby === baby._id;
                                  
                                  return (
                                    <div key={baby._id} className="baby-record-card">
                                      <div className="baby-record-header">
                                        <div className="baby-record-info">
                                          <h5>Baby Batch</h5>
                                          {isBabyEditing ? (
                                            <input
                                              type="date"
                                              name="BirthDate"
                                              value={editBabyForm.BirthDate}
                                              onChange={handleBabyEditChange}
                                              className="edit-input"
                                            />
                                          ) : (
                                            <span className="baby-birth-date">
                                              Born: {formatDate(baby.BirthDate)}
                                            </span>
                                          )}
                                        </div>
                                        <div className="baby-record-actions">
                                          {isBabyEditing ? (
                                            <>
                                              <button 
                                                className="save-btn"
                                                onClick={() => updateBabyRecord(baby._id)}
                                                title="Save changes"
                                              >
                                                ✓
                                              </button>
                                              <button 
                                                className="cancel-btn"
                                                onClick={cancelEditBaby}
                                                title="Cancel editing"
                                              >
                                                ✕
                                              </button>
                                            </>
                                          ) : (
                                            <button 
                                              className="edit-btn"
                                              onClick={() => startEditBaby(baby)}
                                              title="Edit baby record"
                                            >
                                              ✎
                                            </button>
                                          )}
                                          <button 
                                            className="delete-baby-btn"
                                            onClick={() => deleteBabyRecord(baby._id, record._id)}
                                            title="Delete baby record"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="baby-record-details">
                                        <div className="baby-detail-row">
                                          <div className="baby-detail-item">
                                            <span className="baby-detail-label">Baby Tank</span>
                                            {isBabyEditing ? (
                                              <select
                                                name="BabyTankID"
                                                value={editBabyForm.BabyTankID}
                                                onChange={handleBabyEditChange}
                                                className="edit-select"
                                              >
                                                <option value="">Select Baby Tank</option>
                                                {availableBabyTanks.concat(inUseBabyTanks.filter(t => t._id === baby.BabyTankID)).map(tank => (
                                                  <option key={tank._id} value={tank._id}>
                                                    {tank.TankCode} {tank._id === baby.BabyTankID ? '(Current)' : ''}
                                                  </option>
                                                ))}
                                              </select>
                                            ) : (
                                              <span className="baby-detail-value">
                                                {babyTankInfo.TankCode}
                                              </span>
                                            )}
                                          </div>
                                          <div className="baby-detail-item">
                                            <span className="baby-detail-label">Count</span>
                                            {isBabyEditing ? (
                                              <input
                                                type="number"
                                                name="BabyCount"
                                                value={editBabyForm.BabyCount}
                                                onChange={handleBabyEditChange}
                                                className="edit-input"
                                                placeholder="Baby Count"
                                                min="0"
                                              />
                                            ) : (
                                              <span className="baby-detail-value highlight">
                                                {baby.BabyCount} babies
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="baby-detail-row">
                                          <div className="baby-detail-item">
                                            <span className="baby-detail-label">Age</span>
                                            <span className="baby-detail-value">
                                              {babyAge} days ({ageCategory})
                                            </span>
                                          </div>
                                          <div className="baby-detail-item">
                                            <span className="baby-detail-label">Status</span>
                                            <span className={`baby-status-badge ${ageCategory.toLowerCase()}`}>
                                              {ageCategory}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {isBabyEditing ? (
                                          <div className="edit-baby-description">
                                            <label>Description</label>
                                            <textarea
                                              name="Description"
                                              value={editBabyForm.Description}
                                              onChange={handleBabyEditChange}
                                              className="edit-textarea"
                                              placeholder="Add notes about this baby batch..."
                                              rows="2"
                                            />
                                          </div>
                                        ) : (
                                          baby.Description && (
                                            <div className="baby-description">
                                              <span className="baby-detail-label">Notes</span>
                                              <p className="baby-description-text">{baby.Description}</p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {!hasBabies && isExpanded && (
                          <div className="no-babies-message">
                            <p>No baby records yet for this breeding. Add baby records when fish are born.</p>
                          </div>
                        )}

                        <div className="record-footer">
                          <span className="record-id">
                            ID: {record._id?.substring(0, 8)}...
                          </span>
                          <span className="tank-in-use-warning">
                            {hasBabies ? "🐠 Has baby batches" : "⚠️ This tank is occupied"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Breeding Tanks Section */}
          {availableBreedingTanks.length > 0 && (
            <div className="available-tanks-section">
              <h2>Available Breeding Tanks ({availableBreedingTanks.length})</h2>
              <p className="section-description">
                These breeding tanks are ready for new breeding activities
              </p>
              <div className="available-tanks-grid">
                {availableBreedingTanks.map(tank => (
                  <div key={tank._id} className="available-tank-card breeding-tank">
                    <div className="tank-header">
                      <div className="tank-code">{tank.TankCode}</div>
                      <div className="tank-type">{tank.TankType}</div>
                    </div>
                    <div className="tank-specs">
                      <div className="tank-spec">
                        <span className="spec-label">Size:</span>
                        <span className="spec-value">{tank.Length}m × {tank.Width}m × {tank.Height}m</span>
                      </div>
                      <div className="tank-spec">
                        <span className="spec-label">Valves:</span>
                        <span className="spec-value">In: {tank.InletValves} | Out: {tank.OutletValves}</span>
                      </div>
                      {tank.Description && (
                        <div className="tank-spec">
                          <span className="spec-label">Notes:</span>
                          <span className="spec-value description">{tank.Description}</span>
                        </div>
                      )}
                    </div>
                    <div className="tank-status available">Available for Breeding</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Baby Tanks Tab */}
      {activeTab === 'babyTanks' && (
        <div className="baby-tanks-section">
          {/* Available Baby Tanks */}
          <div className="available-baby-tanks-section">
            <div className="section-header">
              <h2>Available Baby Tanks ({availableBabyTanks.length})</h2>
              <p className="section-description">
                These baby tanks are ready for new baby fish batches
              </p>
            </div>
            
            {availableBabyTanks.length === 0 ? (
              <div className="no-baby-tanks-message">
                <h3>No Available Baby Tanks</h3>
                <p>All baby tanks are currently in use. Consider adding more baby tanks or moving mature fish to other tanks.</p>
              </div>
            ) : (
              <div className="baby-tanks-grid">
                {availableBabyTanks.map(tank => (
                  <div key={tank._id} className="baby-tank-card available">
                    <div className="baby-tank-header">
                      <div className="tank-code">{tank.TankCode}</div>
                      <div className="tank-type">{tank.TankType}</div>
                    </div>
                    <div className="baby-tank-specs">
                      <div className="tank-spec">
                        <span className="spec-label">Dimensions:</span>
                        <span className="spec-value">{tank.Length}m × {tank.Width}m × {tank.Height}m</span>
                      </div>
                      <div className="tank-spec">
                        <span className="spec-label">Valves:</span>
                        <span className="spec-value">In: {tank.InletValves} | Out: {tank.OutletValves}</span>
                      </div>
                      <div className="tank-spec">
                        <span className="spec-label">Location:</span>
                        <span className="spec-value">{tank.TankLocation}</span>
                      </div>
                      {tank.Description && (
                        <div className="tank-spec">
                          <span className="spec-label">Description:</span>
                          <span className="spec-value description">{tank.Description}</span>
                        </div>
                      )}
                    </div>
                    <div className="baby-tank-status available">
                      ✅ Available for Baby Fish
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* In-Use Baby Tanks */}
          <div className="in-use-baby-tanks-section">
            <div className="section-header">
              <h2>Baby Tanks in Use ({inUseBabyTanks.length})</h2>
              <p className="section-description">
                These baby tanks currently contain baby fish batches
              </p>
            </div>
            
            {inUseBabyTanks.length === 0 ? (
              <div className="no-in-use-baby-tanks">
                <p>No baby tanks are currently in use.</p>
              </div>
            ) : (
              <div className="in-use-baby-tanks-grid">
                {inUseBabyTanks.map(tank => {
                  const babyRecord = babyRecords.find(baby => baby.BabyTankID === tank._id);
                  const breedingRecord = breedingRecords.find(record => record._id === babyRecord?.BreedingID);
                  const babyAge = babyRecord ? calculateBabyAge(babyRecord.BirthDate) : 0;
                  const ageCategory = babyRecord ? getBabyAgeCategory(babyAge) : 'Unknown';
                  const isBabyEditing = editingBaby === babyRecord?._id;
                  
                  return (
                    <div key={tank._id} className="baby-tank-card in-use">
                      <div className="baby-tank-header">
                        <div className="tank-code">{tank.TankCode}</div>
                        <div className="tank-type">{tank.TankType}</div>
                      </div>
                      
                      {babyRecord && (
                        <div className="baby-tank-content">
                          <div className="baby-batch-info">
                            <h4>Current Baby Batch</h4>
                            <div className="baby-details">
                              <div className="baby-detail">
                                <span className="detail-label">Fish Type:</span>
                                <span className="detail-value">{breedingRecord?.fishType || 'Unknown'}</span>
                              </div>
                              <div className="baby-detail">
                                <span className="detail-label">Baby Count:</span>
                                {isBabyEditing ? (
                                  <input
                                    type="number"
                                    name="BabyCount"
                                    value={editBabyForm.BabyCount}
                                    onChange={handleBabyEditChange}
                                    className="edit-input small"
                                    min="0"
                                  />
                                ) : (
                                  <span className="detail-value highlight">{babyRecord.BabyCount} babies</span>
                                )}
                              </div>
                              <div className="baby-detail">
                                <span className="detail-label">Birth Date:</span>
                                {isBabyEditing ? (
                                  <input
                                    type="date"
                                    name="BirthDate"
                                    value={editBabyForm.BirthDate}
                                    onChange={handleBabyEditChange}
                                    className="edit-input"
                                  />
                                ) : (
                                  <span className="detail-value">{formatDate(babyRecord.BirthDate)}</span>
                                )}
                              </div>
                              <div className="baby-detail">
                                <span className="detail-label">Age:</span>
                                <span className="detail-value">{babyAge} days ({ageCategory})</span>
                              </div>
                              {isBabyEditing ? (
                                <div className="baby-detail">
                                  <span className="detail-label">Description:</span>
                                  <textarea
                                    name="Description"
                                    value={editBabyForm.Description}
                                    onChange={handleBabyEditChange}
                                    className="edit-textarea"
                                    placeholder="Add notes..."
                                    rows="2"
                                  />
                                </div>
                              ) : (
                                babyRecord.Description && (
                                  <div className="baby-detail">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value description">{babyRecord.Description}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                          
                          <div className="baby-tank-actions">
                            {isBabyEditing ? (
                              <>
                                <button 
                                  className="save-btn"
                                  onClick={() => updateBabyRecord(babyRecord._id)}
                                >
                                  Save Changes
                                </button>
                                <button 
                                  className="cancel-btn"
                                  onClick={cancelEditBaby}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button 
                                className="edit-btn"
                                onClick={() => startEditBaby(babyRecord)}
                              >
                                Edit Batch
                              </button>
                            )}
                            <button 
                              className="delete-baby-btn"
                              onClick={() => deleteBabyRecord(babyRecord._id, babyRecord.BreedingID)}
                            >
                              Free Up Tank
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="baby-tank-status in-use">
                        🐠 Currently Housing {babyRecord?.BabyCount || 0} Babies
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMother;