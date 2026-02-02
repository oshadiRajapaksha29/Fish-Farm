// MedicineDashboardLayout.jsx

// Importing React and useState hook for managing component state
import React, { useState } from 'react';

// Importing the sidebar component specifically for the Fish module
import MedicineSidebar from './MedicineSidebar.jsx';

// Importing the Outlet component from react-router-dom to render nested routes
import { Outlet } from 'react-router-dom';

// Functional component for the Fish Dashboard Layout
function MedicineDashboardLayout() {
  // State variable to manage whether the sidebar is collapsed or expanded
  const [isSidebarClosed, setSidebarClosed] = useState(false);

  return (
    // Main container for the dashboard layout
    <div className="main">
      {/* Sidebar component receives the current state and setter function as props.
          It can control its open/closed state from inside the sidebar */}
      <MedicineSidebar
        isSidebarClosed={isSidebarClosed}
        setSidebarClosed={setSidebarClosed}
      />

      {/* Main content section of the dashboard.
          The 'collapsed' class is conditionally applied based on sidebar state.
          This class can be used in CSS to shift or resize the layout when sidebar is closed */}
      <section className={`home ${isSidebarClosed ? 'collapsed' : ''}`}>
        {/* <Outlet /> is a placeholder for rendering child routes defined under this layout in react-router */}
        <Outlet />
      </section>
    </div>
  );
}

// Exporting the layout component so it can be used in routing or other components
export default MedicineDashboardLayout;
