import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './MiniCart.css';

const MiniCart = () => {
  const { recentItems, totals } = useCart();
  const navigate = useNavigate();

  const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");

  // Resolve various image formats to a proper absolute URL
  const resolveImageSrc = (img) => {
    if (!img) return null;
    if (typeof img !== "string") return null;
    let s = img.replace(/\\/g, "/");
    if (s.startsWith("http")) return s;
    const clean = s.replace(/^\/+/, "");
    if (clean.includes("/")) {
      return `${API_BASE}/${clean}`;
    }
    return `${API_BASE}/uploads/${clean}`;
  };

  return (
    <div className="r_mini_cart">
      <div className="r_mini_cart_header">
        <h4>Recently Added Items</h4>
      </div>
      
      <div className="r_mini_cart_items">
        {recentItems.length === 0 ? (
          <p className="r_mini_cart_empty">Your cart is empty</p>
        ) : (
          recentItems.map(item => (
            <div key={item._id} className="r_mini_cart_item">
              {(item.image || item.imageProduct) && (
                <div className="r_mini_cart_image">
                  <img 
                    src={resolveImageSrc(item.image || item.imageProduct)} 
                    alt={item.productName || item.name} 
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
              <div className="r_mini_cart_info">
                <div className="r_mini_cart_name">{item.productName || item.name}</div>
                <div className="r_mini_cart_price">
                  {item.qty} × Rs. {item.price}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {recentItems.length > 0 && (
        <div className="r_mini_cart_footer">
          <div className="r_mini_cart_total">
            <span>Total:</span>
            <span>Rs. {totals.subtotal}</span>
          </div>
          <button 
            className="r_mini_cart_view_btn"
            onClick={() => navigate('/cart')}
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default MiniCart;