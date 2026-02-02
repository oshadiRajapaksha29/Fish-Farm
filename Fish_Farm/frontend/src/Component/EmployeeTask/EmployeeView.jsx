// frontend/src/Component/EmployeeTask/EmployeeView.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeView.css";

function EmployeeView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchTasks = () => {
    if (!employeeId.trim()) {
      setError("Please enter an Employee ID");
      return;
    }

    setLoading(true);
    setError("");

    axios
      .get(`http://localhost:5000/Tasks/employee/${employeeId}`)
      .then((res) => {
        setTasks(res.data?.tasks || []);
      })
      .catch((err) => {
        setError(`Failed to load tasks: ${err.response?.data?.message || err.message}`);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      const response = await axios.put(`http://localhost:5000/Tasks/${taskId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (err) {
      setError(`Failed to update task: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'In Progress': return '#ffc107';
      case 'Pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'In Progress';
      case 'In Progress': return 'Completed';
      case 'Completed': return 'Pending';
      default: return 'Pending';
    }
  };

  return (
    <div className="O_EV_section" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="O_EV_head">My Assigned Tasks</h1>
      
      <div className="O_EV_section2" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <label className="O_EV_label" style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Enter Your Employee ID:</strong>
          <input 
            className="O_EV_input"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter your employee ID"
            style={{ 
              marginLeft: '10px', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              width: '200px'
            }}
          />
        </label>
        <button 
          className="O_EV_button"
          onClick={fetchTasks}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Get My Tasks'}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", margin: "20px 0", padding: "15px", border: "1px solid red", borderRadius: '5px' }}>
          {error}
        </div>
      )}

      {tasks.length === 0 && !error && !loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No tasks found.</h3>
          <p>Enter your Employee ID and click "Get My Tasks" to see your assignments.</p>
        </div>
      ) : (
        <div className="O_EV_div" style={{ display: 'grid', gap: '20px' }}>
          {tasks.map((task) => (
            <div key={task._id} style={{ 
              border: "1px solid #ddd",
              padding: "20px", 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              position: 'relative'
            }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>{task.taskName}</h2>
              <p style={{ margin: '10px 0', fontSize: '16px', lineHeight: '1.5' }}>{task.description}</p>
              
              {/* Inventory Items Section */}
              {task.inventoryItems && task.inventoryItems.length > 0 && (
                <div style={{ 
                  margin: '15px 0', 
                  padding: '15px', 
                  backgroundColor: '#e0f2fe', 
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📦 Assigned Inventory Items:
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {task.inventoryItems.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        borderLeft: '3px solid #0ea5e9'
                      }}>
                        <div>
                          <strong style={{ color: '#1e293b' }}>
                            {item.itemName || item.inventoryId?.inventoryName}
                          </strong>
                          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
                            Category: {task.taskName}
                          </div>
                        </div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#0f766e',
                          backgroundColor: '#ccfbf1',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}>
                          {item.quantityUsed} {item.unit || item.inventoryId?.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!task.inventoryItems || task.inventoryItems.length === 0 && (
                <div style={{ 
                  margin: '15px 0', 
                  padding: '12px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  📝 No specific inventory items assigned for this task
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '6px 16px', 
                    backgroundColor: getStatusColor(task.status),
                    color: task.status === 'In Progress' ? 'black' : 'white',
                    borderRadius: '15px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Status: {task.status}
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#475569' }}>
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateTaskStatus(task._id, getNextStatus(task.status))}
                    disabled={updating === task._id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                  >
                    {updating === task._id ? 'Updating...' : `Mark as ${getNextStatus(task.status)}`}
                  </button>
                  
                  {task.status !== 'In Progress' && (
                    <button
                      onClick={() => updateTaskStatus(task._id, 'In Progress')}
                      disabled={updating === task._id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#e0a800'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ffc107'}
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => updateTaskStatus(task._id, 'Completed')}
                      disabled={updating === task._id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
              
              {/* ✅ APPROVAL STATUS DISPLAY */}
              {task.status === 'Completed' && task.approved && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  border: '1px solid #c3e6cb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  ✅ Approved by {task.approvedBy || 'Admin'}
                  {task.approvedDate && (
                    <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
                      on {new Date(task.approvedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {task.status === 'Completed' && !task.approved && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  ⏳ Waiting for admin approval
                </div>
              )}

              {/* 🔄 Rework Display */}
              {task.status === 'In Progress' && task.rejectionReason && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  🔄 Sent back for rework<br />
                  <span style={{ fontWeight: 'normal', fontSize: '13px' }}>
                    Reason: {task.rejectionReason}
                  </span>
                </div>
              )}

              {task.employeeId && (
                <div style={{ 
                  marginTop: '12px', 
                  fontSize: '14px', 
                  color: '#666',
                  padding: '8px 12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  borderLeft: '3px solid #6c757d'
                }}>
                  👤 Assigned to: <strong>{task.employeeId.name}</strong> (Employee ID: {task.employeeId.userId})
                </div>
              )}

              {/* Total Inventory Cost (if available) */}
              {task.totalInventoryCost > 0 && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#e8f5e8',
                  color: '#155724',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeView;