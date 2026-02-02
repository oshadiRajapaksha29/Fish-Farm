// DiseaseReportSidebar.jsx

// React imports
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Importing CSS specific to this sidebar
import './DiseaseReportSidebar.css';

// DiseaseReportSidebar functional component
function DiseaseReportSidebar({ isSidebarClosed, setSidebarClosed }) {
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

      {/* Add same space below logo/header as FishSidebar */}
      <div style={{ marginTop: '80px' }}></div>

      <div className="menu-bar">
        <div className="menu">
          <ul>
            {/* Dashboard Link */}
            <li className={`nav-link ${location.pathname === '/dashboard/disease' ? 'active' : ''}`}>
              <a
                href="/dashboard/disease"
                onClick={e => {
                  e.preventDefault();
                  navigate('/dashboard/disease');
                }}
              >
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            {/* Add Detail Link */}
            <li className={`nav-link ${location.pathname === '/dashboard/disease/AddDetail' ? 'active' : ''}`}>
              <a
                href="/dashboard/disease/AddDetail"
                onClick={e => {
                  e.preventDefault();
                  navigate('/dashboard/disease/AddDetail');
                }}
              >
                <i className="bx bx-plus-circle icon"></i>
                <span className="text nav-text">Add Detail</span>
              </a>
            </li>

            {/* View Link */}
            <li className={`nav-link ${location.pathname === '/dashboard/disease/view' ? 'active' : ''}`}>
              <a
                href="/dashboard/disease/view"
                onClick={e => {
                  e.preventDefault();
                  navigate('/dashboard/disease/view');
                }}
              >
                <i className="bx bx-show icon"></i>
                <span className="text nav-text">View</span>
              </a>
            </li>

            {/* Report Link */}
            <li
              className={`nav-link ${
                location.pathname === '/dashboard/disease/reports' ? 'active' : ''
              }`}
            >
              <a
                href="/dashboard/disease/reports"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard/disease/reports');
                }}
              >
                <i className="bx bx-file-find icon"></i>
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

export default DiseaseReportSidebar;
