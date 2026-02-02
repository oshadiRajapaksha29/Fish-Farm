//frontend/src/Component/EmployeePortal/EmployeeLoginPortal.jsx
import React from 'react';
import '../EmployeePortal/EmployeeLoginPortal.css'; // reuse the CSS
import { Link } from 'react-router-dom';
import { FaTruck, FaIndustry, FaFish, FaBoxOpen } from 'react-icons/fa6';
import { RiAccountCircleLine } from 'react-icons/ri';

function EmployeeLoginPortal() {
  return (
    <div className="portal-container">
      <div className="EmployeePortal-box">
        <h2 className="portal-title">EMPLOYEE LOGIN PORTAL</h2>
        <div className="EmployeePortalbutton-grid">
          <Link to="/DisplayTank">
            <button className="portal-button button-transport">
              <FaTruck size={40} />
              Transport Management
            </button>
          </Link>

          <Link to="/TankPortal">
            <button className="portal-button button-tank">
              <FaIndustry size={40} />
              Tank Management
            </button>
          </Link>

          <Link to="/DisplayTank">
            <button className="portal-button button-fish">
              <FaFish size={40} />
              Fish Management
            </button>
          </Link>

          <Link to="/DisplayTank">
            <button className="portal-button button-order">
              <FaBoxOpen size={40} />
              Order Management
            </button>
          </Link>

         <Link to="/EmployeeView">
            <button className="portal-button button-order">
              <FaBoxOpen size={40} />
              Daily Tasks
            </button>
          </Link>
          <Link to="/DisplayTank">
            <button className="portal-button button-account">
              <RiAccountCircleLine size={40} />
              Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLoginPortal;
