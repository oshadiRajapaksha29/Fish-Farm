import { useState } from "react";
import axios from "axios";
import Token from "../logins/Token";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateProfileForm = ({ userId, token }) => {
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        profilePhoto: null,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ name: "", number: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let errorMessage = "";

        if (name === "name") {
            if (!/^[A-Za-z\s]*$/.test(value)) {
                errorMessage = "Name cannot contain numbers or special characters.";
            }
        } else if (name === "number") {
            if (!/^\d{9,10}$/.test(value)) {
                errorMessage = "Number must be 9 or 10 digits long and contain only numbers.";
            }
        }

        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, profilePhoto: e.target.files[0] }));
    };

    const { userId: tokenUserId } = Token();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (errors.name || errors.number) return;

        setLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append("userId", tokenUserId);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("number", formData.number);
        if (formData.profilePhoto) {
            formDataToSend.append("displayPicture", formData.profilePhoto);
        }

        try {
            const response = await axios.put(
                "http://localhost:8005/user/update",
                formDataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            toast.success(response.data.message || "Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="update-profile-form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <p className="error">{errors.name}</p>}
                </div>

                <div className="form-group">
                    <label>Number</label>
                    <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                    />
                    {errors.number && <p className="error">{errors.number}</p>}
                </div>

                <div className="form-group">
                    <label>Profile Photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                </button>
            </form>

            <ToastContainer />

            <style>{`
                .update-profile-form {
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

                input[type="text"],
                input[type="file"] {
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    outline: none;
                    transition: border 0.2s, box-shadow 0.2s;
                }

                input:focus {
                    border-color: #1e90ff;
                    box-shadow: 0 0 0 2px rgba(30,144,255,0.2);
                }

                .error {
                    color: #e53e3e;
                    font-size: 12px;
                }

                button {
                    padding: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    background-color: #1d4ed8;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.2s, opacity 0.2s;
                }

                button:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }

                button:hover:not(:disabled) {
                    background-color: #1e40af;
                }
            `}</style>
        </div>
    );
};

export default UpdateProfileForm;
