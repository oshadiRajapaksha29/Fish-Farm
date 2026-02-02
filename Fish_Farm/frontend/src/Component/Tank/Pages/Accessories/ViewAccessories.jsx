import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ViewAccessories.css";

const URL = "http://localhost:5000/accessories";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

const ViewAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler().then((data) => setAccessories(data.accessories));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setAccessories(accessories.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting accessory:", err);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/dashboard/accessories/ViewAccessories/${id}`);
  };

  return (
    <div className="VA-container">
      <h2 className="VA-title">Accessories List</h2>
      <div className="VA-table-wrapper">
        <table className="VA-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Special Price</th>
              <th>Stock</th>
              <th>Weight</th>
              <th>Dimensions</th>
              <th>Description</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accessories.length > 0 ? (
              accessories.map((item) => (
                <tr key={item._id}>
                  <td>{item.product}</td>
                  <td>{item.category}</td>
                  <td>{item.price}</td>
                  <td>{item.specialPrice || "-"}</td>
                  <td>{item.stock}</td>
                  <td>{item.weight}</td>
                  <td>
                    {item.length} x {item.width} x {item.height}
                  </td>
                  <td>{item.description}</td>
                  <td>
                    {item.imageProduct && (
                      <img
                        src={`http://localhost:5000/${item.imageProduct}`}
                        alt={item.product}
                        className="VA-product-img"
                      />
                    )}
                  </td>
                  <td>
                    <button
                      className="VA-btn VA-update-btn"
                      onClick={() => handleUpdate(item._id)}
                    >
                      Update
                    </button>
                    <button
                      className="VA-btn VA-delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No accessories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAccessories;
