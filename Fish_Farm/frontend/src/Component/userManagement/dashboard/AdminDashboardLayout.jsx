import React from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
    return (
        <div id="dashboard-layout">
            <div className="sidebar">
                <SideNav />
            </div>
            <div className="main-content">
                <TopNav />
                <div className="content-area">
                    <Outlet />
                </div>
            </div>

            <style>{`
                #dashboard-layout {
                    display: grid;
                    grid-template-columns: 2fr 8fr;
                    height: 100vh;
                    width: 100vw;
                    overflow-y: auto;
                }

                /* Custom scrollbar */
                #dashboard-layout::-webkit-scrollbar {
                    width: 8px;
                }
                #dashboard-layout::-webkit-scrollbar-thumb {
                    background-color: #089566;
                    border-radius: 4px;
                }
                #dashboard-layout::-webkit-scrollbar-track {
                    background-color: #f3f2f7;
                }

                .sidebar {
                    grid-column: 1 / 2;
                }

                .main-content {
                    grid-column: 2 / 3;
                    display: grid;
                    grid-template-rows: auto 1fr;
                    background-color: #F3F2F7;
                }

                .content-area {
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
}

export default DashboardLayout;