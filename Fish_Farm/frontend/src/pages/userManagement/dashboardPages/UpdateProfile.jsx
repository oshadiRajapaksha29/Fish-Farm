import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Token from '../../../Component/userManagement/logins/Token';

const UpdateProfileForm = ({ onPopup, userData, onClose }) => {
    const token = Token();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Open popup when onPopup prop changes
    useEffect(() => {
        if (onPopup) {
            setIsOpen(true);
        }
    }, [onPopup]);

    // Load user data from props
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || ''
            });
        }
    }, []);

    // Prevent body scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key to close popup
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closePopup();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const closePopup = () => {
        setIsOpen(false);
        if (onClose) {
            onClose();
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await axios.put(`http://localhost:5000/admin/update/${token?.userId}`, {
                name: formData.name.trim(),
                email: formData.email.trim()
            });
            
            if (response.data.success) {
                alert('Profile updated successfully!');
                closePopup();
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('An error occurred while updating your profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle backdrop click to close popup
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closePopup();
        }
    };

    // Don't render anything if popup is not open
    if (!isOpen) {
        return null;
    }

    return (
        <div className="popup-overlay" onClick={handleBackdropClick}>
            <style jsx>{`
                .popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                }

                .popup-form {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                    animation: slideIn 0.3s ease-out;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .popup-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .popup-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 8px;
                }

                .popup-subtitle {
                    color: #6b7280;
                    font-size: 1rem;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                    font-size: 0.95rem;
                }

                .form-input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                    background: #f9fafb;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .form-input.error {
                    border-color: #ef4444;
                    background: #fef2f2;
                }

                .form-input.error:focus {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 4px;
                    display: block;
                }

                .form-buttons {
                    display: flex;
                    gap: 16px;
                    margin-top: 32px;
                }

                .btn-cancel {
                    flex: 1;
                    padding: 14px 24px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                }

                .btn-cancel:hover:not(:disabled) {
                    background: #e5e7eb;
                    transform: translateY(-1px);
                }

                .btn-submit {
                    flex: 1;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 0.95rem;
                }

                .btn-submit:hover:not(:disabled) {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 10px 25px -3px rgba(59, 130, 246, 0.3);
                }

                .btn-submit:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .loading-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 640px) {
                    .popup-overlay {
                        padding: 16px;
                    }
                    
                    .popup-form {
                        padding: 24px 20px;
                        max-height: 95vh;
                    }
                    
                    .form-buttons {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="popup-form" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2 className="popup-title">Update Profile</h2>
                    <p className="popup-subtitle">Update your personal information</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            placeholder="Enter your full name"
                            disabled={loading}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="Enter your email address"
                            disabled={loading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-buttons">
                        <button
                            type="button"
                            onClick={closePopup}
                            className="btn-cancel"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Updating...
                                </>
                            ) : (
                                'Update Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfileForm;