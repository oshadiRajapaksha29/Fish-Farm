import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_a_o_styles.css';
import api from '../../../api'; // Import the centralized API config

const EnhancedAdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [notes, setNotes] = useState('');
  const [saveNotes, setSaveNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orderDetails/${orderId}`);
        
        // Handle different response formats
        let orderData;
        if (response.data && response.data.success && response.data.order) {
          // Format 1: { success: true, order: {...} }
          orderData = response.data.order;
        } else if (response.data && typeof response.data === 'object') {
          // Format 2: Direct order object
          orderData = response.data;
        } else {
          throw new Error('Invalid response format');
        }
        
        setOrder(orderData);
        setNewStatus(orderData.status || 'Pending');
        setTrackingId(orderData.trackingId || '');
        setTrackingInfo(orderData.trackingInfo || '');
        setNotes(orderData.notes || '');
        
        // Set status history if available
        if (orderData.statusHistory && orderData.statusHistory.length > 0) {
          setStatusHistory(orderData.statusHistory);
        } else {
          // Create a default history entry
          setStatusHistory([
            {
              status: orderData.status || 'Pending',
              date: orderData.createdAt,
              user: 'System'
            }
          ]);
        }
        
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(`Failed to load order details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      
      // Create a new history entry
      const newHistoryEntry = {
        status: newStatus,
        date: new Date().toISOString(),
        user: 'Admin' // In a real app, use the logged-in user's name
      };
      
      // Update order with new status and tracking info
      const updateData = { 
        status: newStatus,
        trackingId: trackingId,
        trackingInfo: trackingInfo,
        statusHistory: [...statusHistory, newHistoryEntry]
      };
      
      // Add notes if save notes is checked
      if (saveNotes && notes) {
        updateData.notes = notes;
      }
      
      const response = await api.put(`/orderDetails/${orderId}/status`, updateData);
      
      if (response.data) {
        // Update local state
        setOrder({ 
          ...order, 
          status: newStatus,
          trackingId,
          trackingInfo,
          notes: saveNotes ? notes : order.notes,
          statusHistory: [...statusHistory, newHistoryEntry]
        });
        
        // Update status history
        setStatusHistory([...statusHistory, newHistoryEntry]);
        alert('Order updated successfully');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert(`Failed to update order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrder = () => {
    const printContent = printRef.current;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleDeleteOrder = async () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await api.delete(`/orderDetails/${orderId}`);
        alert('Order deleted successfully');
        navigate('/dashboard/admin/orders'); // Redirect back to orders list
      } catch (err) {
        console.error('Error deleting order:', err);
        alert(`Failed to delete order: ${err.message}`);
      }
    }
  };

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Calculate order total
  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Get appropriate status badge class
  const getStatusClass = (status) => {
    if (!status) return 'r_a_o_status-pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'r_a_o_status-pending';
    if (statusLower.includes('confirmed') || statusLower.includes('processing')) return 'r_a_o_status-processing';
    if (statusLower.includes('shipped')) return 'r_a_o_status-shipped';
    if (statusLower.includes('delivered')) return 'r_a_o_status-delivered';
    if (statusLower.includes('cancelled')) return 'r_a_o_status-cancelled';
    
    return 'r_a_o_status-pending';
  };

  if (loading) {
    return <div className="r_a_o_loading">Loading order details...</div>;
  }

  if (error) {
    return <div className="r_a_o_error">{error}</div>;
  }

  if (!order) {
    return <div className="r_a_o_error">Order not found</div>;
  }

  return (
    <div className="r_a_o_order-detail-container">
      <div className="r_a_o_order-detail-header">
        <div>
          <Link to="/dashboard/admin/orders" className="r_a_o_back-link">
            ← Back to Orders
          </Link>
          <h1>Order #{order.orderId || order._id?.slice(-6)}</h1>
        </div>
        
        <span className={`r_a_o_status ${getStatusClass(order.status)}`}>
          {order.status || 'Pending'}
        </span>
      </div>

      <div className="r_a_o_action-bar">
        <button className="r_a_o_print-btn" onClick={handlePrintOrder}>
          Print Order
        </button>
        <button className="r_a_o_delete-btn" onClick={handleDeleteOrder}>
          Delete Order
        </button>
      </div>

      <div ref={printRef} className="r_a_o_printable-content">
        <div className="r_a_o_order-panels">
          {/* Order Information Panel */}
          <div className="r_a_o_panel">
            <h2>Order Information</h2>
            <div className="r_a_o_panel-content">
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Order ID:</span>
                <span>{order.orderId || order._id}</span>
              </div>
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Date Placed:</span>
                <span>{formatDate(order.orderDate || order.createdAt)}</span>
              </div>
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Payment Method:</span>
                <span>{order.paymentMethod || order.payment?.method || 'N/A'}</span>
              </div>
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Payment Status:</span>
                <span>{order.paymentStatus || order.payment?.status || 'N/A'}</span>
              </div>
              {order.trackingId && (
                <div className="r_a_o_info-row">
                  <span className="r_a_o_info-label">Tracking ID:</span>
                  <span>{order.trackingId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Panel */}
          <div className="r_a_o_panel">
            <h2>Customer Information</h2>
            <div className="r_a_o_panel-content">
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Name:</span>
                <span>
                  {order.customerName || 
                   `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 
                   'N/A'}
                </span>
              </div>
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Email:</span>
                <span>{order.customerEmail || order.contact?.email || order.contact?.emailOrPhone || 'N/A'}</span>
              </div>
              <div className="r_a_o_info-row">
                <span className="r_a_o_info-label">Phone:</span>
                <span>{order.customerPhone || order.contact?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Panel */}
          <div className="r_a_o_panel">
            <h2>Shipping Address</h2>
            <div className="r_a_o_panel-content">
              {order.shippingAddress ? (
                <>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">Address:</span>
                    <span>{order.shippingAddress.address || 'N/A'}</span>
                  </div>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">City:</span>
                    <span>{order.shippingAddress.city || 'N/A'}</span>
                  </div>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">State/Province:</span>
                    <span>{order.shippingAddress.state || 'N/A'}</span>
                  </div>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">Postal Code:</span>
                    <span>{order.shippingAddress.postalCode || 'N/A'}</span>
                  </div>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">Country:</span>
                    <span>{order.shippingAddress.country || 'N/A'}</span>
                  </div>
                </>
              ) : order.delivery ? (
                <>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">Address:</span>
                    <span>{order.delivery.address || 'N/A'}</span>
                  </div>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">City:</span>
                    <span>{order.delivery.city || 'N/A'}</span>
                  </div>
                  <div className="r_a_o_info-row">
                    <span className="r_a_o_info-label">Postal Code:</span>
                    <span>{order.delivery.postalCode || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <div className="r_a_o_info-row">
                  <span>No shipping address provided</span>
                </div>
              )}
            </div>
          </div>

          {/* Status History Panel */}
          <div className="r_a_o_panel">
            <h2>
              Status History
              <button 
                className="r_a_o_toggle-btn" 
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide' : 'Show'}
              </button>
            </h2>
            {showHistory && (
              <div className="r_a_o_panel-content">
                <div className="r_a_o_status-timeline">
                  {statusHistory.length > 0 ? (
                    statusHistory.map((item, index) => (
                      <div key={index} className="r_a_o_timeline-item">
                        <div className="r_a_o_timeline-status">
                          <span className={`r_a_o_status ${getStatusClass(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="r_a_o_timeline-details">
                          <span className="r_a_o_timeline-date">{formatDate(item.date)}</span>
                          <span className="r_a_o_timeline-user">By: {item.user || 'System'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No status history available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Panel */}
        <div className="r_a_o_panel">
          <h2>Order Items</h2>
          <div className="r_a_o_panel-content">
            <table className="r_a_o_items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="r_a_o_product-info">
                          <span className="r_a_o_product-name">
                            {item.product ? (
                            // Handle different product types and their name fields
                            item.product.productName || 
                            item.product.product || 
                            (item.product.Species && item.product.subSpecies ? `${item.product.Species} - ${item.product.subSpecies}` : null) ||
                            'Unknown Product'
                            ) : (
                              // Fallback when product is not populated
                              item.productName || item.name || 'Product not found'
                            )}
                          </span>
                          <span className="r_a_o_product-id">
                            ID: {item.product ? item.product._id : (item.productId || item.product || 'N/A')}
                          </span>
                          {item.productType && (
                            <span className="r_a_o_product-type">
                              Type: {item.productType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>
                        Rs. {
                          item.product ? (
                            // Handle different price fields based on product type
                            item.productType === 'Fish' 
                              ? (item.product.PricePerCouple || 0).toFixed(2)
                              : (item.product.price || 0).toFixed(2)
                          ) : (
                            // Use stored price from order if product not populated
                            (item.price || 0).toFixed(2)
                          )
                        }
                      </td>
                      <td className="r_a_o_item-total">
                        Rs. {
                          item.product ? (
                            // Calculate based on populated product
                            item.productType === 'Fish' 
                              ? ((item.product.PricePerCouple || 0) * item.quantity).toFixed(2)
                              : ((item.product.price || 0) * item.quantity).toFixed(2)
                          ) : (
                            // Use stored price from order if product not populated
                            ((item.price || 0) * item.quantity).toFixed(2)
                          )
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No items in this order</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="r_a_o_total-label">Subtotal:</td>
                  <td>Rs. {order.subtotal?.toFixed(2) || calculateTotal(order.items).toFixed(2) || '0.00'}</td>
                </tr>
                {order.shippingFee && (
                  <tr>
                    <td colSpan="3" className="r_a_o_total-label">Shipping Fee:</td>
                    <td>Rs. {order.shippingFee.toFixed(2)}</td>
                  </tr>
                )}
                {order.tax && (
                  <tr>
                    <td colSpan="3" className="r_a_o_total-label">Tax:</td>
                    <td>Rs. {order.tax.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3" className="r_a_o_total-label">Total:</td>
                  <td>Rs. {order.totalAmount?.toFixed(2) || calculateTotal(order.items).toFixed(2) || '0.00'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Order Update Panel - Outside printable content */}
      <div className="r_a_o_panel r_a_o_update-panel">
        <h2>Update Order</h2>
        <div className="r_a_o_panel-content">
          <div className="r_a_o_update-form">
            <div className="r_a_o_form-row">
              <div className="r_a_o_form-group">
                <label>Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="r_a_o_select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="r_a_o_form-group">
                <label>Tracking ID:</label>
                <input
                  type="text"
                  className="r_a_o_text-input"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
            </div>

            <div className="r_a_o_form-group">
              <label>Tracking Information:</label>
              <input
                type="text"
                className="r_a_o_text-input"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
                placeholder="Enter carrier info or tracking URL"
              />
            </div>

            <div className="r_a_o_form-group">
              <label>Notes:</label>
              <textarea
                className="r_a_o_textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this order (internal use only)"
                rows={4}
              ></textarea>
              <div className="r_a_o_checkbox-group">
                <input
                  type="checkbox"
                  id="saveNotes"
                  checked={saveNotes}
                  onChange={() => setSaveNotes(!saveNotes)}
                />
                <label htmlFor="saveNotes">Save notes with this update</label>
              </div>
            </div>

            <div className="r_a_o_form-actions">
              <button
                className="r_a_o_update-btn"
                onClick={handleStatusUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Special Instructions */}
      {(order.notes || order.specialInstructions) && (
        <div className="r_a_o_panel">
          <h2>Previous Notes</h2>
          <div className="r_a_o_panel-content">
            <p>{order.notes || order.specialInstructions}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminOrderDetails;