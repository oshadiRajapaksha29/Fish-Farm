import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './OrderDetail.css';
import InvoiceGenerator from '../../Invoice/InvoiceGenerator';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  
  // Return/Refund states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('Refund');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnImages, setReturnImages] = useState([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/orderDetails/${id}`);
        setOrder(response.data.order);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'r_om_status_pending';
      case 'Confirmed': return 'r_om_status_confirmed';
      case 'Shipped': return 'r_om_status_shipped';
      case 'Delivered': return 'r_om_status_delivered';
      case 'Cancelled': return 'r_om_status_cancelled';
      default: return '';
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    
    try {
      const response = await axios.put(
        `http://localhost:5000/orderDetails/${id}/cancel`,
        { reason: cancelReason }
      );

      if (response.data.success) {
        alert('Order cancelled successfully!');
        // Update the order state with the cancelled order
        setOrder(response.data.order);
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        alert(response.data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to cancel order. Please try again.';
      alert(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnRequest = async () => {
    // Validation
    if (!returnReason) {
      alert('Please select a reason for return');
      return;
    }
    
    if (!returnDescription.trim()) {
      alert('Please provide a description for your return request');
      return;
    }
    
    if (returnDescription.trim().length < 20) {
      alert('Please provide a more detailed description (at least 20 characters)');
      return;
    }

    if (!window.confirm(`Are you sure you want to request a ${returnType.toLowerCase()}?`)) {
      return;
    }

    setSubmittingReturn(true);

    try {
      console.log('===========================================');
      console.log('SUBMITTING RETURN REQUEST');
      console.log('===========================================');
      console.log('Order ID:', order._id);
      console.log('Order Status:', order.status);
      console.log('Customer Name:', `${order.delivery?.firstName} ${order.delivery?.lastName}`);
      console.log('Email/Phone:', order.contact?.emailOrPhone);
      console.log('Phone:', order.delivery?.phone);
      console.log('Return Reason:', returnReason);
      console.log('Return Type:', returnType);
      console.log('Description length:', returnDescription.length);
      
      // Validate required fields before creating FormData
      if (!order._id) {
        throw new Error('Order ID is missing');
      }
      
      if (!order.delivery?.firstName || !order.delivery?.lastName) {
        throw new Error('Customer name is missing from order');
      }
      
      if (!order.contact?.emailOrPhone) {
        throw new Error('Customer email/phone is missing from order');
      }
      
      if (!order.delivery?.phone) {
        console.warn('⚠️ Warning: Phone number is missing, using email/phone instead');
      }
      
      if (!order.items || order.items.length === 0) {
        throw new Error('Order has no items');
      }
      
      // Prepare form data for multipart/form-data
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('customerName', `${order.delivery.firstName} ${order.delivery.lastName}`);
      formData.append('customerEmail', order.contact.emailOrPhone); // Assuming this contains email
      formData.append('customerPhone', order.delivery.phone || order.contact.emailOrPhone); // Fallback to email if phone missing
      formData.append('reason', returnReason);
      formData.append('description', returnDescription);
      formData.append('returnType', returnType);
      
      // Convert items array to JSON string for FormData compatibility
      const itemsData = order.items.map(item => {
        // Handle both populated (object) and unpopulated (string ID) product references
        const productId = typeof item.product === 'object' ? item.product._id : item.product;
        
        console.log('Processing item:', {
          original: item,
          productId: productId,
          productType: item.productType,
          quantity: item.quantity
        });
        
        return {
          product: productId,
          productType: item.productType,
          quantity: item.quantity
        };
      });
      console.log('Final items data to send:', itemsData);
      formData.append('items', JSON.stringify(itemsData));
      
      // Add images
      returnImages.forEach((image, idx) => {
        formData.append('images', image);
        console.log(`Image ${idx + 1}:`, image.name, `(${(image.size / 1024).toFixed(2)} KB)`);
      });
      console.log('Number of images:', returnImages.length);
      
      // Log all FormData entries for debugging
      console.log('\n📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}:`, value.name, `(${(value.size / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      console.log('\n🌐 Sending POST request to http://localhost:5000/returns');
      
      const response = await axios.post(
        'http://localhost:5000/returns',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Response received:', response.data);
      console.log('===========================================');

      if (response.data.success) {
        alert('Return request submitted successfully! We will review it and get back to you soon.');
        // Reset form
        setShowReturnModal(false);
        setReturnReason('');
        setReturnDescription('');
        setReturnType('Refund');
        setReturnImages([]);
      } else {
        alert(response.data.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error('===========================================');
      console.error('❌ RETURN REQUEST ERROR');
      console.error('===========================================');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('===========================================');
      
      let errorMsg = 'Failed to submit return request. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
        
        // If there are validation errors, show them
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMsg = err.response.data.errors.join(', ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert(`Error: ${errorMsg}`);
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + returnImages.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }
    
    // Validate file size (10MB each)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert('Each image must be less than 10MB');
      return;
    }
    
    setReturnImages([...returnImages, ...files]);
  };

  const removeImage = (index) => {
    setReturnImages(returnImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="r_om_loading">
        <div className="r_om_spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="r_om_error">{error}</div>;
  }

  if (!order) {
    return <div className="r_om_error">Order not found</div>;
  }

  return (
    <div className="r_om_container">
      <div className="r_om_header">
        <Link to="/my-orders" className="r_om_back_button">
          &larr; Back to My Orders
        </Link>
        <h2>Order Details</h2>
        <div className="r_om_order_id">Order #{order._id.slice(-8)}</div>
      </div>

      <div className="r_om_card">
        <div className="r_om_status_section">
          <div className="r_om_date">
            Ordered on: {formatDate(order.createdAt)}
          </div>
          <div className={`r_om_status ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>

        <div className="r_om_info_section">
          <div className="r_om_info_box">
            <h3>Shipping Address</h3>
            <div className="r_om_address_details">
              <p>{order.delivery.firstName} {order.delivery.lastName}</p>
              <p>{order.delivery.address}</p>
              {order.delivery.apartment && <p>{order.delivery.apartment}</p>}
              <p>{order.delivery.city}, {order.delivery.state} {order.delivery.pinCode}</p>
              <p>Phone: {order.delivery.phone}</p>
            </div>
          </div>

          <div className="r_om_info_box">
            <h3>Payment Information</h3>
            <div className="r_om_payment_details">
              <p><strong>Method:</strong> {order.payment.method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
              <p><strong>Total:</strong> Rs. {order.totalAmount.toFixed(2)}</p>
              {order.payment.bankSlipImage && (
                <div className="r_om_bank_slip">
                  <p><strong>Bank Slip:</strong></p>
                  <img 
                    src={`http://localhost:5000/uploads/slips/${order.payment.bankSlipImage}`} 
                    alt="Bank Slip" 
                    className="r_om_bank_slip_image"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="r_om_items_section">
          <h3>Order Items</h3>
          <table className="r_om_items_table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="r_om_item_name_cell">
                    {item.product?.image && (
                      <img 
                        src={`http://localhost:5000/uploads/${item.product.image}`} 
                        alt={item.product.productName} 
                        className="r_om_item_thumbnail"
                      />
                    )}
                    {item.product?.productName || "Product"}
                  </td>
                  <td>Rs. {item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">Total</td>
                <td>Rs. {order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="r_om_actions">
          {order.status === 'Pending' && (
            <button 
              className="r_om_btn r_om_cancel_btn" 
              onClick={() => setShowCancelModal(true)}
            >
              🚫 Cancel Order
            </button>
          )}
          {order.status === 'Delivered' && (
            <>
              <button 
                className="r_om_btn r_om_return_btn" 
                onClick={() => setShowReturnModal(true)}
              >
                ↩️ Request Return/Refund
              </button>
              <button className="r_om_btn">🔄 Buy Again</button>
            </>
          )}
          <button 
            className="r_om_btn r_om_invoice_btn" 
            onClick={() => setShowInvoice(true)}
          >
            📄 Download Invoice
          </button>
        </div>
      </div>
      
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="r_om_modal_overlay" onClick={() => setShowCancelModal(false)}>
          <div className="r_om_modal" onClick={(e) => e.stopPropagation()}>
            <div className="r_om_modal_header">
              <h3>Cancel Order</h3>
              <button 
                className="r_om_modal_close" 
                onClick={() => setShowCancelModal(false)}
              >
                ×
              </button>
            </div>
            <div className="r_om_modal_body">
              <p className="r_om_cancel_warning">
                ⚠️ Are you sure you want to cancel this order?
              </p>
              <label htmlFor="cancelReason">Reason for cancellation:</label>
              <textarea
                id="cancelReason"
                className="r_om_cancel_reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you're cancelling this order..."
                rows="4"
                required
              />
            </div>
            <div className="r_om_modal_footer">
              <button 
                className="r_om_btn r_om_btn_secondary" 
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button 
                className="r_om_btn r_om_btn_danger" 
                onClick={handleCancelOrder}
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Return/Refund Request Modal */}
      {showReturnModal && (
        <div className="r_om_modal_overlay" onClick={() => setShowReturnModal(false)}>
          <div className="r_om_modal r_om_return_modal" onClick={(e) => e.stopPropagation()}>
            <div className="r_om_modal_header">
              <h3>Request Return/Refund</h3>
              <button 
                className="r_om_modal_close" 
                onClick={() => setShowReturnModal(false)}
              >
                ×
              </button>
            </div>
            <div className="r_om_modal_body">
              <p className="r_om_return_info">
                ℹ️ Submit a return request for this order. We typically process requests within 2-3 business days.
              </p>
              
              {/* Return Type Selection */}
              <div className="r_om_form_group">
                <label>Return Type:</label>
                <div className="r_om_radio_group">
                  <label className="r_om_radio_label">
                    <input
                      type="radio"
                      name="returnType"
                      value="Refund"
                      checked={returnType === 'Refund'}
                      onChange={(e) => setReturnType(e.target.value)}
                    />
                    <span>💰 Refund</span>
                  </label>
                  <label className="r_om_radio_label">
                    <input
                      type="radio"
                      name="returnType"
                      value="Exchange"
                      checked={returnType === 'Exchange'}
                      onChange={(e) => setReturnType(e.target.value)}
                    />
                    <span>🔄 Exchange</span>
                  </label>
                </div>
              </div>

              {/* Reason Selection */}
              <div className="r_om_form_group">
                <label htmlFor="returnReason">Reason for Return: *</label>
                <select
                  id="returnReason"
                  className="r_om_select"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                >
                  <option value="">-- Select a reason --</option>
                  <option value="Defective Product">Defective Product</option>
                  <option value="Wrong Item Received">Wrong Item Received</option>
                  <option value="Product Not as Described">Not as Described</option>
                  <option value="Changed Mind">Changed Mind</option>
                  <option value="Damaged During Shipping">Damaged in Shipping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="r_om_form_group">
                <label htmlFor="returnDescription">
                  Description: * <span className="r_om_char_count">({returnDescription.length}/1000)</span>
                </label>
                <textarea
                  id="returnDescription"
                  className="r_om_textarea"
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Please provide detailed information about the issue (minimum 20 characters)..."
                  rows="5"
                  maxLength="1000"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="r_om_form_group">
                <label htmlFor="returnImages">
                  Upload Images (Optional - Max 5 images, 10MB each):
                </label>
                <input
                  type="file"
                  id="returnImages"
                  className="r_om_file_input"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  disabled={returnImages.length >= 5}
                />
                <p className="r_om_file_hint">
                  📷 Add photos of the product to help us process your request faster
                </p>
                
                {/* Image Previews */}
                {returnImages.length > 0 && (
                  <div className="r_om_image_previews">
                    {returnImages.map((image, index) => (
                      <div key={index} className="r_om_image_preview">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="r_om_remove_image"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          ×
                        </button>
                        <p className="r_om_image_name">{image.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items Summary */}
              <div className="r_om_return_items">
                <h4>Items to Return:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="r_om_return_item">
                    {item.product?.image && (
                      <img 
                        src={`http://localhost:5000/uploads/${item.product.image}`} 
                        alt={item.product.productName}
                      />
                    )}
                    <div className="r_om_return_item_details">
                      <p className="r_om_return_item_name">{item.product?.productName}</p>
                      <p className="r_om_return_item_qty">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="r_om_modal_footer">
              <button 
                className="r_om_btn r_om_btn_secondary" 
                onClick={() => setShowReturnModal(false)}
                disabled={submittingReturn}
              >
                Cancel
              </button>
              <button 
                className="r_om_btn r_om_btn_primary" 
                onClick={handleReturnRequest}
                disabled={submittingReturn || !returnReason || !returnDescription.trim()}
              >
                {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoice Generator Modal */}
      {showInvoice && (
        <InvoiceGenerator 
          orderId={id} 
          onClose={() => setShowInvoice(false)} 
        />
      )}
    </div>
  );
};

export default OrderDetail;
