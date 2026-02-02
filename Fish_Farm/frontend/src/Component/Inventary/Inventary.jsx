import { Link } from "react-router-dom";
import "./Inventary.css";
import React from "react";

function Inventary({ inventary, onDelete }) {
  const { _id, inventoryName, category, quantity, unit, reorder_level } = inventary;

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      onDelete(_id);
    }
  };

  return (
    <div className="O_V_I_card">
      <h2 className="O_V_I_name">{inventoryName}</h2>
      <p><strong>ID:</strong> {_id}</p>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>Units:</strong> {unit}</p>
      <p><strong>Quantity:</strong> {quantity}</p>
      <p><strong>Reorder Level:</strong> {reorder_level}</p>

      <div className="O_V_I_actions">
        <Link to={`/dashboard/Inventory/DisplayInventary/${_id}`}>
          <button className="O_V_I_update">Update</button>
        </Link>
        <button className="O_V_I_delete" onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default Inventary;
