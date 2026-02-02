// src/Component/Inventary/InventarySidebar/InventorySidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./InventorySidebar.css"; // Use the same CSS
// ↑ Adjust the import path if needed based on your folder structure

function InventorySidebar({ isSidebarClosed, setSidebarClosed }) {
  const [isDarkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarClosed((prev) => !prev);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // Apply dark mode class to the root element
  useEffect(() => {
    const root = document.querySelector(".main");
    if (isDarkMode) root?.classList.add("dark");
    else root?.classList.remove("dark");
  }, [isDarkMode]);

  return (
    <nav className={`sidebar ${isSidebarClosed ? "close" : ""}`}>
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
            <br></br><br></br><br></br>

            {/* Dashboard */}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/Inventory" ? "active" : ""
              }`}
            >
              <a
                href="/dashboard/Inventory"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/Inventory");
                }}
              >
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            {/* Display Inventory */}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/Inventory/DisplayInventary"
                  ? "active"
                  : ""
              }`}
            >
              <a
                href="/dashboard/Inventory/DisplayInventary"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/Inventory/DisplayInventary");
                }}
              >
                <i className="bx bx-list-ul icon"></i>
                <span className="text nav-text">Display Inventory</span>
              </a>
            </li>

            {/* Add Inventory */}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/Inventory/AddInventary"
                  ? "active"
                  : ""
              }`}
            >
              <a
                href="/dashboard/Inventory/AddInventary"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/Inventory/AddInventary");
                }}
              >
                <i className="bx bx-plus-circle icon"></i>
                <span className="text nav-text">Add Inventory</span>
              </a>
            </li>

            {/* Reports */}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/Inventory/InventaryReports"
                  ? "active"
                  : ""
              }`}
            >
              <a
                href="/dashboard/Inventory/InventaryReports"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/Inventory/InventaryReports");
                }}
              >
                <i className="bx bx-bar-chart icon"></i>
                <span className="text nav-text">Reports</span>
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

export default InventorySidebar;
