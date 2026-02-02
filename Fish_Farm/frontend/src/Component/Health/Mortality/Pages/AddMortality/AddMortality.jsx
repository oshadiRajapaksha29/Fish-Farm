// AddMortality.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddMortality.css";

const API_BASE = "http://localhost:5000";

export default function AddMortality() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Species: "",
    subSpecies: "",
    TankNumber: "",
    DateOfDeath: "",
    QuantityDied: "",
    CauseOfDeath: "",
    Notes: "",
  });

  const [errors, setErrors] = useState({});
  const [speciesData, setSpeciesData] = useState([]);
  const [subSpeciesOptions, setSubSpeciesOptions] = useState([]);
  const [tankOptions, setTankOptions] = useState([]);

  // Fetch species data from backend
  useEffect(() => {
    const fetchSpeciesData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/fish/species-data`);
        setSpeciesData(res.data);
      } catch (err) {
        console.error("Failed to fetch species data:", err);
      }
    };
    fetchSpeciesData();
  }, []);

  // Handle main species change
  const handleSpeciesChange = (e) => {
    const selected = e.target.value;
    setFormData({ ...formData, Species: selected, subSpecies: "", TankNumber: "" });

    // Find species object by name
    const selectedData = speciesData.find((item) => item.speciesName === selected);

    setSubSpeciesOptions(selectedData?.subSpecies || []);
    setTankOptions(selectedData?.tanks || []);

    if (errors.Species) setErrors({ ...errors, Species: "" });
  };

  // Handle other field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.Species) newErrors.Species = "Species is required";
    if (!formData.subSpecies) newErrors.subSpecies = "Sub Species is required";
    if (!formData.TankNumber) newErrors.TankNumber = "Tank Number is required";
    if (!formData.DateOfDeath) newErrors.DateOfDeath = "Date of Death is required";
    if (!formData.QuantityDied || Number(formData.QuantityDied) < 1)
      newErrors.QuantityDied = "Quantity Died must be at least 1";
    if (!formData.CauseOfDeath) newErrors.CauseOfDeath = "Cause of Death is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData({
      Species: "",
      subSpecies: "",
      TankNumber: "",
      DateOfDeath: "",
      QuantityDied: "",
      CauseOfDeath: "",
      Notes: "",
    });
    setSubSpeciesOptions([]);
    setTankOptions([]);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return alert("Please fix errors before submitting.");

    try {
      const payload = {
        ...formData,
        QuantityDied: Number(formData.QuantityDied),
        Species: formData.Species,
        subSpecies: formData.subSpecies,
        CauseOfDeath: formData.CauseOfDeath,
        Notes: formData.Notes,
      };
      const res = await axios.post(`${API_BASE}/mortality`, payload);
      if (res.status === 201 || res.status === 200) {
        alert("Mortality record added successfully!");
        handleReset();
        navigate("/dashboard/mortality/View");
      } else {
        alert(res?.data?.message || "Failed to add mortality record.");
      }
    } catch (err) {
      console.error("Add Mortality error:", err);
      alert(err?.response?.data?.message || "Failed to add mortality. Check console.");
    }
  };

  return (
    <div className="S_AM_mortality-form-page">
      <div className="S_AM_mortality-form-container">
        <div className="S_AM_mortality-form-wrapper">
          <h1 className="S_AM_form-title">Add Mortality</h1>
          <form onSubmit={handleSubmit} className="S_AM_mortality-form" noValidate>

            {/* Basic Info */}
            <div className="S_AM_form-box">
              <h2 className="S_AM_form-section-title">Basic Information</h2>
              <div className="S_AM_form-grid">
                
                {/* Main Species */}
                <label>
                  Species *
                  <select
                    name="Species"
                    value={formData.Species}
                    onChange={handleSpeciesChange}
                    className={errors.Species ? "S_AM_input-error" : ""}
                  >
                    <option value="">Select Main Species</option>
                    {speciesData.map((species) => (
                      <option key={species._id} value={species.speciesName}>
                        {species.speciesName}
                      </option>
                    ))}
                  </select>
                  {errors.Species && <span className="S_AM_error-message">{errors.Species}</span>}
                </label>

                {/* Sub Species */}
                <label>
                  Sub Species *
                  <select
                    name="subSpecies"
                    value={formData.subSpecies}
                    onChange={handleChange}
                    className={errors.subSpecies ? "S_AM_input-error" : ""}
                  >
                    <option value="">Select Sub Species</option>
                    {subSpeciesOptions.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {errors.subSpecies && <span className="S_AM_error-message">{errors.subSpecies}</span>}
                </label>

                {/* Tank Number */}
                <label>
                  Tank Number *
                  <select
                    name="TankNumber"
                    value={formData.TankNumber}
                    onChange={handleChange}
                    className={errors.TankNumber ? "S_AM_input-error" : ""}
                  >
                    <option value="">Select Tank Number</option>
                    {tankOptions.map((tank) => (
                      <option key={tank} value={tank}>{tank}</option>
                    ))}
                  </select>
                  {errors.TankNumber && <span className="S_AM_error-message">{errors.TankNumber}</span>}
                </label>

                {/* Date of Death */}
                <label>
                  Date of Death *
                  <input
                    type="date"
                    name="DateOfDeath"
                    value={formData.DateOfDeath}
                    onChange={handleChange}
                    className={errors.DateOfDeath ? "S_AM_input-error" : ""}
                  />
                  {errors.DateOfDeath && <span className="S_AM_error-message">{errors.DateOfDeath}</span>}
                </label>

              </div>
            </div>

            {/* Details */}
            <div className="S_AM_form-box">
              <h2 className="S_AM_form-section-title">Details</h2>
              <div className="S_AM_form-grid">
                <label>
                  Quantity Died *
                  <input
                    type="number"
                    name="QuantityDied"
                    value={formData.QuantityDied}
                    onChange={handleChange}
                    min="1"
                    className={errors.QuantityDied ? "S_AM_input-error" : ""}
                  />
                  {errors.QuantityDied && <span className="S_AM_error-message">{errors.QuantityDied}</span>}
                </label>

                <label>
                  Cause of Death *
                  <input
                    type="text"
                    name="CauseOfDeath"
                    value={formData.CauseOfDeath}
                    onChange={handleChange}
                    placeholder="e.g., Ich outbreak, low DO, handling stress"
                    className={errors.CauseOfDeath ? "S_AM_input-error" : ""}
                  />
                  {errors.CauseOfDeath && <span className="S_AM_error-message">{errors.CauseOfDeath}</span>}
                </label>

                <label className="S_AM_full-width">
                  Notes
                  <textarea
                    name="Notes"
                    rows={3}
                    value={formData.Notes}
                    onChange={handleChange}
                    placeholder="Optional notes"
                  />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="S_AM_form-buttons">
              <button type="button" onClick={handleReset} className="S_AM_btn-reset">
                <i className="fas fa-redo"></i> Reset
              </button>
              <button type="submit" className="S_AM_btn-submit">
                <i className="fas fa-plus-circle"></i> Add Mortality
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
