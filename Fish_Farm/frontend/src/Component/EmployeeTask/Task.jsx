import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Task.css";

function Task(props) {
  const { _id, taskName, description, employeeId, status, dueDate, approved, approvedBy, approvedDate, inventoryItems, totalInventoryCost } = props.Task;
  const history = useNavigate();

  const deleteHandler = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/Tasks/${_id}`);
        
        if (response.status === 200) {
          alert("Task deleted successfully!");
          window.location.reload();
        } else {
          alert("Failed to delete task.");
        }
      } catch (err) {
        console.error("Error deleting task:", err);
        alert("Error deleting task. Please try again.");
      }
    }
  };

  const approveTask = async () => {
    if (!window.confirm("Are you sure you want to approve this task?")) return;
    
    try {
      const response = await axios.put(`http://localhost:5000/Tasks/${_id}/approve`, {
        approvedBy: "Admin"
      });
      
      if (response.data.success) {
        alert("Task approved successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Error approving task:", err);
      alert("Error approving task: " + (err.response?.data?.message || err.message));
    }
  };

  const rejectTask = async () => {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;
    
    try {
      const response = await axios.put(`http://localhost:5000/Tasks/${_id}/reject`, {
        reason: reason
      });
      
      if (response.data.success) {
        alert("Task rejected and sent back for rework!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Error rejecting task:", err);
      alert("Error rejecting task: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return approved ? '#28a745' : '#20c997';
      case 'In Progress': return '#ffc107';
      case 'Pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusTextColor = (status) => {
    return status === 'In Progress' ? '#000' : '#fff';
  };

  return (
    <div className="O_V_T_section">
      <h1 className="O_V_T_topic">Task Display</h1>
      
      <div className="O_V_T_content">
        <div className="O_V_T_row">
          <span className="O_V_T_label">Name:</span>
          <span className="O_V_T_value">{taskName}</span>
        </div>
        
        <div className="O_V_T_row">
          <span className="O_V_T_label">ID:</span>
          <span className="O_V_T_value O_V_T_id">{_id}</span>
        </div>
        
        <div className="O_V_T_row">
          <span className="O_V_T_label">Description:</span>
          <span className="O_V_T_value O_V_T_description">{description}</span>
        </div>
        
        <div className="O_V_T_row">
          <span className="O_V_T_label">Employee Name:</span>
          <span className="O_V_T_value">{employeeId?.name || 'N/A'}</span>
        </div>
        
        <div className="O_V_T_row">
          <span className="O_V_T_label">User ID:</span>
          <span className="O_V_T_value">{employeeId?.userId || 'N/A'}</span>
        </div>
        
        <div className="O_V_T_row">
          <span className="O_V_T_label">Status:</span>
          <span 
            className="O_V_T_status" 
            style={{
              backgroundColor: getStatusColor(status),
              color: getStatusTextColor(status),
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {status} {approved && status === 'Completed' && '✓'}
          </span>
        </div>

        {/* Inventory Items Section */}
        {inventoryItems && inventoryItems.length > 0 && (
          <div className="O_V_T_inventory_section">
            <h4 className="O_V_T_inventory_header">Inventory Used:</h4>
            {inventoryItems.map((item, index) => (
              <div key={index} className="O_V_T_inventory_item">
                <span className="O_V_T_inventory_name">
                  {item.itemName || item.inventoryId?.inventoryName}
                </span>
                <span className="O_V_T_inventory_quantity">
                  {item.quantityUsed} {item.unit || item.inventoryId?.unit}
                </span>
              </div>
            ))}
            
          </div>
        )}

        {approved && status === 'Completed' && (
          <>
            <div className="O_V_T_row">
              <span className="O_V_T_label">Approval Status:</span>
              <span className="O_V_T_value" style={{color: '#28a745', fontWeight: 'bold'}}>
                ✓ Approved by {approvedBy}
              </span>
            </div>
            <div className="O_V_T_row">
              <span className="O_V_T_label">Approved Date:</span>
              <span className="O_V_T_value">
                {approvedDate ? new Date(approvedDate).toLocaleString() : "N/A"}
              </span>
            </div>
          </>
        )}
        
        <div className="O_V_T_row">
          <span className="O_V_T_label">Due Date:</span>
          <span className="O_V_T_value">
            {dueDate ? new Date(dueDate).toLocaleString() : "Not set"}
          </span>
        </div>
      </div>

      <div className="O_V_T_actions">
        <Link to={`/dashboard/EmployeeTask/ViewTask/${_id}`} className="O_V_T_link O_V_T_update">
  Update Task
</Link>

        
        {status === 'Completed' && !approved && (
          <>
            <button 
              className="O_V_T_button O_V_T_approve" 
              onClick={approveTask}
              style={{backgroundColor: '#28a745'}}
            >
              Approve Task
            </button>
            <button 
              className="O_V_T_button O_V_T_reject" 
              onClick={rejectTask}
              style={{backgroundColor: '#ffc107', color: '#000'}}
            >
              Send for Rework
            </button>
          </>
        )}
        
        <button className="O_V_T_button O_V_T_delete" onClick={deleteHandler}>
          Delete Task
        </button>
      </div>
    </div>
  );
}

export default Task;