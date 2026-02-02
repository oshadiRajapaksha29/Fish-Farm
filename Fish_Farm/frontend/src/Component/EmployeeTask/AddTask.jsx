import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "./AddTask.css";

function AddTask() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    taskName: "",
    description: "",
    employeeId: "",
    dueDate: "",
  });

  const [employees, setEmployees] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState([]);
  const [descError, setDescError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch employees
  useEffect(() => {
    axios.get("http://localhost:5000/admin/employees")
      .then(res => {
        setEmployees(res.data.employees);
      })
      .catch(err => console.log(err));
  }, []);

  // Fetch inventory when task category is selected
  useEffect(() => {
    if (inputs.taskName) {
      setLoading(true);
      axios.get(`http://localhost:5000/Tasks/inventory/${inputs.taskName}`)
        .then(res => {
          setInventoryItems(res.data.inventory || []);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setInventoryItems([]);
    }
  }, [inputs.taskName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputs(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "description") {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < 1 || wordCount > 200) {
        setDescError("Description must be between 1 and 200 words.");
      } else {
        setDescError("");
      }
    }
  };

  const handleInventoryChange = (inventoryId, field, value) => {
    setSelectedInventory(prev => {
      const existingIndex = prev.findIndex(item => item.inventoryId === inventoryId);
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [field]: field === 'quantityUsed' ? Number(value) : value
        };
        
        // Remove if quantity is 0 or empty
        if (field === 'quantityUsed' && (value === 0 || value === '')) {
          return updated.filter(item => item.inventoryId !== inventoryId);
        }
        
        return updated;
      } else if (value && value > 0) {
        // Add new item
        const inventoryItem = inventoryItems.find(item => item._id === inventoryId);
        return [
          ...prev,
          {
            inventoryId,
            quantityUsed: Number(value),
            itemName: inventoryItem?.inventoryName,
            unit: inventoryItem?.unit
          }
        ];
      }
      
      return prev;
    });
  };

  const getAvailableQuantity = (inventoryId) => {
    const item = inventoryItems.find(inv => inv._id === inventoryId);
    return item ? item.quantity : 0;
  };

  const getSelectedQuantity = (inventoryId) => {
    const selected = selectedInventory.find(item => item.inventoryId === inventoryId);
    return selected ? selected.quantityUsed : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (descError) {
      return;
    }

    try {
      await sendRequest();
      history('/dashboard/EmployeeTask/ViewTask');
    } catch (err) {
      console.error('Error adding task:', err);
      alert(err.response?.data?.message || 'Error adding task');
    }
  };

  const sendRequest = async () => {
    const payload = {
      taskName: String(inputs.taskName),
      description: String(inputs.description),
      employeeId: inputs.employeeId,
      dueDate: inputs.dueDate,
      inventoryItems: selectedInventory
    };

    const response = await axios.post("http://localhost:5000/Tasks", payload);
    return response.data;
  };

  return (
    <div className="O_A_T_section">
      <h1 className="O_A_T_header">Add Task with Inventory</h1>

      <form className="O_A_T_form" onSubmit={handleSubmit}>
        <label className="O_A_T_label">Task:</label>
        <select 
          className="O_A_T_select" 
          name="taskName" 
          onChange={handleChange} 
          value={inputs.taskName}
          required
        >
          <option value="">Select Task</option>
          <option value="Feeding">Feeding</option>
          <option value="Cleaning Tanks">Cleaning Tanks</option>
          <option value="Packaging">Packaging</option>
          <option value="Transferring Fish">Transferring Fish</option>
          <option value="Check Water Quality">Check Water Quality</option>
          <option value="Add Medicine">Add Medicine</option>
        </select>

        <label className="O_A_T_label">Employee:</label>
        <select
          className="O_A_T_input"
          name="employeeId"
          onChange={handleChange}
          value={inputs.employeeId}
          required
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.userId} - {emp.name}
            </option>
          ))}
        </select>

        <label className="O_A_T_label">Description:</label>
        <textarea
          className="O_A_T_textarea"
          name="description"
          onChange={handleChange}
          value={inputs.description}
          placeholder="Task details..."
          required
        />
        {descError && <p style={{ color: "red", fontSize: "0.85rem" }}>{descError}</p>}

        <label className="O_A_T_label">Due Date</label>
        <input 
          className="O_A_T_input" 
          type="date" 
          name="dueDate" 
          onChange={handleChange} 
          value={inputs.dueDate} 
          required
        />

        {/* Inventory Section */}
        {inputs.taskName && (
          <div className="inventory-section">
            <h3 className="inventory-header">Inventory for {inputs.taskName}</h3>
            
            {loading ? (
              <p>Loading inventory...</p>
            ) : inventoryItems.length > 0 ? (
              <div className="inventory-list">
                <h4>Select items to use:</h4>
                {inventoryItems.map((item) => (
                  <div key={item._id} className="inventory-item">
                    <div className="item-info">
                      <span className="item-name">{item.inventoryName}</span>
                      <span className="item-stock">Available: {item.quantity} {item.unit}</span>
                    </div>
                    <div className="quantity-input">
                      <label>Quantity to use:</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={getSelectedQuantity(item._id)}
                        onChange={(e) => handleInventoryChange(item._id, 'quantityUsed', e.target.value)}
                        placeholder="0"
                      />
                      <span className="unit">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No inventory items available for this task category.</p>
            )}
            
            {selectedInventory.length > 0 && (
              <div className="selected-items">
                <h4>Selected Items:</h4>
                {selectedInventory.map((item) => (
                  <div key={item.inventoryId} className="selected-item">
                    {item.itemName}: {item.quantityUsed} {item.unit}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button 
          className="O_A_T_button" 
          type="submit" 
          disabled={!!descError || loading}
        >
          {loading ? "Assigning Task..." : "Assign Task with Inventory"}
        </button>
      </form>
    </div>
  );
}

export default AddTask;