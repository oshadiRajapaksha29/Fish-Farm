import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ViewAllTank.css";
import TankConfigForm from './TankConfigForm';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Status color mapping for different tank states
const VTStatusColor = (status) => {
  switch (status) {
    case "GOOD": return "#10b981";      // Green for optimal
    case "WARN": return "#f59e0b";      // Orange for warning
    case "LOW": return "#f97316";       // Amber for low water
    case "CRITICAL": return "#ef4444";  // Red for critical
    default: return "#6b7280";          // Gray for no data
  }
};

// Status text display with fallback
const VTStatusText = (status, statusText) => {
  if (statusText) return statusText;
  switch (status) {
    case "GOOD": return "Perfect";
    case "WARN": return "Warning";
    case "LOW": return "Low Water";
    case "CRITICAL": return "Critical";
    default: return "No Data";
  }
};

// Status icons for visual representation
const VTStatusIcon = (status) => {
  switch (status) {
    case "GOOD": return "✅";
    case "WARN": return "⚠️";
    case "LOW": return "🔻";
    case "CRITICAL": return "🚨";
    default: return "📊";
  }
};

// Individual tank card component
const VTTankCard = ({ tank, VTLiveData, VTOnUpdate, onConfigure, onDelete }) => {
  const VTHasSensor = VTLiveData[tank.TankCode] !== null;
  const VTData = VTLiveData[tank.TankCode];
  
  const VTHasRealTimeData = tank.RealTime && tank.RealTime.UpdatedAt;
  const VTCurrentData = VTHasSensor ? VTData : (VTHasRealTimeData ? tank.RealTime : null);

  // Calculate LED status based on water levels
  const getLEDStatus = () => {
    if (!VTCurrentData) return { red: false, green: false, both: false };
    
    const waterHeight = VTCurrentData.FillHeightCm;
    const minWater = VTCurrentData.MinWaterHeightCm || 1.0;
    const maxWater = VTCurrentData.MaxWaterHeightCm || 3.0;
    const idealWater = VTCurrentData.IdealWaterHeightCm || 2.0;
    
    if (waterHeight < minWater) return { red: true, green: false, both: false };
    if (waterHeight > maxWater) return { red: true, green: true, both: true };
    if (waterHeight >= idealWater) return { red: false, green: true, both: false };
    return { red: false, green: true, both: false };
  };

  const ledStatus = getLEDStatus();

  // Get LED text display
  const getLEDText = () => {
    if (!VTCurrentData) return { red: "OFF", green: "OFF", both: "OFF" };
    
    const waterHeight = VTCurrentData.FillHeightCm;
    const minWater = VTCurrentData.MinWaterHeightCm || 1.0;
    const maxWater = VTCurrentData.MaxWaterHeightCm || 3.0;
    
    return {
      red: waterHeight < minWater ? 'ON' : 'OFF',
      green: (waterHeight >= minWater && waterHeight <= maxWater) ? 'ON' : 'OFF',
      both: waterHeight > maxWater ? 'ON' : 'OFF'
    };
  };

  const ledText = getLEDText();

  // Handle tank deletion with confirmation
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete tank "${tank.TankCode}"? This action cannot be undone.`)) {
      onDelete(tank._id, tank.TankCode);
    }
  };

  return (
    <div className="VT-tank-card">
      {/* Tank Header Section */}
      <div className="VT-tank-card-header">
        <div className="VT-tank-title-section">
          <div className="VT-tank-status-indicator">
            <div 
              className="VT-status-pulse"
              style={{ 
                backgroundColor: VTCurrentData ? VTStatusColor(VTCurrentData.Status) : "#6b7280",
                boxShadow: VTCurrentData ? `0 0 0 0 ${VTStatusColor(VTCurrentData.Status)}40` : "none"
              }}
            />
            <div className="VT-tank-info-main">
              <h3 className="VT-tank-code">{tank.TankCode}</h3>
              <span className="VT-tank-type">{tank.TankType}</span>
            </div>
          </div>
          <div className={`VT-sensor-badge ${VTHasSensor ? 'VT-live' : VTHasRealTimeData ? 'VT-stored' : 'VT-manual'}`}>
            {VTHasSensor ? "📡 Live" : VTHasRealTimeData ? "💾 Stored" : "📋 Manual"}
          </div>
        </div>
        
        <div className="VT-tank-location">
          <span className="VT-location-icon">📍</span>
          {tank.TankLocation}
        </div>
      </div>

      {/* Tank Specifications */}
      <div className="VT-tank-specs">
        <div className="VT-spec-item">
          <div className="VT-spec-icon">📏</div>
          <div className="VT-spec-info">
            <span className="VT-spec-label">Dimensions</span>
            <span className="VT-spec-value">{tank.Length}×{tank.Width}×{tank.Height}m</span>
          </div>
        </div>
        <div className="VT-spec-item">
          <div className="VT-spec-icon">⚙️</div>
          <div className="VT-spec-info">
            <span className="VT-spec-label">Valves</span>
            <span className="VT-spec-value">
              In: {tank.InletValves} | Out: {tank.OutletValves}
            </span>
          </div>
        </div>
      </div>

      {/* Water Level Display */}
      {VTCurrentData ? (
        <div className="VT-water-level-display">
          <div className="VT-level-header">
            <div className="VT-level-title">
              <span className="VT-title-icon">💧</span>
              Water Level
              {VTHasSensor && <span className="VT-live-indicator"></span>}
            </div>
            <div 
              className="VT-status-tag"
              style={{ 
                backgroundColor: `${VTStatusColor(VTCurrentData.Status)}20`,
                color: VTStatusColor(VTCurrentData.Status),
                border: `1px solid ${VTStatusColor(VTCurrentData.Status)}40`
              }}
            >
              {VTStatusIcon(VTCurrentData.Status)} {VTCurrentData.StatusText || VTStatusText(VTCurrentData.Status)}
            </div>
          </div>
          
          {/* Percentage Display */}
          <div className="VT-percentage-display">
            <div className="VT-percentage-value">{VTCurrentData.WaterLevelPercent}%</div>
            <div className="VT-percentage-label">Current Fill Level</div>
          </div>
          
          {/* Progress Bar */}
          <div className="VT-progress-container">
            <div 
              className="VT-progress-fill"
              style={{ 
                width: `${VTCurrentData.WaterLevelPercent}%`,
                backgroundColor: VTStatusColor(VTCurrentData.Status),
                boxShadow: `0 2px 8px ${VTStatusColor(VTCurrentData.Status)}40`
              }}
            />
            <div className="VT-progress-markers">
              <span className="VT-marker">0%</span>
              <span className="VT-marker">50%</span>
              <span className="VT-marker">100%</span>
            </div>
          </div>
          
          {/* Sensor Metrics */}
          <div className="VT-sensor-metrics">
            <div className="VT-metric">
              <span className="VT-metric-icon">📐</span>
              <div className="VT-metric-info">
                <span className="VT-metric-label">Distance</span>
                <span className="VT-metric-value">{VTCurrentData.DistanceCm} cm</span>
              </div>
            </div>
            <div className="VT-metric">
              <span className="VT-metric-icon">🔼</span>
              <div className="VT-metric-info">
                <span className="VT-metric-label">Water Depth</span>
                <span className="VT-metric-value">{VTCurrentData.FillHeightCm} cm</span>
              </div>
            </div>
            <div className="VT-metric">
              <span className="VT-metric-icon">🎯</span>
              <div className="VT-metric-info">
                <span className="VT-metric-label">Target</span>
                <span className="VT-metric-value">{VTCurrentData.IdealWaterHeightCm} cm</span>
              </div>
            </div>
          </div>
          
          {/* LED Status Display */}
          <div className="VT-led-status">
            <div className="VT-led-title">ESP32 LED Status:</div>
            <div className="VT-led-indicators">
              <div className={`VT-led-indicator ${ledStatus.red && !ledStatus.both ? 'VT-led-active' : ''}`}>
                <div className="VT-led-red"></div>
                <span>Low Water ({ledText.red})</span>
              </div>
              <div className={`VT-led-indicator ${ledStatus.green && !ledStatus.both ? 'VT-led-active' : ''}`}>
                <div className="VT-led-green"></div>
                <span>Perfect ({ledText.green})</span>
              </div>
              <div className={`VT-led-indicator ${ledStatus.both ? 'VT-led-active' : ''}`}>
                <div className="VT-led-both"></div>
                <span>Overflow ({ledText.both})</span>
              </div>
            </div>
          </div>
          
          {/* Offline Notice */}
          {!VTHasSensor && VTHasRealTimeData && (
            <div className="VT-offline-notice">
              <span className="VT-offline-icon">🔴</span>
              Sensor offline - showing last known data
            </div>
          )}
        </div>
      ) : (
        // No Data State
        <div className="VT-no-data-state">
          <div className="VT-no-data-icon">📊</div>
          <div className="VT-no-data-content">
            <h4>No Data Available</h4>
            <p>This tank requires automated measurements</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="VT-tank-actions">
       
        <button 
          className="VT-btn VT-btn-primary"
          onClick={() => VTOnUpdate(tank.TankCode)}
        >
          <span className="VT-btn-icon">🔄</span>
          Refresh
        </button>
        <button 
          className="VT-btn VT-btn-config"
          onClick={() => onConfigure(tank)}
        >
          <span className="VT-btn-icon">⚙️</span>
          Configure
        </button>
        <button 
          className="VT-btn VT-btn-danger"
          onClick={handleDelete}
        >
          <span className="VT-btn-icon">🗑️</span>
          Delete
        </button>
      </div>
    </div>
  );
};

// Main ViewAllTank Component
const ViewAllTank = () => {
  // State management
  const [VTTanks, VTSetTanks] = useState([]);
  const [VTLoading, VTSetLoading] = useState(true);
  const [VTError, VTSetError] = useState(null);
  const [VTLiveData, VTSetLiveData] = useState({});
  const [VTSearchTerm, VTSetSearchTerm] = useState("");
  const [VTStatusFilter, VTSetStatusFilter] = useState("all");
  const [VTTypeFilter, VTSetTypeFilter] = useState("all");
  const [selectedTank, setSelectedTank] = useState(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Refs and connection management
  const VTEventSourcesRef = useRef({});
  const [VTUpdateTrigger, VTSetUpdateTrigger] = useState(0);
  const [VTConnectionStatus, VTSetConnectionStatus] = useState({});

  // Update live data for specific tank
  const VTUpdateLiveData = (tankCode, newData) => {
    VTSetLiveData(prev => ({
      ...prev,
      [tankCode]: newData
    }));
    VTSetUpdateTrigger(prev => prev + 1);
  };

  // Fetch all tanks from API
  const VTFetchAllTanks = async () => {
    try {
      VTSetLoading(true);
      const response = await axios.get(`${API_URL}/tanksNew`);
      const tanksData = response.data.tanks;
      VTSetTanks(tanksData);
      
      const VTInitialLiveData = {};
      const VTInitialConnectionStatus = {};
      
      // Initialize live data and connection status
      tanksData.forEach(tank => {
        if (tank.RealTime && tank.RealTime.UpdatedAt) {
          VTInitialLiveData[tank.TankCode] = {
            WaterLevelPercent: tank.RealTime.WaterLevelPercent,
            DistanceCm: tank.RealTime.DistanceCm,
            FillHeightCm: tank.RealTime.FillHeightCm,
            Status: tank.RealTime.Status,
            StatusText: tank.RealTime.StatusText,
            TankHeightCm: tank.RealTime.TankHeightCm,
            IdealWaterHeightCm: tank.RealTime.IdealWaterHeightCm,
            MinWaterHeightCm: tank.RealTime.MinWaterHeightCm,
            MaxWaterHeightCm: tank.RealTime.MaxWaterHeightCm,
            UpdatedAt: tank.RealTime.UpdatedAt
          };
          VTInitialConnectionStatus[tank.TankCode] = 'VT-connected';
        } else {
          VTInitialLiveData[tank.TankCode] = null;
          VTInitialConnectionStatus[tank.TankCode] = 'VT-no-data';
        }
      });
      
      VTSetLiveData(VTInitialLiveData);
      VTSetConnectionStatus(VTInitialConnectionStatus);
      VTSetupEventSources(tanksData);
      
    } catch (err) {
      VTSetError("Failed to fetch tanks: " + err.message);
      console.error("Error fetching tanks:", err);
    } finally {
      VTSetLoading(false);
    }
  };

  // Setup EventSource connections for real-time updates
  const VTSetupEventSources = (tanksData) => {
    VTCleanupEventSources();
    
    const VTNewEventSources = {};
    const VTNewConnectionStatus = { ...VTConnectionStatus };
    
    tanksData.forEach(tank => {
      if (tank.TankCode) {
        try {
          const es = new EventSource(`${API_URL}/tanksNew/${tank.TankCode}/stream`);
          
          es.addEventListener("snapshot", (event) => {
            try {
              const data = JSON.parse(event.data);
              VTUpdateLiveData(tank.TankCode, data);
              VTNewConnectionStatus[tank.TankCode] = 'VT-live';
              VTSetConnectionStatus(VTNewConnectionStatus);
            } catch (err) {
              console.error(`Error parsing snapshot for ${tank.TankCode}:`, err);
            }
          });
          
          es.addEventListener("message", (event) => {
            try {
              const data = JSON.parse(event.data);
              VTUpdateLiveData(tank.TankCode, data);
              VTNewConnectionStatus[tank.TankCode] = 'VT-live';
              VTSetConnectionStatus(VTNewConnectionStatus);
            } catch (err) {
              console.error(`Error parsing SSE data for ${tank.TankCode}:`, err);
            }
          });
          
          es.onerror = (err) => {
            console.error(`EventSource error for ${tank.TankCode}:`, err);
            VTNewConnectionStatus[tank.TankCode] = 'VT-error';
            VTSetConnectionStatus(VTNewConnectionStatus);
          };
          
          es.onopen = () => {
            console.log(`EventSource connected for ${tank.TankCode}`);
            VTNewConnectionStatus[tank.TankCode] = 'VT-connected';
            VTSetConnectionStatus(VTNewConnectionStatus);
          };
          
          VTNewEventSources[tank.TankCode] = es;
        } catch (error) {
          console.error(`Failed to create EventSource for ${tank.TankCode}:`, error);
          VTNewConnectionStatus[tank.TankCode] = 'VT-error';
          VTSetConnectionStatus(VTNewConnectionStatus);
        }
      }
    });
    
    VTEventSourcesRef.current = VTNewEventSources;
  };

  // Cleanup EventSource connections
  const VTCleanupEventSources = () => {
    Object.entries(VTEventSourcesRef.current).forEach(([tankCode, es]) => {
      if (es && es.readyState !== EventSource.CLOSED) {
        es.close();
        console.log(`Closed EventSource for ${tankCode}`);
      }
    });
    VTEventSourcesRef.current = {};
  };

  // Refresh data for specific tank
  const VTRefreshTankData = async (tankCode) => {
    try {
      console.log(`Refreshing data for tank: ${tankCode}`);
      const response = await axios.get(`${API_URL}/tanksNew/byCode/${tankCode}`);
      const tank = response.data.tank;
      
      if (tank.RealTime && tank.RealTime.UpdatedAt) {
        VTUpdateLiveData(tankCode, {
          WaterLevelPercent: tank.RealTime.WaterLevelPercent,
          DistanceCm: tank.RealTime.DistanceCm,
          FillHeightCm: tank.RealTime.FillHeightCm,
          Status: tank.RealTime.Status,
          StatusText: tank.RealTime.StatusText,
          TankHeightCm: tank.RealTime.TankHeightCm,
          IdealWaterHeightCm: tank.RealTime.IdealWaterHeightCm,
          MinWaterHeightCm: tank.RealTime.MinWaterHeightCm,
          MaxWaterHeightCm: tank.RealTime.MaxWaterHeightCm,
          UpdatedAt: tank.RealTime.UpdatedAt
        });
        console.log(`Updated data for tank: ${tankCode}`);
      } else {
        VTUpdateLiveData(tankCode, null);
        console.log(`No realtime data for tank: ${tankCode}`);
      }
    } catch (err) {
      console.error(`Error refreshing tank ${tankCode}:`, err);
    }
  };

  // Refresh all tank data
  const VTRefreshAllData = () => {
    console.log("Refreshing all tank data...");
    VTFetchAllTanks();
  };

  // Handle configuration updates
  const handleConfigUpdate = (updatedTank) => {
    console.log("Configuration updated for tank:", updatedTank.TankCode);
    VTSetTanks(prev => prev.map(tank => 
      tank._id === updatedTank._id ? updatedTank : tank
    ));
    
    // Update live data with new configuration
    if (VTLiveData[updatedTank.TankCode]) {
      VTUpdateLiveData(updatedTank.TankCode, {
        ...VTLiveData[updatedTank.TankCode],
        TankHeightCm: updatedTank.TankConfiguration?.TankHeightCm,
        IdealWaterHeightCm: updatedTank.TankConfiguration?.IdealWaterHeightCm,
        MinWaterHeightCm: updatedTank.TankConfiguration?.MinWaterHeightCm,
        MaxWaterHeightCm: updatedTank.TankConfiguration?.MaxWaterHeightCm
      });
    }
    
    setShowConfigForm(false);
    setSelectedTank(null);
  };

  // Open configuration form
  const handleConfigure = (tank) => {
    console.log("Configuring tank:", tank.TankCode);
    setSelectedTank(tank);
    setShowConfigForm(true);
  };

  // Handle tank deletion
  const handleDeleteTank = async (tankId, tankCode) => {
    setDeleteLoading(tankId);
    
    try {
      console.log(`Deleting tank: ${tankCode}`);
      
      // Close EventSource connection
      if (VTEventSourcesRef.current[tankCode]) {
        VTEventSourcesRef.current[tankCode].close();
        delete VTEventSourcesRef.current[tankCode];
      }
      
      // Remove from live data
      VTSetLiveData(prev => {
        const newLiveData = { ...prev };
        delete newLiveData[tankCode];
        return newLiveData;
      });
      
      // Remove from connection status
      VTSetConnectionStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[tankCode];
        return newStatus;
      });
      
      // Send delete request to backend
      const response = await axios.delete(`${API_URL}/tanksNew/${tankId}`);
      
      if (response.status === 200) {
        // Remove tank from state
        VTSetTanks(prev => prev.filter(tank => tank._id !== tankId));
        console.log(`Successfully deleted tank: ${tankCode}`);
        alert(`Tank "${tankCode}" has been deleted successfully.`);
      }
    } catch (error) {
      console.error(`Error deleting tank ${tankCode}:`, error);
      alert(`Failed to delete tank "${tankCode}". Please try again.`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter tanks based on search and filter criteria
  const VTFilteredTanks = VTTanks.filter(tank => {
    const VTMatchesSearch = tank.TankCode.toLowerCase().includes(VTSearchTerm.toLowerCase()) ||
                         tank.TankLocation.toLowerCase().includes(VTSearchTerm.toLowerCase()) ||
                         tank.TankType.toLowerCase().includes(VTSearchTerm.toLowerCase());
    
    const VTMatchesStatus = VTStatusFilter === "all" || 
                         (VTLiveData[tank.TankCode] && VTLiveData[tank.TankCode].Status === VTStatusFilter);
    
    const VTMatchesType = VTTypeFilter === "all" || tank.TankType === VTTypeFilter;
    
    return VTMatchesSearch && VTMatchesStatus && VTMatchesType;
  });

  // Categorize tanks by data availability
  const VTTanksWithLiveData = VTFilteredTanks.filter(tank => 
    VTLiveData[tank.TankCode] !== null && VTConnectionStatus[tank.TankCode] === 'VT-live'
  );
  const VTTanksWithStoredData = VTFilteredTanks.filter(tank => 
    VTLiveData[tank.TankCode] !== null && VTConnectionStatus[tank.TankCode] !== 'VT-live'
  );
  const VTTanksWithoutData = VTFilteredTanks.filter(tank => 
    VTLiveData[tank.TankCode] === null
  );

  const VTUniqueTankTypes = [...new Set(VTTanks.map(tank => tank.TankType))];

  // Count tanks by status
  const totalTanks = VTTanks.length;
  const liveTanks = VTTanksWithLiveData.length;
  const storedTanks = VTTanksWithStoredData.length;
  const manualTanks = VTTanksWithoutData.length;

  // Initialize component
  useEffect(() => {
    VTFetchAllTanks();
    
    return () => {
      VTCleanupEventSources();
    };
  }, []);

  // Loading state
  if (VTLoading) {
    return (
      <div className="VT-view-all-tanks-container">
        <div className="VT-loading-container">
          <div className="VT-loading-spinner"></div>
          <p>Loading tanks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (VTError) {
    return (
      <div className="VT-view-all-tanks-container">
        <div className="VT-error-container">
          <div className="VT-error-icon">⚠️</div>
          <h3>Error Loading Tanks</h3>
          <p>{VTError}</p>
          <button onClick={VTFetchAllTanks} className="VT-btn VT-btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="VT-view-all-tanks-container">
      {/* Dashboard Header */}
      <div className="VT-dashboard-header">
        <div className="VT-header-content">
          <div className="VT-header-title">
            <h1>🏗️ Tank Management Dashboard</h1>
            <p>
              Monitor and manage all your water tanks in real-time
            </p>
          </div>
          <button onClick={VTRefreshAllData} className="VT-btn-refresh-all">
            <span className="VT-btn-icon">🔄</span>
            Refresh All
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="VT-stats-grid">
          <div className="VT-stat-card VT-total">
            <div className="VT-stat-icon">🏗️</div>
            <div className="VT-stat-content">
              <span className="VT-stat-number">{totalTanks}</span>
              <span className="VT-stat-label">Total Tanks</span>
            </div>
          </div>
          <div className="VT-stat-card VT-live">
            <div className="VT-stat-icon">📡</div>
            <div className="VT-stat-content">
              <span className="VT-stat-number">{liveTanks}</span>
              <span className="VT-stat-label">Live Sensors</span>
            </div>
          </div>
          <div className="VT-stat-card VT-stored">
            <div className="VT-stat-icon">💾</div>
            <div className="VT-stat-content">
              <span className="VT-stat-number">{storedTanks}</span>
              <span className="VT-stat-label">Stored Data</span>
            </div>
          </div>
          <div className="VT-stat-card VT-manual">
            <div className="VT-stat-icon">📋</div>
            <div className="VT-stat-content">
              <span className="VT-stat-number">{manualTanks}</span>
              <span className="VT-stat-label">Manual Entry</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="VT-filters-section">
          <div className="VT-search-box">
            <span className="VT-search-icon"></span>
            <input
              type="text"
              placeholder="Search tanks by code, location, or type..."
              value={VTSearchTerm}
              onChange={(e) => VTSetSearchTerm(e.target.value)}
              className="VT-search-input"
            />
          </div>
          
          <div className="VT-filter-group">
            <select 
              value={VTStatusFilter} 
              onChange={(e) => VTSetStatusFilter(e.target.value)}
              className="VT-filter-select"
            >
              <option value="all">All Status</option>
              <option value="GOOD">Perfect</option>
              <option value="WARN">Warning</option>
              <option value="LOW">Low Water</option>
              <option value="CRITICAL">Critical</option>
            </select>
            
            <select 
              value={VTTypeFilter} 
              onChange={(e) => VTSetTypeFilter(e.target.value)}
              className="VT-filter-select"
            >
              <option value="all">All Types</option>
              {VTUniqueTankTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Last Update Info */}
        <div className="VT-last-update">
          Last updated: {new Date().toLocaleTimeString()} • 
          Live updates: <span className="VT-live-count">{liveTanks}</span> active
        </div>
      </div>

      {/* Tanks Content Sections */}
      <div className="VT-tanks-content">
        {/* Live Sensor Tanks Section */}
        {VTTanksWithLiveData.length > 0 && (
          <section className="VT-tanks-section">
            <div className="VT-section-header">
              <h2>📡 Live Sensor Tanks</h2>
              <span className="VT-section-badge">{VTTanksWithLiveData.length} active</span>
            </div>
            <div className="VT-tanks-grid">
              {VTTanksWithLiveData.map(tank => (
                <VTTankCard 
                  key={tank._id} 
                  tank={tank} 
                  VTLiveData={VTLiveData}
                  VTOnUpdate={VTRefreshTankData}
                  onConfigure={handleConfigure}
                  onDelete={handleDeleteTank}
                />
              ))}
            </div>
          </section>
        )}

        {/* Historical Data Section */}
        {VTTanksWithStoredData.length > 0 && (
          <section className="VT-tanks-section">
            <div className="VT-section-header">
              <h2>💾 Historical Data</h2>
              <span className="VT-section-badge">{VTTanksWithStoredData.length} tanks</span>
            </div>
            <div className="VT-tanks-grid">
              {VTTanksWithStoredData.map(tank => (
                <VTTankCard 
                  key={tank._id} 
                  tank={tank} 
                  VTLiveData={VTLiveData}
                  VTOnUpdate={VTRefreshTankData}
                  onConfigure={handleConfigure}
                  onDelete={handleDeleteTank}
                />
              ))}
            </div>
          </section>
        )}

        {/* Manual Monitoring Section */}
        {VTTanksWithoutData.length > 0 && (
          <section className="VT-tanks-section">
            <div className="VT-section-header">
              <h2>📋 Manual Monitoring</h2>
              <span className="VT-section-badge">{VTTanksWithoutData.length} tanks</span>
            </div>
            <div className="VT-tanks-grid">
              {VTTanksWithoutData.map(tank => (
                <VTTankCard 
                  key={tank._id} 
                  tank={tank} 
                  VTLiveData={VTLiveData}
                  VTOnUpdate={VTRefreshTankData}
                  onConfigure={handleConfigure}
                  onDelete={handleDeleteTank}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {VTFilteredTanks.length === 0 && (
          <div className="VT-empty-state">
            <h3>No Tanks Found</h3>
            <p>Try adjusting your search or filters</p>
            <button 
              onClick={() => { 
                VTSetSearchTerm(""); 
                VTSetStatusFilter("all"); 
                VTSetTypeFilter("all"); 
              }}
              className="VT-btn VT-btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Configuration Form Modal */}
      {showConfigForm && selectedTank && (
        <TankConfigForm
          tank={selectedTank}
          onConfigUpdate={handleConfigUpdate}
          onClose={() => {
            setShowConfigForm(false);
            setSelectedTank(null);
          }}
        />
      )}
    </div>
  );
};

export default ViewAllTank;