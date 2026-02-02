import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddFoodOrMedicine.css";

const AddFoodOrMedicine = () => {
  const navigate = useNavigate();

  const initialInputs = {
    productName: "",
    category: "food",
    size: "",
    price: "",
    stock: "",
    description: "",
  };

  const [inputs, setInputs] = useState(initialInputs);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    // Clear image error when a new image is selected
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };
  
  // Handle blur events to validate fields when user leaves them
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };
  
  // Validate a single field
  const validateField = (field) => {
    let newError = '';
    
    switch (field) {
      case 'productName':
        if (!inputs.productName) {
          newError = 'Product name is required';
        } else if (inputs.productName.length < 3) {
          newError = 'Product name must be at least 3 characters';
        }
        break;
      
      case 'size':
        if (!inputs.size) {
          newError = 'Size is required';
        }
        break;
        
      case 'price':
        if (!inputs.price) {
          newError = 'Price is required';
        } else if (isNaN(inputs.price) || Number(inputs.price) <= 0) {
          newError = 'Price must be a positive number';
        }
        break;
        
      case 'stock':
        if (!inputs.stock) {
          newError = 'Stock quantity is required';
        } else if (isNaN(inputs.stock) || Number(inputs.stock) < 0 || !Number.isInteger(Number(inputs.stock))) {
          newError = 'Stock must be a positive whole number';
        }
        break;
        
      case 'description':
        if (!inputs.description) {
          newError = 'Description is required';
        } else if (inputs.description.length < 10) {
          newError = 'Description must be at least 10 characters';
        }
        break;
        
      case 'image':
        if (!image) {
          newError = 'Product image is required';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: newError }));
    return !newError;
  };
  
  // Validate all fields
  const validateForm = () => {
    const fields = ['productName', 'size', 'price', 'stock', 'description', 'image'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const fields = ['productName', 'size', 'price', 'stock', 'description', 'image'];
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      // Animate form shake on error
      const form = document.querySelector('.r_A_FM_form');
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
      
      // Scroll to first error
      const firstErrorField = document.querySelector('.input-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(inputs).forEach((key) => formData.append(key, inputs[key]));
    if (image) formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/foodAndMedicine", formData);
      alert("Added successfully ✅");
      navigate("/dashboard/FoodAndMedicine/ViewFoodAndMedicine");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setInputs(initialInputs);
    setImage(null);
  };

  return (
    <div className="r_A_FM_container">
      <h2 className="r_A_FM_title">Add Food or Medicine</h2>

      <form className="r_A_FM_form" onSubmit={handleSubmit}>
        <div>
          <label className="r_A_FM_label">Product Name</label>
          <input
            className={`r_A_FM_input ${errors.productName && touched.productName ? 'input-error' : ''}`}
            name="productName"
            value={inputs.productName}
            onChange={handleChange}
            onBlur={() => handleBlur('productName')}
            placeholder="Enter product name"
          />
          {errors.productName && touched.productName && 
            <div className="error-message">{errors.productName}</div>
          }
        </div>

        <div>
          <label className="r_A_FM_label">Category</label>
          <select
            className="r_A_FM_select"
            name="category"
            value={inputs.category}
            onChange={handleChange}
            required
          >
            <option value="food">Food</option>
            <option value="medicine">Medicine</option>
          </select>
        </div>

        <div>
          <label className="r_A_FM_label">Size</label>
          <input
            className={`r_A_FM_input ${errors.size && touched.size ? 'input-error' : ''}`}
            name="size"
            value={inputs.size}
            onChange={handleChange}
            onBlur={() => handleBlur('size')}
            placeholder="e.g., 250g, 500ml"
          />
          {errors.size && touched.size && 
            <div className="error-message">{errors.size}</div>
          }
        </div>

        <div>
          <label className="r_A_FM_label">Price</label>
          <input
            className={`r_A_FM_input ${errors.price && touched.price ? 'input-error' : ''}`}
            type="number"
            name="price"
            value={inputs.price}
            onChange={handleChange}
            onBlur={() => handleBlur('price')}
            placeholder="Enter price"
            min="0"
          />
          {errors.price && touched.price && 
            <div className="error-message">{errors.price}</div>
          }
        </div>

        <div>
          <label className="r_A_FM_label">Stock</label>
          <input
            className={`r_A_FM_input ${errors.stock && touched.stock ? 'input-error' : ''}`}
            type="number"
            name="stock"
            value={inputs.stock}
            onChange={handleChange}
            onBlur={() => handleBlur('stock')}
            placeholder="Enter available quantity"
            min="0"
          />
          {errors.stock && touched.stock && 
            <div className="error-message">{errors.stock}</div>
          }
        </div>

        <div>
          <label className="r_A_FM_label">Description</label>
          <textarea
            className={`r_A_FM_textarea ${errors.description && touched.description ? 'input-error' : ''}`}
            name="description"
            value={inputs.description}
            onChange={handleChange}
            onBlur={() => handleBlur('description')}
            placeholder="Enter product description"
          />
          {errors.description && touched.description && 
            <div className="error-message">{errors.description}</div>
          }
        </div>

        <div>
          <label className="r_A_FM_label">Upload Image</label>
          <input
            className={`r_A_FM_file ${errors.image && touched.image ? 'input-error' : ''}`}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            onBlur={() => handleBlur('image')}
          />
          {errors.image && touched.image && 
            <div className="error-message">{errors.image}</div>
          }
        </div>

        <div className="r_A_FM_buttons">
          <button className="r_A_FM_btn r_A_FM_btn_submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
          <button
            className="r_A_FM_btn r_A_FM_btn_reset"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFoodOrMedicine;
