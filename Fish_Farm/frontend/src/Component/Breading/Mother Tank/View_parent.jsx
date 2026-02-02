//frontend/src/Component/Breading/Parent Tank/View_parent.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./View_parent.css";

const API_URL = "http://localhost:5000";

const View_parent = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [babyRecords, setBabyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    fishType: "",
    tankId: "",
    dateFrom: "",
    dateTo: "",
    status: "all"
  });
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

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
      setError("Failed to load parent fish records");
    } finally {
      setLoading(false);
    }
  };

  const getTankInfo = (tankId) => {
    const tank = tanks.find(t => t._id === tankId);
    return tank || { TankCode: "Unknown", TankType: "N/A" };
  };

  const getBabiesForBreeding = (breedingId) => {
    return babyRecords.filter(baby => baby.BreedingID === breedingId);
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
    if (ageInDays < 7) return { category: "Newborn", color: "#e74c3c" };
    if (ageInDays < 30) return { category: "Juvenile", color: "#f39c12" };
    if (ageInDays < 90) return { category: "Young", color: "#3498db" };
    return { category: "Mature", color: "#27ae60" };
  };

  const getBreedingStatus = (record) => {
    const babies = getBabiesForBreeding(record._id);
    if (babies.length > 0) {
      return { status: "Successful", color: "#27ae60", icon: "✅" };
    }
    
    const breedingDate = new Date(record.BreedingDate);
    const today = new Date();
    const daysSinceBreeding = Math.ceil((today - breedingDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceBreeding < 7) {
      return { status: "Breeding", color: "#3498db", icon: "🐟" };
    } else if (daysSinceBreeding < 30) {
      return { status: "Waiting", color: "#f39c12", icon: "⏳" };
    } else {
      return { status: "Failed", color: "#e74c3c", icon: "❌" };
    }
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
      dateTo: "",
      status: "all"
    });
  };

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const handleUpdate = (recordId) => {
    navigate(`/update-parent/${recordId}`);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this breeding record? This will also delete all associated baby records.")) {
      return;
    }

    try {
      // First, delete associated baby records
      const associatedBabies = babyRecords.filter(baby => baby.BreedingID === recordId);
      for (const baby of associatedBabies) {
        await axios.delete(`${API_URL}/babies/${baby._id}`);
      }
      
      // Then delete the breeding record
      await axios.delete(`${API_URL}/breeding/${recordId}`);
      alert("Breeding record and associated baby records deleted successfully!");
      fetchData(); // Refresh the data
    } catch (err) {
      console.error("Error deleting breeding record:", err);
      alert("Failed to delete breeding record");
    }
  };

  const getUniqueFishTypes = () => {
    const fishTypes = breedingRecords.map(record => record.fishType);
    return [...new Set(fishTypes)].filter(Boolean);
  };

  const getInUseTanks = () => {
    const inUseTankIds = new Set(breedingRecords.map(record => record.tankId));
    return tanks.filter(tank => inUseTankIds.has(tank._id));
  };

  const filteredRecords = breedingRecords.filter(record => {
    const matchesFishType = !filter.fishType || record.fishType === filter.fishType;
    const matchesTank = !filter.tankId || record.tankId === filter.tankId;
    
    const recordDate = new Date(record.BreedingDate);
    const fromDate = filter.dateFrom ? new Date(filter.dateFrom) : null;
    const toDate = filter.dateTo ? new Date(filter.dateTo) : null;
    
    const matchesDateFrom = !fromDate || recordDate >= fromDate;
    const matchesDateTo = !toDate || recordDate <= toDate;

    const statusInfo = getBreedingStatus(record);
    const matchesStatus = filter.status === "all" || statusInfo.status === filter.status;
    
    return matchesFishType && matchesTank && matchesDateFrom && matchesDateTo && matchesStatus;
  });

  // Calculate statistics
  const totalRecords = breedingRecords.length;
  const successfulBreedings = breedingRecords.filter(record => 
    getBabiesForBreeding(record._id).length > 0
  ).length;
  const failedBreedings = totalRecords - successfulBreedings;

  if (loading) {
    return (
      <div className="view-parent-container">
        <div className="loading">Loading parent fish records...</div>
      </div>
    );
  }

  return (
    <div className="view-parent-container">
      <div className="view-parent-header">
        <h1 className="view-parent-title">Parent Fish Records Management</h1>
        <p className="view-parent-subtitle">
          View, update, and manage all breeding records and parent fish
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

      {/* Statistics Overview */}
      <div className="statistics-section">
        <h2>📊 Parent Fish Overview</h2>
        <div className="statistics-grid">
          <div className="stat-card total">
            <div className="stat-icon">🐟</div>
            <div className="stat-content">
              <span className="stat-number">{totalRecords}</span>
              <span className="stat-label">Total Records</span>
            </div>
          </div>
          <div className="stat-card successful">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-number">{successfulBreedings}</span>
              <span className="stat-label">Successful</span>
            </div>
          </div>
          <div className="stat-card failed">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <span className="stat-number">{failedBreedings}</span>
              <span className="stat-label">Failed</span>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-number">
                {breedingRecords.filter(record => getBreedingStatus(record).status === "Breeding").length}
              </span>
              <span className="stat-label">Breeding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>🔍 Filter Records</h3>
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
              {getInUseTanks().map(tank => (
                <option key={tank._id} value={tank._id}>
                  {tank.TankCode}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Status</option>
              <option value="Successful">Successful</option>
              <option value="Breeding">Breeding</option>
              <option value="Waiting">Waiting</option>
              <option value="Failed">Failed</option>
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
              🗑️ Clear Filters
            </button>
            <button onClick={fetchData} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Records Section */}
      <div className="records-section">
        <div className="section-header">
          <h2>Parent Fish Records ({filteredRecords.length})</h2>
          <div className="section-actions">
            <button onClick={fetchData} className="refresh-btn">
              Refresh
            </button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="no-records">
            {breedingRecords.length === 0 
              ? "No parent fish records found. Start by adding a new breeding record."
              : "No records match your current filters."
            }
          </div>
        ) : (
          <div className="records-grid">
            {filteredRecords.map(record => {
              const tankInfo = getTankInfo(record.tankId);
              const babyRecordsForBreeding = getBabiesForBreeding(record._id);
              const totalBabies = babyRecordsForBreeding.reduce((sum, baby) => sum + baby.BabyCount, 0);
              const statusInfo = getBreedingStatus(record);
              const isExpanded = expandedRecord === record._id;
              
              return (
                <div key={record._id} className="record-card">
                  <div className="record-header">
                    <div className="record-title">
                      <h3>{record.fishType}</h3>
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
                      <button 
                        className="update-btn"
                        onClick={() => handleUpdate(record._id)}
                        title="Update record"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(record._id)}
                        title="Delete record"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="record-summary">
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="label">Tank:</span>
                        <span className="value">{tankInfo.TankCode}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Parents:</span>
                        <span className="value">{record.MotherCount}♀ {record.FatherCount}♂</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Baby Batches:</span>
                        <span className="value">{babyRecordsForBreeding.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Total Babies:</span>
                        <span className="value">{totalBabies}</span>
                      </div>
                    </div>
                    
                    <div className="status-section">
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        <span className="status-icon">{statusInfo.icon}</span>
                        <span className="status-text">{statusInfo.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="record-details">
                      {/* Breeding Information */}
                      <div className="detail-section">
                        <h4>🐟 Breeding Information</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Fish Type:</span>
                            <span className="detail-value">{record.fishType}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Breeding Date:</span>
                            <span className="detail-value">{formatDate(record.BreedingDate)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Mother Count:</span>
                            <span className="detail-value">{record.MotherCount}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Father Count:</span>
                            <span className="detail-value">{record.FatherCount}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Breeding Tank:</span>
                            <span className="detail-value">{tankInfo.TankCode} ({tankInfo.TankType})</span>
                          </div>
                          {record.Description && (
                            <div className="detail-item full-width">
                              <span className="detail-label">Notes:</span>
                              <span className="detail-value description">{record.Description}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Baby Records */}
                      {babyRecordsForBreeding.length > 0 ? (
                        <div className="detail-section">
                          <h4>🐠 Baby Fish Records</h4>
                          <div className="baby-records-grid">
                            {babyRecordsForBreeding.map((baby, index) => {
                              const babyAge = calculateBabyAge(baby.BirthDate);
                              const ageInfo = getBabyAgeCategory(babyAge);
                              
                              return (
                                <div key={baby._id} className="baby-record-card">
                                  <div className="baby-record-header">
                                    <h5>Batch #{index + 1}</h5>
                                    <div 
                                      className="age-badge"
                                      style={{ backgroundColor: ageInfo.color }}
                                    >
                                      {babyAge}d • {ageInfo.category}
                                    </div>
                                  </div>
                                  <div className="baby-details">
                                    <div className="baby-detail">
                                      <span className="label">Birth Date:</span>
                                      <span className="value">{formatDate(baby.BirthDate)}</span>
                                    </div>
                                    <div className="baby-detail">
                                      <span className="label">Baby Count:</span>
                                      <span className="value highlight">{baby.BabyCount} babies</span>
                                    </div>
                                    {baby.Description && (
                                      <div className="baby-detail full-width">
                                        <span className="label">Notes:</span>
                                        <span className="value description">{baby.Description}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="no-babies-section">
                          <h4>🐠 Baby Fish Records</h4>
                          <div className="no-babies-message">
                            <p>No baby records for this breeding attempt.</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="action-section">
                        <button 
                          className="btn btn-update"
                          onClick={() => handleUpdate(record._id)}
                        >
                          ✏️ Update Record
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => handleDelete(record._id)}
                        >
                          🗑️ Delete Record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default View_parent;