//Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderSidebar.css';

function OrderSidebar({ isSidebarClosed, setSidebarClosed }) {
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
              <i className="bx bx-search g_search_icon"></i>
              <input type="search" placeholder="Search..." className="g_search_input" />
            </li>

            {/* Dashboard */}
            <li className={`nav-link ${location.pathname === '/dashboard/admin' ? 'active' : ''}`}>
              <a href="/dashboard/admin" onClick={e => { e.preventDefault(); navigate('/dashboard/admin'); }}>
                <i className="bx bx-home-alt icon"></i>
                <span className="text nav-text">Dashboard</span>
              </a>
            </li>

            <li className={`nav-link ${location.pathname === '/dashboard/admin/orders' ? 'active' : ''}`}>
              <a href="/dashboard/admin/orders" onClick={e => { e.preventDefault(); navigate('/dashboard/admin/orders'); }}>
                <i className="bx bx-cart-add icon"></i>
                <span className="text nav-text">Order List</span>
              </a>
            </li>

          <li className={`nav-link ${location.pathname.includes('/dashboard/admin/orders/') && !location.pathname.includes('/report') && location.pathname !== '/dashboard/admin/orders' ? 'active' : ''}`}>
          <a href="/dashboard/admin/orders/details" onClick={e => {
            e.preventDefault();
            // Navigate to last viewed order if available
            try {
              const lastId = localStorage.getItem('lastViewedOrderId');
              if (lastId) {
                navigate(`/dashboard/admin/orders/${lastId}`);
                return;
              }
            } catch (err) {}
            navigate('/dashboard/admin/orders/details');
          }}>
          <i className="bx bx-list-ul icon"></i>
          <span className="text nav-text">Order Details</span>
         </a>
       </li>
       
       <li className={`nav-link ${location.pathname === '/dashboard/admin/orders/report' ? 'active' : ''}`}>
          <a href="/dashboard/admin/orders/report" onClick={e => { 
            e.preventDefault(); 
            navigate('/dashboard/admin/orders/report'); 
          }}>
            <i className="bx bx-file icon"></i>
            <span className="text nav-text">Order Reports</span>
          </a>
        </li>

        <li className={`nav-link ${location.pathname === '/dashboard/admin/orders/returns' ? 'active' : ''}`}>
          <a href="/dashboard/admin/orders/returns" onClick={e => { 
            e.preventDefault(); 
            navigate('/dashboard/admin/orders/returns'); 
          }}>
            <i className="bx bx-undo icon"></i>
            <span className="text nav-text">Return Requests</span>
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

export default OrderSidebar;
