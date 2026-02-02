// DashboardLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  // State to control whether the sidebar is closed or open
  const [isSidebarClosed, setSidebarClosed] = useState(false);

  return (
    <div className={`main`}>
      {/* Sidebar component with props to control open/close state hi */}
      <Sidebar
        isSidebarClosed={isSidebarClosed}
        setSidebarClosed={setSidebarClosed}
      />
      {/* Main content section that adjusts layout based on sidebar state */}
      <section className={`home ${isSidebarClosed ? 'collapsed' : ''}`}>
        {/* Outlet renders the matched child route components here */}
        <Outlet />
      </section>
    </div>
  );
}

export default DashboardLayout;
