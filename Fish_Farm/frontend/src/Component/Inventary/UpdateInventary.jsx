// frontend/src/Component/Inventary/UpdateInventary.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const BASE = "http://localhost:5000"; // Update this if your server base changes

function UpdateInventary() {
  const [inputs, setInputs] = useState({
    inventoryName: "",
    category: "",
    quantity: "",
    unit: "",
    reorder_level: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch inventory details by ID
  useEffect(() => {
    let mounted = true;
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`${BASE}/Inventory/${id}`);
        console.log("GET /Inventory/:id response", res);
        const inv = res.data.inventory || res.data;
        if (!inv) {
          setError("Inventory not found in server response");
          return;
        }
        if (mounted) {
          setInputs({
            inventoryName: inv.inventoryName ?? "",
            category: inv.category ?? "",
            quantity: inv.quantity ?? "",
            unit: inv.unit ?? "",
            reorder_level: inv.reorder_level ?? "",
          });
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError(err?.response?.data?.message || err.message || "Fetch failed");
      }
    };
    fetchHandler();
    return () => (mounted = false);
  }, [id]);

  // Send PUT request to update the inventory
  const sendRequest = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        inventoryName: String(inputs.inventoryName),
        category: String(inputs.category),
        quantity: inputs.quantity === "" ? 0 : Number(inputs.quantity),
        unit: String(inputs.unit),
        reorder_level: inputs.reorder_level === "" ? 0 : Number(inputs.reorder_level),
      };
      console.log("PUT payload:", payload);

      const res = await axios.put(`${BASE}/Inventory/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("PUT response:", res);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      console.error("Update failed:", err);
      setError(err?.response?.data?.message || err.message || "Update failed");
      throw err;
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", inputs);
    try {
      await sendRequest();
      alert("Inventory updated successfully!");
      // Navigate to Display Inventary page after successful update
      navigate("/dashboard/Inventory/DisplayInventary");
    } catch (err) {
      // Error already handled
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "50px auto",
        padding: "20px",
        background: "#f4f4f4",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Update Inventory
      </h2>

      {error && (
        <div
          style={{
            color: "white",
            background: "crimson",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Inventory Name:</label>
        <input
          type="text"
          name="inventoryName"
          value={inputs.inventoryName ?? ""}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <label>Category:</label>
        <select
          name="category"
          value={inputs.category}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        >
          <option value="">-- Select Category --</option>
          <option value="Feeding">Feeding</option>
          <option value="Cleaning Tanks">Cleaning Tanks</option>
          <option value="Packaging">Packaging</option>
          <option value="Transferring Fish">Transferring Fish</option>
          <option value="Check Water Quality">Check Water Quality</option>
          <option value="Add Medicine">Add Medicine</option>
        </select>

        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={inputs.quantity ?? ""}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <label>Unit:</label>
        <input
          type="text"
          name="unit"
          value={inputs.unit ?? ""}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <label>Reorder Level:</label>
        <input
          type="number"
          name="reorder_level"
          value={inputs.reorder_level ?? ""}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Updating..." : "Update Inventory"}
        </button>
      </form>
    </div>
  );
}

export default UpdateInventary;
