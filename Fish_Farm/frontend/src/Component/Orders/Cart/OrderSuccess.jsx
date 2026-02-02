import React from "react";
import { useParams, Link } from "react-router-dom";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const { id } = useParams(); // order id from URL

  return (
    <div className="ap_os_container">
      {/* Background decorative elements */}
      <div className="ap_os_bg_circle ap_os_circle_1"></div>
      <div className="ap_os_bg_circle ap_os_circle_2"></div>
      <div className="ap_os_bg_circle ap_os_circle_3"></div>

      <div className="ap_os_content_wrapper">
        {/* Success Icon with Animation */}
        <div className="ap_os_success_icon_wrapper">
          <div className="ap_os_success_icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div className="ap_os_success_ripple"></div>
          <div className="ap_os_success_ripple ap_os_ripple_2"></div>
        </div>

        {/* Title */}
        <h2 className="ap_os_title">
          {id ? "Order Placed Successfully!" : "Order Updated Successfully!"}
        </h2>

        {/* Subtitle */}
        <p className="ap_os_subtitle">
          {id
            ? "Thank you for your order! Your purchase has been confirmed."
            : "Your order details have been updated successfully."}
        </p>

        {/* Order ID Card */}
        {id && (
          <div className="ap_os_order_card">
            <div className="ap_os_order_card_header">
              <div className="ap_os_order_icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </div>
              <div className="ap_os_order_info">
                <span className="ap_os_order_label">Order ID</span>
                <span className="ap_os_order_id">{id}</span>
              </div>
            </div>
            <div className="ap_os_order_card_note">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p>Please save this Order ID for tracking and future reference</p>
            </div>
          </div>
        )}

        {/* Message Card */}
        <div className="ap_os_message_card">
          <div className="ap_os_message_icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <div className="ap_os_message_content">
            <h3>What's Next?</h3>
            <p>
              {id
                ? "We'll send you email updates about your order status. You can track your order anytime from 'My Orders' section."
                : "All changes have been saved. You can view the updated details in your order history."}
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="ap_os_info_banner">
          <div className="ap_os_info_icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
            </svg>
          </div>
          <div className="ap_os_info_text">
            <strong>Need to track your order?</strong>
            <p>Go to "My Orders" and enter the email or phone number you used during checkout.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ap_os_actions">
          <Link to="/" className="ap_os_btn ap_os_btn_primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Continue Shopping
          </Link>

          <Link to="/my-orders" className="ap_os_btn ap_os_btn_secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            View My Orders
          </Link>
        </div>

        {/* Features Section */}
        <div className="ap_os_features">
          <div className="ap_os_feature">
            <div className="ap_os_feature_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
              </svg>
            </div>
            <div className="ap_os_feature_text">
              <strong>Fast Delivery</strong>
              <p>Quick shipping to your door</p>
            </div>
          </div>

          <div className="ap_os_feature">
            <div className="ap_os_feature_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
            <div className="ap_os_feature_text">
              <strong>Secure Payment</strong>
              <p>Your data is protected</p>
            </div>
          </div>

          <div className="ap_os_feature">
            <div className="ap_os_feature_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
              </svg>
            </div>
            <div className="ap_os_feature_text">
              <strong>24/7 Support</strong>
              <p>We're here to help</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
