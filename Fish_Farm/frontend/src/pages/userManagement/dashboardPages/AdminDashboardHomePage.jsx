import React, { useEffect, useState } from 'react';
import HomeHeader from '../../../Component/userManagement/dashboard/bodyComponents/HomeHeader';
import Card1 from '../../../Component/userManagement/dashboard/bodyComponents/Card1';
import Card2 from '../../../Component/userManagement/dashboard/bodyComponents/Card2';
import Card3 from '../../../Component/userManagement/dashboard/bodyComponents/Card3';
import Card4 from '../../../Component/userManagement/dashboard/bodyComponents/Card4';
import Card5 from '../../../Component/userManagement/dashboard/bodyComponents/Card5';
import CPU from '../../../assets/userManagement/Group 206.svg';
import MemoryCard from '../../../assets/userManagement/memoryCard.svg';
import SolidDisk from '../../../assets/userManagement/solid state disk_.svg';
import People from '../../../assets/userManagement/every user.svg';
import axios from 'axios';
import { BASE_URL } from '../../../Component/userManagement/BaseUrl';
import ServerInfoProvider from '../../../Component/userManagement/dashboard/bodyComponents/ServerInfoProvider';

function AdminDashboardHome() {
    const [activeSessions, setActiveSessions] = useState(0);

    useEffect(() => {
        const fetchActiveSessions = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/admin/getactivesessions`);
                const newActiveSessions = response.data.activeSessions;
                setActiveSessions(prev => (prev !== newActiveSessions ? newActiveSessions : prev));
            } catch (error) {
                console.error(`Error fetching active sessions: ${error.message}`);
            }
        };

        fetchActiveSessions();
        const interval = setInterval(fetchActiveSessions, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ServerInfoProvider>
            {serverInfo => (
                <div className="admin-dashboard-home">
                    <HomeHeader upTime={serverInfo.upTime || 'Loading...'} />

                    <div className="card-row">
                        <Card1 cardName="CPU Usage" icon={CPU} value={serverInfo.cpuUsage ? `${serverInfo.cpuUsage}%` : 'Loading...'} />
                        <Card1 cardName="Memory Usage" icon={MemoryCard} value={serverInfo.ramUsage ? `${serverInfo.ramUsage}%` : 'Loading...'} />
                        <Card1 cardName="Disk Usage" icon={SolidDisk} value={serverInfo.diskUsage ? `${serverInfo.diskUsage}%` : 'Loading...'} />
                        <Card1 cardName="Active Sessions" icon={People} value={activeSessions ? `${activeSessions}` : 'Loading...'} />
                    </div>

                    <div className="card-row">
                        <Card2 cardName="Pie Charts" chartType="pie" />
                        <Card2 cardName="System Load" chartType="line" />
                    </div>

                    <div className="card-row">
                        <Card3 />
                        <Card4 />
                    </div>

                    <div className="card-row">
                        <Card5 />
                    </div>

                    <style>{`
                        .admin-dashboard-home {
                            width: 100%;
                            margin-top: -8px;
                            padding: 8px;
                            box-sizing: border-box;
                        }

                        .card-row {
                            display: grid;
                            grid-template-columns: repeat(12, 1fr);
                            gap: 20px;
                            margin-top: 8px;
                        }

                        /* You can add responsive behavior here if needed */
                        @media (max-width: 768px) {
                            .card-row {
                                grid-template-columns: repeat(1, 1fr);
                                gap: 12px;
                            }
                        }
                    `}</style>
                </div>
            )}
        </ServerInfoProvider>
    );
}

export default AdminDashboardHome;
