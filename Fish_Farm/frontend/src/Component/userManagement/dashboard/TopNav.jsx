import React, { useState, useRef, useEffect } from 'react';
import SearchBar from './topNavComponents/SearchBar';
import { Bell, Gear, Message } from '../icons/Icons';
import Account from './topNavComponents/Account';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

function TopNav() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    useEffect(() => {
        async function fetchBroadcasts() {
            try {
                const response = await fetch(`${BASE_URL}/api/admin/broadcast/get`);
                if (!response.ok) throw new Error("Failed to fetch notifications");

                const data = await response.json();
                const broadcasts = data.broadcasts || [];
                setNotifications(broadcasts.reverse());
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        }

        fetchBroadcasts();
        const interval = setInterval(fetchBroadcasts, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target) &&
                !event.target.closest('.notification-popup')
            ) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="top-nav">
            <div className="top-nav-left">
                <SearchBar />
            </div>
            <div className="top-nav-right">
                <div className="top-nav-icons">
                    <div
                        className="icon-wrapper bell-wrapper"
                        onClick={toggleNotifications}
                        ref={notificationRef}
                    >
                        <Bell />
                        {notifications.length > 0 && (
                            <span className="notification-count">{notifications.length}</span>
                        )}
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className='notification-popup'
                            >
                                <h3>Notifications</h3>
                                {notifications.length > 0 ? (
                                    notifications.map((notification, index) => (
                                        <div key={notification._id} className="notification-item">
                                            <div className="notification-content">
                                                <Mail size={16} className='mail-icon' />
                                                <div className="notification-text">
                                                    <p className='notification-title'>{notification.title}</p>
                                                    <p className='notification-message'>{notification.message}</p>
                                                    <p className='notification-time'>{formatDate(notification.timestamp)}</p>
                                                </div>
                                            </div>
                                            {index !== notifications.length - 1 && <hr />}
                                        </div>
                                    ))
                                ) : (
                                    <p className='no-notifications'>No new notifications</p>
                                )}
                            </motion.div>
                        )}
                    </div>
                    <div className="icon-wrapper"><Message /></div>
                    <div className="icon-wrapper"><Gear /></div>
                </div>
                <div className="account-wrapper">
                    <Account />
                </div>
            </div>

            <style>{`
                .top-nav {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 7fr 2fr;
                    padding: 8px;
                    position: relative;
                    align-items: center;
                    gap: 10px;
                    background-color: #F3F2F7;
                }

                .top-nav-left {
                    display: flex;
                    align-items: center;
                }

                .top-nav-right {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .top-nav-icons {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .icon-wrapper {
                    background-color: rgba(45, 155, 219, 0.28);
                    padding: 6px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                }

                .bell-wrapper {
                    position: relative;
                }

                .notification-count {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background-color: red;
                    color: white;
                    font-size: 10px;
                    border-radius: 50%;
                    padding: 1px 4px;
                }

                .notification-popup {
                    position: absolute;
                    top: 35px;
                    right: 0;
                    width: 400px;
                    max-height: 270px;
                    overflow-y: auto;
                    background-color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-radius: 8px;
                    padding: 12px;
                    z-index: 20;
                }

                .notification-popup h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .notification-item {
                    padding: 4px 0;
                }

                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                }

                .mail-icon {
                    color: #3b82f6;
                    flex-shrink: 0;
                }

                .notification-text {
                    flex: 1;
                }

                .notification-title {
                    font-weight: 600;
                    margin: 0;
                }

                .notification-message {
                    font-size: 12px;
                    color: #555;
                    margin: 0;
                }

                .notification-time {
                    font-size: 10px;
                    color: #999;
                    margin-top: 2px;
                }

                .no-notifications {
                    font-size: 12px;
                    color: #999;
                    text-align: center;
                }

                .account-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    width: 100%;
                }

                hr {
                    border: none;
                    border-top: 1px solid #e5e5e5;
                    margin: 4px 0;
                }
            `}</style>
        </div>
    );
}

export default TopNav;