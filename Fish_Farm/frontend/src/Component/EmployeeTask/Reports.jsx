import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Reports.css";

function Reports() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    status: '',
    approved: ''
  });
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, employeesRes] = await Promise.all([
        axios.get("http://localhost:5000/Tasks"),
        axios.get("http://localhost:5000/admin/employees")
      ]);

      const fetchedTasks = tasksRes?.data?.Tasks ?? tasksRes?.data?.tasks ?? [];
      const fetchedEmployees = employeesRes?.data?.employees ?? [];

      setTasks(fetchedTasks);
      setEmployees(fetchedEmployees);
      setFilteredTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching data:', err);
      setTasks([]);
      setFilteredTasks([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tasks];

    if (filters.startDate) {
      filtered = filtered.filter(task => task.dueDate && new Date(task.dueDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(task => task.dueDate && new Date(task.dueDate) <= new Date(filters.endDate));
    }
    if (filters.employeeId) {
      filtered = filtered.filter(task => task.employeeId?._id === filters.employeeId);
    }
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.approved !== '') {
      filtered = filtered.filter(task => filters.approved === 'true' ? !!task.approved : !task.approved);
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeId: '',
      status: '',
      approved: ''
    });
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
  };

  const calculateStats = () => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = filteredTasks.filter(task => task.status === 'Pending').length;
    const inProgressTasks = filteredTasks.filter(task => task.status === 'In Progress').length;
    const approvedTasks = filteredTasks.filter(task => !!task.approved).length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    const approvalRate = completedTasks > 0 ? ((approvedTasks / completedTasks) * 100).toFixed(1) : 0;

    return { totalTasks, completedTasks, pendingTasks, inProgressTasks, approvedTasks, completionRate, approvalRate };
  };

  const stats = calculateStats();

  const exportToCSV = () => {
    const headers = ['Task Name', 'Description', 'Employee', 'Status', 'Approved', 'Due Date', 'Assigned Date'];

    const escapeCsv = (val = '') => `"${String(val).replace(/"/g, '""')}"`;

    const rows = filteredTasks.map(task => [
      escapeCsv(task.taskName || ''),
      escapeCsv(task.description || ''),
      escapeCsv(task.employeeId?.name ?? 'N/A'),
      escapeCsv(task.status ?? ''),
      escapeCsv(task.approved ? 'Yes' : 'No'),
      escapeCsv(formatDate(task.dueDate)),
      escapeCsv(formatDate(task.createdAt ?? task.assignedDate))
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    // Get the current report content based on report type
    let contentToPrint = '';
    
    if (reportType === 'summary') {
      contentToPrint = document.querySelector('.O_summary-report')?.innerHTML || '';
    } else if (reportType === 'detailed') {
      contentToPrint = document.querySelector('.O_detailed-report')?.innerHTML || '';
    } else if (reportType === 'employee') {
      contentToPrint = document.querySelector('.O_employee-report')?.innerHTML || '';
    }
    
    // Include stats section in the PDF
    const statsContent = document.querySelector('.O_stats-section')?.innerHTML || '';
    
    const fullContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Task Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .O_reports-header { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .O_stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .O_stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
          .O_stat-number { font-size: 24px; font-weight: bold; display: block; color: #2c5aa0; }
          .O_stat-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .O_status-badge, .O_approval-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .O_status-completed { background: #d4edda; color: #155724; }
          .O_approved { background: #d4edda; color: #155724; }
          .O_not-approved { background: #fff3cd; color: #856404; }
          .O_employee-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .O_breakdown-bar { margin: 10px 0; }
          .O_bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; }
          .O_bar-fill { height: 100%; }
          .completed { background: #28a745; }
          .in-progress { background: #ffc107; }
          .pending { background: #dc3545; }
          .report-footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1 class="O_reports-header">Task Management Report</h1>
        <div class="report-info">
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
          <p><strong>Period:</strong> ${filters.startDate || 'All time'} to ${filters.endDate || 'Present'}</p>
        </div>
        ${statsContent}
        ${contentToPrint}
        <div class="report-footer">
          Generated by Task Management System • ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(fullContent);
    printWindow.document.close();
    
    // Wait for content to load then print as PDF
    setTimeout(() => {
      printWindow.print();
      // Optional: Close the window after printing
      // printWindow.close();
    }, 500);
  };

  const printReport = () => window.print();

  if (loading) return <div className="O_reports-loading">Loading reports...</div>;

  return (
    <div className="O_reports-container">
      <h1 className="O_reports-header">Task Management Reports</h1>

      {/* Filters */}
      <div className="O_filters-section">
        <h3>Filter Reports</h3>
        <div className="O_filter-grid">
          <div className="O_filter-group">
            <label>Start Date:</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="O_filter-group">
            <label>End Date:</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="O_filter-group">
            <label>Employee:</label>
            <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange}>
              <option value="">All Employees</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.userId})</option>)}
            </select>
          </div>
          <div className="O_filter-group">
            <label>Status:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="O_filter-group">
            <label>Approval:</label>
            <select name="approved" value={filters.approved} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="true">Approved</option>
              <option value="false">Not Approved</option>
            </select>
          </div>
          <div className="O_filter-actions">
            <button onClick={clearFilters} className="O_clear-btn">Clear Filters</button>
          </div>
        </div>
      </div>

      {/* Report Type */}
      <div className="O_report-type-section">
        <h3>Report Type</h3>
        <div className="O_report-type-buttons">
          <button className={reportType === 'summary' ? 'active' : ''} onClick={() => setReportType('summary')}>Summary Report</button>
          <button className={reportType === 'detailed' ? 'active' : ''} onClick={() => setReportType('detailed')}>Detailed Report</button>
          <button className={reportType === 'employee' ? 'active' : ''} onClick={() => setReportType('employee')}>Employee Performance</button>
        </div>
      </div>

      {/* Export */}
      <div className="O_export-section">
        <button onClick={exportToCSV} className="O_export-btn O_csv-btn">Export to CSV</button>
        <button onClick={downloadPDF} className="O_export-btn O_pdf-btn">Download PDF</button>
        <button onClick={printReport} className="O_export-btn O_print-btn">Print Report</button>
      </div>

      {/* Statistics */}
      <div className="O_stats-section">
        <h3>Summary Statistics</h3>
        <div className="O_stats-grid">
          <div className="O_stat-card"><span className="O_stat-number">{stats.totalTasks}</span><span className="O_stat-label">Total Tasks</span></div>
          <div className="O_stat-card"><span className="O_stat-number">{stats.completedTasks}</span><span className="O_stat-label">Completed</span></div>
          <div className="O_stat-card"><span className="O_stat-number">{stats.pendingTasks}</span><span className="O_stat-label">Pending</span></div>
          <div className="O_stat-card"><span className="O_stat-number">{stats.inProgressTasks}</span><span className="O_stat-label">In Progress</span></div>
          <div className="O_stat-card"><span className="O_stat-number">{stats.approvedTasks}</span><span className="O_stat-label">Approved</span></div>
          <div className="O_stat-card"><span className="O_stat-number">{stats.completionRate}%</span><span className="O_stat-label">Completion Rate</span></div>
        </div>
      </div>

      {/* Detailed Report */}
      {reportType === 'detailed' && (
        <div className="O_detailed-report">
          <h3>Detailed Task Report ({filteredTasks.length} tasks)</h3>
          <div className="O_tasks-table">
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Approved</th>
                  <th>Due Date</th>
                  <th>Days Remaining</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const today = new Date();
                  const daysRemaining = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <tr key={task._id}>
                      <td>{task.taskName || '—'}</td>
                      <td>{task.employeeId?.name || 'N/A'}</td>
                      <td><span className={`O_status-badge O_status-${(task.status || '').toLowerCase().replace(' ', '-')}`}>{task.status || 'N/A'}</span></td>
                      <td><span className={`O_approval-badge ${task.approved ? 'O_approved' : 'O_not-approved'}`}>{task.approved ? '✓ Approved' : '⏳ Pending'}</span></td>
                      <td>{dueDate ? dueDate.toLocaleDateString() : 'N/A'}</td>
                      <td className={daysRemaining === null ? '' : daysRemaining < 0 ? 'O_overdue' : daysRemaining < 3 ? 'O_urgent' : 'O_normal'}>
                        {daysRemaining === null ? 'N/A' : (daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Performance */}
      {reportType === 'employee' && (
        <div className="O_employee-report">
          <h3>Employee Performance Report</h3>
          <div className="O_employee-stats">
            {employees.map(employee => {
              const employeeTasks = filteredTasks.filter(task => task.employeeId?._id === employee._id);
              const completed = employeeTasks.filter(task => task.status === 'Completed');
              const approved = employeeTasks.filter(task => task.approved);

              return (
                <div key={employee._id} className="O_employee-card">
                  <h4>{employee.name} ({employee.userId})</h4>
                  <div className="O_employee-metrics">
                    <span>Total Tasks: {employeeTasks.length}</span>
                    <span>Completed: {completed.length}</span>
                    <span>Approved: {approved.length}</span>
                    <span>Completion Rate: {employeeTasks.length > 0 ? ((completed.length / employeeTasks.length) * 100).toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {reportType === 'summary' && (
        <div className="O_summary-report">
          <h3>Summary Report</h3>
          <div className="O_summary-content">
            <p><strong>Report Period:</strong> {filters.startDate || 'All time'} to {filters.endDate || 'Present'}</p>
            <p><strong>Total Tasks:</strong> {stats.totalTasks}</p>
            <p><strong>Completion Rate:</strong> {stats.completionRate}%</p>
            <p><strong>Approval Rate:</strong> {stats.approvalRate}%</p>

            <div className="O_status-breakdown">
              <h4>Status Breakdown</h4>
              <div className="O_breakdown-bars">
                <div className="O_breakdown-bar">
                  <span>Completed: {stats.completedTasks}</span>
                  <div className="O_bar">
                    <div className="O_bar-fill completed" style={{width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`}} />
                  </div>
                </div>

                <div className="O_breakdown-bar">
                  <span>In Progress: {stats.inProgressTasks}</span>
                  <div className="O_bar">
                    <div className="O_bar-fill in-progress" style={{width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%`}} />
                  </div>
                </div>

                <div className="O_breakdown-bar">
                  <span>Pending: {stats.pendingTasks}</span>
                  <div className="O_bar">
                    <div className="O_bar-fill pending" style={{width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%`}} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Reports;