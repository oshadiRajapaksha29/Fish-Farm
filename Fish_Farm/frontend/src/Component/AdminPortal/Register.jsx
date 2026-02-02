import React, { useState } from 'react';
import { Eye, EyeOff, Fish, Mail, Lock, Phone, User, CreditCard, Upload, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    email: '',
    phone: '',
    password: '',
    displayPicture: null
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setFormData({ ...formData, displayPicture: file });
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.nic || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill in all required fields");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return false;
    }
    
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      try{
        const res = await axios.post("http://localhost:5000/api/auth/register", {
          name: formData.name,
          nic: formData.nic,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "customer",
          status: true
        }, { withCredentials: true });
        if(res.data.success){
          alert("Registration successful! Please login.");
        }
        
      }catch(err){
        console.error("Error checking auth status:", err);
      }
      
    } catch (err) {
      console.log(err);
      alert("Registration failed. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = `
    @keyframes swim {
      0% { transform: translateX(0px) translateY(0px) rotateY(0deg); }
      25% { transform: translateX(30px) translateY(-15px) rotateY(0deg); }
      50% { transform: translateX(0px) translateY(-30px) rotateY(180deg); }
      75% { transform: translateX(-30px) translateY(-15px) rotateY(180deg); }
      100% { transform: translateX(0px) translateY(0px) rotateY(0deg); }
    }
    
    @keyframes fishGlow {
      0%, 100% { filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.4)); }
      50% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.6)); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .H-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 1rem;
    }

    .H-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .H-form-container {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 1rem;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      z-index: 10;
      position: relative;
    }

    .H-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .H-logo-container {
      position: relative;
      display: inline-block;
      margin-bottom: 1rem;
    }

    .H-logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 4rem;
      height: 4rem;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
      border-radius: 50%;
      animation: glow 3s ease-in-out infinite;
    }

    .H-logo {
      position: relative;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .H-title {
      font-size: 2rem;
      font-weight: bold;
      background: linear-gradient(135deg, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      margin-top: 0;
    }

    .H-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    .H-label {
      display: block;
      color: #e2e8f0;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      cursor: pointer;
    }

    .H-form-group {
      margin-bottom: 1.5rem;
    }

    .H-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .H-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(71, 85, 105, 0.5);
      border-radius: 0.5rem;
      color: #e2e8f0;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      outline: none;
      box-sizing: border-box;
    }

    .H-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: rgba(30, 41, 59, 0.8);
    }

    .H-input-file {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(71, 85, 105, 0.5);
      border-radius: 0.5rem;
      color: #e2e8f0;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      outline: none;
      box-sizing: border-box;
    }

    .H-input-file:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: rgba(30, 41, 59, 0.8);
    }

    .H-input-icon {
      position: absolute;
      left: 0.75rem;
      width: 1rem;
      height: 1rem;
      color: #64748b;
      transition: color 0.3s ease;
      z-index: 1;
    }

    .H-password-toggle {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.3s ease;
    }

    .H-button {
      width: 100%;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border: none;
      border-radius: 0.5rem;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      margin-top: 1rem;
    }

    .H-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    }

    .H-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .H-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }

    .H-footer {
      text-align: center;
      margin-top: 2rem;
    }

    .H-footer p {
      color: #64748b;
      font-size: 0.875rem;
    }

    .H-footer a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .H-footer a:hover {
      color: #60a5fa;
    }

    .H-floating-fish {
      position: absolute;
      color: rgba(59, 130, 246, 0.6);
      animation: swim 8s ease-in-out infinite, fishGlow 4s ease-in-out infinite;
      pointer-events: none;
      font-size: 2rem;
      z-index: 1;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="H-container">
        {/* Floating fish */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="H-floating-fish"
            style={{
              left: `${[10, 80, 60, 20, 90, 35][i]}%`,
              top: `${[20, 10, 70, 60, 50, 85][i]}%`,
              animationDelay: `${i * 1.5}s`,
              transform: `scale(${[0.8, 1.2, 0.6, 1.0, 0.9, 1.1][i]})`,
              color: [
                'rgba(59, 130, 246, 0.6)',
                'rgba(147, 51, 234, 0.6)', 
                'rgba(16, 185, 129, 0.6)',
                'rgba(245, 101, 101, 0.6)',
                'rgba(251, 191, 36, 0.6)',
                'rgba(168, 85, 247, 0.6)'
              ][i]
            }}
          >
            <Fish />
          </div>
        ))}

        <div className="H-form-container">
          <div className="H-header">
            <div className="H-logo-container">
              <div className="H-logo-glow" />
              <div className="H-logo">
                <Fish style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
              </div>
            </div>
            <h1 className="H-title">Aqua-Peak</h1>
            <p className="H-subtitle">Create your account and dive in!</p>
          </div>

          <div className="H-form-group">
            <label className="H-label">Name</label>
            <div className="H-input-wrapper">
              <User className="H-input-icon" style={{ color: focusedField === 'name' ? '#3b82f6' : '#64748b' }} />
              <input 
                type="text" 
                placeholder="Enter your name" 
                className="H-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="H-form-group">
            <label className="H-label">NIC</label>
            <div className="H-input-wrapper">
              <CreditCard className="H-input-icon" style={{ color: focusedField === 'nic' ? '#3b82f6' : '#64748b' }} />
              <input 
                type="text" 
                placeholder="Enter your NIC" 
                className="H-input"
                value={formData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
                onFocus={() => setFocusedField('nic')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="H-form-group">
            <label className="H-label">Email</label>
            <div className="H-input-wrapper">
              <Mail className="H-input-icon" style={{ color: focusedField === 'email' ? '#3b82f6' : '#64748b' }} />
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="H-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="H-form-group">
            <label className="H-label">Phone</label>
            <div className="H-input-wrapper">
              <Phone className="H-input-icon" style={{ color: focusedField === 'phone' ? '#3b82f6' : '#64748b' }} />
              <input 
                type="tel" 
                placeholder="Enter your phone number" 
                className="H-input"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <div className="H-form-group">
            <label className="H-label">Password</label>
            <div className="H-input-wrapper">
              <Lock className="H-input-icon" style={{ color: focusedField === 'password' ? '#3b82f6' : '#64748b' }} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password" 
                className="H-input"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="H-password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="H-form-group">
            <label className="H-label">Profile Picture</label>
            <div className="H-input-wrapper">
              <Upload className="H-input-icon" style={{ color: focusedField === 'file' ? '#3b82f6' : '#64748b' }} />
              <input 
                type="file" 
                accept="image/*" 
                className="H-input-file"
                onChange={handleFileChange}
                onFocus={() => setFocusedField('file')}
                onBlur={() => setFocusedField('')}
              />
            </div>
          </div>

          <button 
            className="H-button" 
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="H-spinner"></div>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} />
              </>
            )}
          </button>

          <div className="H-footer">
            <p>Already have an account? <a href="/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;