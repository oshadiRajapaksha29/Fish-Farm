import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddDisease.css";

const API_BASE = "http://localhost:5000";

export default function AddDisease() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ReportedBy: "",
    DateReported: "",
    TankNumber: "",
    FishSpecies: "",
    SubSpecies: "",
    NumberOfSick: "",
    Symptoms: "",
  });

  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [speciesList, setSpeciesList] = useState([]);
  const [subSpeciesList, setSubSpeciesList] = useState([]);
  const [tankList, setTankList] = useState([]);
  const [employeeEmails, setEmployeeEmails] = useState([]); // ✅ Store objects

  // Fetch main species
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const res = await axios.get(`${API_BASE}/fish/species-list`);
        setSpeciesList(res.data || []);
      } catch (err) {
        console.error("Failed to fetch species list", err);
      }
    };
    fetchSpecies();
  }, []);

  // Fetch employee emails (objects from DB)
  useEffect(() => {
    const fetchEmployeeEmails = async () => {
      try {
        const res = await axios.get(`${API_BASE}/employee-extra/all-emails`);
        if (Array.isArray(res.data)) setEmployeeEmails(res.data);
      } catch (err) {
        console.error("Failed to fetch employee emails", err);
      }
    };
    fetchEmployeeEmails();
  }, []);

  // Fetch sub-species + tanks when main species changes
  useEffect(() => {
    if (!formData.FishSpecies) {
      setSubSpeciesList([]);
      setTankList([]);
      setFormData((p) => ({ ...p, SubSpecies: "", TankNumber: "" }));
      return;
    }

    const fetchSubSpecies = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/fish/subspecies/${encodeURIComponent(formData.FishSpecies)}`
        );
        setSubSpeciesList(res.data || []);
      } catch (err) {
        console.error("Failed to fetch sub-species", err);
        setSubSpeciesList([]);
      }
    };

    const fetchTanks = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/fish/tanks/${encodeURIComponent(formData.FishSpecies)}`
        );
        if (Array.isArray(res.data)) setTankList(res.data);
        else if (res.data?.tanks) setTankList(res.data.tanks);
        else setTankList([]);
        setFormData((p) => ({ ...p, TankNumber: "" }));
      } catch (err) {
        console.error("Failed to fetch tanks", err);
        setTankList([]);
      }
    };

    fetchSubSpecies();
    fetchTanks();
  }, [formData.FishSpecies]);

  // Auto-update tank list if sub-species selected
  useEffect(() => {
    if (!formData.SubSpecies || !formData.FishSpecies) return;

    const fetchTankBySub = async () => {
      try {
        const res = await axios.get(`${API_BASE}/fish/species-data`, {
          params: { species: formData.FishSpecies, subSpecies: formData.SubSpecies },
        });
        if (Array.isArray(res.data?.tanks) && res.data.tanks.length > 0) setTankList(res.data.tanks);
        else if (res.data?.tankNumber) setTankList([res.data.tankNumber]);
      } catch (err) {
        console.error("Failed to fetch tank data for sub-species", err);
      }
    };

    fetchTankBySub();
  }, [formData.SubSpecies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });

    if (name === "FishSpecies") {
      setSubSpeciesList([]);
      setTankList([]);
      setFormData((p) => ({ ...p, SubSpecies: "", TankNumber: "" }));
    }
    if (name === "SubSpecies") setFormData((p) => ({ ...p, TankNumber: "" }));
  };

  const handleFileChange = (e) => {
    setPhotos([...e.target.files]);
    if (errors.photos) setErrors({ ...errors, photos: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ReportedBy.trim()) newErrors.ReportedBy = "Reported By is required";
    if (!formData.DateReported) newErrors.DateReported = "Date Reported is required";
    if (!formData.FishSpecies) newErrors.FishSpecies = "Fish Species is required";
    if (!formData.SubSpecies) newErrors.SubSpecies = "Sub-Species is required";
    if (!formData.TankNumber) newErrors.TankNumber = "Tank Number is required";
    if (!formData.NumberOfSick || formData.NumberOfSick === "")
      newErrors.NumberOfSick = "Number of Sick Fish is required";
    else if (Number(formData.NumberOfSick) < 1)
      newErrors.NumberOfSick = "Number of Sick Fish must be at least 1";
    if (!formData.Symptoms.trim()) newErrors.Symptoms = "Symptoms are required";
    if (photos.length === 0) newErrors.photos = "At least one photo is recommended";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData({
      ReportedBy: "",
      DateReported: "",
      TankNumber: "",
      FishSpecies: "",
      SubSpecies: "",
      NumberOfSick: "",
      Symptoms: "",
    });
    setPhotos([]);
    setErrors({});
    setSubSpeciesList([]);
    setTankList([]);
    document.querySelectorAll('input[type="file"]').forEach((i) => (i.value = ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fix validation errors before submitting.");
      return;
    }

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      photos.forEach((photo) => form.append("Photos", photo));

      const res = await axios.post(`${API_BASE}/diseaseReports`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201 || res.status === 200) {
        alert("Disease report added successfully!");
        handleReset();
        navigate("/dashboard/disease/View");
      } else {
        alert(res?.data?.message || "Unexpected response from server.");
      }
    } catch (err) {
      console.error("Add Disease error:", err.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to add disease report.");
    }
  };

  return (
    <div className="S_AD_disease-form-page">
      <div className="S_AD_disease-form-container">
        <div className="S_AD_disease-form-wrapper">
          <h1 className="S_AD_form-title">Add Disease Report</h1>
          <form
            onSubmit={handleSubmit}
            className="S_AD_disease-form"
            encType="multipart/form-data"
            noValidate
          >
            {/* Basic Info */}
            <div className="S_AD_form-box">
              <h2 className="S_AD_form-section-title">Basic Information</h2>
              <div className="S_AD_form-grid">
                <label>
                  Reported By *
                  <select
                    name="ReportedBy"
                    value={formData.ReportedBy}
                    onChange={handleChange}
                    className={errors.ReportedBy ? "S_AD_input-error" : ""}
                  >
                    <option value="">Select Employee Email</option>
                    {employeeEmails.map((emp) => (
                      <option key={emp._id} value={emp.email}>
                        {emp.email}
                      </option>
                    ))}
                  </select>
                  {errors.ReportedBy && (
                    <span className="S_AD_error-message">{errors.ReportedBy}</span>
                  )}
                </label>

                <label>
                  Date Reported *
                  <input
                    type="date"
                    name="DateReported"
                    value={formData.DateReported}
                    onChange={handleChange}
                    className={errors.DateReported ? "S_AD_input-error" : ""}
                  />
                  {errors.DateReported && (
                    <span className="S_AD_error-message">{errors.DateReported}</span>
                  )}
                </label>
              </div>
            </div>

            {/* Stock Info */}
            <div className="S_AD_form-box">
              <h2 className="S_AD_form-section-title">Stock Information</h2>
              <div className="S_AD_form-grid">
                <label>
                  Fish Species *
                  <select
                    name="FishSpecies"
                    value={formData.FishSpecies}
                    onChange={handleChange}
                    className={errors.FishSpecies ? "S_AD_input-error" : ""}
                  >
                    <option value="">Select Species</option>
                    {speciesList.map((sp, idx) => (
                      <option key={idx} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                  {errors.FishSpecies && (
                    <span className="S_AD_error-message">{errors.FishSpecies}</span>
                  )}
                </label>

                <label>
                  Sub-Species *
                  <select
                    name="SubSpecies"
                    value={formData.SubSpecies}
                    onChange={handleChange}
                    className={errors.SubSpecies ? "S_AD_input-error" : ""}
                  >
                    <option value="">Select Sub-Species</option>
                    {subSpeciesList.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  {errors.SubSpecies && (
                    <span className="S_AD_error-message">{errors.SubSpecies}</span>
                  )}
                </label>

                <label>
                  Tank Number *
                  <select
                    name="TankNumber"
                    value={formData.TankNumber}
                    onChange={handleChange}
                    className={errors.TankNumber ? "S_AD_input-error" : ""}
                  >
                    <option value="">Select Tank</option>
                    {tankList.map((tn, idx) => (
                      <option key={idx} value={tn}>
                        {tn}
                      </option>
                    ))}
                  </select>
                  {errors.TankNumber && (
                    <span className="S_AD_error-message">{errors.TankNumber}</span>
                  )}
                </label>

                <label>
                  Number of Sick Fish *
                  <input
                    type="number"
                    name="NumberOfSick"
                    value={formData.NumberOfSick}
                    onChange={handleChange}
                    min="1"
                    className={errors.NumberOfSick ? "S_AD_input-error" : ""}
                  />
                  {errors.NumberOfSick && (
                    <span className="S_AD_error-message">{errors.NumberOfSick}</span>
                  )}
                </label>
              </div>
            </div>

            {/* Symptoms */}
            <div className="S_AD_form-box">
              <h2 className="S_AD_form-section-title">Symptoms & Photos</h2>
              <div className="S_AD_form-grid">
                <label className="S_AD_full-width">
                  Symptoms *
                  <textarea
                    name="Symptoms"
                    rows={3}
                    value={formData.Symptoms}
                    onChange={handleChange}
                    placeholder="Enter visible symptoms"
                    className={errors.Symptoms ? "S_AD_input-error" : ""}
                  />
                  {errors.Symptoms && (
                    <span className="S_AD_error-message">{errors.Symptoms}</span>
                  )}
                </label>

                <label>
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    name="Photos"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={errors.photos ? "S_AD_input-error" : ""}
                  />
                  {errors.photos && (
                    <span className="S_AD_error-message">{errors.photos}</span>
                  )}
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="S_AD_form-buttons">
              <button type="button" onClick={handleReset} className="S_AD_btn-reset">
                <i className="fas fa-redo"></i> Reset
              </button>
              <button type="submit" className="S_AD_btn-submit">
                <i className="fas fa-plus-circle"></i> Add Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
