import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './r_om_detail_styles.css';
import api from '../../../api'; // Import the centralized API config

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set a timeout to prevent long-hanging requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out after 10s')), 10000)
        );
        
        // Race between actual request and timeout
        const response = await Promise.race([
          api.get(`/orderDetails/${orderId}`),
          timeoutPromise
        ]);
        
        console.log('Order Details Response:', response.data);
        
        // Debug: Log the items structure
        if (response.data && (response.data.order || response.data)) {
          const orderData = response.data.order || response.data;
          console.log('Order items debug:', orderData.items);
          if (orderData.items && orderData.items.length > 0) {
            console.log('First item debug:', {
              product: orderData.items[0].product,
              productType: orderData.items[0].productType,
              productName: orderData.items[0].product?.productName || orderData.items[0].product?.product || (orderData.items[0].product?.Species && orderData.items[0].product?.subSpecies ? `${orderData.items[0].product.Species} - ${orderData.items[0].product.subSpecies}` : null),
              productId: orderData.items[0].product?._id || orderData.items[0].product
            });
          }
        }
        
        // Handle different response formats
        if (response.data && response.data.success && response.data.order) {
          // Format 1: { success: true, order: {...} }
          setOrder(response.data.order);
          setUpdatedStatus(response.data.order.status || 'Pending');
          // Remember last viewed order id for sidebar navigation
          try { localStorage.setItem('lastViewedOrderId', response.data.order._id); } catch (e) {}
        } else if (response.data && typeof response.data === 'object' && response.data._id) {
          // Format 2: Direct order object
          setOrder(response.data);
          setUpdatedStatus(response.data.status || 'Pending');
          // Remember last viewed order id for sidebar navigation
          try { localStorage.setItem('lastViewedOrderId', response.data._id); } catch (e) {}
        } else {
          // Handle unexpected response format
          console.warn('⚠️ Unexpected API response format:', response.data);
          
          if (response.data && response.data.message) {
            setError(`Server message: ${response.data.message}`);
          } else {
            setError('Failed to load order details: Unexpected response format');
          }
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        
        // Enhanced error reporting
        let errorMessage = `Failed to load order: ${err.message}`;
        
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

  // Update order status
  const updateOrderStatus = async () => {
    try {
      setLoading(true);
      
      const response = await api.put(`/orderDetails/${orderId}/status`, { 
        status: updatedStatus 
      });
      
      // Handle different response formats
      if (response.data && response.data.success && response.data.order) {
        // Format 1: { success: true, order: {...} }
        setOrder(response.data.order);
        alert('Order status updated successfully');
      } else if (response.data && typeof response.data === 'object') {
        // Format 2: Direct order object
        setOrder(prev => ({
          ...prev,
          status: updatedStatus
        }));
        alert('Order status updated successfully');
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="r_om_detail_loading">
        <div className="r_om_detail_spinner"></div>
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="r_om_detail_error">
        <h2>❌ Error Loading Order</h2>
        <p className="r_om_detail_error_message">{error || 'Order not found'}</p>
        
        <div className="r_om_detail_error_actions">
          <button 
            onClick={() => window.location.reload()}
            className="r_om_detail_retry_btn"
          >
            🔄 Retry
          </button>
          
          <Link to="/dashboard/admin/orders" className="r_om_detail_back_link">
            Back to Orders
          </Link>
        </div>
        
        <div className="r_om_detail_debug">
          <h3>🔧 Troubleshooting Information:</h3>
          <p>Order ID: {orderId}</p>
          <p>Endpoint: <code>/orderDetails/{orderId}</code></p>
          
          <h4>Possible Issues:</h4>
          <ul>
            <li>The order ID might not exist in the database</li>
            <li>The backend server might be experiencing issues</li>
            <li>There might be database connection problems</li>
            <li>The API endpoint might have changed</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="r_om_detail_container">
      <div className="r_om_detail_header">
        <Link to="/dashboard/admin/orders" className="r_om_detail_back_link">
          ← Back to Orders
        </Link>
        <h1>Order #{order._id.slice(-6)}</h1>
        <span className={`r_om_detail_status r_om_detail_status-${(order.status || 'pending').toLowerCase()}`}>
          {order.status || 'Pending'}
        </span>
      </div>

      <div className="r_om_detail_content">
        <div className="r_om_detail_panels">
          {/* Order Summary Panel */}
          <div className="r_om_detail_panel r_om_detail_order_summary">
            <h2>Order Summary</h2>
            <div className="r_om_detail_panel_content">
              <div className="r_om_detail_info_row">
                <span className="r_om_detail_info_label">Order ID:</span>
                <span className="r_om_detail_info_value">{order._id}</span>
              </div>
              <div className="r_om_detail_info_row">
                <span className="r_om_detail_info_label">Date Placed:</span>
                <span className="r_om_detail_info_value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="r_om_detail_info_row">
                <span className="r_om_detail_info_label">Total Amount:</span>
                <span className="r_om_detail_info_value r_om_detail_total">Rs. {order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="r_om_detail_info_row">
                <span className="r_om_detail_info_label">Payment Method:</span>
                <span className="r_om_detail_info_value">{order.payment?.method || 'N/A'}</span>
              </div>
              {order.payment?.method === "BANK_SLIP" && order.payment?.bankSlipImage && (
                <div className="r_om_detail_info_row">
                  <span className="r_om_detail_info_label">Bank Slip:</span>
                  <div className="r_om_detail_info_value">
                    <div className="r_om_detail_bank_slip_preview">
                      <img 
                        src={`http://localhost:5000/uploads/slips/${order.payment.bankSlipImage}`} 
                        alt="Bank slip" 
                        className="r_om_detail_slip_thumbnail"
                        onClick={() => window.open(`http://localhost:5000/uploads/slips/${order.payment.bankSlipImage}`, '_blank')}
                      />
                    </div>
                    <div className="r_om_detail_slip_actions">
                      <button 
                        className="r_om_detail_view_slip_btn"
                        onClick={() => window.open(`http://localhost:5000/uploads/slips/${order.payment.bankSlipImage}`, '_blank')}
                      >
                        View Slip
                      </button>
                      <a 
                        href={`http://localhost:5000/uploads/slips/${order.payment.bankSlipImage}`} 
                        download
                        className="r_om_detail_download_slip_btn"
                      >
                        Download Slip
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Panel */}
          <div className="r_om_detail_panel r_om_detail_customer_info">
            <h2>Customer Information</h2>
            <div className="r_om_detail_panel_content">
              <div className="r_om_detail_info_group">
                <h3>Contact</h3>
                <p>{order.contact?.emailOrPhone || 'N/A'}</p>
              </div>
              
              {order.delivery && (
                <div className="r_om_detail_info_group">
                  <h3>Delivery Address</h3>
                  <p>
                    {order.delivery.firstName} {order.delivery.lastName}<br />
                    {order.delivery.address}<br />
                    {order.delivery.city}, {order.delivery.postalCode}<br />
                    Phone: {order.delivery.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Panel */}
        <div className="r_om_detail_panel r_om_detail_order_items">
          <h2>Order Items</h2>
          <div className="r_om_detail_panel_content">
            <table className="r_om_detail_items_table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.map((item, index) => {
                  // Helper function to get product name
                  const getProductName = () => {
                    if (!item.product) return 'Product Not Available';
                    
                    // If product is an object (populated)
                    if (typeof item.product === 'object') {
                      return item.product.productName || 
                             item.product.product || 
                             item.product.name ||
                             (item.product.Species && item.product.subSpecies 
                               ? `${item.product.Species} - ${item.product.subSpecies}` 
                               : null) ||
                             `Product (ID: ${item.product._id?.toString().slice(-6) || 'Unknown'})`;
                    }
                    
                    // If product is just an ID string
                    return `Product ID: ${item.product.toString().slice(-6)}`;
                  };

                  // Helper function to get price - ALWAYS prefer item.price first!
                  const getPrice = () => {
                    // PRIORITY 1: Use the stored price from the order item
                    if (item.price !== undefined && item.price !== null && item.price > 0) {
                      return item.price;
                    }
                    
                    // PRIORITY 2: Try to get from populated product object
                    if (item.product && typeof item.product === 'object') {
                      if (item.productType === 'Fish') {
                        return item.product.PricePerCouple || 0;
                      } else {
                        return item.product.price || 0;
                      }
                    }
                    
                    // PRIORITY 3: Default to 0
                    return 0;
                  };

                  const itemPrice = getPrice();
                  const itemTotal = itemPrice * (item.quantity || 1);

                  return (
                    <tr key={index}>
                      <td className="r_om_detail_product_cell">
                        <div className="r_om_detail_product_info">
                          <span className="r_om_detail_product_name">
                            {getProductName()}
                          </span>
                          <span className="r_om_detail_product_id">
                            ID: {item.product?._id?.toString().slice(-8) || item.product?.toString().slice(-8) || 'N/A'}
                          </span>
                          {item.productType && (
                            <span className="r_om_detail_product_type">
                              Type: {item.productType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>Rs. {itemPrice.toFixed(2)}</td>
                      <td>{item.quantity || 1}</td>
                      <td className="r_om_detail_item_total">
                        Rs. {itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="r_om_detail_total_label">Total</td>
                  <td className="r_om_detail_total">Rs. {order.totalAmount?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Actions Panel */}
        <div className="r_om_detail_panel r_om_detail_order_actions">
          <h2>Order Actions</h2>
          <div className="r_om_detail_panel_content">
            <div className="r_om_detail_status_update">
              <div className="r_om_detail_status_form">
                <label htmlFor="status">Update Order Status:</label>
                <select 
                  id="status"
                  value={updatedStatus} 
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  className="r_om_detail_select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button 
                  onClick={updateOrderStatus} 
                  className="r_om_detail_update_btn"
                  disabled={updatedStatus === order.status}
                >
                  Update Status
                </button>
              </div>
              
              <div className="r_om_detail_action_buttons">
                <button 
                  onClick={() => window.print()} 
                  className="r_om_detail_print_btn"
                >
                  🖨️ Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
