import React, { lazy, Suspense, useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Bell } from "lucide-react";
import logo from "../image/Logo.png";
import { useCart } from "../Orders/Cart/CartContext";
import "./Navbar.css";
import axios from "axios";

// Lazy load components
const MiniCart = lazy(() => import("../Orders/Cart/MiniCart"));

const Navbar = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isVibrating, setIsVibrating] = useState(false);

  // Calculate total number of items in the cart
  const cartItemCount = items.reduce((count, item) => count + item.qty, 0);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    (async() => {
      try{
        const res = await axios.get("http://localhost:5000/api/check-auth", { withCredentials: true });
        if(res.data.success){
          setLoggedIn(true);
          setUser(res.data.user);
        }
      }catch(err){
        console.error("Error checking auth status:", err);
        setLoggedIn(false);
        setUser(null);
      }
    })();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data.notifications);
      const unread = res.data.notifications.filter(notif => !notif.isRead).length;
      setUnreadCount(unread);
      
      // Trigger vibration for new notifications
      if (unread > 0) {
        triggerVibration();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Trigger vibration effect
  const triggerVibration = () => {
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 1000);
  };

  // Poll for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}`, { isRead: true });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put("http://localhost:5000/api/notifications/mark-all-read/bulk");
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error marking all as read:", error);
      alert("Failed to mark all as read. Please try again.");
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        {/* Logo */}
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="logo-img" />
          <div className="logo-text-block">
            <span className="logo-text">AquaPeak</span>
            <span className="logoUp-text">Fish farm</span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/shop/fish" className={({ isActive }) => (isActive ? "active" : "")}>
            Fish
          </NavLink>
          <NavLink to="/shop/food-medicine" className={({ isActive }) => (isActive ? "active" : "")}>
            Food & Medicine
          </NavLink>
          <NavLink to="/dashboard/homeaccessories" className={({ isActive }) => (isActive ? "active" : "")}>
            Accessories
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
            Contact
          </NavLink>
        </div>

        {/* Right Side */}
        <div className="nav-right">
          <NavLink to="/my-orders" className={({ isActive }) => 
            isActive ? "orders-link active" : "orders-link"
          }>
            My Orders
          </NavLink>

          {/* Notifications Bell - For ALL users to VIEW notifications */}
          <div className="notification-container">
            <button 
              className={`icon-btn notification-btn ${isVibrating ? 'vibrating' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read-btn"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(notification => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <div className="notification-dot"></div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.Title}</div>
                          <div className="notification-message">{notification.Message}</div>
                          <div className="notification-time">
                            {new Date(notification.Date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 5 && (
                  <div className="notifications-footer">
                    <button 
                      className="view-all-btn"
                      onClick={() => navigate("/notifications")}
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="icon-btn search-btn">
            <Search size={20} />
          </button>
          
          <div className="icon-btn cart-btn">
            <div className="cart-icon-wrapper" onClick={() => navigate("/cart")}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </div>
            {/* Render the MiniCart component with Suspense */}
            <Suspense fallback={<div></div>}>
              <MiniCart />
            </Suspense>
          </div>
          
          {loggedIn && user ? (
            // Show user profile when logged in
            <div 
              className="user-profile-btn"
              onClick={() => navigate(`/profile/${user.userId}`)}
            >
              <div className="user-avatar">
                {user.displayPicture ? (
                  <img 
                    src={user.displayPicture} 
                    alt={user.name} 
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className="user-name">{user.name}</span>
            </div>
          ) : (
            // Show sign in and join buttons when not logged in
            <div className="auth-buttons">
              <button 
                className="auth-btn signin" 
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
              <button 
                className="auth-btn join" 
                onClick={() => navigate("/register")}
              >
                Join
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="dropdowns-overlay"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default Navbar;