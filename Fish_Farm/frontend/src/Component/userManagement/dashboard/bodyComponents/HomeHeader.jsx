import React, { useEffect, useState } from 'react';
import Token from '../../logins/Token';
import { PcDisplay } from '../../icons/Icons';
import axios from 'axios';

function HomeHeader(props) {
    const token = Token();
    const [upTime, setUptime] = useState('');

    useEffect(() => {
        const fetchUptime = async () => {
            try {
                const response = await axios.get('http://localhost:8005/api/admin/server');
                if (response.data && response.data.data) {
                    setUptime(response.data.data.upTime);
                } else {
                    console.error("Invalid response structure:", response.data);
                }
            } catch (e) {
                console.error(`Error fetching uptime: ${e.message}`);
            }
        };

        fetchUptime();
        const interval = setInterval(fetchUptime, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-header">
            <div className="home-header-left">
                <h3 className="home-header-title">Dashboard</h3>
                {window.location.pathname.startsWith('/admin') && (
                    <p className="home-header-welcome">
                        {`Hi ${token?.name}, Welcome back to Harverst Lanka Administration`}
                    </p>
                )}
            </div>

            <div className="home-header-right">
                <div className="home-header-icon">
                    <PcDisplay />
                </div>
                <div className="home-header-info">
                    <div className="home-header-status">System Online</div>
                    <div className="home-header-uptime">Uptime - {props.upTime || upTime}</div>
                </div>
            </div>

            <style>{`
                .home-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: -60px;
                }

                .home-header-left h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #464255;
                }

                .home-header-welcome {
                    font-size: 0.75rem;
                    color: #A3A3A3;
                    margin-top: 2px;
                }

                .home-header-right {
                    display: flex;
                    align-items: center;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    padding: 7px;
                }

                .home-header-icon {
                    background-color: rgba(45, 155, 219, 0.13);
                    padding: 8px;
                    border-radius: 12px;
                }

                .home-header-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    margin-left: 12px;
                }

                .home-header-status {
                    font-size: 13px;
                    color: #108A01;
                }

                .home-header-uptime {
                    font-size: 13px;
                    color: #3E4954;
                }
            `}</style>
        </div>
    );
}

export default HomeHeader;
