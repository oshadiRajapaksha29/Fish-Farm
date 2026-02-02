import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bell, X } from "lucide-react";
import axios from "axios";
import "./Massage.css";

const Massage = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Title: "",
    Message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post("http://localhost:5000/api/notifications", formData);
      setSuccess(true);
      setFormData({ Title: "", Message: "" });
      
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
        // Navigate to View All Messages page after success
        navigate("/dashboard/Notification/viewAllMassage");
      }, 2000);
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking on overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="massage-overlay" onClick={handleOverlayClick}>
      <div className="massage-container">
        <div className="massage-header">
          <div className="massage-title">
            <Bell size={24} className="bell-icon" />
            <h2>Send Notification</h2>
          </div>
          <button 
            className="close-btn" 
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="massage-form">
          <div className="form-group">
            <label htmlFor="Title">Notification Title</label>
            <input
              type="text"
              id="Title"
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              placeholder="Enter notification title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="Message">Notification Message</label>
            <textarea
              id="Message"
              name="Message"
              value={formData.Message}
              onChange={handleChange}
              placeholder="Enter your message..."
              rows="4"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
            disabled={loading}
          >
            {loading ? (
              "Sending..."
            ) : success ? (
              "Sent Successfully!"
            ) : (
              <>
                <Send size={18} />
                Send Notification
              </>
            )}
          </button>

          {/* Success message with redirect info */}
          {success && (
            <div className="success-redirect-message">
              <p>✅ Notification sent successfully!</p>
              <p>Redirecting to view all messages...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Massage;