import React from 'react';
import SideNavHeader from './sideNavComponents/SideNavHeader';
import SideNavTabs from './sideNavComponents/SideNavTabs';
import SideNavFooter from './sideNavComponents/SideNavFooter';

function SideNav() {
    return (
        <div className="side-nav">
            <div className="side-nav-header">
                <SideNavHeader />
            </div>
            <div className="side-nav-tabs">
                <SideNavTabs />
            </div>
            <div className="side-nav-footer">
                <SideNavFooter />
            </div>

            <style>{`
                .side-nav {
                    height: 100vh;
                    width: 242px;
                    display: grid;
                    grid-template-rows: 1fr 7fr 2fr;
                    position: fixed;
                }

                .side-nav-header,
                .side-nav-footer {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .side-nav-tabs {
                    overflow-y: auto;
                }

                /* Optional: hide default scrollbar for tabs */
                .side-nav-tabs::-webkit-scrollbar {
                    width: 6px;
                }
                .side-nav-tabs::-webkit-scrollbar-thumb {
                    background-color: transparent;
                }
                .side-nav-tabs::-webkit-scrollbar-track {
                    background-color: transparent;
                }
            `}</style>
        </div>
    );
}

export default SideNav;
