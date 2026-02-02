import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './Reports.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Status color mapping for consistent styling
const RTStatusColor = (status) => {
  switch (status) {
    case "GOOD": return "#10b981";
    case "WARN": return "#f59e0b";
    case "LOW": return "#f97316";
    case "CRITICAL": return "#ef4444";
    default: return "#6b7280";
  }
};

// Main Reports Component
const Reports = () => {
  // State management for reports data
  const [RTLoading, RTSetLoading] = useState(true);
  const [RTError, RTSetError] = useState(null);
  const [RTTanks, RTSetTanks] = useState([]);
  const [RTExportLoading, RTSetExportLoading] = useState(false);
  const [RTExportType, RTSetExportType] = useState('all'); // all, withSensors, withoutSensors
  
  // Reference for PDF generation
  const reportRef = useRef();

  // Fetch tanks data on component mount
  useEffect(() => {
    RTFetchTanksData();
  }, []);

  // Fetch tanks data from API
  const RTFetchTanksData = async () => {
    try {
      RTSetLoading(true);
      const response = await axios.get(`${API_URL}/tanksNew`);
      RTSetTanks(response.data.tanks || []);
    } catch (err) {
      console.error('Error fetching tanks data:', err);
      RTSetError('Failed to load report data. Please try again.');
    } finally {
      RTSetLoading(false);
    }
  };

  // Filter tanks based on sensor status
  const RTFilterTanks = (type) => {
    switch (type) {
      case 'withSensors':
        return RTTanks.filter(tank => tank.RealTime && tank.RealTime.UpdatedAt);
      case 'withoutSensors':
        return RTTanks.filter(tank => !tank.RealTime || !tank.RealTime.UpdatedAt);
      default:
        return RTTanks;
    }
  };

  // Generate PDF report for specific tank type
  const RTGeneratePDF = async (type = 'all') => {
    try {
      RTSetExportLoading(true);
      const filteredTanks = RTFilterTanks(type);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const currentDate = new Date();
      
      // Report Header
      doc.setFontSize(20);
      doc.setTextColor(10, 115, 221);
      doc.text("TANK MANAGEMENT SYSTEM", pageWidth / 2, 20, { align: "center" });
      
      // Report Title based on type
      let reportTitle = "COMPLETE TANK INVENTORY REPORT";
      if (type === 'withSensors') reportTitle = "SENSOR-EQUIPPED TANKS REPORT";
      if (type === 'withoutSensors') reportTitle = "MANUAL MONITORING TANKS REPORT";
      
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(reportTitle, pageWidth / 2, 35, { align: "center" });
      
      // Report Details
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`, 14, 50);
      doc.text(`Total Tanks in Report: ${filteredTanks.length}`, 14, 57);
      
      // Summary Statistics
      const stats = RTCalculateStats(filteredTanks);
      doc.setFontSize(12);
      doc.setTextColor(10, 115, 221);
      doc.text("SUMMARY STATISTICS", 14, 72);
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Total Tanks: ${stats.totalTanks}`, 14, 82);
      doc.text(`Active Monitoring: ${stats.tanksWithData}`, 14, 89);
      doc.text(`Optimal Status: ${stats.optimalTanks}`, 14, 96);
      doc.text(`Critical Alerts: ${stats.criticalTanks}`, 14, 103);
      doc.text(`Data Coverage: ${stats.dataCoverage.toFixed(1)}%`, 14, 110);

      // Table Data
      const tableColumn = type === 'withSensors' 
        ? ["Tank Code", "Type", "Location", "Water Level", "Status", "Last Update", "Distance", "Fill Height"]
        : ["Tank Code", "Type", "Location", "Inlet Valves", "Outlet Valves", "Dimensions", "Description"];
      
      const tableRows = [];

      filteredTanks.forEach((tank) => {
        if (type === 'withSensors') {
          // Sensor-equipped tanks table
          const status = tank.RealTime?.Status || 'NO_DATA';
          const rowData = [
            tank.TankCode,
            tank.TankType,
            tank.TankLocation,
            tank.RealTime ? `${tank.RealTime.WaterLevelPercent}%` : 'N/A',
            status,
            tank.RealTime?.UpdatedAt ? new Date(tank.RealTime.UpdatedAt).toLocaleDateString() : 'Never',
            tank.RealTime ? `${tank.RealTime.DistanceCm} cm` : 'N/A',
            tank.RealTime ? `${tank.RealTime.FillHeightCm} cm` : 'N/A'
          ];
          tableRows.push(rowData);
        } else {
          // Manual monitoring tanks table
          const rowData = [
            tank.TankCode,
            tank.TankType,
            tank.TankLocation,
            tank.InletValves || 0,
            tank.OutletValves || 0,
            `${tank.Length || 0}×${tank.Width || 0}×${tank.Height || 0}m`,
            tank.Description || 'No description'
          ];
          tableRows.push(rowData);
        }
      });

      // Table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 120,
        styles: { 
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: { 
          fillColor: [10, 115, 221],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 },
        pageBreak: 'auto'
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
        doc.text("Tank Management System Report", pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
      }

      // Generate filename
      let filename = `Tank_Report_${currentDate.toISOString().split('T')[0]}`;
      if (type === 'withSensors') filename = `Sensor_Tanks_Report_${currentDate.toISOString().split('T')[0]}`;
      if (type === 'withoutSensors') filename = `Manual_Tanks_Report_${currentDate.toISOString().split('T')[0]}`;
      
      doc.save(`${filename}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      RTSetExportLoading(false);
    }
  };

  // Generate visual PDF with charts (for dashboard export)
  const RTGenerateVisualPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      RTSetExportLoading(true);
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`Tank_Dashboard_Report_${timestamp}.pdf`);
      
    } catch (error) {
      console.error('Error generating visual PDF:', error);
      alert('Failed to generate visual PDF report. Please try again.');
    } finally {
      RTSetExportLoading(false);
    }
  };

  // Calculate report statistics from real tank data
  const RTCalculateStats = (tanks = RTTanks) => {
    const totalTanks = tanks.length;
    const tanksWithData = tanks.filter(tank => tank.RealTime && tank.RealTime.UpdatedAt).length;
    const optimalTanks = tanks.filter(tank => 
      tank.RealTime && tank.RealTime.Status === 'GOOD'
    ).length;
    const warningTanks = tanks.filter(tank => 
      tank.RealTime && (tank.RealTime.Status === 'WARN' || tank.RealTime.Status === 'LOW')
    ).length;
    const criticalTanks = tanks.filter(tank => 
      tank.RealTime && tank.RealTime.Status === 'CRITICAL'
    ).length;

    return {
      totalTanks,
      tanksWithData,
      optimalTanks,
      warningTanks,
      criticalTanks,
      dataCoverage: totalTanks > 0 ? (tanksWithData / totalTanks) * 100 : 0
    };
  };

  // Generate chart data from real tank data
  const RTGenerateChartData = () => {
    const stats = RTCalculateStats();
    
    // Status distribution data for pie chart
    const statusData = [
      { name: 'Optimal', value: stats.optimalTanks, color: RTStatusColor('GOOD') },
      { name: 'Warning', value: stats.warningTanks, color: RTStatusColor('WARN') },
      { name: 'Critical', value: stats.criticalTanks, color: RTStatusColor('CRITICAL') },
      { name: 'No Data', value: stats.totalTanks - stats.tanksWithData, color: '#6b7280' }
    ];

    // Tank type distribution data
    const typeDistribution = RTTanks.reduce((acc, tank) => {
      const existing = acc.find(item => item.name === tank.TankType);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: tank.TankType, count: 1 });
      }
      return acc;
    }, []);

    // Water level data for bar chart - using actual tank data
    const waterLevelData = RTTanks
      .filter(tank => tank.RealTime && tank.RealTime.WaterLevelPercent)
      .map(tank => ({
        name: tank.TankCode,
        level: tank.RealTime.WaterLevelPercent,
        status: tank.RealTime.Status,
        location: tank.TankLocation
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 10);

    return {
      statusData,
      typeDistribution,
      waterLevelData
    };
  };

  // Get tanks with sensors
  const tanksWithSensors = RTFilterTanks('withSensors');
  const tanksWithoutSensors = RTFilterTanks('withoutSensors');

  // Render loading state
  if (RTLoading) {
    return (
      <div className="RT-reports-container">
        <div className="RT-loading-container">
          <div className="RT-loading-spinner"></div>
          <p>Generating reports...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (RTError) {
    return (
      <div className="RT-reports-container">
        <div className="RT-error-container">
          <div className="RT-error-icon">⚠️</div>
          <h3>Report Generation Failed</h3>
          <p>{RTError}</p>
          <button onClick={RTFetchTanksData} className="RT-btn RT-btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = RTCalculateStats();
  const chartData = RTGenerateChartData();

  return (
    <div className="RT-reports-container">
      {/* Reports Header */}
      <div className="RT-reports-header">
        <div className="RT-header-content">
          <div className="RT-header-title">
            <h1>📊 Tank Management Reports</h1>
            <p>Comprehensive analytics and export capabilities for your water tank system</p>
          </div>
          <div className="RT-header-actions">
            <div className="RT-export-buttons">
              <button 
                onClick={() => RTGeneratePDF('all')}
                disabled={RTExportLoading}
                className="RT-btn RT-btn-primary"
              >
                {RTExportLoading ? 'Generating...' : '📄 All Tanks PDF'}
              </button>
              <button 
                onClick={() => RTGeneratePDF('withSensors')}
                disabled={RTExportLoading || tanksWithSensors.length === 0}
                className="RT-btn RT-btn-secondary"
              >
                📡 Sensor Tanks ({tanksWithSensors.length})
              </button>
              <button 
                onClick={() => RTGeneratePDF('withoutSensors')}
                disabled={RTExportLoading || tanksWithoutSensors.length === 0}
                className="RT-btn RT-btn-outline"
              >
                📋 Manual Tanks ({tanksWithoutSensors.length})
              </button>
              <button 
                onClick={RTGenerateVisualPDF}
                disabled={RTExportLoading}
                className="RT-btn RT-btn-visual"
              >
                📊 Dashboard PDF
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="RT-quick-stats">
          <div className="RT-stat-badge RT-total">
            <span className="RT-stat-number">{stats.totalTanks}</span>
            <span className="RT-stat-label">Total Tanks</span>
          </div>
          <div className="RT-stat-badge RT-sensors">
            <span className="RT-stat-number">{tanksWithSensors.length}</span>
            <span className="RT-stat-label">With Sensors</span>
          </div>
          <div className="RT-stat-badge RT-manual">
            <span className="RT-stat-number">{tanksWithoutSensors.length}</span>
            <span className="RT-stat-label">Manual Monitoring</span>
          </div>
        </div>
      </div>

      {/* Main Reports Content */}
      <div className="RT-reports-content" ref={reportRef}>
        {/* Summary Statistics */}
        <section className="RT-stats-section">
          <h2>📈 System Overview</h2>
          <div className="RT-stats-grid">
            <div className="RT-stat-card RT-total">
              <div className="RT-stat-icon">🏗️</div>
              <div className="RT-stat-content">
                <span className="RT-stat-number">{stats.totalTanks}</span>
                <span className="RT-stat-label">Total Tanks</span>
                <span className="RT-stat-subtext">
                  Complete inventory
                </span>
              </div>
            </div>
            
            <div className="RT-stat-card RT-monitored">
              <div className="RT-stat-icon">📡</div>
              <div className="RT-stat-content">
                <span className="RT-stat-number">{stats.tanksWithData}</span>
                <span className="RT-stat-label">Active Monitoring</span>
                <span className="RT-stat-subtext">
                  {stats.dataCoverage.toFixed(1)}% coverage
                </span>
              </div>
            </div>
            
            <div className="RT-stat-card RT-optimal">
              <div className="RT-stat-icon">✅</div>
              <div className="RT-stat-content">
                <span className="RT-stat-number">{stats.optimalTanks}</span>
                <span className="RT-stat-label">Optimal Status</span>
                <span className="RT-stat-subtext">
                  {stats.tanksWithData > 0 ? 
                    `${((stats.optimalTanks / stats.tanksWithData) * 100).toFixed(1)}% of monitored` : 
                    'No active data'
                  }
                </span>
              </div>
            </div>
            
            <div className="RT-stat-card RT-critical">
              <div className="RT-stat-icon">🚨</div>
              <div className="RT-stat-content">
                <span className="RT-stat-number">{stats.criticalTanks}</span>
                <span className="RT-stat-label">Critical Alerts</span>
                <span className="RT-stat-subtext">
                  {stats.criticalTanks > 0 ? 'Needs attention' : 'All systems normal'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        {chartData.waterLevelData.length > 0 && (
          <section className="RT-charts-section">
            <h2>📊 Performance Analytics</h2>
            <div className="RT-charts-grid">
              <div className="RT-chart-card">
                <div className="RT-chart-header">
                  <h3>Tank Status Distribution</h3>
                  <span className="RT-chart-subtitle">Current operational status</span>
                </div>
                <div className="RT-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tanks`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="RT-chart-card">
                <div className="RT-chart-header">
                  <h3>Top Water Levels</h3>
                  <span className="RT-chart-subtitle">Highest fill percentages</span>
                </div>
                <div className="RT-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.waterLevelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Water Level']} />
                      <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                        {chartData.waterLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={RTStatusColor(entry.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sensor Tanks Table */}
        {tanksWithSensors.length > 0 && (
          <section className="RT-data-section">
            <h2>📡 Sensor-Equipped Tanks</h2>
            <div className="RT-table-card">
              <div className="RT-table-header">
                <h3>Live Monitoring Data</h3>
                <span className="RT-table-count">{tanksWithSensors.length} tanks with active sensors</span>
              </div>
              <div className="RT-table-container">
                <table className="RT-data-table">
                  <thead>
                    <tr>
                      <th>Tank Code</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Water Level</th>
                      <th>Status</th>
                      <th>Distance</th>
                      <th>Fill Height</th>
                      <th>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tanksWithSensors.map((tank) => (
                      <tr key={tank._id}>
                        <td className="RT-tank-code">{tank.TankCode}</td>
                        <td>{tank.TankType}</td>
                        <td>{tank.TankLocation}</td>
                        <td>
                          <div className="RT-level-display">
                            <span className="RT-level-value">{tank.RealTime.WaterLevelPercent}%</span>
                            <div 
                              className="RT-level-bar"
                              style={{ 
                                width: `${tank.RealTime.WaterLevelPercent}%`,
                                backgroundColor: RTStatusColor(tank.RealTime.Status)
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="RT-status-tag"
                            style={{ 
                              backgroundColor: `${RTStatusColor(tank.RealTime.Status)}20`,
                              color: RTStatusColor(tank.RealTime.Status)
                            }}
                          >
                            {tank.RealTime.Status}
                          </span>
                        </td>
                        <td>{tank.RealTime.DistanceCm} cm</td>
                        <td>{tank.RealTime.FillHeightCm} cm</td>
                        <td>{new Date(tank.RealTime.UpdatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Manual Monitoring Tanks Table */}
        {tanksWithoutSensors.length > 0 && (
          <section className="RT-data-section">
            <h2>📋 Manual Monitoring Tanks</h2>
            <div className="RT-table-card">
              <div className="RT-table-header">
                <h3>Tank Specifications</h3>
                <span className="RT-table-count">{tanksWithoutSensors.length} tanks requiring manual checks</span>
              </div>
              <div className="RT-table-container">
                <table className="RT-data-table">
                  <thead>
                    <tr>
                      <th>Tank Code</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Inlet Valves</th>
                      <th>Outlet Valves</th>
                      <th>Dimensions</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tanksWithoutSensors.map((tank) => (
                      <tr key={tank._id}>
                        <td className="RT-tank-code">{tank.TankCode}</td>
                        <td>{tank.TankType}</td>
                        <td>{tank.TankLocation}</td>
                        <td>
                          <span className="RT-valve-count">{tank.InletValves || 0}</span>
                        </td>
                        <td>
                          <span className="RT-valve-count">{tank.OutletValves || 0}</span>
                        </td>
                        <td>{tank.Length || 0}×{tank.Width || 0}×{tank.Height || 0}m</td>
                        <td className="RT-description">{tank.Description || 'No description'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Report Footer */}
        <div className="RT-report-footer">
          <div className="RT-footer-content">
            <div className="RT-footer-info">
              <h4>Report Information</h4>
              <p><strong>Generated on:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Total Tanks:</strong> {stats.totalTanks}</p>
              <p><strong>Sensor Tanks:</strong> {tanksWithSensors.length}</p>
              <p><strong>Manual Tanks:</strong> {tanksWithoutSensors.length}</p>
            </div>
            <div className="RT-footer-notes">
              <h4>Export Notes</h4>
              <p>• Use "All Tanks PDF" for complete inventory report</p>
              <p>• Use "Sensor Tanks" for live monitoring data</p>
              <p>• Use "Manual Tanks" for tanks requiring physical checks</p>
              <p>• Use "Dashboard PDF" for visual charts and analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;