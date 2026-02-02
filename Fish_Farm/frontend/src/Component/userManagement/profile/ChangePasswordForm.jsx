import { useState, useEffect } from "react";
import axios from "axios";
import Token from "../logins/Token";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { X } from "lucide-react";

const ChangePasswordForm = ({ onPopup = false, userData = {}, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const tokenData = Token();
    const userId = userData?.id || tokenData?.userId;
    const authToken = tokenData?.token;

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);
        return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "newPassword") {
            setErrors((prev) => ({
                ...prev,
                newPassword: !validatePassword(value)
                    ? "Password must be 8+ chars, include uppercase, lowercase, number & special char."
                    : ""
            }));
        }

        if (name === "confirmPassword") {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: value !== formData.newPassword ? "Passwords do not match." : ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (errors.newPassword || errors.confirmPassword) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/admin/change-password",
                {
                    userId,
                    currentPassword: formData.currentPassword,
                    password: formData.newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success(response.data.message || "Password changed successfully.");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            if (onClose) onClose(); // Close popup if provided
            window.location.href = "/logout"; 
        } catch (error) {
            if (error.response?.status === 401) toast.error("User not found.");
            else if (error.response?.status === 402) toast.error("Current password is wrong.");
            else toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={onPopup ? "modal-overlay" : "form-container"}>
            <div className={onPopup ? "modal-box" : "normal-box"}>
                {onPopup && (
                    <button className="modal-close" onClick={onClose}><X /></button>
                )}
                <h2>Change Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                        {errors.newPassword && <p className="error">{errors.newPassword}</p>}
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || errors.newPassword || errors.confirmPassword}
                    >
                        {loading ? "Changing..." : "Change Password"}
                    </button>
                </form>
            </div>

            <ToastContainer />

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-box {
                    background: #fff;
                    padding: 24px;
                    border-radius: 8px;
                    width: 100%;
                    max-width: 400px;
                    position: relative;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .modal-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                }

                .form-container {
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                }

                form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                }

                input {
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    outline: none;
                }

                input:focus {
                    border-color: #1e90ff;
                    box-shadow: 0 0 0 2px rgba(30,144,255,0.2);
                }

                .error {
                    color: #e53e3e;
                    font-size: 12px;
                }

                button[type="submit"] {
                    padding: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    background-color: #21cc61;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }

                button[type="submit"]:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ChangePasswordForm;
