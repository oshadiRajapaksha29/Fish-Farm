import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ViewFoodAndMedicine.css";

const ViewFoodAndMedicine = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("http://localhost:5000/foodAndMedicine");
        setItems(Array.isArray(res.data) ? res.data : res.data.foodAndMedicine || []);
      } catch (err) {
        console.error(err);
        setItems([]);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`http://localhost:5000/foodAndMedicine/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const handleUpdate = (id) => {
    navigate(`/dashboard/FoodAndMedicine/UpdateFoodAndMedicine/${id}`);
  };

  return (
    <div className="r_v_FM_container">
      <h2 className="r_v_FM_title">Food & Medicine List</h2>

      {items.length === 0 ? (
        <div className="r_v_FM_empty">
          <p>No food or medicine items available</p>
          <p>Add items to see them listed here</p>
        </div>
      ) : (
        <table className="r_v_FM_table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Size</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Description</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.productName}</td>
                <td>
                  <span className={`r_v_FM_category ${item.category}`}>
                    {item.category}
                  </span>
                </td>
                <td>{item.size}</td>
                <td>Rs. {item.price}</td>
                <td>
                  <span className={`r_v_FM_stock ${item.stock < 10 ? 'low' : item.stock < 30 ? 'medium' : 'high'}`}>
                    {item.stock}
                  </span>
                </td>
                <td>{item.description}</td>
                <td>
                  {item.image && (
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt={item.productName}
                      className="r_v_FM_image"
                      onError={(e) =>
                        (e.currentTarget.src = "/default-placeholder.png")
                      }
                    />
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="r_v_FM_btn r_v_FM_update"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="r_v_FM_btn r_v_FM_delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewFoodAndMedicine;
