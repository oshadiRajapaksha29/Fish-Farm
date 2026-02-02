//Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isSidebarClosed, setSidebarClosed }) {
  const [isDarkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarClosed(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate('/admin');
  };

  // Detect if submenu should auto-open based on current path
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/tank/AddDetails')) {
      setActiveMenu('TankAddDetails');
    } else {
      setActiveMenu(null);
    }
  }, [location.pathname]);

  // Add or remove dark mode class
  useEffect(() => {
    const root = document.querySelector('.main');
    if (isDarkMode) root?.classList.add('dark');
    else root?.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <nav className={`sidebar ${isSidebarClosed ? 'close' : ''}`}>
      <header>
        <div className="image-text">
          <span className="image">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwR_-rajvPgl5tYcAZdA_dX2_SA__PStgKuQ&s"
              alt="logo"
            />
          </span>
          <div className="text header-text">
            <span className="name">Aqua Peak</span>
            <span className="profession">Fish Farm</span>
          </div>
          <i className="bx bx-chevron-right toggle" onClick={toggleSidebar}></i>
        </div>
      </header>

      <div className="menu-bar">
        <div className="menu">
          <ul>
            {/* <li className="search-box">
              <i className="bx bx-search icon"></i>
              <input type="search" placeholder="Search..." />
            </li> */}

            <br></br><br></br><br></br>

            {/* Dashboard */}
            <li className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <a href="/dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            {/* Add Tanks */}
            <li className={`nav-link ${location.pathname.startsWith('/dashboard/tank/AddDetails/all') ? 'active' : ''}`}>
              <a
                href="tank/AddDetails/all"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu(activeMenu === 'TankAddDetails' ? null : 'TankAddDetails');
                  navigate('tank/AddDetails/all');
                }}
              >
                <i className="bx bx-plus-circle icon"></i>
                <span className="text nav-text">Add Tanks</span>
              </a>
            </li>

            {/* Submenu for Add Tanks
            {activeMenu === 'TankAddDetails' && (
              <>
                <li className={`nav-link submenu-link ${location.pathname.endsWith('/mud') ? 'active' : ''}`}>
                  <a href="/dashboard/tank/AddDetails/mud" onClick={e => { e.preventDefault(); navigate('/dashboard/tank/AddDetails/mud'); }}>
                    <i className="bx bx-leaf icon submenu-icon"></i>
                    <span className="text nav-text submenu">Mud Puddles</span>
                  </a>
                </li>
                <li className={`nav-link submenu-link ${location.pathname.endsWith('/glass') ? 'active' : ''}`}>
                  <a href="/dashboard/tank/AddDetails/glass" onClick={e => { e.preventDefault(); navigate('/dashboard/tank/AddDetails/glass'); }}>
                    <i className="bx bx-shape-square icon submenu-icon"></i>
                    <span className="text nav-text submenu">Glass Tanks</span>
                  </a>
                </li>
                <li className={`nav-link submenu-link ${location.pathname.endsWith('/cement') ? 'active' : ''}`}>
                  <a href="/dashboard/tank/AddDetails/cement" onClick={e => { e.preventDefault(); navigate('/dashboard/tank/AddDetails/cement'); }}>
                    <i className="bx bx-building-house icon submenu-icon"></i>
                    <span className="text nav-text submenu">Cement Tanks</span>
                  </a>
                </li>
              </>
            )} */}

            {/* View Details */}
            <li className={`nav-link ${location.pathname === '/dashboard/tank/view-live' ? 'active' : ''}`}>
              <a href="/dashboard/tank/view-live" onClick={e => { e.preventDefault(); navigate('/dashboard/tank/view-live'); }}>
                <i className="bx bx-show icon"></i>
                <span className="text nav-text">View Details</span>
              </a>
            </li>

            {/* Water Level
            <li className={`nav-link ${location.pathname === '/dashboard/tank/water-level' ? 'active' : ''}`}>
              <a href="/dashboard/tank/water-level" onClick={e => { e.preventDefault(); navigate('/dashboard/tank/water-level'); }}>
                <i className="bx bx-water icon"></i>
                <span className="text nav-text">Tanks Status</span>
              </a>
            </li> */}

            {/* Reports */}
            <li className={`nav-link ${location.pathname === '/dashboard/tank/reports' ? 'active' : ''}`}>
              <a href="/dashboard/tank/reports" onClick={e => { e.preventDefault(); navigate('/dashboard/tank/reports'); }}>
                <i className="bx bx-bar-chart icon"></i>
                <span className="text nav-text">Reports</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="bottm-content">
          <ul>
            <li>
              <a href="/admin" onClick={handleBackClick}>
                <i className="bx bx-arrow-back icon"></i>
                <span className="text nav-text">Back</span>
              </a>
            </li>

            <li className="mode" onClick={toggleDarkMode}>
              <div className="moon-sun">
                <i className="bx bx-moon icon moon"></i>
                <i className="bx bx-sun icon sun"></i>
              </div>
              <span className="mode-text text">Dark Mode</span>
              <div className="toggle-switch"></div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
