import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./EmployeeTaskDashboardHome.css";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Completed, In Progress, Pending

const EmployeeTaskDashboardHome = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch tasks
  useEffect(() => {
    axios.get("http://localhost:5000/Tasks")
      .then(res => setTasks(res.data?.Tasks || []))
      .catch(err => console.error("Error fetching tasks:", err));
  }, []);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const completionRate = ((completedTasks / totalTasks) * 100 || 0).toFixed(1);

  // Employee workload for bar chart
  const employeeData = tasks.reduce((acc, task) => {
    if (task.employeeId?.name) {
      acc[task.employeeId.name] = (acc[task.employeeId.name] || 0) + 1;
    }
    return acc;
  }, {});
  const employeeChartData = Object.entries(employeeData).map(([name, count]) => ({ name, tasks: count }));

  // Pie chart data
  const statusData = [
    { name: "Completed", value: completedTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "Pending", value: pendingTasks },
  ];

  return (
    <div className="O_D_H_dashboard">
      <div className="O_D_H_header">
        <div className="O_D_H_welcome">
          <h1 className="O_D_H_dashboard-title">Hi, Welcome back</h1>
          <p className="O_D_H_subtitle">Employee Task Dashboard</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="O_D_H_stats-grid">
        <div className="O_D_H_stat-card">
          <div className="O_D_H_stat-main">
            <span className="O_D_H_stat-number">{totalTasks}</span>
            <span className="O_D_H_stat-change">+{completedTasks} completed</span>
          </div>
          <div className="O_D_H_stat-info">
            <h3 className="O_D_H_stat-title">Total Tasks</h3>
            <p className="O_D_H_stat-detail">
              {pendingTasks} pending • {inProgressTasks} in progress
            </p>
          </div>
        </div>

        <div className="O_D_H_stat-card">
          <div className="O_D_H_stat-main">
            <span className="O_D_H_stat-number completed">{completedTasks}</span>
            <span className="O_D_H_stat-change positive">+{completionRate}%</span>
          </div>
          <div className="O_D_H_stat-info">
            <h3 className="O_D_H_stat-title">Completed Tasks</h3>
            <p className="O_D_H_stat-detail">
              {completionRate}% completion rate
            </p>
          </div>
        </div>

        <div className="O_D_H_stat-card">
          <div className="O_D_H_stat-main">
            <span className="O_D_H_stat-number pending">{pendingTasks}</span>
            <span className="O_D_H_stat-change negative">-{((pendingTasks / totalTasks) * 100 || 0).toFixed(1)}%</span>
          </div>
          <div className="O_D_H_stat-info">
            <h3 className="O_D_H_stat-title">Pending Tasks</h3>
            <p className="O_D_H_stat-detail">
              Needs immediate attention
            </p>
          </div>
        </div>

        <div className="O_D_H_stat-card">
          <div className="O_D_H_stat-main">
            <span className="O_D_H_stat-number progress">{inProgressTasks}</span>
            <span className="O_D_H_stat-change neutral">In progress</span>
          </div>
          <div className="O_D_H_stat-info">
            <h3 className="O_D_H_stat-title">Active Tasks</h3>
            <p className="O_D_H_stat-detail">
              Currently being worked on
            </p>
          </div>
        </div>
      </div>

      {/* Charts and Content Grid */}
      <div className="O_D_H_content-grid">
        {/* Charts Section */}
        <div className="O_D_H_charts-section">
          <div className="O_D_H_chart-card">
            <div className="O_D_H_chart-header">
              <h3 className="O_D_H_chart-title">Employee Workload</h3>
              <span className="O_D_H_chart-subtitle">Tasks assigned per employee</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={employeeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="O_D_H_chart-card">
            <div className="O_D_H_chart-header">
              <h3 className="O_D_H_chart-title">Task Status Distribution</h3>
              <span className="O_D_H_chart-subtitle">Overview of task progress</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="O_D_H_actions-sidebar">
          <div className="O_D_H_actions-card">
            <h3 className="O_D_H_actions-title">Quick Actions</h3>
            <div className="O_D_H_action-buttons">
              <button 
                className="O_D_H_action-btn primary"
                onClick={() => navigate("/dashboard/EmployeeTask/AddTask")}
              >
                <span className="O_D_H_action-icon">➕</span>
                <span className="O_D_H_action-text">
                  <strong>Add New Task</strong>
                  <small>Assign to employee</small>
                </span>
              </button>
              
              <button 
                className="O_D_H_action-btn secondary"
                onClick={() => navigate("/dashboard/EmployeeTask/ViewTask")}
              >
                <span className="O_D_H_action-icon">📋</span>
                <span className="O_D_H_action-text">
                  <strong>View Tasks</strong>
                  <small>Manage existing</small>
                </span>
              </button>
              
              <button 
                className="O_D_H_action-btn tertiary"
                onClick={() => navigate("/dashboard/EmployeeTask/Reports")}
              >
                <span className="O_D_H_action-icon">📑</span>
                <span className="O_D_H_action-text">
                  <strong>View Reports</strong>
                  <small>Analytics & insights</small>
                </span>
              </button>
            </div>
          </div>

          {/* Task Table */}
          <div className="O_D_H_table-card">
            <div className="O_D_H_table-header">
              <h3 className="O_D_H_table-title">Recent Tasks</h3>
              <span className="O_D_H_table-subtitle">Latest assigned tasks</span>
            </div>
            <div className="O_D_H_table-container">
              <table className="O_D_H_tasks-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 5).map(task => (
                    <tr key={task._id}>
                      <td className="O_D_H_task-name">{task.taskName || '—'}</td>
                      <td className="O_D_H_employee">{task.employeeId?.name || 'N/A'}</td>
                      <td className={`O_D_H_status O_D_H_status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </td>
                      <td className="O_D_H_due-date">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskDashboardHome;