import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./UpdateFoodAndMedicine.css"; // optional CSS

const UpdateFoodAndMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    productName: "",
    category: "food",
    size: "",
    price: "",
    stock: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Loading state

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/foodAndMedicine/${id}`);

        // Adjust if API wraps inside foodAndMedicine
        const data = res.data.foodAndMedicine ? res.data.foodAndMedicine : res.data;

        setInputs({
          productName: data.productName || "",
          category: data.category || "food",
          size: data.size || "",
          price: data.price || "",
          stock: data.stock || "",
          description: data.description || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch item", err);
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(inputs).forEach((key) => formData.append(key, inputs[key]));
    if (image) formData.append("image", image);

    try {
      await axios.put(`http://localhost:5000/foodAndMedicine/${id}`, formData);
      alert("Updated successfully ✅");
      navigate("/dashboard/FoodAndMedicine/ViewFoodAndMedicine");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return (
    <div className="r_u_FM_container">
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          border: '3px solid rgba(59, 130, 246, 0.2)', 
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          width: '40px', 
          height: '40px',
          margin: '0 auto 20px',
          animation: 'r_u_FM_spin 0.8s linear infinite'
        }}></div>
        <p>Loading item data...</p>
      </div>
    </div>
  );

  /* Add keyframe animation for spinner */
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `
    @keyframes r_u_FM_spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleElement);

  return (
    <div className="r_u_FM_container">
      <h2 className="r_u_FM_title">Update Food or Medicine</h2>

      <form className="r_u_FM_form" onSubmit={handleSubmit}>
        <label className="r_u_FM_label">Product Name</label>
        <input
          className="r_u_FM_input"
          name="productName"
          value={inputs.productName}
          onChange={handleChange}
          required
        />

        <label className="r_u_FM_label">Category</label>
        <select
          className="r_u_FM_select"
          name="category"
          value={inputs.category}
          onChange={handleChange}
          required
        >
          <option value="food">Food</option>
          <option value="medicine">Medicine</option>
        </select>

        <label className="r_u_FM_label">Size</label>
        <input
          className="r_u_FM_input"
          name="size"
          value={inputs.size}
          onChange={handleChange}
          required
        />

        <label className="r_u_FM_label">Price</label>
        <input
          className="r_u_FM_input"
          type="number"
          name="price"
          value={inputs.price}
          onChange={handleChange}
          min="0"
          required
        />

        <label className="r_u_FM_label">Stock</label>
        <input
          className="r_u_FM_input"
          type="number"
          name="stock"
          value={inputs.stock}
          onChange={handleChange}
          min="0"
          required
        />

        <label className="r_u_FM_label">Description</label>
        <textarea
          className="r_u_FM_textarea"
          name="description"
          value={inputs.description}
          onChange={handleChange}
          required
        />

        <label className="r_u_FM_label">Upload New Image</label>
        <input
          className="r_u_FM_file"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        <div className="r_u_FM_buttons">
          <button 
            type="button" 
            className="r_u_FM_btn r_u_FM_btn_cancel" 
            onClick={() => navigate('/dashboard/FoodAndMedicine/ViewFoodAndMedicine')}
          >
            Cancel
          </button>
          <button className="r_u_FM_btn r_u_FM_btn_submit" type="submit">
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateFoodAndMedicine;
