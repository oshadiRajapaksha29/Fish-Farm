import React, { use, useEffect, useState } from 'react';
import Token from '../../Component/userManagement/logins/Token';
import Popup from '../../Component/userManagement/shared/Popup';
import ChangePasswordForm from '../../Component/userManagement/profile/ChangePasswordForm';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

// Import banner images
import AdminProfileImg from '../../assets/userManagement/adminProfile.png';
import FarmerProfileImg from '../../assets/userManagement/farmerProfile.png';
import FinanceProfileImg from '../../assets/userManagement/financeProfile.png';
import DeliveryProfileImg from '../../assets/userManagement/deliveryProfile.png';
import ShopProfileImg from '../../assets/userManagement/shopProfile.png';
import DefaultDP from '../../assets/userManagement/defaultDP.png';
import { CopyNotFilled, CopyFilled, Facebook, Google } from '../../Component/userManagement/icons/Icons';
import UpdateProfileForm from './dashboardPages/UpdateProfile';

const ProfilePage = () => {
    const token = Token();
    const { id } = useParams();
    const isOwner = id === token?.userId;

    const [isCopied, setIsCopied] = useState(false);
    const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [userData, setUserData] = useState({});
    const [isGoogleLinked, setIsGoogleLinked] = useState(false);

    useEffect(() => {
        const checkGoogleAuth = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/auth/google/check-google/${id}`, {
                    withCredentials: true
                });

                if (response?.data?.linked === false) {
                    setIsGoogleLinked(false);
                } else if (response?.data?.linked === true) {
                    setIsGoogleLinked(true);
                } else {
                    console.error('Unexpected response status:', response.message);
                }
                console.log(isGoogleLinked);
            } catch (error) {
                console.error('Error checking Google authentication:', error);
            }
        }
        checkGoogleAuth();
    }, [])


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/find/${id}`);
                setUserData(response.data.user);
            } catch (e) {
                console.log(`Error fetching user data: ${e.message}`);
            }
        };

        fetchUser();
        const interval = setInterval(fetchUser, 2000);
        return () => clearInterval(interval);
    }, [id]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(userData?.userId).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };


    const roleBanners = {
        "admin": AdminProfileImg,
        "customer": FarmerProfileImg,
        "employee": FinanceProfileImg
    };

    const roleReturn = () => {
        switch (userData?.role) {
            case "admin":
                return "admin";
            case "employee":
                return "employee";
            case "customer":
                return "customer";
        }
    };

    const bannerImage = roleBanners[token?.role] || "https://cdn.pixabay.com/photo/2022/03/31/14/53/camp-7103189_1280.png";

    const handleLogout = () => {
        if (userData?.role === "farmer" || userData?.role === "shopowner" || userData?.role === "driver") {
            window.location.href = "/"
        } else {
            window.location.href = "/logout"
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            await axios.post('http://localhost:5000/admin/deactivate',
                { userIds: [token.userId]}
            );
            alert("Account deleted successfully");
            setIsDeletePopupOpen(false);
            window.location.href = "/logout";
        } catch (error) {
            alert(`Error deleting account: ${error.response?.data?.message || error.message}`);
        }
    };
    console.log(userData.displayPicture);

    return (
        <>
            <style jsx>{`
                .profile-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f4f4f4 0%, #e0e0e0 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .profile-card {
                    width: 100%;
                    max-width: 1200px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                }

                .banner-section {
                    position: relative;
                    height: 256px;
                    background: linear-gradient(90deg, #1e3b8b 0%, #3b82f6 100%);
                }

                .banner-image {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.3;
                }

                .profile-picture-wrapper {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: -64px;
                    padding: 4px;
                    background: white;
                    border-radius: 50%;
                }

                .profile-picture {
                    width: 144px;
                    height: 144px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
                }

                .profile-content {
                    padding: 96px 40px 40px;
                }

                .profile-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .profile-name {
                    font-size: 2.25rem;
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 8px;
                }

                .profile-role {
                    font-size: 1.25rem;
                    color: #6b7280;
                    text-transform: capitalize;
                }

                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 32px;
                }

                .info-card {
                    background: #f9fafb;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .info-card-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #d1d5db;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .info-label {
                    color: #4b5563;
                    font-weight: 500;
                }

                .info-value {
                    color: #1f2937;
                    font-weight: 600;
                }

                .copy-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .copy-icon {
                    height: 20px;
                    width: 20px;
                }

                .status-active {
                    color: #10b981;
                    font-weight: 600;
                }

                .status-inactive {
                    color: #ef4444;
                    font-weight: 600;
                }

                .settings-section {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .settings-card-blue {
                    background: #eff6ff;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .settings-card-blue h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e3b8b;
                    margin-bottom: 16px;
                }

                .settings-card-green {
                    background: #f0fdf4;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .settings-card-green h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #166534;
                    margin-bottom: 16px;
                }

                .btn-primary {
                    width: 100%;
                    padding: 12px;
                    background: #1e3b8b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-primary:hover {
                    background: #61a5fa;
                }

                .btn-green {
                    width: 100%;
                    padding: 12px;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    margin-bottom: 16px;
                }

                .btn-green:hover {
                    background: #047857;
                }

                .btn-green:last-child {
                    margin-bottom: 0;
                }

                .single-profile-card {
                    max-width: 448px;
                    margin: 0 auto;
                    background: #f9fafb;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .connected-accounts {
                    margin-top: 32px;
                    background: #f9fafb;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .connected-accounts h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 24px;
                }

                .accounts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                .account-item {
                    display: flex;
                    align-items: center;
                    background: white;
                    padding: 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .account-icon-wrapper {
                    background: #dbeafe;
                    padding: 12px;
                    border-radius: 50%;
                    margin-right: 16px;
                }

                .account-icon {
                    width: 32px;
                    height: 32px;
                    color: #1e3b8b;
                }

                .account-info {
                    flex-grow: 1;
                }

                .account-name {
                    font-weight: 600;
                    color: #1f2937;
                }

                .account-desc {
                    font-size: 0.875rem;
                    color: #6b7280;
                }

                .btn-connect {
                    padding: 8px 16px;
                    background: #1e3b8b;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    width: 100px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-connect:hover {
                    background: #61a5fa;
                }

                .btn-unlink {
                    padding: 8px 16px;
                    background: #1cb554;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-buttons {
                    margin-top: 32px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                .btn-delete {
                    width: 100%;
                    padding: 12px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .btn-delete:hover {
                    background: #b91c1c;
                }

                .btn-logout {
                    width: 100%;
                    padding: 12px;
                    background: #374151;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .btn-logout:hover {
                    background: #1f2937;
                }

                .popup-content {
                    padding: 32px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
                }

                .popup-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #dc2626;
                    margin-bottom: 16px;
                }

                .popup-text {
                    margin-bottom: 24px;
                    color: #4b5563;
                }

                .popup-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                }

                .btn-cancel {
                    padding: 8px 24px;
                    background: #e5e7eb;
                    color: #374151;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .btn-cancel:hover {
                    background: #d1d5db;
                }

                .btn-confirm-delete {
                    padding: 8px 24px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .btn-confirm-delete:hover {
                    background: #b91c1c;
                }

                @media (max-width: 768px) {
                    .grid-container {
                        grid-template-columns: 1fr;
                    }

                    .accounts-grid {
                        grid-template-columns: 1fr;
                    }

                    .action-buttons {
                        grid-template-columns: 1fr;
                    }

                    .profile-content {
                        padding: 96px 16px 40px;
                    }

                    .profile-name {
                        font-size: 1.875rem;
                    }
                }
            `}</style>

            <div className="profile-container">
                {/* Popups */}
                {isUpdateProfileOpen && (
                    <div>
                        <UpdateProfileForm onPopup={true} userData={userData} onClose={() => setIsUpdateProfileOpen(false)} />
                    </div>
                )}

                {isChangePasswordOpen && (
                    <div>
                        <ChangePasswordForm onPopup={true} userData={userData} onClose={() => setIsChangePasswordOpen(false)} />
                    </div>
                )}
                
                {isDeletePopupOpen && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                        <h2 className="popup-title">Confirm Account Deletion</h2>
                        <p className="popup-text">
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="popup-buttons">
                            <button
                            onClick={() => setIsDeletePopupOpen(false)}
                            className="btn-cancel"
                            >
                            Cancel
                            </button>
                            <button
                            onClick={confirmDeleteAccount}
                            className="btn-confirm-delete"
                            >
                            Delete
                            </button>
                        </div>
                        </div>
                    </div>
                    )}


                <div className="profile-card">
                    <div className="banner-section">
                        <img
                            className="banner-image"
                            src={bannerImage}
                            alt={`${token?.role} Banner`}
                        />
                        <div className="profile-picture-wrapper">
                            <img
                                className="profile-picture"
                                src={userData.displayPicture ? `http://localhost:8005${userData.displayPicture}` : DefaultDP}
                                alt="Profile"
                            />
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-header">
                            <h2 className="profile-name">{userData.name}</h2>
                            <p className="profile-role">{roleReturn()}</p>
                        </div>

                        {isOwner ? (
                            <div className="grid-container">
                                <div className="info-card">
                                    <h3 className="info-card-title">Profile Details</h3>
                                    <div>
                                        <div className="info-row">
                                            <span className="info-label">Email</span>
                                            <span className="info-value">{userData.email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">User ID</span>
                                            <div className="copy-section" onClick={copyToClipboard}>
                                                <span className="info-value">{userData?.userId}</span>
                                                {isCopied ? (
                                                    <CopyFilled className="copy-icon" style={{color: '#10b981'}} />
                                                ) : (
                                                    <CopyNotFilled className="copy-icon" style={{color: '#6b7280'}} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Account Status</span>
                                            <span className={userData.status ? 'status-active' : 'status-inactive'}>
                                                {userData.status ? "Active" : "Deactivated"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <div className="settings-card-blue">
                                        <h3>Profile Settings</h3>
                                        <button
                                            onClick={() => setIsUpdateProfileOpen(true)}
                                            className="btn-primary"
                                        >
                                            <span>Update Profile</span>
                                        </button>
                                    </div>

                                    <div className="settings-card-green">
                                        <h3>Security</h3>
                                        <button
                                            onClick={() => setIsChangePasswordOpen(true)}
                                            className="btn-green"
                                        >
                                            Change Password
                                        </button>
                                        <button className="btn-green">
                                            Enable Two-Factor Authentication
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="single-profile-card">
                                <h3 className="info-card-title">Profile Details</h3>
                                <div>
                                    <div className="info-row">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{userData.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{userData.number}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">User ID</span>
                                        <div className="copy-section" onClick={copyToClipboard}>
                                            <span className="info-value">{userData?.userId}</span>
                                            {isCopied ? (
                                                <CopyFilled className="copy-icon" style={{color: '#10b981'}} />
                                            ) : (
                                                <CopyNotFilled className="copy-icon" style={{color: '#6b7280'}} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Account Status</span>
                                        <span className={userData.status ? 'status-active' : 'status-inactive'}>
                                            {userData.status ? "Active" : "Deactivated"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isOwner && (
                            <>
                                <div className="connected-accounts">
                                    <h3>Connected Accounts</h3>
                                    <div className="accounts-grid">
                                        <div className="account-item">
                                            <div className="account-icon-wrapper">
                                                <Google className="account-icon" />
                                            </div>
                                            <div className="account-info">
                                                <h4 className="account-name">Google Account</h4>
                                                <p className="account-desc">Connect for easy login</p>
                                            </div>
                                            {isGoogleLinked ? (
                                                <Link to={`http://localhost:5000/auth/google/unlink-google/${id}`} className="btn-unlink">
                                                    Unlink
                                                </Link>
                                            ) : (
                                                <Link to="http://localhost:5000/auth/google" className="btn-connect">
                                                    Connect
                                                </Link>
                                            )}
                                        </div>
                                        <div className="account-item">
                                            <div className="account-icon-wrapper">
                                                <Facebook className="account-icon" />
                                            </div>
                                            <div className="account-info">
                                                <h4 className="account-name">Facebook Account</h4>
                                                <p className="account-desc">Stay connected</p>
                                            </div>
                                            <button className="btn-connect">
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    {token.status !== 'deactivated' && (
                                        <button
                                            onClick={() => setIsDeletePopupOpen(true)}
                                            className="btn-delete"
                                        >
                                            Delete Account
                                        </button>
                                    )}
                                    <button
                                        className="btn-logout"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;