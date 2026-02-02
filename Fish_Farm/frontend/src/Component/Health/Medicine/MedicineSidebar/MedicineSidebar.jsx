// FishSidebar.jsx

// React imports
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Importing CSS specific to this sidebar
import './MedicineSidebar.css';

// FishSidebar functional component
function MedicineSidebar({ isSidebarClosed, setSidebarClosed }) {
  const [isDarkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarClosed(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  useEffect(() => {
    const root = document.querySelector('.main');
    if (isDarkMode) {
      root?.classList.add('dark');
    } else {
      root?.classList.remove('dark');
    }
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
            <li className="search-box">
              <i className="bx bx-search icon"></i>
              <input type="search" placeholder="Search..." />
            </li>

            {/* Dashboard Link */}
            <li className={`nav-link ${location.pathname === '/dashboard/medicine' ? 'active' : ''}`}>
              <a
                href="/dashboard/medicine"
                onClick={e => {
                  e.preventDefault();
                  navigate('/dashboard/medicine');
                }}
              >
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            {/* Add Detail Link */}
            <li className={`nav-link ${location.pathname === '/dashboard/medicine/AddDetail' ? 'active' : ''}`}>
              <a
                href="/dashboard/medicine/AddDetail"
                onClick={e => {
                  e.preventDefault();
                  navigate('/dashboard/medicine/AddDetails');
                }}
              >
                <i className="bx bx-plus-circle icon"></i>
                <span className="text nav-text">Add Detail</span>
              </a>
            </li>

            {/* View Link */}
            <li className={`nav-link ${location.pathname === '/dashboard/medicine/View' ? 'active' : ''}`}>
              <a
                href="/dashboard/medicine/View"
                onClick={e => {
                  e.preventDefault();
                  navigate('/dashboard/medicine/View');
                }}
              >
                <i className="bx bx-plus-circle icon"></i>
                <span className="text nav-text">View</span>
              </a>
            </li>

           {/* Report Link */}
<li className={`nav-link ${location.pathname === '/dashboard/medicine/Report' ? 'active' : ''}`}>
  <a
    href="/dashboard/medicine/Report"
    onClick={e => {
      e.preventDefault();
      navigate('/dashboard/medicine/Report');
    }}
  >
    <i className="bx bxs-report icon"></i> {/* Updated icon */}
    <span className="text nav-text">Report</span>
  </a>
</li>

            

          </ul>
        </div>

        <div className="bottm-content">
          <ul>
            <li>
              <a href="/" onClick={handleBackClick}>
                <i className="bx bx-arrow-back icon"></i>
                <span className="text nav-text">Back</span>
              </a>
            </li>

            <li
              className="mode"
              onClick={toggleDarkMode}
              style={{ cursor: 'pointer' }}
            >
              <div className="moon-sun">
                <i className="bx bx-moon icon moon"></i>
                <i className="bx bx-sun icon sun"></i>
              </div>
              <span className="mode-text text">Dark Mode</span>

              <div className="toggle-switch">
                <div className="switch"></div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default MedicineSidebar;
