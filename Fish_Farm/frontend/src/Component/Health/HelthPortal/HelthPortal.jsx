import React from "react";
import "./HelthPortal.css";
import { Link } from "react-router-dom";

// Icons
import { FaDisease, FaPills } from "react-icons/fa";
import { GiDeathSkull } from "react-icons/gi";

function HelthPortal() {
  return (
    <div className="s-portal-container">
      <div className="s-items-box">
        <h2 className="s-portal-title">Health Portal</h2>
        <div className="s-itemsbutton-grid">
          
          {/* Disease Inform */}
          <Link to="/dashboard/disease">
            <button className="s-portal-button s-disease">
              <FaDisease size={40} />
              &nbsp;Disease Inform
            </button>
          </Link>

          {/* Mortality Inform */}
          <Link to="/dashboard/mortality">
            <button className="s-portal-button s-mortality">
              <GiDeathSkull size={40} />
              &nbsp;Mortality Inform
            </button>
          </Link>
          
          {/* Medicine Inventory */}
          <Link to="/dashboard/medicine">
            <button className="s-portal-button s-medicine">
              <FaPills size={40} />
              &nbsp;Our Medicine Inventory
            </button>
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default HelthPortal;
