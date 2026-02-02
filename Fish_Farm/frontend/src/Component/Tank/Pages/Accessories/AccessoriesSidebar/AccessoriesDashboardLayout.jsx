// AccessoriesDashboardLayout.jsx
import React, { useState } from 'react';
import AccessoriesSidebar from './AccessoriesSidebar.jsx';
import { Outlet } from 'react-router-dom';

function AccessoriesDashboardLayout() {
  const [isSidebarClosed, setSidebarClosed] = useState(false);

  return (
    <div className="main">
      <AccessoriesSidebar
        isSidebarClosed={isSidebarClosed}
        setSidebarClosed={setSidebarClosed}
      />
      <section className={`home ${isSidebarClosed ? 'collapsed' : ''}`}>
        <Outlet />
      </section>
    </div>
  );
}

export default AccessoriesDashboardLayout;
