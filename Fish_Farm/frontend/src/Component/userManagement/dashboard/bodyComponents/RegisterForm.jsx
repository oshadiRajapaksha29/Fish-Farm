import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, User, Phone, Lock, Image, RefreshCcw, IdCard } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

const RegisterForm = (props) => {
  const initialFormState = {
    email: "",
    name: "",
    nic: "",
    number: "",
    password: props.role === "farmer" ? "" : generatePassword(),
    role: props.role || "farmer",
    displayPicture: "",
    status: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const validate = (fieldName, value) => {
    let newErrors = { ...errors };

    if (fieldName === "name") {
      if (!value) newErrors.name = "Name is required";
      else if (!/^[A-Za-z ]+$/.test(value))
        newErrors.name = "Name can only contain letters and spaces";
      else newErrors.name = "";
    }

    if (fieldName === "nic") {
      if (!value) newErrors.nic = "NIC is required";
      else {
        const nicPatternOld = /^[0-9]{9}[vV]$/;
        const nicPatternNew = /^[0-9]{12}$/;
        if (!(nicPatternOld.test(value) || nicPatternNew.test(value))) {
          newErrors.nic =
            "NIC must be 9 digits plus a trailing 'v' or 12 digits only";
        } else newErrors.nic = "";
      }
    }

    if (fieldName === "email") {
      if (!value) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
        newErrors.email = "Invalid email format";
      else newErrors.email = "";
    }

    if (fieldName === "number") {
      if (!value) newErrors.number = "Phone number is required";
      else if (!/^\d{9,10}$/.test(value))
        newErrors.number = "Phone number must be 9 or 10 digits";
      else newErrors.number = "";
    }

    if (fieldName === "password") {
      if (!value) newErrors.password = "Password is required";
      else if (props.role === "farmer" && value.length < 8)
        newErrors.password = "Password must be at least 8 characters long";
      else newErrors.password = "";
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") newValue = newValue.replace(/[^A-Za-z ]/g, "");
    if (name === "number") newValue = newValue.replace(/[^0-9]/g, "").slice(0, 10);
    if (name === "nic") {
      newValue = newValue.replace(/[^0-9vV]/g, "");
      const lowerValue = newValue.toLowerCase();
      const indexOfV = lowerValue.indexOf("v");
      if (indexOfV !== -1 && indexOfV !== newValue.length - 1) {
        newValue = newValue
          .split("")
          .filter((char, i) => i === newValue.length - 1 || char.toLowerCase() !== "v")
          .join("");
      }
      if (newValue.toLowerCase().endsWith("v")) newValue = newValue.slice(0, 10);
      else newValue = newValue.slice(0, 12);
    }

    setFormData({ ...formData, [name]: newValue });
    validate(name, newValue);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, displayPicture: file });
      setPreviewUrl(URL.createObjectURL(file));
      setErrors({ ...errors, displayPicture: "" });
    } else {
      setFormData({ ...formData, displayPicture: "" });
      setPreviewUrl(null);
      setErrors({ ...errors, displayPicture: "Please select a valid image file" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    ["name", "email", "number", "password", "nic"].forEach((f) =>
      validate(f, formData[f])
    );
    const hasErrors = Object.values(errors).some((err) => err !== "");
    if (hasErrors) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const data = new FormData();
    data.append("email", formData.email);
    data.append("name", formData.name);
    data.append("NIC", formData.nic);
    data.append("number", formData.number);
    data.append("password", formData.password);
    data.append("role", props.role || formData.role);
    data.append("status", formData.status);
    if (formData.displayPicture) data.append("displayPicture", formData.displayPicture);

    try {
      console.log(data);
      
      const response = await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Registration successful!");
      setSubmitSuccess("Registration successful!");
      setSubmitError("");
      setFormData(initialFormState);
      setPreviewUrl(null);
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
      setSubmitError(error.response?.data?.message || "Registration failed.");
      setSubmitSuccess("");
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
  };

  return (
    <div className="register-form-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="register-form-box"
      >
        <h2 className="form-title">{props.formName}</h2>
        <form onSubmit={handleSubmit} className="form-fields">
          {[
            { name: "name", label: "Name", icon: <User size={20} /> },
            { name: "nic", label: "NIC Number", icon: <IdCard size={20} /> },
            { name: "email", label: "Email", icon: <Mail size={20} /> },
            { name: "number", label: "Phone Number", icon: <Phone size={20} />, prefix: "+94" },
          ].map((field, index) => (
            <motion.div key={field.name} variants={inputVariants} custom={index} initial="hidden" animate="visible">
              <label className="input-label">{field.label}</label>
              <div className="input-wrapper">
                {field.icon}
                {field.prefix && <span className="input-prefix">{field.prefix}</span>}
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              {errors[field.name] && <p className="error-text">{errors[field.name]}</p>}
            </motion.div>
          ))}

          <motion.div variants={inputVariants} custom={4} initial="hidden" animate="visible">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type="text"
                name="password"
                value={formData.password}
                readOnly={props.role !== "farmer"}
                onChange={props.role === "farmer" ? handleChange : undefined}
                className="input-field"
              />
              {props.role !== "farmer" && (
                <button type="button" onClick={() => {
                  const newPass = generatePassword();
                  setFormData({ ...formData, password: newPass });
                  validate("password", newPass);
                }} className="refresh-btn">
                  <RefreshCcw size={18} />
                </button>
              )}
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </motion.div>

          <motion.div variants={inputVariants} custom={5} initial="hidden" animate="visible">
            <label className="input-label">Display Picture</label>
            <div className="input-wrapper file-input-wrapper">
              <Image size={20} />
              <label className="file-label">Choose File</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            </div>
            {errors.displayPicture && <p className="error-text">{errors.displayPicture}</p>}
            {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
          </motion.div>

          {submitError && <p className="error-text submit-msg">{submitError}</p>}
          {submitSuccess && <p className="success-text submit-msg">{submitSuccess}</p>}

          <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="submit-btn">
            Register
          </motion.button>
        </form>
      </motion.div>

      <style>{`
        .register-form-container { display:flex; justify-content:center; padding:20px; background:#f3f4f6; }
        .register-form-box { width:100%; max-width:500px; background:#fff; padding:24px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.15); }
        .form-title { font-size:24px; font-weight:600; text-align:center; color:#1f2937; }
        .form-fields { display:flex; flex-direction:column; gap:20px; margin-top:20px; }
        .input-label { display:block; margin-bottom:4px; font-weight:500; color:#374151; }
        .input-wrapper { display:flex; align-items:center; border:1px solid #d1d5db; border-radius:8px; padding:8px 12px; gap:8px; transition: all 0.2s; }
        .input-wrapper:focus-within { border-color:#10b981; box-shadow:0 0 0 2px rgba(16,185,129,0.2); }
        .input-prefix { border-right:1px solid #d1d5db; padding-right:6px; color:#374151; }
        .input-field { flex:1; border:none; outline:none; font-size:14px; padding:4px; }
        .refresh-btn { background:none; border:none; cursor:pointer; display:flex; align-items:center; }
        .file-input-wrapper { position:relative; cursor:pointer; }
        .file-label { flex:1; color:#6b7280; }
        .file-input { position:absolute; width:100%; height:100%; opacity:0; cursor:pointer; }
        .preview-img { margin-top:8px; height:80px; width:80px; object-fit:cover; border-radius:8px; border:1px solid #d1d5db; }
        .error-text { color:#ef4444; font-size:12px; margin-top:2px; }
        .success-text { color:#10b981; font-size:12px; margin-top:2px; }
        .submit-msg { text-align:center; }
        .submit-btn { background:#10b981; color:#fff; font-weight:600; padding:10px; border-radius:8px; border:none; cursor:pointer; transition:0.3s; }
        .submit-btn:hover { background:#0f766e; }
      `}</style>
    </div>
  );
};

export default RegisterForm;
