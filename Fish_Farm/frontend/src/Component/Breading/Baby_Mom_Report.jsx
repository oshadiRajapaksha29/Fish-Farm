//frontend/src/Component/Breading/Reports/Baby_Mom_Report.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Baby_Mom_Report.css";

const API_URL = "http://localhost:5000";

const Baby_Mom_Report = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [babyRecords, setBabyRecords] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    fishType: "",
    dateFrom: "",
    dateTo: "",
    successStatus: "all"
  });
  const [expandedRecords, setExpandedRecords] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [breedingResponse, babiesResponse, tanksResponse] = await Promise.all([
        axios.get(`${API_URL}/breeding`),
        axios.get(`${API_URL}/babies`).catch(err => ({ data: [] })),
        axios.get(`${API_URL}/tanksNew`)
      ]);

      const breedingData = breedingResponse.data.breedingRecords || breedingResponse.data || [];
      const babiesData = babiesResponse.data.babyRecords || babiesResponse.data || [];
      const tanksData = tanksResponse.data.tanks || tanksResponse.data || [];

      setBreedingRecords(breedingData);
      setBabyRecords(babiesData);
      setTanks(tanksData);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load breeding and baby records");
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

  const calculateSuccessRate = (breedingRecord) => {
    const babies = getBabiesForBreeding(breedingRecord._id);
    if (babies.length === 0) return { rate: 0, status: "No Babies", color: "#e74c3c" };
    
    const totalBabies = babies.reduce((sum, baby) => sum + baby.BabyCount, 0);
    const parentCount = breedingRecord.MotherCount + breedingRecord.FatherCount;
    const successRate = (totalBabies / parentCount) * 100;
    
    if (successRate >= 80) return { rate: successRate, status: "Excellent", color: "#27ae60" };
    if (successRate >= 50) return { rate: successRate, status: "Good", color: "#3498db" };
    if (successRate >= 20) return { rate: successRate, status: "Fair", color: "#f39c12" };
    return { rate: successRate, status: "Poor", color: "#e74c3c" };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      fishType: "",
      dateFrom: "",
      dateTo: "",
      successStatus: "all"
    });
  };

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const expandAllRecords = () => {
    const expanded = {};
    filteredRecords.forEach(record => {
      expanded[record._id] = true;
    });
    setExpandedRecords(expanded);
  };

  const collapseAllRecords = () => {
    setExpandedRecords({});
  };

  // Filter and sort records
  const filteredRecords = breedingRecords
    .filter(record => {
      const matchesFishType = !filters.fishType || record.fishType === filters.fishType;
      
      const recordDate = new Date(record.BreedingDate);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      const matchesDateFrom = !fromDate || recordDate >= fromDate;
      const matchesDateTo = !toDate || recordDate <= toDate;

      const successInfo = calculateSuccessRate(record);
      const matchesSuccessStatus = filters.successStatus === "all" || 
        (filters.successStatus === "success" && successInfo.rate > 0) ||
        (filters.successStatus === "no_babies" && successInfo.rate === 0);

      return matchesFishType && matchesDateFrom && matchesDateTo && matchesSuccessStatus;
    })
    .sort((a, b) => new Date(b.BreedingDate) - new Date(a.BreedingDate));

  // Calculate overall statistics
  const totalBreedingRecords = breedingRecords.length;
  const totalBabyBatches = babyRecords.length;
  const totalBabyFish = babyRecords.reduce((sum, baby) => sum + baby.BabyCount, 0);
  
  const successfulBreedings = breedingRecords.filter(record => 
    getBabiesForBreeding(record._id).length > 0
  ).length;
  
  const overallSuccessRate = totalBreedingRecords > 0 
    ? Math.round((successfulBreedings / totalBreedingRecords) * 100) 
    : 0;

  const getUniqueFishTypes = () => {
    const fishTypes = breedingRecords.map(record => record.fishType);
    return [...new Set(fishTypes)].filter(Boolean);
  };

  const exportToCSV = () => {
    const headers = [
      'Fish Type',
      'Breeding Date',
      'Mother Count',
      'Father Count',
      'Breeding Tank',
      'Baby Batches',
      'Total Babies',
      'Success Rate',
      'Success Status'
    ];

    const csvData = filteredRecords.map(record => {
      const tankInfo = getTankInfo(record.tankId);
      const babies = getBabiesForBreeding(record._id);
      const totalBabies = babies.reduce((sum, baby) => sum + baby.BabyCount, 0);
      const successInfo = calculateSuccessRate(record);

      return [
        record.fishType,
        formatDate(record.BreedingDate),
        record.MotherCount,
        record.FatherCount,
        tankInfo.TankCode,
        babies.length,
        totalBabies,
        `${successInfo.rate.toFixed(1)}%`,
        successInfo.status
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breeding-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="baby-mom-report-container">
        <div className="loading">Loading breeding and baby reports...</div>
      </div>
    );
  }

  return (
    <div className="baby-mom-report-container">
      <div className="report-header">
        <h1 className="report-title">🐟 Baby & Mother Fish Report</h1>
        <p className="report-subtitle">
          Comprehensive overview of breeding activities and baby fish production
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
        <h2>📊 Breeding Performance Overview</h2>
        <div className="statistics-grid">
          <div className="stat-card total-breeding">
            <div className="stat-icon">🐟</div>
            <div className="stat-content">
              <span className="stat-number">{totalBreedingRecords}</span>
              <span className="stat-label">Total Breeding Records</span>
            </div>
          </div>
          <div className="stat-card successful-breeding">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-number">{successfulBreedings}</span>
              <span className="stat-label">Successful Breedings</span>
            </div>
          </div>
          <div className="stat-card baby-batches">
            <div className="stat-icon">🐠</div>
            <div className="stat-content">
              <span className="stat-number">{totalBabyBatches}</span>
              <span className="stat-label">Baby Batches</span>
            </div>
          </div>
          <div className="stat-card total-babies">
            <div className="stat-icon">🔢</div>
            <div className="stat-content">
              <span className="stat-number">{totalBabyFish}</span>
              <span className="stat-label">Total Baby Fish</span>
            </div>
          </div>
          <div className="stat-card success-rate">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <span className="stat-number">{overallSuccessRate}%</span>
              <span className="stat-label">Overall Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h3>🔍 Filter Reports</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Fish Type</label>
            <select
              name="fishType"
              value={filters.fishType}
              onChange={handleFilterChange}
            >
              <option value="">All Fish Types</option>
              {getUniqueFishTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Success Status</label>
            <select
              name="successStatus"
              value={filters.successStatus}
              onChange={handleFilterChange}
            >
              <option value="all">All Records</option>
              <option value="success">With Babies</option>
              <option value="no_babies">No Babies</option>
            </select>
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

      {/* Report Actions */}
      <div className="report-actions">
        <div className="action-buttons">
          <button onClick={expandAllRecords} className="action-btn expand-all">
            📂 Expand All
          </button>
          <button onClick={collapseAllRecords} className="action-btn collapse-all">
            📁 Collapse All
          </button>
          <button onClick={exportToCSV} className="action-btn export-csv">
            📊 Export to CSV
          </button>
        </div>
        <div className="results-count">
          Showing {filteredRecords.length} of {breedingRecords.length} records
        </div>
      </div>

      {/* Breeding Records Report */}
      <div className="report-section">
        <div className="section-header">
          <h2>📋 Breeding Records Report ({filteredRecords.length})</h2>
          <div className="section-info">
            <span className="success-rate-badge">
              Overall Success: {overallSuccessRate}%
            </span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="no-records">
            {breedingRecords.length === 0 
              ? "No breeding records found. Start by adding breeding records."
              : "No records match your current filters."
            }
          </div>
        ) : (
          <div className="records-grid">
            {filteredRecords.map(record => {
              const tankInfo = getTankInfo(record.tankId);
              const babyRecordsForBreeding = getBabiesForBreeding(record._id);
              const totalBabies = babyRecordsForBreeding.reduce((sum, baby) => sum + baby.BabyCount, 0);
              const successInfo = calculateSuccessRate(record);
              const isExpanded = expandedRecords[record._id];
              
              return (
                <div key={record._id} className="report-record-card">
                  <div 
                    className="record-summary"
                    onClick={() => toggleRecordExpansion(record._id)}
                  >
                    <div className="summary-main">
                      <div className="fish-type-section">
                        <h3 className="fish-type">{record.fishType}</h3>
                        <span className="breeding-date">
                          🗓️ {formatDate(record.BreedingDate)}
                        </span>
                      </div>
                      
                      <div className="summary-stats">
                        <div className="stat-item">
                          <span className="stat-label">Parents:</span>
                          <span className="stat-value parents">
                            {record.MotherCount}♀ {record.FatherCount}♂
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Tank:</span>
                          <span className="stat-value tank">{tankInfo.TankCode}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Baby Batches:</span>
                          <span className="stat-value batches">{babyRecordsForBreeding.length}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total Babies:</span>
                          <span className="stat-value babies">{totalBabies}</span>
                        </div>
                      </div>
                    </div>

                    <div className="summary-status">
                      <div 
                        className="success-indicator"
                        style={{ backgroundColor: successInfo.color }}
                      >
                        <span className="success-rate">{successInfo.rate > 0 ? `${successInfo.rate.toFixed(1)}%` : 'No Babies'}</span>
                        <span className="success-status">{successInfo.status}</span>
                      </div>
                      <div className="expand-indicator">
                        {isExpanded ? "▲" : "▼"}
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
                          <h4>🐠 Baby Fish Records ({babyRecordsForBreeding.length} batches)</h4>
                          <div className="baby-records-grid">
                            {babyRecordsForBreeding.map((baby, index) => {
                              const babyTankInfo = getBabyTankInfo(baby.BabyTankID);
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
                                    <div className="baby-detail">
                                      <span className="label">Baby Tank:</span>
                                      <span className="value">{babyTankInfo.TankCode}</span>
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
                            <p>No baby records yet for this breeding attempt.</p>
                          </div>
                        </div>
                      )}

                      {/* Success Analysis */}
                      <div className="detail-section">
                        <h4>📈 Success Analysis</h4>
                        <div className="success-analysis">
                          <div className="analysis-item">
                            <span className="analysis-label">Parent to Baby Ratio:</span>
                            <span className="analysis-value">
                              {totalBabies > 0 
                                ? `1:${(totalBabies / (record.MotherCount + record.FatherCount)).toFixed(1)}` 
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="analysis-item">
                            <span className="analysis-label">Baby Batches:</span>
                            <span className="analysis-value">{babyRecordsForBreeding.length}</span>
                          </div>
                          <div className="analysis-item">
                            <span className="analysis-label">Total Babies Produced:</span>
                            <span className="analysis-value highlight">{totalBabies}</span>
                          </div>
                          <div className="analysis-item">
                            <span className="analysis-label">Success Rating:</span>
                            <span 
                              className="analysis-value status"
                              style={{ color: successInfo.color }}
                            >
                              {successInfo.status} ({successInfo.rate.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="summary-section">
        <h2>📋 Summary Statistics</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Fish Type Distribution</h4>
            <div className="type-distribution">
              {getUniqueFishTypes().map(type => {
                const typeRecords = breedingRecords.filter(record => record.fishType === type);
                const typeWithBabies = typeRecords.filter(record => 
                  getBabiesForBreeding(record._id).length > 0
                );
                const successRate = typeRecords.length > 0 
                  ? Math.round((typeWithBabies.length / typeRecords.length) * 100) 
                  : 0;
                
                return (
                  <div key={type} className="type-item">
                    <span className="type-name">{type}</span>
                    <span className="type-stats">
                      {typeRecords.length} breedings • {successRate}% success
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="summary-card">
            <h4>Performance Overview</h4>
            <div className="performance-stats">
              <div className="performance-item">
                <span className="performance-label">Total Breeding Attempts:</span>
                <span className="performance-value">{totalBreedingRecords}</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Successful Breedings:</span>
                <span className="performance-value success">{successfulBreedings}</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Failed Breedings:</span>
                <span className="performance-value failed">{totalBreedingRecords - successfulBreedings}</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Overall Success Rate:</span>
                <span className="performance-value rate">{overallSuccessRate}%</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Total Baby Fish:</span>
                <span className="performance-value babies">{totalBabyFish}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Baby_Mom_Report;