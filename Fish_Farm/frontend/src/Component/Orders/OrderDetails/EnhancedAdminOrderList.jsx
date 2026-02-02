import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './r_a_o_styles.css';
import api from '../../../api'; // Import the centralized API config

// Enhanced AdminOrderList component with advanced filtering, sorting and batch operations
const EnhancedAdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate order statistics
  useEffect(() => {
    if (orders.length > 0) {
      const newStats = {
        total: orders.length,
        pending: orders.filter(order => order.status?.toLowerCase() === 'pending').length,
        confirmed: orders.filter(order => order.status?.toLowerCase() === 'confirmed').length,
        shipped: orders.filter(order => order.status?.toLowerCase() === 'shipped').length,
        delivered: orders.filter(order => order.status?.toLowerCase() === 'delivered').length,
        cancelled: orders.filter(order => order.status?.toLowerCase() === 'cancelled').length
      };
      setStats(newStats);
    }
  }, [orders]);

  // Function to fetch orders from API
  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from backend...');
      setLoading(true);
      setError(null);
      
      const response = await api.get('/orderDetails');
      console.log('Response data:', response.data);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        // Format 1: Direct array of orders
        setOrders(response.data);
        console.log(`Found ${response.data.length} orders`);
      } else if (response.data && response.data.success && Array.isArray(response.data.orders)) {
        // Format 2: { success: true, orders: [...] }
        setOrders(response.data.orders);
        console.log(`Found ${response.data.orders.length} orders`);
      } else {
        console.warn('API response format unexpected:', response.data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(`Failed to load orders: ${err.message}`);
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
      await api.delete(`/orderDetails/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      alert('Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  // Batch delete orders
  const batchDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
      return;
    }
    
    try {
      const deletePromises = selectedOrders.map(orderId => 
        api.delete(`/orderDetails/${orderId}`)
      );
      
      await Promise.all(deletePromises);
      
      // Remove deleted orders from state
      setOrders(orders.filter(order => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
      alert('Selected orders deleted successfully');
    } catch (err) {
      console.error('Error deleting orders in batch:', err);
      alert(`Failed to delete orders: ${err.message}`);
    }
  };

  // Function to update status in batch
  const updateOrdersStatus = async (newStatus) => {
    if (selectedOrders.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to update ${selectedOrders.length} orders to status: ${newStatus}?`)) {
      return;
    }
    
    try {
      const updatePromises = selectedOrders.map(orderId => 
        api.put(`/orderDetails/${orderId}/status`, { status: newStatus })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (selectedOrders.includes(order._id)) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setSelectedOrders([]);
      alert(`Status updated to ${newStatus} for selected orders`);
    } catch (err) {
      console.error('Error updating status in batch:', err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allOrderIds = filteredOrders.map(order => order._id);
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelectOrder = (e, orderId) => {
    if (e.target.checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }
    
    // Create CSV headers
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Contact',
      'Total Amount',
      'Status',
      'Payment Method'
    ].join(',');
    
    // Create CSV rows
    const rows = filteredOrders.map(order => [
      order._id || '',
      new Date(order.createdAt).toLocaleDateString() || '',
      `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'N/A',
      order.contact?.emailOrPhone || 'N/A',
      order.totalAmount?.toFixed(2) || '0.00',
      order.status || 'Pending',
      order.payment?.method || 'N/A'
    ].join(','));
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders based on search, status, and date
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filter by status
      if (statusFilter !== 'all' && order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      
      // Filter by date range
      if (dateFilter.startDate && new Date(order.createdAt) < new Date(dateFilter.startDate)) {
        return false;
      }
      
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59);
        if (new Date(order.createdAt) > endDate) {
          return false;
        }
      }
      
      // Filter by search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        
        // Search in order ID
        if (order._id?.toLowerCase().includes(term)) {
          return true;
        }
        
        // Search in customer name
        if (order.delivery?.firstName?.toLowerCase().includes(term) || 
            order.delivery?.lastName?.toLowerCase().includes(term)) {
          return true;
        }
        
        // Search in contact information
        if (order.contact?.emailOrPhone?.toLowerCase().includes(term)) {
          return true;
        }
        
        // If no matches, exclude this order
        return false;
      }
      
      // Include by default if no search term
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get current orders for pagination
  const filteredOrders = getFilteredOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter({ startDate: '', endDate: '' });
    setSortConfig({ key: 'createdAt', direction: 'desc' });
    setCurrentPage(1);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="r_a_o_loading">
        <h2>Loading orders...</h2>
        <p>Please wait while we fetch order data.</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="r_a_o_error">
        <h2>❌ Error Loading Orders</h2>
        <p>{error}</p>
        <button onClick={fetchOrders} className="r_a_o_retry-btn">
          🔄 Retry
        </button>
        <div className="r_a_o_debug">
          <h3>🔧 Debug Information:</h3>
          <p>API endpoint: /orderDetails</p>
          <p>Check if backend server is running</p>
          <p>Orders count: {orders.length}</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="r_a_o_container">
      <div className="r_a_o_header">
        <h1>Order Management</h1>
        
        <div className="r_a_o_actions">
          <button 
            className="r_a_o_export-btn"
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="r_a_o_stats">
        <div className="r_a_o_stat-card">
          <h3>Total Orders</h3>
          <span className="r_a_o_stat-number">{stats.total}</span>
        </div>
        <div className="r_a_o_stat-card">
          <h3>Pending</h3>
          <span className="r_a_o_stat-number r_a_o_pending">{stats.pending}</span>
        </div>
        <div className="r_a_o_stat-card">
          <h3>Confirmed</h3>
          <span className="r_a_o_stat-number r_a_o_processing">{stats.confirmed}</span>
        </div>
        <div className="r_a_o_stat-card">
          <h3>Shipped</h3>
          <span className="r_a_o_stat-number r_a_o_shipped">{stats.shipped}</span>
        </div>
        <div className="r_a_o_stat-card">
          <h3>Delivered</h3>
          <span className="r_a_o_stat-number r_a_o_delivered">{stats.delivered}</span>
        </div>
        <div className="r_a_o_stat-card">
          <h3>Cancelled</h3>
          <span className="r_a_o_stat-number r_a_o_cancelled">{stats.cancelled}</span>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="r_a_o_advanced-filters">
        <div className="r_a_o_filter-row">
          <input
            type="text"
            placeholder="Search by ID, name, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="r_a_o_search-input"
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="r_a_o_select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="r_a_o_filter-row">
          <div className="r_a_o_date-filter">
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="r_a_o_date-input"
              placeholder="Start Date"
            />
            <span className="r_a_o_date-separator">to</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="r_a_o_date-input"
              placeholder="End Date"
            />
          </div>
          
          <button onClick={resetFilters} className="r_a_o_reset-btn">
            Reset Filters
          </button>
        </div>

        {/* Batch Actions */}
        {selectedOrders.length > 0 && (
          <div className="r_a_o_batch-actions">
            <span className="r_a_o_selected-count">
              {selectedOrders.length} orders selected
            </span>
            
            <div className="r_a_o_batch-buttons">
              <select 
                className="r_a_o_select" 
                onChange={(e) => {
                  if (e.target.value) {
                    updateOrdersStatus(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Update status...</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              <button 
                onClick={batchDeleteOrders} 
                className="r_a_o_delete-btn"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="r_a_o_no-orders">
          <h3>No Orders Found</h3>
          <p>
            {orders.length === 0
              ? "No orders have been placed yet. Orders will appear here once customers start purchasing."
              : "No orders match your current filter criteria. Try adjusting your filters."
            }
          </p>
        </div>
      ) : (
        <>
          <div className="r_a_o_table-wrapper">
            <table className="r_a_o_table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox"
                      checked={
                        selectedOrders.length > 0 && 
                        selectedOrders.length === filteredOrders.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => requestSort('_id')}>
                    Order ID {sortConfig.key === '_id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('createdAt')}>
                    Date {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Customer</th>
                  <th onClick={() => requestSort('totalAmount')}>
                    Total {sortConfig.key === 'totalAmount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('status')}>
                    Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => handleSelectOrder(e, order._id)}
                      />
                    </td>
                    <td className="r_a_o_order-id">#{order._id?.slice(-6) || 'N/A'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.delivery?.firstName || order.delivery?.lastName 
                        ? `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() 
                        : 'N/A'
                      }
                    </td>
                    <td className="r_a_o_total">Rs. {order.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`r_a_o_status r_a_o_status-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="r_a_o_actions">
                      <Link
                        to={`/dashboard/admin/orders/${order._id}`}
                        className="r_a_o_view-btn"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="r_a_o_delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="r_a_o_pagination">
              <button 
                onClick={() => paginate(1)} 
                disabled={currentPage === 1}
                className="r_a_o_page-btn"
              >
                First
              </button>
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="r_a_o_page-btn"
              >
                Previous
              </button>
              
              <div className="r_a_o_page-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="r_a_o_page-btn"
              >
                Next
              </button>
              <button 
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="r_a_o_page-btn"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedAdminOrderList;