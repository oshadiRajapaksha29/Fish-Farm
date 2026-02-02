import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getUserContact } from '../../../utils/userUtils';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [manualContact, setManualContact] = useState('');
  const [showContactInput, setShowContactInput] = useState(false);

  // Get user contact information from utility function
  const userContact = getUserContact();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders for contact:', userContact);
        
        // First, let's try getting all orders to see if the endpoint works
        const allOrdersResponse = await axios.get('http://localhost:5000/orderDetails');
        console.log('All available orders:', allOrdersResponse.data);
        
        if (!userContact) {
          console.log('No user contact found - showing debug information');
          setLoading(false);
          setError('No user contact found. Please enter your email/phone below to view your orders.');
          return;
        }
        
        // Now, use query parameter to filter orders by user contact information
        const response = await axios.get(`http://localhost:5000/orderDetails?contact=${encodeURIComponent(userContact)}`);
        console.log('Filtered orders response:', response.data);
        
        if (response.data.orders && response.data.orders.length > 0) {
          setOrders(response.data.orders);
          console.log('Orders set successfully:', response.data.orders);
          // Log first order items to check structure
          if (response.data.orders[0]?.items) {
            console.log('First order items:', response.data.orders[0].items);
          }
        } else {
          console.log('No orders found for this user contact');
          setOrders([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders. Please try again later.');
        setLoading(false);
      }
    };

    // Get contact from localStorage or userContact
    const contactToUse = userContact || localStorage.getItem('userContact');
    
    console.log('Current user contact:', contactToUse);
    console.log('localStorage userContact:', localStorage.getItem('userContact'));
    
    if (contactToUse) {
      fetchOrders();
    } else {
      console.log('No user contact found - you need to place an order first');
      setLoading(false);
      setError('No user contact found. Please enter your email/phone below to view your orders.');
    }
  }, [userContact]);

  const handleManualContactSearch = async () => {
    if (!manualContact.trim()) {
      alert('Please enter your email or phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search for orders with the manually entered contact
      const response = await axios.get(`http://localhost:5000/orderDetails?contact=${encodeURIComponent(manualContact.trim())}`);
      console.log('Manual search response:', response.data);
      
      if (response.data.orders && response.data.orders.length > 0) {
        setOrders(response.data.orders);
        // Save the contact for future use
        localStorage.setItem('userContact', manualContact.trim());
        setShowContactInput(false);
        console.log('Orders found and contact saved:', manualContact.trim());
      } else {
        setOrders([]);
        setError(`No orders found for contact: ${manualContact.trim()}`);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error searching for orders:', err);
      setError('Failed to search for orders. Please try again.');
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="r_m_o_loading">Loading your orders...</div>;
  }

  if (error) {
    return (
      <div className="r_m_o_error">
        <h2>My Orders</h2>
        <p>{error}</p>
        
        <div className="r_m_o_manual_contact_section">
          <p>Enter the email or phone number you used when placing your order:</p>
          <div className="r_m_o_contact_input_group">
            <input
              type="text"
              placeholder="Enter email or phone number"
              value={manualContact}
              onChange={(e) => setManualContact(e.target.value)}
              className="r_m_o_contact_input"
              onKeyPress={(e) => e.key === 'Enter' && handleManualContactSearch()}
            />
            <button 
              onClick={handleManualContactSearch}
              disabled={loading}
              className="r_m_o_search_orders_btn"
            >
              {loading ? 'Searching...' : 'Search Orders'}
            </button>
          </div>
        </div>

        <div className="r_m_o_debug_section">
          <p>Current saved contact: {localStorage.getItem('userContact') || 'None'}</p>
        </div>
        
        <Link to="/" className="r_m_o_shop_now_btn">Go Shopping</Link>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="r_m_o_empty">
        <h2>My Orders</h2>
        <p>No orders found for this contact.</p>
        
        <div className="r_m_o_manual_contact_section">
          <p>Try a different email or phone number:</p>
          <div className="r_m_o_contact_input_group">
            <input
              type="text"
              placeholder="Enter email or phone number"
              value={manualContact}
              onChange={(e) => setManualContact(e.target.value)}
              className="r_m_o_contact_input"
              onKeyPress={(e) => e.key === 'Enter' && handleManualContactSearch()}
            />
            <button 
              onClick={handleManualContactSearch}
              disabled={loading}
              className="r_m_o_search_orders_btn"
            >
              {loading ? 'Searching...' : 'Search Orders'}
            </button>
          </div>
        </div>

        <div className="r_m_o_debug_section">
          <p>Current contact: {userContact || localStorage.getItem('userContact') || 'None'}</p>
        </div>
        
        <Link to="/" className="r_m_o_shop_now_btn">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="r_m_o_container">
      <div className="r_m_o_page_header">
        <h2>My Orders</h2>
      </div>
      
      <div className="r_m_o_filter_controls">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={filter === 'Pending' ? 'active' : ''} 
          onClick={() => setFilter('Pending')}
        >
          Pending ({orders.filter(o => o.status === 'Pending').length})
        </button>
        <button 
          className={filter === 'Confirmed' ? 'active' : ''} 
          onClick={() => setFilter('Confirmed')}
        >
          Confirmed ({orders.filter(o => o.status === 'Confirmed').length})
        </button>
        <button 
          className={filter === 'Shipped' ? 'active' : ''} 
          onClick={() => setFilter('Shipped')}
        >
          Shipped ({orders.filter(o => o.status === 'Shipped').length})
        </button>
        <button 
          className={filter === 'Delivered' ? 'active' : ''} 
          onClick={() => setFilter('Delivered')}
        >
          Delivered ({orders.filter(o => o.status === 'Delivered').length})
        </button>
      </div>

      <div className="r_m_o_orders_list">
        {getFilteredOrders().map((order) => (
          <div key={order._id} className="r_m_o_order_card">
            <div className="r_m_o_order_header">
              <div className="r_m_o_order_id">
                <span className="r_m_o_label">Order ID:</span>
                <span className="r_m_o_id_value">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="r_m_o_order_date">
                <span className="r_m_o_date_icon">📅</span>
                {order.createdAt ? formatDate(order.createdAt) : "N/A"}
              </div>
              <div className={`r_m_o_order_status r_m_o_status_${(order.status || 'pending').toLowerCase()}`}>
                {order.status || "Pending"}
              </div>
            </div>
            
            <div className="r_m_o_order_items_advanced">
              <div className="r_m_o_items_header">
                <span>Product</span>
                <span>Type</span>
                <span>Quantity</span>
                <span>Price</span>
              </div>
              {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  // Detailed logging for debugging
                  console.log(`=== Order Item ${index} ===`);
                  console.log('Full item object:', JSON.stringify(item, null, 2));
                  console.log('item.product type:', typeof item.product);
                  console.log('item.product value:', item.product);
                  
                  // Get product name based on product type and available fields
                  let productName = 'Loading...';
                  let productSubtitle = '';
                  
                  // Check if product is an object (populated) or just an ID (string)
                  if (item.product && typeof item.product === 'object') {
                    console.log('Product is populated object:', item.product);
                    
                    if (item.productType === 'Fish') {
                      // For Fish: primary name is subSpecies, subtitle is Species
                      productName = item.product.subSpecies || item.product.Species || 'Fish Product';
                      if (item.product.Species && item.product.subSpecies) {
                        productSubtitle = item.product.Species;
                      }
                      console.log('Fish product name:', productName, 'subtitle:', productSubtitle);
                    } else if (item.productType === 'Food&MedicineModel') {
                      // For Food & Medicine: use productName or name
                      productName = item.product.productName || item.product.name || 'Food & Medicine Product';
                      console.log('Food&Medicine product name:', productName);
                    } else if (item.productType === 'Accessory') {
                      // For Accessories: use product, name, or productName
                      productName = item.product.product || item.product.name || item.product.productName || 'Accessory Product';
                      console.log('Accessory product name:', productName);
                    } else {
                      // Generic fallback
                      productName = item.product.productName || 
                                   item.product.name || 
                                   item.product.product ||
                                   item.product.subSpecies ||
                                   item.product.Species ||
                                   'Product';
                      console.log('Generic product name:', productName);
                    }
                  } else if (typeof item.product === 'string') {
                    // Product is not populated, just an ID
                    console.log('Product is NOT populated (ID only):', item.product);
                    productName = `Product ID: ${item.product.substring(0, 8)}...`;
                  } else {
                    console.log('Product is undefined or invalid');
                    productName = 'Product information unavailable';
                  }
                  
                  // Get product type display name
                  const productType = item.productType || 'N/A';
                  
                  return (
                    <div key={index} className="r_m_o_order_item_advanced">
                      <div className="r_m_o_product_info">
                        <div className="r_m_o_product_name_adv">
                          {productName}
                        </div>
                        {productSubtitle && (
                          <div className="r_m_o_product_species">{productSubtitle}</div>
                        )}
                      </div>
                      <div className="r_m_o_product_type">
                        <span className="r_m_o_type_badge">{productType}</span>
                      </div>
                      <div className="r_m_o_product_quantity">
                        <span className="r_m_o_qty_value">×{item.quantity || 0}</span>
                      </div>
                      <div className="r_m_o_product_price">
                        Rs. {item.price ? Number(item.price).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="r_m_o_no_items">No items found for this order</div>
              )}
            </div>
            
            <div className="r_m_o_order_footer">
              <div className="r_m_o_order_total">
                <span className="r_m_o_total_label">Total Amount:</span>
                <span className="r_m_o_total_value">Rs. {order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}</span>
              </div>
              <Link to={`/my-orders/${order._id}`} className="r_m_o_view_details_btn">
                View Full Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
