// AdminPortal.jsx

// Import React for building the component
import React from "react";

// Import CSS for styling the Admin Portal UI
import "../AdminPortal/AdminPortal.css";

// Import Link component for internal routing
import { Link } from "react-router-dom";

import { FaBoxes } from "react-icons/fa";
// Import icons from react-icons (FontAwesome and RemixIcon)
import {
  FaMoneyBillTransfer, // Finance icon
  FaUserTie, // Employee icon
  FaBoxOpen, // Order icon
  FaUsers, // User management icon
  FaTruck, // Transport icon
  FaIndustry, // Tank icon
  FaFish, // Fish management icon
} from "react-icons/fa6";
import { FaDna } from "react-icons/fa";

import { RiAccountCircleLine } from "react-icons/ri"; // Account icon
import { FaShoppingCart } from "react-icons/fa";
import { FaStethoscope } from "react-icons/fa";

// Functional component definition for AdminPortal
function AdminPortal() {
  return (
    // Top-level container for layout structure
    <div className="portal-container">
      {/* Inner box that holds title and button grid */}
      <div className="portal-box">
        {/* Main heading for the admin portal */}
        <h2 className="portal-title">ADMIN LOGIN PORTAL</h2>

        {/* Grid container for the management buttons */}
        <div className="button-grid">
          {/* Finance Management Navigation */}
          <Link to="/EmployeeLoginPortal">
            <button className="portal-button button-finance">
              <FaMoneyBillTransfer size={40} /> {/* Icon */}
              Finance Management
            </button>
          </Link>

          {/* Employee Management Navigation */}
          <Link to="/dashboard/EmployeeTask">
            <button className="portal-button button-employee">
              <FaUserTie size={40} />
              Employee Management
            </button>
          </Link>

          {/* Order Management Navigation - direct to dashboard */}

          <Link to="/dashboard/admin">
            <button className="portal-button button-order">
              <FaBoxOpen size={40} />
              Order Management
            </button>
          </Link>

          {/* Order Management Navigation (currently routes to /dashboard) */}

          <Link to="/items">
            <button className="portal-button button-item">
              <FaShoppingCart size={40} />
              Items
            </button>
          </Link>

          {/* User Management Navigation */}
          <Link to="/admin/dashboard">
            <button className="portal-button button-user">
              <FaUsers size={40} />
              User Management
            </button>
          </Link>

          {/* Transport Management Navigation */}
          <Link to="/dashboard/Notification">
            <button className="portal-button button-transport">
              <FaTruck size={40} />
              Massage
            </button>
          </Link>

          {/* Tank Management Navigation */}
          <Link to="/dashboard">
            <button className="portal-button button-tank">
              <FaIndustry size={40} />
              Tank Management
            </button>
          </Link>

          {/* Fish Management Navigation – takes user to fish module dashboard */}
          <Link to="/dashboard/fish">
            <button className="portal-button button-fish">
              <FaFish size={40} />
              Fish Management
            </button>
          </Link>

          {/* Health Management Navigation */}

          <Link to="/HelthPortal">
            <button className="portal-button button-health">
              <FaStethoscope size={40} />
              Health Management
            </button>
          </Link>

          {/*inventary management navigation */}
          <Link to="/dashboard/Inventory">
            <button className="portal-button button-inventary">
              <FaBoxes size={40} color="#d261a7ff"/>
              Inventory Management
            </button>
          </Link>

          {/* Breeding Management Navigation */}
          <Link to="/dashboard/Breeding">
            <button className="portal-button button-health">
              <FaDna size={40} color="#8A2BE2" /> {/* Violet DNA icon */}
              Breeding Management
            </button>
          </Link>

          {/* Account Details or Display Page (example path: /DisplayTank) */}
          <Link to="/profile/:id">
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

// Exporting the component so it can be used in routin
export default AdminPortal;