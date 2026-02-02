import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import "./DashboardHome.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const statusColor = (status) => {
  switch (status) {
    case "GOOD": return "#10b981";
    case "WARN": return "#f59e0b";
    case "LOW": return "#f97316";
    case "CRITICAL": return "#ef4444";
    default: return "#6b7280";
  }
};

const statusText = (status) => {
  switch (status) {
    case "GOOD": return "Optimal";
    case "WARN": return "Warning";
    case "LOW": return "Low";
    case "CRITICAL": return "Critical";
    default: return "No Data";
  }
};

const DashboardHome = () => {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTanks: 0,
    liveSensors: 0,
    optimalTanks: 0,
    warningTanks: 0,
    criticalTanks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const eventSourcesRef = useRef({});

  const fetchAllTanks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tanksNew`);
      const tanksData = response.data.tanks;
      setTanks(tanksData);
      updateStats(tanksData);
      setupEventSources(tanksData);
      
    } catch (err) {
      console.error("Error fetching tanks:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (tanksData) => {
    const totalTanks = tanksData.length;
    const liveSensors = tanksData.filter(tank => 
      tank.RealTime && tank.RealTime.UpdatedAt
    ).length;
    
    const optimalTanks = tanksData.filter(tank => 
      tank.RealTime && tank.RealTime.Status === "GOOD"
    ).length;
    
    const warningTanks = tanksData.filter(tank => 
      tank.RealTime && (tank.RealTime.Status === "WARN" || tank.RealTime.Status === "LOW")
    ).length;
    
    const criticalTanks = tanksData.filter(tank => 
      tank.RealTime && tank.RealTime.Status === "CRITICAL"
    ).length;

    setStats({
      totalTanks,
      liveSensors,
      optimalTanks,
      warningTanks,
      criticalTanks
    });

    // Update recent activity
    const activity = tanksData
      .filter(tank => tank.RealTime && tank.RealTime.UpdatedAt)
      .sort((a, b) => new Date(b.RealTime.UpdatedAt) - new Date(a.RealTime.UpdatedAt))
      .slice(0, 8)
      .map(tank => ({
        tankCode: tank.TankCode,
        action: "Water Level Update",
        value: `${tank.RealTime.WaterLevelPercent}%`,
        status: tank.RealTime.Status,
        time: new Date(tank.RealTime.UpdatedAt).toLocaleTimeString(),
        timestamp: new Date(tank.RealTime.UpdatedAt)
      }));

    setRecentActivity(activity);
  };

  const setupEventSources = (tanksData) => {
    // Cleanup existing connections
    cleanupEventSources();
    
    const newEventSources = {};
    
    tanksData.forEach(tank => {
      if (tank.TankCode) {
        try {
          const es = new EventSource(`${API_URL}/tanksNew/${tank.TankCode}/stream`);
          
          es.addEventListener("message", (event) => {
            try {
              const data = JSON.parse(event.data);
              handleRealTimeUpdate(data);
            } catch (err) {
              console.error(`Error parsing SSE data for ${tank.TankCode}:`, err);
            }
          });

          es.addEventListener("snapshot", (event) => {
            try {
              const data = JSON.parse(event.data);
              handleRealTimeUpdate(data);
            } catch (err) {
              console.error(`Error parsing snapshot for ${tank.TankCode}:`, err);
            }
          });

          es.onerror = (err) => {
            console.error(`SSE error for ${tank.TankCode}:`, err);
          };

          newEventSources[tank.TankCode] = es;
        } catch (error) {
          console.error(`Failed to create EventSource for ${tank.TankCode}:`, error);
        }
      }
    });
    
    eventSourcesRef.current = newEventSources;
  };

  const cleanupEventSources = () => {
    Object.values(eventSourcesRef.current).forEach(es => {
      if (es && es.readyState !== EventSource.CLOSED) {
        es.close();
      }
    });
    eventSourcesRef.current = {};
  };

  const handleRealTimeUpdate = (data) => {
    setLastUpdate(new Date());
    
    // Update tanks state with new data
    setTanks(prevTanks => {
      const updatedTanks = prevTanks.map(tank => {
        if (tank.TankCode === data.tankCode) {
          return {
            ...tank,
            RealTime: {
              WaterLevelPercent: data.WaterLevelPercent,
              DistanceCm: data.DistanceCm,
              FillHeightCm: data.FillHeightCm,
              Status: data.Status,
              UpdatedAt: data.UpdatedAt
            }
          };
        }
        return tank;
      });
      
      // Update stats with new data
      updateStats(updatedTanks);
      
      // Update recent activity
      const newActivity = {
        tankCode: data.tankCode,
        action: "Live Update",
        value: `${data.WaterLevelPercent}%`,
        status: data.Status,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date()
      };
      
      setRecentActivity(prev => {
        const filtered = prev.filter(activity => activity.tankCode !== data.tankCode);
        return [newActivity, ...filtered].slice(0, 8);
      });

      return updatedTanks;
    });
  };

  useEffect(() => {
    fetchAllTanks();
    
    return () => {
      cleanupEventSources();
    };
  }, []);

  // Chart data
  const statusData = [
    { name: 'Optimal', value: stats.optimalTanks, color: '#10b981' },
    { name: 'Warning', value: stats.warningTanks, color: '#f59e0b' },
    { name: 'Critical', value: stats.criticalTanks, color: '#ef4444' },
    { name: 'No Data', value: stats.totalTanks - stats.liveSensors, color: '#6b7280' }
  ];

  const tankTypeData = tanks.reduce((acc, tank) => {
    const existing = acc.find(item => item.name === tank.TankType);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: tank.TankType, count: 1 });
    }
    return acc;
  }, []);

  const waterLevelData = tanks
    .filter(tank => tank.RealTime && tank.RealTime.WaterLevelPercent)
    .map(tank => ({
      name: tank.TankCode,
      level: tank.RealTime.WaterLevelPercent,
      status: tank.RealTime.Status
    }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 8);

  if (loading) {
    return (
      <div className="DT-dashboard-home-container">
        <div className="DT-loading-container">
          <div className="DT-loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="DT-dashboard-home-container">
      {/* Header */}
      <div className="DT-dashboard-header">
        <div className="DT-header-content">
          <div className="DT-header-title">
            <h1>🏗️ Tank Dashboard</h1>
            <p>Real-time overview of your water tank management system</p>
          </div>
          <div className="DT-header-actions">
            <div className="DT-last-update-info">
              <span className="DT-update-label">Last update:</span>
              <span className="DT-update-time">{lastUpdate.toLocaleTimeString()}</span>
            </div>
            <button onClick={fetchAllTanks} className="DT-btn-refresh">
              <span className="DT-btn-icon">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="DT-stats-grid">
          <div className="DT-metric-card DT-total">
            <div className="DT-metric-icon">🏗️</div>
            <div className="DT-metric-content">
              <span className="DT-metric-number">{stats.totalTanks}</span>
              <span className="DT-metric-label">Total Tanks</span>
            </div>
            <div className="DT-metric-trend">All Systems</div>
          </div>

          <div className="DT-metric-card DT-live">
            <div className="DT-metric-icon">📡</div>
            <div className="DT-metric-content">
              <span className="DT-metric-number">{stats.liveSensors}</span>
              <span className="DT-metric-label">Live Sensors</span>
            </div>
            <div className="DT-metric-trend">
              {stats.totalTanks > 0 ? 
                `${Math.round((stats.liveSensors / stats.totalTanks) * 100)}% coverage` : 
                'No tanks'
              }
            </div>
          </div>

          <div className="DT-metric-card DT-optimal">
            <div className="DT-metric-icon">✅</div>
            <div className="DT-metric-content">
              <span className="DT-metric-number">{stats.optimalTanks}</span>
              <span className="DT-metric-label">Optimal</span>
            </div>
            <div className="DT-metric-trend DT-positive">
              {stats.liveSensors > 0 ? 
                `${Math.round((stats.optimalTanks / stats.liveSensors) * 100)}% of monitored` : 
                'No data'
              }
            </div>
          </div>

          <div className="DT-metric-card DT-critical">
            <div className="DT-metric-icon">🚨</div>
            <div className="DT-metric-content">
              <span className="DT-metric-number">{stats.criticalTanks}</span>
              <span className="DT-metric-label">Critical</span>
            </div>
            <div className="DT-metric-trend DT-warning">
              {stats.criticalTanks > 0 ? 'Needs attention' : 'All good'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="DT-dashboard-main-content">
        <div className="DT-content-container">
          <div className="DT-content-grid">
            {/* Left Column - Charts */}
            <div className="DT-content-column DT-left-column">
              {/* Status Distribution */}
              <div className="DT-chart-card">
                <div className="DT-chart-header">
                  <h3>📊 Tank Status Distribution</h3>
                  <span className="DT-chart-subtitle">Current tank conditions overview</span>
                </div>
                <div className="DT-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} tanks`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Water Levels */}
              <div className="DT-chart-card">
                <div className="DT-chart-header">
                  <h3>💧 Water Levels</h3>
                  <span className="DT-chart-subtitle">Top tanks by fill percentage</span>
                  <div className="DT-live-badge">
                    <span className="DT-live-dot"></span>
                    LIVE
                  </div>
                </div>
                <div className="DT-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={waterLevelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Water Level']}
                        labelFormatter={(label) => `Tank: ${label}`}
                      />
                      <Bar 
                        dataKey="level" 
                        radius={[4, 4, 0, 0]}
                      >
                        {waterLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColor(entry.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Info */}
            <div className="DT-content-column DT-right-column">
              {/* Recent Activity */}
              <div className="DT-chart-card DT-activity-card">
                <div className="DT-chart-header">
                  <h3>🕒 Recent Activity</h3>
                  <span className="DT-chart-subtitle">Latest sensor updates</span>
                  <div className="DT-live-badge">
                    <span className="DT-live-dot"></span>
                    LIVE
                  </div>
                </div>
                <div className="DT-activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="DT-activity-item">
                        <div className="DT-activity-icon">
                          {activity.status === "GOOD" ? "✅" : 
                           activity.status === "WARN" ? "⚠️" : 
                           activity.status === "LOW" ? "🔻" : "🚨"}
                        </div>
                        <div className="DT-activity-content">
                          <div className="DT-activity-title">
                            <span className="DT-tank-name">{activity.tankCode}</span>
                            <span 
                              className="DT-activity-status"
                              style={{ color: statusColor(activity.status) }}
                            >
                              {activity.value}
                            </span>
                          </div>
                          <div className="DT-activity-details">
                            <span className="DT-activity-action">{activity.action}</span>
                            <span className="DT-activity-time">{activity.time}</span>
                          </div>
                        </div>
                        {activity.action === "Live Update" && (
                          <div className="DT-live-update-indicator"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="DT-no-activity">
                      <div className="DT-no-activity-icon">📊</div>
                      <p>No recent activity</p>
                      <span>Sensor updates will appear here</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tank Types */}
              <div className="DT-chart-card">
                <div className="DT-chart-header">
                  <h3>🏭 Tank Types</h3>
                  <span className="DT-chart-subtitle">Distribution by tank type</span>
                </div>
                <div className="DT-chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={tankTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="count" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="DT-chart-card">
                <div className="DT-chart-header">
                  <h3>⚡ Quick Actions</h3>
                </div>
                <div className="DT-actions-grid">
                  <button className="DT-action-btn DT-primary">
                    <span className="DT-action-icon">➕</span>
                    <span className="DT-action-text">Add New Tank</span>
                  </button>
                  <button className="DT-action-btn DT-secondary">
                    <span className="DT-action-icon">📊</span>
                    <span className="DT-action-text">View Reports</span>
                  </button>
                  <button className="DT-action-btn DT-secondary">
                    <span className="DT-action-icon">⚙️</span>
                    <span className="DT-action-text">Manage Sensors</span>
                  </button>
                  <button className="DT-action-btn DT-secondary">
                    <span className="DT-action-icon">🔔</span>
                    <span className="DT-action-text">Alert Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;