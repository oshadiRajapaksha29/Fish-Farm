// FoodAndMedicineDashboardLayout.jsx
import React, { useState } from 'react';
import FoodAndMedicineSidebar from './FoodAndMedicineSidebar.jsx';
import { Outlet } from 'react-router-dom';

function FoodAndMedicineDashboardLayout() {
  const [isSidebarClosed, setSidebarClosed] = useState(false);

  return (
    <div className="main">
      <FoodAndMedicineSidebar
        isSidebarClosed={isSidebarClosed}
        setSidebarClosed={setSidebarClosed}
      />
      <section className={`home ${isSidebarClosed ? 'collapsed' : ''}`}>
        <Outlet />
      </section>
    </div>
  );
}

export default FoodAndMedicineDashboardLayout;
