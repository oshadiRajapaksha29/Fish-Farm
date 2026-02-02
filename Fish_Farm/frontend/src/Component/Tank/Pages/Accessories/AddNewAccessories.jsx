// AddNewAccessories.jsx
import React, { useState } from "react";
import "./AddNewAccessories.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddNewAccessories = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    product: "",
    category: "",
    price: "",
    specialPrice: "",
    stock: "",
    description: "",
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  const [productImage, setProductImage] = useState(null);
  const [promotionImages, setPromotionImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
    }
  };

  const removeProductImage = () => {
    setProductImage(null);
    document.getElementById("productImageInput").value = "";
  };

  const handlePromotionImages = (e) => {
    const files = Array.from(e.target.files);
    if (promotionImages.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setPromotionImages((prev) => [...prev, ...files]);
  };

  const removePromotionImage = (index) => {
    setPromotionImages(promotionImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (const key in inputs) {
      formData.append(key, inputs[key]);
    }

    if (productImage) {
      formData.append("imageProduct", productImage);
    }

    promotionImages.forEach((file, index) => {
      formData.append("buyerImagesProduct", file);
    });

    try {
      await axios.post("http://localhost:5000/accessories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Accessory added successfully!");
      navigate("/dashboard/accessories/ViewAccessories");
    } catch (err) {
      console.error("Error adding accessory:", err);
      alert("Failed to add accessory.");
    }
  };

  return (
    <div className="ANA-container">
      <h1>Add New Accessories</h1>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="ANA-section">
          <h2>Basic Information</h2>
          <label>Product Name</label>
          <input
            type="text"
            name="product"
            value={inputs.product}
            onChange={handleChange}
            placeholder="Ex. Air Pump"
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={inputs.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="pumps">Pumps</option>
            <option value="filters">Filters</option>
            <option value="lighting">Lighting</option>
            <option value="heaters">Heaters</option>
            <option value="tanks">Tanks</option>
            <option value="tools">Tools</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Images */}
        <div className="ANA-section">
          <h2>Images</h2>
          <label>Main Product Image</label>
          <input
            id="productImageInput"
            type="file"
            accept="image/*"
            onChange={handleProductImage}
          />
          {productImage && (
            <div className="ANA-image-preview">
              <img
                src={URL.createObjectURL(productImage)}
                alt="Product Preview"
              />
              <button type="button" onClick={removeProductImage}>
                ×
              </button>
            </div>
          )}

          <label>Promotion Images (Max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePromotionImages}
          />
          <div className="ANA-image-preview-container">
            {promotionImages.map((file, i) => (
              <div key={i} className="ANA-image-preview">
                <img src={URL.createObjectURL(file)} alt={`Promo ${i}`} />
                <button type="button" onClick={() => removePromotionImage(i)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="ANA-section">
          <h2>Pricing & Stock</h2>
          <div className="ANA-row">
            <div>
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={inputs.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div>
              <label>Special Price</label>
              <input
                type="number"
                name="specialPrice"
                value={inputs.specialPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={inputs.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={inputs.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        {/* Package Details */}
        <div className="ANA-section">
          <h2>Package Details</h2>
          <label>Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            name="weight"
            value={inputs.weight}
            onChange={handleChange}
            min="0"
          />

          <label>Dimensions (cm)</label>
          <div className="ANA-row">
            <input
              type="number"
              name="length"
              placeholder="Length"
              value={inputs.length}
              onChange={handleChange}
              min="0"
            />
            <span>×</span>
            <input
              type="number"
              name="width"
              placeholder="Width"
              value={inputs.width}
              onChange={handleChange}
              min="0"
            />
            <span>×</span>
            <input
              type="number"
              name="height"
              placeholder="Height"
              value={inputs.height}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="ANA-buttons">
          <button type="submit" className="ANA-primary-btn">
            Submit
          </button>
          <button
            type="button"
            className="ANA-secondary-btn"
            onClick={() => {
              setInputs({
                product: "",
                category: "",
                price: "",
                specialPrice: "",
                stock: "",
                description: "",
                weight: "",
                length: "",
                width: "",
                height: "",
              });
              setProductImage(null);
              setPromotionImages([]);
              document.getElementById("productImageInput").value = "";
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewAccessories;