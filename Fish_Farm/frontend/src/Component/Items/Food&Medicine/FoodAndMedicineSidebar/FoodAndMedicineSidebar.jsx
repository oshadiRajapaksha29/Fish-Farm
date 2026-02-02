//FoodAndMedicineSidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FoodAndMedicineSidebar.css';

function FoodAndMedicineSidebar({ isSidebarClosed, setSidebarClosed }) {
  const [isDarkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarClosed(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate('/admin');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // You can implement search functionality here
      console.log("Searching for:", searchTerm);
      // Example: navigate to search results page
      // navigate(`/dashboard/FoodAndMedicine/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

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
            <li className="g_search_box">
              <i 
                className="bx bx-search g_search_icon" 
                onClick={() => {
                  if (isSidebarClosed) {
                    setSidebarClosed(false);
                  }
                }}
              ></i>
              <input 
                type="search" 
                placeholder="Search..." 
                className="g_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </li>

            {/* Dashboard */}
            <li className={`nav-link ${location.pathname === '/dashboard/FoodAndMedicine' ? 'active' : ''}`}>
              <a href="/dashboard/FoodAndMedicine" onClick={e => { e.preventDefault(); navigate('/dashboard/FoodAndMedicine'); }}>
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            {/* Add New Food & Medicine*/}
            <li className={`nav-link ${location.pathname === '/dashboard/FoodAndMedicine/AddNewFoodAndMedicine' ? 'active' : ''}`}>
              <a href="AddNewFoodAndMedicine" onClick={e => { e.preventDefault(); navigate('AddNewFoodAndMedicine'); }}>
                <svg className="icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <span className="text nav-text">Food & Medi</span>
              </a>
            </li>
            {/* View Food & Medicine */}
            <li className={`nav-link ${location.pathname === '/dashboard/FoodAndMedicine/ViewFoodAndMedicine' ? 'active' : ''}`}>
              <a href="ViewFoodAndMedicine" onClick={e => { e.preventDefault(); navigate('ViewFoodAndMedicine'); }}>
                <i className="bx bx-list-ul icon"></i>
                <span className="text nav-text">Food & Medi</span>
              </a>
            </li>
            {/* reports */}
            <li className={`nav-link ${location.pathname === '/dashboard/FoodAndMedicine/reports' ? 'active' : ''}`}>
              <a href="reports" onClick={e => { e.preventDefault(); navigate('reports'); }}>
                <i className="bx bx-bar-chart-alt-2 icon"></i>
                <span className="text nav-text">Reports</span>
              </a>
            </li>
            </ul>
            </div>

        <div className="bottm-content">
          <ul>
            <li>
              <a href="/OrderManagement" onClick={handleBackClick}>
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

export default FoodAndMedicineSidebar;
