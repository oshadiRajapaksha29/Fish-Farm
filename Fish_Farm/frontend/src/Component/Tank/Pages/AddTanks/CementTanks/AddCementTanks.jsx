// AddCementTanks.jsx
import React from 'react';
import './AddCementTanks.css';

function AddCementTanks() {
  return (
    <div className="cement-form-container">
      <form className="cement-form">
        <h1>Add Cement Tank</h1>

        <div className="form-group">
          <label>Tank Name</label>
          <input type="text" placeholder="Enter tank name" />
        </div>

        <div className="form-group">
          <label>Tank Location</label>
          <input type="text" placeholder="Enter location" />
        </div>

        <h3>Tank Size</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Height (m)</label>
            <input type="number" />
          </div>
          <div className="form-group">
            <label>Width (m)</label>
            <input type="number" />
          </div>
          <div className="form-group">
            <label>Length (m)</label>
            <input type="number" />
          </div>
        </div>

        <h3>Water Valves</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Inlet Valves</label>
            <input type="number" />
          </div>
          <div className="form-group">
            <label>Outlet Valves</label>
            <input type="number" />
          </div>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddCementTanks;
