import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFilePdf, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../../api';
import './r_om_report_styles.css';
import OrderReportGenerator from './OrderReportGenerator';

/**
 * OrderManagementReport - A component for generating and downloading order reports
 * CSS class prefix: r_o_m_r (Report Order Management Report)
 */
const OrderManagementReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [dateRangeError, setDateRangeError] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders from API
  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders for report...');
      setLoading(true);
      setError(null);

      const response = await api.get('/orderDetails');
      console.log('📦 Response data:', response.data);

      // Handle different response formats
      if (response.data && response.data.success && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
        console.log(`✅ Found ${response.data.orders.length} orders for report`);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
        console.log(`✅ Found ${response.data.length} orders for report`);
      } else {
        console.warn('⚠️ API response format unexpected:', response.data);
        setOrders([]);
      }
    } catch (err) {
      console.error('❌ Error fetching orders for report:', err);
      setError(`Failed to load orders: ${err.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Apply filters to get filtered orders
  const getFilteredOrders = () => {
    // If there's a date range error, don't apply date filters
    const shouldApplyDateFilter = dateRange.startDate && dateRange.endDate && !dateRangeError;
    
    return orders.filter((order) => {
      // Filter by status
      if (filter !== 'all' && order.status !== filter) {
        return false;
      }

      // Filter by date range (only if we have valid dates)
      if (shouldApplyDateFilter) {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59); // Set to end of day

        if (orderDate < startDate || orderDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  // Calculate report statistics
  const calculateStatistics = () => {
    const filteredOrders = getFilteredOrders();
    
    // Total revenue
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Orders by status
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };
    
    filteredOrders.forEach(order => {
      if (order.status && statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });
    
    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      statusCounts
    };
  };

  // Generate and download PDF report
  const downloadPdfReport = () => {
    try {
      // Validate date range if both are provided
      if (dateRange.startDate || dateRange.endDate) {
        const isValid = validateDateRange(dateRange.startDate, dateRange.endDate);
        if (!isValid) {
          return; // Stop if validation fails
        }
      }
      
      const filteredOrders = getFilteredOrders();
      const filters = {
        status: filter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      const success = OrderReportGenerator.downloadPdfReport(
        filteredOrders,
        filters,
        stats
      );
      
      if (success) {
        alert('PDF report generated and download started.');
      }
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      alert(`Failed to generate PDF report: ${error.message}`);
    }
  };

  // Generate and download Excel report
  // Simplify: PDF only

  // Validate date range
  const validateDateRange = (startDate, endDate) => {
    // Clear any previous errors
    setDateRangeError('');
    
    // If both dates are empty, that's valid (no filter)
    if (!startDate && !endDate) {
      return true;
    }
    
    // If one date is filled but the other isn't
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setDateRangeError('Please select both start and end dates');
      return false;
    }
    
    // Parse the dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if end date is before start date
    if (end < start) {
      setDateRangeError('End date cannot be before start date');
      return false;
    }
    
    // Check if date range is more than 1 year
    const oneYearFromStart = new Date(start);
    oneYearFromStart.setFullYear(oneYearFromStart.getFullYear() + 1);
    
    if (end > oneYearFromStart) {
      setDateRangeError('Date range cannot exceed 1 year');
      return false;
    }
    
    // Check if start date is in the future
    const currentDate = new Date();
    if (start > currentDate) {
      setDateRangeError('Start date cannot be in the future');
      return false;
    }
    
    return true;
  };

  // Handle date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    const updatedDateRange = {
      ...dateRange,
      [name]: value
    };
    
    setDateRange(updatedDateRange);
    
    // Validate only if both dates have values or when clearing values
    if (
      (updatedDateRange.startDate && updatedDateRange.endDate) || 
      (name === 'startDate' && !value && !updatedDateRange.endDate) ||
      (name === 'endDate' && !value && !updatedDateRange.startDate)
    ) {
      validateDateRange(updatedDateRange.startDate, updatedDateRange.endDate);
    }
  };

  // Get statistics
  const stats = calculateStatistics();

  if (loading) {
    return (
      <div className="r_om_report_loading">
        <div className="r_om_report_spinner"></div>
        <h2>Loading report data...</h2>
        <p>Please wait while we fetch and process order data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="r_om_report_error">
        <h2>❌ Error Loading Report Data</h2>
        <p>{error}</p>
        <button onClick={fetchOrders} className="r_om_report_retry_btn">
          🔄 Retry
        </button>
        <Link to="/dashboard/admin/orders" className="r_om_report_back_link">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="r_om_report_container">
      <div className="r_om_report_header">
        <h1>Order Management Reports</h1>
        <p>Generate and download detailed reports about your orders</p>
      </div>

      <div className="r_om_report_filters">
        <div className="r_om_report_filter_group">
          <label>Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="r_om_report_select"
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="r_om_report_date_range">
          <label>Date Range:</label>
          <div className="r_om_report_date_inputs">
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className={`r_om_report_date_input ${dateRangeError ? 'r_om_report_input_error' : ''}`}
              max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
            />
            <span>to</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className={`r_om_report_date_input ${dateRangeError ? 'r_om_report_input_error' : ''}`}
              min={dateRange.startDate} // Prevent selecting dates before start date
            />
          </div>
          {dateRangeError && (
            <div className="r_om_report_error_message">
              <FaExclamationTriangle className="r_om_report_error_icon" />
              {dateRangeError}
            </div>
          )}
        </div>
      </div>

      <div className="r_om_report_actions">
        <button onClick={downloadPdfReport} className="r_om_report_action_btn r_om_report_pdf_btn">
          <FaFilePdf /> Download PDF
        </button>
      </div>

      <div className="r_om_report_summary_cards">
        <div className="r_om_report_card">
          <h3>Total Orders</h3>
          <div className="r_om_report_stat">{stats.totalOrders}</div>
        </div>
        <div className="r_om_report_card">
          <h3>Total Revenue</h3>
          <div className="r_om_report_stat">Rs. {stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="r_om_report_card">
          <h3>Delivered Orders</h3>
          <div className="r_om_report_stat">{stats.statusCounts.Delivered}</div>
        </div>
        <div className="r_om_report_card">
          <h3>Pending Orders</h3>
          <div className="r_om_report_stat">{stats.statusCounts.Pending}</div>
        </div>
      </div>

      <div className="r_om_report_report_content">
        <h2>Order Report Summary</h2>
        
        <div className="r_om_report_status_breakdown">
          <h3>Order Status Breakdown</h3>
          <div className="r_om_report_status_grid">
            <div className="r_om_report_status_item">
              <div className="r_om_report_status_label">Pending</div>
              <div className="r_om_report_status_count">{stats.statusCounts.Pending}</div>
            </div>
            <div className="r_om_report_status_item">
              <div className="r_om_report_status_label">Confirmed</div>
              <div className="r_om_report_status_count">{stats.statusCounts.Confirmed}</div>
            </div>
            <div className="r_om_report_status_item">
              <div className="r_om_report_status_label">Shipped</div>
              <div className="r_om_report_status_count">{stats.statusCounts.Shipped}</div>
            </div>
            <div className="r_om_report_status_item">
              <div className="r_om_report_status_label">Delivered</div>
              <div className="r_om_report_status_count">{stats.statusCounts.Delivered}</div>
            </div>
            <div className="r_om_report_status_item">
              <div className="r_om_report_status_label">Cancelled</div>
              <div className="r_om_report_status_count">{stats.statusCounts.Cancelled}</div>
            </div>
          </div>
        </div>

        <div className="r_om_report_table_container">
          <h3>Order List</h3>
          {getFilteredOrders().length === 0 ? (
            <div className="r_om_report_no_orders">
              <p>No orders found matching your filter criteria.</p>
            </div>
          ) : (
            <table className="r_om_report_table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredOrders().map((order) => (
                  <tr key={order._id}>
                    <td>{order._id?.slice(-6) || 'N/A'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.delivery?.firstName || order.delivery?.lastName 
                        ? `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() 
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <span className={`r_om_report_status r_om_report_status-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td>Rs. {order.totalAmount?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="r_om_report_footer">
        <p>Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        <p>Aqua-peak Fish Farm Order Management System</p>
      </div>
    </div>
  );
};

export default OrderManagementReport;