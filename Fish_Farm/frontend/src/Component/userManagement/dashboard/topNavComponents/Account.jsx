import React from 'react';
import Token from '../../logins/Token';
import { Link } from 'react-router-dom';

function Account() {
    const tokenData = Token();

    const nameParts = tokenData?.name.split(" ");
    const displayName = nameParts?.length > 1 ? nameParts?.slice(0, -1).join(" ") : tokenData?.name;
    console.log(tokenData?.userId);
    

    return (
        <Link to={`/profile/${tokenData?.userId}`} className="account-link">
            <div className="account-container">
                <p className="account-text">Hello, {displayName}</p>
                <div className="account-avatar">
                    <img
                        src={`http://localhost:5000${tokenData?.displayPicture}`}
                        alt="Profile"
                    />
                </div>
            </div>

            <style>{`
                .account-link {
                    text-decoration: none;
                    display: inline-block;
                }
                .account-container {
                width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 8px;
                    height: 100%;
                    background: linear-gradient(to right, #00b075, #00b075a5);
                    margin-left: -20px;
                }
                .account-text {
                    color: white;
                    font-size: 0.875rem;
                    margin-right: 8px;
                }
                .account-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }
                .account-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
            `}</style>
        </Link>
    );
}

export default Account;
