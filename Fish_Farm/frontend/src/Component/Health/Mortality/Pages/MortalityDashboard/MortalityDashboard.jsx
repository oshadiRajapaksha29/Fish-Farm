import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewMortality from "../ViewMortality/ViewMortality";

import "./MortalityDashboard.css";

const API_BASE = "http://localhost:5000";

export default function MortalityDashboard() {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/mortality`)
      .then((res) => {
        // accepts [{...}] or {mortality:[...]}
        const list = Array.isArray(res.data) ? res.data : (res.data.mortality || []);
        setRows(list);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="mortality-dash">
      <h1>Mortality Records</h1>

      <table className="mortality-table">
        <thead>
          <tr>
            <th>Species</th>
            <th>Subspecies</th>
            <th>Tank</th>
            <th>Date</th>
            <th>Died</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m._id}>
              <td>{m.Species}</td>
              <td>{m.subSpecies}</td>
              <td>{m.TankNumber}</td>
              <td>{m.DateOfDeath ? new Date(m.DateOfDeath).toLocaleDateString() : "-"}</td>
              <td>{m.QuantityDied}</td>
              <td>
                <button className="view-btn" onClick={() => setSelectedId(m._id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedId && (
        <div className="sidebar">
          <button className="close-btn" onClick={() => setSelectedId(null)}>Close</button>
          <ViewMortality id={selectedId} />
        </div>
      )}
    </div>
  );
}
