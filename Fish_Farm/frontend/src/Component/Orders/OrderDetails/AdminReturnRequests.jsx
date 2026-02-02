import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminReturnRequests.css';

const AdminReturnRequests = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('Bank Transfer');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = statusFilter 
        ? `http://localhost:5000/returns?status=${statusFilter}`
        : 'http://localhost:5000/returns';
      
      console.log('Fetching returns from:', url);
      const response = await axios.get(url);
      
      console.log('Returns response:', response.data);
      
      const returnRequests = response.data.returnRequests || response.data || [];
      
      // Validate each return request has required fields
      const validatedReturns = returnRequests.filter(ret => {
        if (!ret || !ret._id) {
          console.warn('Invalid return request (missing _id):', ret);
          return false;
        }
        return true;
      });
      
      setReturns(validatedReturns);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch returns:', err);
      setError(err.response?.data?.message || 'Failed to load return requests');
      setReturns([]); // Set empty array on error
      setLoading(false);
    }
  };

  const handleViewDetails = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setNewStatus(returnRequest.status);
    setAdminResponse('');
    setRefundAmount('');
    setRefundMethod('Bank Transfer');
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    if (!adminResponse.trim()) {
      alert('Please provide a response message');
      return;
    }

    if (newStatus === 'Completed' && !refundAmount) {
      alert('Please enter the refund amount for completed returns');
      return;
    }

    setUpdating(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/returns/${selectedReturn._id}/status`,
        {
          status: newStatus,
          adminResponse: adminResponse,
          respondedBy: 'Admin', // You can get this from auth context
          refundAmount: newStatus === 'Completed' ? parseFloat(refundAmount) : undefined,
          refundMethod: newStatus === 'Completed' ? refundMethod : undefined,
        }
      );

      if (response.data.success) {
        alert('Return request updated successfully!');
        setShowDetailModal(false);
        fetchReturns(); // Reload the list
      } else {
        alert(response.data.message || 'Failed to update return request');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.message || 'Failed to update return request');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReturn = async (returnId) => {
    if (!window.confirm('Are you sure you want to delete this return request?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/returns/${returnId}`);
      
      if (response.data.success) {
        alert('Return request deleted successfully');
        fetchReturns();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete return request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'r_ao_r_status_pending';
      case 'Approved': return 'r_ao_r_status_approved';
      case 'Rejected': return 'r_ao_r_status_rejected';
      case 'Processing': return 'r_ao_r_status_processing';
      case 'Completed': return 'r_ao_r_status_completed';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="r_ao_r_loading">
        <div className="r_ao_r_spinner"></div>
        <p>Loading return requests...</p>
      </div>
    );
  }

  if (error) {
    return <div className="r_ao_r_error">{error}</div>;
  }

  return (
    <div className="r_ao_r_container">
      <div className="r_ao_r_header">
        <h2>Return & Refund Requests</h2>
        <div className="r_ao_r_stats">
          <div className="r_ao_r_stat_card">
            <span className="r_ao_r_stat_value">{returns.length}</span>
            <span className="r_ao_r_stat_label">Total Requests</span>
          </div>
          <div className="r_ao_r_stat_card">
            <span className="r_ao_r_stat_value">
              {returns.filter(r => r.status === 'Pending').length}
            </span>
            <span className="r_ao_r_stat_label">Pending</span>
          </div>
          <div className="r_ao_r_stat_card">
            <span className="r_ao_r_stat_value">
              {returns.filter(r => r.status === 'Approved').length}
            </span>
            <span className="r_ao_r_stat_label">Approved</span>
          </div>
        </div>
      </div>

      <div className="r_ao_r_filters">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="r_ao_r_select"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {returns.length === 0 ? (
        <div className="r_ao_r_empty">
          <p>No return requests found</p>
        </div>
      ) : (
        <div className="r_ao_r_table_container">
          <table className="r_ao_r_table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Reason</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnRequest) => (
                <tr key={returnRequest._id}>
                  <td>#{returnRequest._id?.slice(-8) || 'N/A'}</td>
                  <td>
                    <div className="r_ao_r_customer_info">
                      <strong>{returnRequest.customerName || 'N/A'}</strong>
                      <small>{returnRequest.customerEmail || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    {returnRequest.order && returnRequest.order._id 
                      ? `#${returnRequest.order._id.slice(-8)}` 
                      : returnRequest.order 
                        ? `#${String(returnRequest.order).slice(-8)}`
                        : 'N/A'}
                  </td>
                  <td>{returnRequest.reason || 'N/A'}</td>
                  <td>
                    <span className={`r_ao_r_type_badge r_ao_r_type_${(returnRequest.returnType || 'return').toLowerCase()}`}>
                      {returnRequest.returnType || 'Return'}
                    </span>
                  </td>
                  <td>
                    <span className={`r_ao_r_status_badge ${getStatusBadgeClass(returnRequest.status)}`}>
                      {returnRequest.status || 'Pending'}
                    </span>
                  </td>
                  <td>{returnRequest.createdAt ? formatDate(returnRequest.createdAt) : 'N/A'}</td>
                  <td>
                    <div className="r_ao_r_actions">
                      <button
                        className="r_ao_r_btn r_ao_r_btn_view"
                        onClick={() => handleViewDetails(returnRequest)}
                      >
                        View Details
                      </button>
                      <button
                        className="r_ao_r_btn r_ao_r_btn_delete"
                        onClick={() => handleDeleteReturn(returnRequest._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReturn && (
        <div className="r_ao_r_modal_overlay" onClick={() => setShowDetailModal(false)}>
          <div className="r_ao_r_modal" onClick={(e) => e.stopPropagation()}>
            <div className="r_ao_r_modal_header">
              <h3>Return Request Details</h3>
              <button 
                className="r_ao_r_modal_close" 
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="r_ao_r_modal_body">
              {/* Customer Info */}
              <div className="r_ao_r_section">
                <h4>Customer Information</h4>
                <div className="r_ao_r_info_grid">
                  <div className="r_ao_r_info_item">
                    <label>Name:</label>
                    <span>{selectedReturn.customerName || 'N/A'}</span>
                  </div>
                  <div className="r_ao_r_info_item">
                    <label>Email:</label>
                    <span>{selectedReturn.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="r_ao_r_info_item">
                    <label>Phone:</label>
                    <span>{selectedReturn.customerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Return Details */}
              <div className="r_ao_r_section">
                <h4>Return Details</h4>
                <div className="r_ao_r_info_grid">
                  <div className="r_ao_r_info_item">
                    <label>Order ID:</label>
                    <span>
                      {selectedReturn.order && selectedReturn.order._id 
                        ? `#${selectedReturn.order._id.slice(-8)}` 
                        : selectedReturn.order 
                          ? `#${String(selectedReturn.order).slice(-8)}`
                          : 'N/A'}
                    </span>
                  </div>
                  <div className="r_ao_r_info_item">
                    <label>Return Type:</label>
                    <span className={`r_ao_r_type_badge r_ao_r_type_${(selectedReturn.returnType || 'return').toLowerCase()}`}>
                      {selectedReturn.returnType || 'Return'}
                    </span>
                  </div>
                  <div className="r_ao_r_info_item">
                    <label>Reason:</label>
                    <span>{selectedReturn.reason || 'N/A'}</span>
                  </div>
                  <div className="r_ao_r_info_item r_ao_r_info_full">
                    <label>Description:</label>
                    <p className="r_ao_r_description">{selectedReturn.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* Items to Return */}
              <div className="r_ao_r_section">
                <h4>Items to Return</h4>
                <div className="r_ao_r_items_list">
                  {selectedReturn.items && selectedReturn.items.length > 0 ? (
                    selectedReturn.items.map((item, index) => (
                      <div key={index} className="r_ao_r_item">
                        <span>Product Type: {item.productType || 'N/A'}</span>
                        <span>Quantity: {item.quantity || 0}</span>
                      </div>
                    ))
                  ) : (
                    <p>No items specified</p>
                  )}
                </div>
              </div>

              {/* Uploaded Images */}
              {selectedReturn.images && selectedReturn.images.length > 0 && (
                <div className="r_ao_r_section">
                  <h4>Uploaded Images</h4>
                  <div className="r_ao_r_images_grid">
                    {selectedReturn.images.map((image, index) => (
                      <a
                        key={index}
                        href={`http://localhost:5000/uploads/returns/${image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="r_ao_r_image_link"
                      >
                        <img 
                          src={`http://localhost:5000/uploads/returns/${image}`} 
                          alt={`Evidence ${index + 1}`}
                          className="r_ao_r_image"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Response Section */}
              <div className="r_ao_r_section r_ao_r_admin_section">
                <h4>Admin Response</h4>
                
                <div className="r_ao_r_form_group">
                  <label>Update Status:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="r_ao_r_select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="r_ao_r_form_group">
                  <label>Response Message: *</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Write your response to the customer..."
                    rows="4"
                    className="r_ao_r_textarea"
                  />
                </div>

                {newStatus === 'Completed' && (
                  <>
                    <div className="r_ao_r_form_group">
                      <label>Refund Amount: *</label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="Enter refund amount"
                        className="r_ao_r_input"
                      />
                    </div>
                    <div className="r_ao_r_form_group">
                      <label>Refund Method:</label>
                      <select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        className="r_ao_r_select"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Store Credit">Store Credit</option>
                        <option value="Original Payment Method">Original Payment Method</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedReturn.adminResponse && selectedReturn.adminResponse.message && (
                  <div className="r_ao_r_previous_response">
                    <h5>Previous Response:</h5>
                    <p>{selectedReturn.adminResponse.message}</p>
                    <small>
                      By {selectedReturn.adminResponse.respondedBy || 'Admin'} on{' '}
                      {selectedReturn.adminResponse.respondedAt ? formatDate(selectedReturn.adminResponse.respondedAt) : 'N/A'}
                    </small>
                  </div>
                )}
              </div>
            </div>

            <div className="r_ao_r_modal_footer">
              <button 
                className="r_ao_r_btn r_ao_r_btn_secondary" 
                onClick={() => setShowDetailModal(false)}
                disabled={updating}
              >
                Close
              </button>
              <button 
                className="r_ao_r_btn r_ao_r_btn_primary" 
                onClick={handleUpdateStatus}
                disabled={updating || !adminResponse.trim()}
              >
                {updating ? 'Updating...' : 'Update Status & Respond'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnRequests;
