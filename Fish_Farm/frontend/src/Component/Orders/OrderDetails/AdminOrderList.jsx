import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './r_om_list_styles.css';
import api from '../../../api'; // Import the centralized API config
import ApiErrorDisplay from './ApiErrorDisplay'; // Import error display component

// Simplified Admin Order List component
const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders from API
  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders from backend...');
      setLoading(true);
      setError(null);
      
      // Set a timeout to prevent long-hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 10s')), 10000)
      );
      
      // Race between actual request and timeout
      const response = await Promise.race([
        api.get('/orderDetails'),
        timeoutPromise
      ]);
      
      console.log('📦 Response data:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success && Array.isArray(response.data.orders)) {
        // Format 1: { success: true, orders: [...] }
        setOrders(response.data.orders);
        console.log(`✅ Found ${response.data.orders.length} orders`);
      } else if (Array.isArray(response.data)) {
        // Format 2: Direct array of orders
        setOrders(response.data);
        console.log(`✅ Found ${response.data.length} orders`);
      } else {
        console.warn('⚠️ API response format unexpected:', response.data);
        setOrders([]);
        
        // If the API returns a message, display it
        if (response.data && response.data.message) {
          setError(`Server message: ${response.data.message}`);
        } else {
          setError('Unexpected API response format');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      
      // Enhanced error reporting
      let errorMessage = `Failed to load orders: ${err.message}`;
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += ` (Status: ${err.response.status})`;
        
        if (err.response.data && err.response.data.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
        
        if (err.response.status === 500) {
          errorMessage += ' - There appears to be an issue with the server. Please try again later.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
      }
      
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete an order
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      await axios.delete(`/orderDetails/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      alert('Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  // Filter orders based on status and search term
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filter by status
      if (filter !== 'all' && order.status !== filter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const searchFields = [
          order._id,
          order.contact?.emailOrPhone,
          order.delivery?.firstName,
          order.delivery?.lastName
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchFields.includes(term)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if order is new (within last 24 hours)
  const isNewOrder = (order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Orders within last 24 hours are "new"
  };

  // Check if order needs attention (new + pending)
  const needsAttention = (order) => {
    return isNewOrder(order) && order.status === 'Pending';
  };

  // Render loading state
  if (loading) {
    return (
      <div className="r_om_list_loading">
        <div className="r_om_list_spinner"></div>
        <h2>Loading orders...</h2>
        <p>Please wait while we fetch order data.</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <ApiErrorDisplay 
        error={error}
        endpoint="/orderDetails"
        onRetry={fetchOrders}
        showDebug={true}
      />
    );
  }

  // Main render
  return (
    <div className="r_om_list_container">
      <div className="r_om_list_header">
        <h1 className="r_om_list_title">Order Management</h1>
        
        <div className="r_om_list_actions_top">
          <Link to="/dashboard/admin/orders/report" className="r_om_list_report_btn">
            Generate Report
          </Link>
        </div>
        
        <div className="r_om_list_filters">
          <div className="r_om_list_filter_group">
            <label>Filter by Status:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="r_om_list_select"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="r_om_list_search_box">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="r_om_list_search_input"
            />
          </div>
        </div>
      </div>

      <div className="r_om_list_stats">
        <div className="r_om_list_stat_card">
          <h3>Total Orders</h3>
          <span className="r_om_list_stat_number">{orders.length}</span>
        </div>
        <div className="r_om_list_stat_card">
          <h3>Filtered Results</h3>
          <span className="r_om_list_stat_number">{getFilteredOrders().length}</span>
        </div>
        <div className="r_om_list_stat_card r_om_list_stat_new">
          <h3>New Orders (24h)</h3>
          <span className="r_om_list_stat_number r_om_list_stat_highlight">
            {orders.filter(isNewOrder).length}
          </span>
        </div>
        <div className="r_om_list_stat_card r_om_list_stat_attention">
          <h3>Needs Attention</h3>
          <span className="r_om_list_stat_number r_om_list_stat_urgent">
            {orders.filter(needsAttention).length}
          </span>
        </div>
      </div>

      {getFilteredOrders().length === 0 ? (
        <div className="r_om_list_no_orders">
          <h3>No Orders Found</h3>
          <p>
            {orders.length === 0
              ? "No orders have been placed yet. Orders will appear here once customers start purchasing."
              : "No orders match your current filter criteria."
            }
          </p>
        </div>
      ) : (
        <div className="r_om_list_table_wrapper">
          <table className="r_om_list_table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((order) => {
                const isNew = isNewOrder(order);
                const urgent = needsAttention(order);
                
                return (
                  <tr 
                    key={order._id}
                    className={`
                      ${isNew ? 'r_om_list_row_new' : ''} 
                      ${urgent ? 'r_om_list_row_urgent' : ''}
                    `}
                  >
                    <td className="r_om_list_order_id">
                      #{order._id?.slice(-6) || 'N/A'}
                      {isNew && <span className="r_om_list_new_badge">NEW</span>}
                      {urgent && <span className="r_om_list_urgent_badge">!</span>}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.delivery?.firstName || order.delivery?.lastName 
                        ? `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() 
                        : 'N/A'
                      }
                    </td>
                    <td>{order.contact?.emailOrPhone || 'N/A'}</td>
                    <td className="r_om_list_total">Rs. {order.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`r_om_list_status r_om_list_status-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="r_om_list_actions">
                      <Link
                        to={`/dashboard/admin/orders/${order._id}`}
                        className="r_om_list_view_btn"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="r_om_list_delete_btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;