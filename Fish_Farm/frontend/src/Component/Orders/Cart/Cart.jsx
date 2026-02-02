import React, { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import "./Cart.css";

// Lazy load the RelatedProducts component
const RelatedProducts = lazy(() => import("./RelatedProducts"));

export default function Cart() {
  const { items, setQty, removeItem, totals, clear } = useCart();
  const navigate = useNavigate();

  const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");

  // Resolve various image formats to a proper absolute URL
  // Accepts:
  // - full URLs (http...)
  // - paths like "/uploads/xyz.jpg" or "uploads/xyz.jpg"
  // - bare filenames like "xyz.jpg" (assume under uploads/)
  // - nested folders like "uploads/accessories/xyz.jpg"
  const resolveImageSrc = (img) => {
    if (!img) return null;
    if (typeof img !== "string") return null;
    // Normalize Windows backslashes to forward slashes
    let s = img.replace(/\\/g, "/");
    if (s.startsWith("http")) return s;
    // Trim any leading slashes
    const clean = s.replace(/^\/+/, "");
    if (clean.includes("/")) {
      // already contains a folder (e.g., uploads/...)
      return `${API_BASE}/${clean}`;
    }
    // bare filename -> assume /uploads/<file>
    return `${API_BASE}/uploads/${clean}`;
  };

  if (items.length === 0) {
    return (
      <div className="r_c_empty">
        <div className="r_c_empty_icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2L7.17 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4H16.83L15 2H9Z" fill="currentColor" opacity="0.3"/>
            <path d="M15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9Z" fill="currentColor"/>
          </svg>
        </div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <button onClick={() => navigate("/")} className="r_c_shop_btn">
          <span>Start Shopping</span>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="r_c_container">
      <div className="r_c_header">
        <div className="r_c_title_section">
          <h2>Shopping Cart</h2>
          <span className="r_c_item_count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>
        {items.length > 0 && (
          <button onClick={() => clear()} className="r_c_clear_btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Clear All
          </button>
        )}
      </div>

      <div className="r_c_content_wrapper">
        <div className="r_c_items_section">
          {items.map((it, index) => (
            <div key={it._id} className="r_c_card" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="r_c_card_image">
                {(it.image || it.imageProduct) && (
                  <img
                    src={resolveImageSrc(it.image || it.imageProduct)}
                    alt={it.productName || it.name || "Item"}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>
              
              <div className="r_c_card_details">
                <div className="r_c_card_info">
                  <h3 className="r_c_card_name">{it.productName || it.name || it.Species}</h3>
                  <div className="r_c_card_meta">
                    {it.size && <span className="r_c_card_badge">{it.size}</span>}
                    {(it.category || it.subSpecies) && (
                      <span className="r_c_card_category">{it.category || it.subSpecies}</span>
                    )}
                  </div>
                  {it.stock && <div className="r_c_card_stock">In Stock: {it.stock}</div>}
                </div>

                <div className="r_c_card_price">
                  <span className="r_c_price_label">Price</span>
                  <span className="r_c_price_value">Rs. {(it.price || it.PricePerCouple || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="r_c_card_actions">
                <div className="r_c_qty_wrapper">
                  <label className="r_c_qty_label">Quantity</label>
                  <div className="r_c_qty_controls">
                    <button 
                      className="r_c_qty_btn"
                      onClick={() => setQty(it._id, Math.max(1, it.qty - 1))}
                      disabled={it.qty <= 1}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={it.stock}
                      value={it.qty}
                      onChange={(e) => setQty(it._id, Number(e.target.value))}
                      className="r_c_qty_input"
                    />
                    <button 
                      className="r_c_qty_btn"
                      onClick={() => setQty(it._id, Math.min(it.stock, it.qty + 1))}
                      disabled={it.qty >= it.stock}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="r_c_card_subtotal">
                  <span className="r_c_subtotal_label">Subtotal</span>
                  <span className="r_c_subtotal_value">Rs. {((it.price || it.PricePerCouple || 0) * it.qty).toLocaleString()}</span>
                </div>

                <button onClick={() => removeItem(it._id)} className="r_c_remove_btn" title="Remove item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="r_c_summary_section">
          <div className="r_c_summary_card">
            <h3 className="r_c_summary_title">Order Summary</h3>
            
            <div className="r_c_summary_row">
              <span>Subtotal ({items.length} items)</span>
              <span>Rs. {totals.subtotal.toLocaleString()}</span>
            </div>
            
            <div className="r_c_summary_row">
              <span>Shipping</span>
              <span className="r_c_free_tag">FREE</span>
            </div>

            <div className="r_c_summary_divider"></div>

            <div className="r_c_summary_total">
              <span>Total</span>
              <span className="r_c_total_amount">Rs. {totals.subtotal.toLocaleString()}</span>
            </div>

            <button onClick={() => navigate("/checkout")} className="r_c_checkout_btn">
              <span>Proceed to Checkout</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button onClick={() => navigate("/")} className="r_c_continue_btn">
              Continue Shopping
            </button>

            <div className="r_c_trust_badges">
              <div className="r_c_badge_item">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Secure Payment</span>
              </div>
              <div className="r_c_badge_item">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Show related products */}
      <Suspense fallback={<div className="r_c_loading">Loading suggestions...</div>}>
        <RelatedProducts />
      </Suspense>
    </div>
  );
}
