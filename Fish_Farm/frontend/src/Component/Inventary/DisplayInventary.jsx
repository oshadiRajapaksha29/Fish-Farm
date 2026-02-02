// Fish_Farm/frontend/src/Component/Inventary/DisplayInventary.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Inventary from "../Inventary/Inventary";

const URL = "http://localhost:5000/Inventory";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function ViewInventary() {
  const [inventary, setInventary] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => {
      const list = Array.isArray(data)
        ? data
        : data?.inventary ?? data?.inventory ?? [];
      setInventary(list);
    });
  }, []);

  // ✅ Delete function to remove from backend + UI
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      alert("Inventory deleted successfully!");
      // Instantly remove deleted item from list
      setInventary((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting inventory:", err);
      alert("Failed to delete inventory. Please try again.");
    }
  };

  return (
    <div>
      <h1>Inventory Detail Display Page</h1>
      <div>
        {inventary && inventary.length > 0 ? (
          inventary.map((inv, i) => (
            <div key={i}>
              {/* ✅ Pass delete handler to child */}
              <Inventary inventary={inv} onDelete={handleDelete} />
            </div>
          ))
        ) : (
          <p>No inventory items found.</p>
        )}
      </div>
    </div>
  );
}

export default ViewInventary;
