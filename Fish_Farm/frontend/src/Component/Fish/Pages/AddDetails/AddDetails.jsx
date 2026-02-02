import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddDetails.css";

const API_BASE = "http://localhost:5000";

export default function AddFish() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Species: "",
    subSpecies: "",
    Stage: "",
    DateOfArrival: "",
    Quantity: "",
    TankNumber: "",
    AverageWeight: "",
    PurchasePrice: "",
    PricePerCouple: "",
    AboutFish: "",
  });

  const [photo, setPhoto] = useState(null);
  const [extraPhoto, setExtraPhoto] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files?.[0] || null);
    if (errors.photo) {
      setErrors({ ...errors, photo: "" });
    }
  };

  const handleExtraFileChange = (e) => setExtraPhoto(e.target.files?.[0] || null);

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.Species.trim()) newErrors.Species = "Species is required";
    if (!formData.subSpecies.trim()) newErrors.subSpecies = "Sub Species is required";
    if (!formData.Stage) newErrors.Stage = "Stage is required";
    if (!formData.DateOfArrival) newErrors.DateOfArrival = "Date of Arrival is required";

    // Quantity validation - cannot be less than 1
    if (!formData.Quantity || formData.Quantity === "") {
      newErrors.Quantity = "Quantity is required";
    } else if (Number(formData.Quantity) < 1) {
      newErrors.Quantity = "Quantity must be at least 1";
    }

    // Tank Number validation - must be between 1 and 8
    if (!formData.TankNumber) {
      newErrors.TankNumber = "Tank Number is required";
    } else if (Number(formData.TankNumber) < 1 || Number(formData.TankNumber) > 8) {
      newErrors.TankNumber = "Tank Number must be between 1 and 8";
    }

    // Average Weight validation - cannot be less than 1
    if (!formData.AverageWeight || formData.AverageWeight === "") {
      newErrors.AverageWeight = "Average Weight is required";
    } else if (Number(formData.AverageWeight) < 1) {
      newErrors.AverageWeight = "Average Weight must be at least 1 kg";
    }

    // Purchase Price validation - cannot be less than 1
    if (!formData.PurchasePrice || formData.PurchasePrice === "") {
      newErrors.PurchasePrice = "Purchase Price is required";
    } else if (Number(formData.PurchasePrice) < 1) {
      newErrors.PurchasePrice = "Purchase Price must be at least Rs. 1";
    }

    // Selling Price validation - cannot be less than 1
    if (!formData.PricePerCouple || formData.PricePerCouple === "") {
      newErrors.PricePerCouple = "Selling Price is required";
    } else if (Number(formData.PricePerCouple) < 1) {
      newErrors.PricePerCouple = "Selling Price must be at least Rs. 1";
    }

    // Photo validation - required
    if (!photo) {
      newErrors.photo = "Photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData({
      Species: "",
      subSpecies: "",
      Stage: "",
      DateOfArrival: "",
      Quantity: "",
      TankNumber: "",
      AverageWeight: "",
      PurchasePrice: "",
      PricePerCouple: "",
      AboutFish: "",
    });
    setPhoto(null);
    setExtraPhoto(null);
    setErrors({});
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    try {
      const form = new FormData();
      form.append("Species", formData.Species.trim());
      form.append("subSpecies", formData.subSpecies.trim());
      form.append("Stage", formData.Stage);
      form.append(
        "DateOfArrival",
        formData.DateOfArrival ? new Date(formData.DateOfArrival).toISOString() : ""
      );
      form.append("Quantity", Number(formData.Quantity));
      form.append("TankNumber", Number(formData.TankNumber));
      form.append("AverageWeight", Number(formData.AverageWeight));
      form.append("PurchasePrice", Number(formData.PurchasePrice));
      form.append("PricePerCouple", Number(formData.PricePerCouple));
      form.append("AboutFish", formData.AboutFish.trim());
      if (photo) form.append("photo", photo);
      if (extraPhoto) form.append("extraPhoto", extraPhoto);

      const res = await axios.post(`${API_BASE}/fish`, form);
      if (res.status === 201) {
        alert("Fish added successfully!");
        handleReset();
        navigate("/dashboard/fish/View");
      } else {
        alert(res?.data?.message || "Failed to add fish.");
      }
    } catch (err) {
      console.error("Add Fish error:", err);
      alert(err?.response?.data?.message || "Failed to add fish. Check console.");
    }
  };

  return (
    <div className="S_AF_fish-form-page">
      <div className="S_AF_fish-form-container">
        <div className="S_AF_fish-form-wrapper">
          <h1 className="S_AF_form-title">Add Fish</h1>
          <form
            onSubmit={handleSubmit}
            className="S_AF_fish-form"
            encType="multipart/form-data"
            noValidate // This prevents HTML5 validation
          >
            {/* Basic Information */}
            <div className="S_AF_form-box">
              <h2 className="S_AF_form-section-title">Basic Information</h2>
              <div className="S_AF_form-grid">
                <label>
                  Species *
                  <input
                    type="text"
                    name="Species"
                    value={formData.Species}
                    onChange={handleChange}
                    className={errors.Species ? "S_AF_input-error" : ""}
                  />
                  {errors.Species && <span className="S_AF_error-message">{errors.Species}</span>}
                </label>

                <label>
                  Sub Species *
                  <input
                    type="text"
                    name="subSpecies"
                    value={formData.subSpecies}
                    onChange={handleChange}
                    className={errors.subSpecies ? "S_AF_input-error" : ""}
                  />
                  {errors.subSpecies && <span className="S_AF_error-message">{errors.subSpecies}</span>}
                </label>

                <label>
                  Stage *
                  <select
                    name="Stage"
                    value={formData.Stage}
                    onChange={handleChange}
                    className={errors.Stage ? "S_AF_input-error" : ""}
                  >
                    <option value="">Select Stage</option>
                    <option value="Fry">Fry</option>
                    <option value="Juvenile">Juvenile</option>
                    <option value="Adult">Adult</option>
                  </select>
                  {errors.Stage && <span className="S_AF_error-message">{errors.Stage}</span>}
                </label>

                <label>
                  Date of Arrival *
                  <input
                    type="date"
                    name="DateOfArrival"
                    value={formData.DateOfArrival}
                    onChange={handleChange}
                    className={errors.DateOfArrival ? "S_AF_input-error" : ""}
                  />
                  {errors.DateOfArrival && <span className="S_AF_error-message">{errors.DateOfArrival}</span>}
                </label>

                <label>
                  Quantity *
                  <input
                    type="number"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleChange}
                    className={errors.Quantity ? "S_AF_input-error" : ""}
                  />
                  {errors.Quantity && <span className="S_AF_error-message">{errors.Quantity}</span>}
                </label>

                <label>
                  Tank Number *
                  <select
                    name="TankNumber"
                    value={formData.TankNumber}
                    onChange={handleChange}
                    className={errors.TankNumber ? "S_AF_input-error" : ""}
                  >
                    <option value="">Select Tank No</option>
                    {[...Array(8)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {errors.TankNumber && <span className="S_AF_error-message">{errors.TankNumber}</span>}
                </label>
              </div>
            </div>

            {/* Financial Information */}
            <div className="S_AF_form-box">
              <h2 className="S_AF_form-section-title">Financial Information</h2>
              <div className="S_AF_form-grid">
                <label>
                  Average Weight (kg) *
                  <input
                    type="number"
                    name="AverageWeight"
                    value={formData.AverageWeight}
                    onChange={handleChange}
                    step="0.01"
                    className={errors.AverageWeight ? "S_AF_input-error" : ""}
                  />
                  {errors.AverageWeight && <span className="S_AF_error-message">{errors.AverageWeight}</span>}
                </label>

                <label>
                  Purchase Price (Rs.) *
                  <input
                    type="number"
                    name="PurchasePrice"
                    value={formData.PurchasePrice}
                    onChange={handleChange}
                    step="0.01"
                    className={errors.PurchasePrice ? "S_AF_input-error" : ""}
                  />
                  {errors.PurchasePrice && <span className="S_AF_error-message">{errors.PurchasePrice}</span>}
                </label>

                <label>
                  Selling Price (Rs.) *
                  <input
                    type="number"
                    name="PricePerCouple"
                    value={formData.PricePerCouple}
                    onChange={handleChange}
                    step="0.01"
                    className={errors.PricePerCouple ? "S_AF_input-error" : ""}
                  />
                  {errors.PricePerCouple && <span className="S_AF_error-message">{errors.PricePerCouple}</span>}
                </label>
              </div>
            </div>

            {/* Additional Information */}
            <div className="S_AF_form-box">
              <h2 className="S_AF_form-section-title">Additional Information</h2>
              <div className="S_AF_form-grid">
                <label className="S_AF_full-width">
                  About Fish
                  <textarea
                    name="AboutFish"
                    value={formData.AboutFish}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe fish characteristics, behavior, special requirements..."
                  />
                </label>

                <label>
                  Upload Photo *
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={errors.photo ? "S_AF_input-error" : ""}
                  />
                  {errors.photo && <span className="S_AF_error-message">{errors.photo}</span>}
                </label>

                <label>
                  Upload Extra Photo
                  <input
                    type="file"
                    name="extraPhoto"
                    accept="image/*"
                    onChange={handleExtraFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="S_AF_form-buttons">
              <button
                type="button"
                onClick={handleReset}
                className="S_AF_btn-reset"
              >
                <i className="fas fa-redo"></i> Reset
              </button>
              <button type="submit" className="S_AF_btn-submit">
                <i className="fas fa-plus-circle"></i> Add Fish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}