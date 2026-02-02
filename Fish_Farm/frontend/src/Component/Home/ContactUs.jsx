import React, { useState } from 'react';
import './ContactUs.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="g_c_p_contact-page">
      <div className="g_c_p_simple-container">
        <div className="g_c_p_simple-header">
          <h1 className="g_c_p_simple-title">Contact Us</h1>
          <p className="g_c_p_simple-subtitle">We'd love to hear from you!</p>
        </div>

        <div className="g_c_p_simple-content">
          <div className="g_c_p_simple-form-section">
            <form onSubmit={handleSubmit} className="g_c_p_simple-form">
              <div className="g_c_p_simple-form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                />
              </div>

              <div className="g_c_p_simple-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="g_c_p_simple-form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button type="submit" className="g_c_p_simple-submit-btn">
                Send Message
              </button>

              {submitted && (
                <div className="g_c_p_simple-success-message">
                  Thank you! Your message has been sent successfully.
                </div>
              )}
            </form>
          </div>

          <div className="g_c_p_simple-info-section">
            <div className="g_c_p_simple-info-card">
              <FaMapMarkerAlt className="g_c_p_simple-icon" />
              <h3>Address</h3>
              <p>123/A,Wijayapura Road <br />Kekirawa,Anuradapura</p>
            </div>

            <div className="g_c_p_simple-info-card">
              <FaEnvelope className="g_c_p_simple-icon" />
              <h3>Email</h3>
              <p>aquapeak@gmail.com</p>
            </div>

            <div className="g_c_p_simple-info-card">
              <FaPhone className="g_c_p_simple-icon" />
              <h3>Phone</h3>
              <p>(123) 456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
