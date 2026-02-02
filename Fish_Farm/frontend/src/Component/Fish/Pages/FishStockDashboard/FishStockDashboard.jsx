import React, { useEffect, useState } from "react";
import axios from "axios";
import FishView from "./FishView";
import "./FishStockDashboard.css"; // link to the updated CSS

function FishStockDashboard() {
  const [fishData, setFishData] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/fish")
      .then((res) => {
        setFishData(res.data.fish || res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="fish-dashboard-container">
      <h1 className="dashboard-title">Fish Stock</h1>

      <table className="fish-table">
        <thead>
          <tr>
            <th>Species</th>
            <th>Stage</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fishData.map((fish) => (
            <tr key={fish._id}>
              <td>{fish.Species}</td>
              <td>
                <span className={`badge stage-${fish.Stage.toLowerCase()}`}>
                  {fish.Stage}
                </span>
              </td>
              <td>
                <span className={`badge quantity-badge`}>
                  {fish.Quantity}
                </span>
              </td>
              <td>
                <button
                  className="btn-view"
                  onClick={() => setSelectedFish(fish)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sidebar / Popup */}
      {selectedFish && (
        <div className="sidebar">
          <button className="btn-close" onClick={() => setSelectedFish(null)}>
            Close
          </button>
          <FishView fish={selectedFish} />
        </div>
      )}
    </div>
  );
}

export default FishStockDashboard;
