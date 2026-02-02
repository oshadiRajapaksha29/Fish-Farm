//AccessoriesSidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AccessoriesSidebar.css";
import { FaList } from "react-icons/fa"; // List icon from FontAwesome

function AccessoriesSidebar({ isSidebarClosed, setSidebarClosed }) {
  // const [isDarkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarClosed((prev) => !prev);
  // const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate("/admin");
  };

  // // Add or remove dark mode class
  // useEffect(() => {
  //   const root = document.querySelector(".main");
  //   if (isDarkMode) root?.classList.add("dark");
  //   else root?.classList.remove("dark");
  // }, [isDarkMode]);

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
            <li className="search-box">
              <i className="bx bx-search icon"></i>
              <input type="search" placeholder="Search..." />
              
            </li>

            {/* Dashboard */}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/accessories" ? "active" : ""
              }`}
            >
              <a
                href="/dashboard/accessories"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/accessories");
                }}
              >
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            {/* Add New Accessories*/}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/accessories/AddNewAccessories"
                  ? "active"
                  : ""
              }`}
            >
              <a
                href="AddNewAccessories"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("AddNewAccessories");
                }}
              >
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    fill="currentColor"
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
                <span className="text nav-text">New Accessory</span>
              </a>
            </li>

            {/* View Accessories*/}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/accessories/ViewAccessories"
                  ? "active"
                  : ""
              }`}
            >
              <a
                href="/dashboard/accessories/ViewAccessories"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/accessories/ViewAccessories");
                }}
              >
                <FaList className="icon" size={24} />
                <span className="text nav-text">View Accessories</span>
              </a>
            </li>

             {/* Add New Accessories*/}
            <li
              className={`nav-link ${
                location.pathname === "/dashboard/accessories/AccessoriesReport"
                  ? "active"
                  : ""
              }`}
            >
              <a
                href="AccessoriesReport"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("AccessoriesReport");
                }}
              >
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    fill="currentColor"
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
                <span className="text nav-text">Report</span>
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

            {/* <li className="mode" onClick={toggleDarkMode}>
              <div className="moon-sun">
                <i className="bx bx-moon icon moon"></i>
                <i className="bx bx-sun icon sun"></i>
              </div>
              <span className="mode-text text">Dark Mode</span>
              <div className="toggle-switch"></div>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default AccessoriesSidebar;
