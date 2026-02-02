import React from 'react';
import '../Items/Items.css'; // Reuse the CSS
import { Link } from 'react-router-dom';

// New icons
import { FaUtensils } from 'react-icons/fa'; // For food and medicine
import { GiWaterTank } from 'react-icons/gi'; // For accessories/tank related

function OrderManagement() {
  return (
    <div className="portal-container">
      <div className="Items-box">
        <h2 className="portal-title">Items</h2>
        <div className="Itemsbutton-grid">
          
          {/* Food & Medicine */}
          <Link to="/dashboard/FoodAndMedicine">
            <button className="portal-button button-transport">
              <FaUtensils size={40} />
              &nbsp;Food
              <br />
              & Medicine
            </button>
          </Link>

          {/* Accessories */}
          <Link to="/dashboard/accessories">
            <button className="portal-button button-tank">
              <GiWaterTank size={40} />
              &nbsp;Accessories
            </button>
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;
