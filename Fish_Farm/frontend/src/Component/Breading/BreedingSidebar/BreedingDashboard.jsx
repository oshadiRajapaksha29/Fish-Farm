//frontend/src/Component/Breading/Dashboard/BreedingDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BreedingDashboard.css";

const API_URL = "http://localhost:5000";

const BreedingDashboard = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [babyRecords, setBabyRecords] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // all, month, week, today
  const [selectedFishType, setSelectedFishType] = useState("all");

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on time range and fish type
  const filterDataByTimeRange = (data, dateField) => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return data; // all time
    }

    return data.filter(item => new Date(item[dateField]) >= startDate);
  };

  const filterByFishType = (data, fishTypeField) => {
    if (selectedFishType === "all") return data;
    return data.filter(item => item[fishTypeField] === selectedFishType);
  };

  // Get filtered data
  const filteredBreedingRecords = filterByFishType(
    filterDataByTimeRange(breedingRecords, "BreedingDate"),
    "fishType"
  );

  const filteredBabyRecords = filterByFishType(
    babyRecords.filter(baby => {
      const breedingRecord = breedingRecords.find(br => br._id === baby.BreedingID);
      return breedingRecord ? filterByFishType([breedingRecord], "fishType").length > 0 : false;
    }),
    "" // Already filtered through breeding records
  );

  // Calculate statistics
  const calculateStatistics = () => {
    const totalBreedingRecords = filteredBreedingRecords.length;
    const totalBabyBatches = filteredBabyRecords.length;
    const totalBabyFish = filteredBabyRecords.reduce((sum, baby) => sum + baby.BabyCount, 0);
    
    const successfulBreedings = filteredBreedingRecords.filter(record => 
      babyRecords.filter(baby => baby.BreedingID === record._id).length > 0
    ).length;
    
    const successRate = totalBreedingRecords > 0 
      ? Math.round((successfulBreedings / totalBreedingRecords) * 100) 
      : 0;

    // Tank utilization
    const breedingTanks = tanks.filter(tank => tank.TankLocation === "Breeding tanks");
    const babyTanks = tanks.filter(tank => tank.TankLocation === "Baby Tank");
    
    const usedBreedingTanks = new Set(filteredBreedingRecords.map(record => record.tankId));
    const usedBabyTanks = new Set(filteredBabyRecords.map(baby => baby.BabyTankID));
    
    const availableBreedingTanks = breedingTanks.filter(tank => !usedBreedingTanks.has(tank._id)).length;
    const availableBabyTanks = babyTanks.filter(tank => !usedBabyTanks.has(tank._id)).length;

    // Recent activity
    const recentBreedings = filteredBreedingRecords
      .sort((a, b) => new Date(b.BreedingDate) - new Date(a.BreedingDate))
      .slice(0, 5);

    const recentBabies = filteredBabyRecords
      .sort((a, b) => new Date(b.BirthDate) - new Date(a.BirthDate))
      .slice(0, 5);

    // Fish type distribution
    const fishTypeStats = {};
    filteredBreedingRecords.forEach(record => {
      if (!fishTypeStats[record.fishType]) {
        fishTypeStats[record.fishType] = { count: 0, withBabies: 0 };
      }
      fishTypeStats[record.fishType].count++;
      
      const hasBabies = babyRecords.filter(baby => baby.BreedingID === record._id).length > 0;
      if (hasBabies) {
        fishTypeStats[record.fishType].withBabies++;
      }
    });

    // Growth trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const breedingTrend = last7Days.map(date => ({
      date,
      count: filteredBreedingRecords.filter(record => 
        record.BreedingDate.split('T')[0] === date
      ).length
    }));

    const babyTrend = last7Days.map(date => ({
      date,
      count: filteredBabyRecords.filter(record => 
        record.BirthDate.split('T')[0] === date
      ).length
    }));

    return {
      totalBreedingRecords,
      totalBabyBatches,
      totalBabyFish,
      successfulBreedings,
      successRate,
      availableBreedingTanks,
      availableBabyTanks,
      usedBreedingTanks: usedBreedingTanks.size,
      usedBabyTanks: usedBabyTanks.size,
      recentBreedings,
      recentBabies,
      fishTypeStats,
      breedingTrend,
      babyTrend
    };
  };

  const stats = calculateStatistics();

  const getUniqueFishTypes = () => {
    const fishTypes = breedingRecords.map(record => record.fishType);
    return [...new Set(fishTypes)].filter(Boolean);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateBabyAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTankInfo = (tankId) => {
    const tank = tanks.find(t => t._id === tankId);
    return tank || { TankCode: "Unknown" };
  };

  const getBreedingInfo = (breedingId) => {
    return breedingRecords.find(br => br._id === breedingId) || { fishType: "Unknown" };
  };

  if (loading) {
    return (
      <div className="breeding-dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading breeding dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="breeding-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">🐟 Breeding Dashboard</h1>
          <p className="dashboard-subtitle">
            Real-time monitoring of fish breeding activities and performance
          </p>
        </div>
        <div className="header-actions">
          <button onClick={fetchData} className="refresh-btn">
            🔄 Refresh
          </button>
          <div className="last-update">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Time Range</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
            <option value="today">Today</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Fish Type</label>
          <select 
            value={selectedFishType} 
            onChange={(e) => setSelectedFishType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {getUniqueFishTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-stats">
          <span className="stat-badge">
            {filteredBreedingRecords.length} Breedings
          </span>
          <span className="stat-badge">
            {stats.totalBabyBatches} Baby Batches
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card breeding-count">
          <div className="metric-icon">🐟</div>
          <div className="metric-content">
            <span className="metric-value">{stats.totalBreedingRecords}</span>
            <span className="metric-label">Breeding Records</span>
            <span className="metric-trend">
              {timeRange === 'all' ? 'Total' : `This ${timeRange}`}
            </span>
          </div>
        </div>

        <div className="metric-card baby-batches">
          <div className="metric-icon">🐠</div>
          <div className="metric-content">
            <span className="metric-value">{stats.totalBabyBatches}</span>
            <span className="metric-label">Baby Batches</span>
            <span className="metric-trend">
              {stats.totalBabyFish} total babies
            </span>
          </div>
        </div>

        <div className="metric-card success-rate">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <span className="metric-value">{stats.successRate}%</span>
            <span className="metric-label">Success Rate</span>
            <span className="metric-trend">
              {stats.successfulBreedings} successful
            </span>
          </div>
        </div>

        <div className="metric-card tank-utilization">
          <div className="metric-icon">🏗️</div>
          <div className="metric-content">
            <span className="metric-value">
              {stats.usedBreedingTanks}/{stats.usedBreedingTanks + stats.availableBreedingTanks}
            </span>
            <span className="metric-label">Breeding Tanks Used</span>
            <span className="metric-trend">
              {stats.availableBreedingTanks} available
            </span>
          </div>
        </div>

        <div className="metric-card baby-tanks">
          <div className="metric-icon">👶</div>
          <div className="metric-content">
            <span className="metric-value">
              {stats.usedBabyTanks}/{stats.usedBabyTanks + stats.availableBabyTanks}
            </span>
            <span className="metric-label">Baby Tanks Used</span>
            <span className="metric-trend">
              {stats.availableBabyTanks} available
            </span>
          </div>
        </div>

        <div className="metric-card efficiency">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <span className="metric-value">
              {stats.totalBreedingRecords > 0 
                ? Math.round(stats.totalBabyFish / stats.totalBreedingRecords) 
                : 0
              }
            </span>
            <span className="metric-label">Avg. Babies per Breeding</span>
            <span className="metric-trend">
              Production efficiency
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="content-column">
          {/* Recent Breeding Activity */}
          <div className="widget recent-activity">
            <div className="widget-header">
              <h3>📋 Recent Breeding Activity</h3>
              <span className="widget-badge">{stats.recentBreedings.length}</span>
            </div>
            <div className="widget-content">
              {stats.recentBreedings.length === 0 ? (
                <div className="no-data">No recent breeding activity</div>
              ) : (
                <div className="activity-list">
                  {stats.recentBreedings.map(record => {
                    const tankInfo = getTankInfo(record.tankId);
                    const hasBabies = babyRecords.filter(baby => baby.BreedingID === record._id).length > 0;
                    
                    return (
                      <div key={record._id} className="activity-item">
                        <div className="activity-icon">
                          {hasBabies ? "🐠" : "🐟"}
                        </div>
                        <div className="activity-details">
                          <div className="activity-title">{record.fishType}</div>
                          <div className="activity-meta">
                            {tankInfo.TankCode} • {formatDate(record.BreedingDate)}
                          </div>
                        </div>
                        <div className="activity-status">
                          <span className={`status-badge ${hasBabies ? 'success' : 'pending'}`}>
                            {hasBabies ? 'Has Babies' : 'Breeding'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Fish Type Performance */}
          <div className="widget fish-performance">
            <div className="widget-header">
              <h3>🎯 Fish Type Performance</h3>
              <span className="widget-badge">{Object.keys(stats.fishTypeStats).length}</span>
            </div>
            <div className="widget-content">
              {Object.keys(stats.fishTypeStats).length === 0 ? (
                <div className="no-data">No data available</div>
              ) : (
                <div className="performance-list">
                  {Object.entries(stats.fishTypeStats)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .map(([fishType, data]) => {
                      const successRate = data.count > 0 
                        ? Math.round((data.withBabies / data.count) * 100) 
                        : 0;
                      
                      return (
                        <div key={fishType} className="performance-item">
                          <div className="fish-type">{fishType}</div>
                          <div className="performance-stats">
                            <span className="stat">{data.count} breedings</span>
                            <span className="success-rate">{successRate}% success</span>
                          </div>
                          <div className="performance-bar">
                            <div 
                              className="performance-fill"
                              style={{ width: `${successRate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-column">
          {/* Recent Baby Births */}
          <div className="widget recent-babies">
            <div className="widget-header">
              <h3>👶 Recent Baby Births</h3>
              <span className="widget-badge">{stats.recentBabies.length}</span>
            </div>
            <div className="widget-content">
              {stats.recentBabies.length === 0 ? (
                <div className="no-data">No recent baby births</div>
              ) : (
                <div className="babies-list">
                  {stats.recentBabies.map(baby => {
                    const breedingInfo = getBreedingInfo(baby.BreedingID);
                    const babyTankInfo = getTankInfo(baby.BabyTankID);
                    const age = calculateBabyAge(baby.BirthDate);
                    
                    return (
                      <div key={baby._id} className="baby-item">
                        <div className="baby-icon">
                          {age < 7 ? "🆕" : age < 30 ? "🐠" : "🐟"}
                        </div>
                        <div className="baby-details">
                          <div className="baby-title">{breedingInfo.fishType}</div>
                          <div className="baby-meta">
                            {baby.BabyCount} babies • {babyTankInfo.TankCode} • {age}d old
                          </div>
                        </div>
                        <div className="baby-date">
                          {formatDate(baby.BirthDate)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tank Utilization */}
          <div className="widget tank-utilization-widget">
            <div className="widget-header">
              <h3>🏗️ Tank Utilization</h3>
              <span className="widget-badge">
                {stats.usedBreedingTanks + stats.usedBabyTanks} in use
              </span>
            </div>
            <div className="widget-content">
              <div className="tank-stats">
                <div className="tank-type-stats">
                  <h4>Breeding Tanks</h4>
                  <div className="tank-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill breeding"
                        style={{ 
                          width: `${(stats.usedBreedingTanks / (stats.usedBreedingTanks + stats.availableBreedingTanks)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span>{stats.usedBreedingTanks} used</span>
                      <span>{stats.availableBreedingTanks} available</span>
                    </div>
                  </div>
                </div>

                <div className="tank-type-stats">
                  <h4>Baby Tanks</h4>
                  <div className="tank-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill baby"
                        style={{ 
                          width: `${(stats.usedBabyTanks / (stats.usedBabyTanks + stats.availableBabyTanks)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span>{stats.usedBabyTanks} used</span>
                      <span>{stats.availableBabyTanks} available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="widget quick-actions">
            <div className="widget-header">
              <h3>⚡ Quick Actions</h3>
            </div>
            <div className="widget-content">
              <div className="actions-grid">
                <button className="action-btn primary">
                  <span className="action-icon">➕</span>
                  <span className="action-text">Add Breeding Record</span>
                </button>
                <button className="action-btn success">
                  <span className="action-icon">🐠</span>
                  <span className="action-text">Add Baby Record</span>
                </button>
                <button className="action-btn info">
                  <span className="action-icon">📊</span>
                  <span className="action-text">View Reports</span>
                </button>
                <button className="action-btn warning">
                  <span className="action-icon">🏗️</span>
                  <span className="action-text">Manage Tanks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Overview */}
      <div className="trends-section">
        <div className="widget trends-widget">
          <div className="widget-header">
            <h3>📈 7-Day Trends</h3>
            <span className="widget-badge">Last week</span>
          </div>
          <div className="widget-content">
            <div className="trends-grid">
              <div className="trend-item">
                <h4>Breeding Activity</h4>
                <div className="trend-chart">
                  {stats.breedingTrend.map((day, index) => (
                    <div key={day.date} className="chart-bar">
                      <div 
                        className="bar-fill breeding"
                        style={{ height: `${(day.count / Math.max(...stats.breedingTrend.map(d => d.count))) * 80}%` }}
                      ></div>
                      <span className="bar-label">{formatDate(day.date)}</span>
                      <span className="bar-value">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="trend-item">
                <h4>Baby Births</h4>
                <div className="trend-chart">
                  {stats.babyTrend.map((day, index) => (
                    <div key={day.date} className="chart-bar">
                      <div 
                        className="bar-fill baby"
                        style={{ height: `${(day.count / Math.max(...stats.babyTrend.map(d => d.count || 1)) * 80)}%` }}
                      ></div>
                      <span className="bar-label">{formatDate(day.date)}</span>
                      <span className="bar-value">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedingDashboard;