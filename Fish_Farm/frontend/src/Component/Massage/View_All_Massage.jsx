import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Calendar,
  User
} from "lucide-react";
import axios from "axios";
import "./View_All_Massage.css";

const View_All_Massage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, read, unread
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on search and status
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.Message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "read" && notification.isRead) ||
      (filterStatus === "unread" && !notification.isRead);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  // Delete notification
  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      await fetchNotifications(); // Refresh the list
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Toggle read status
  const toggleReadStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}`, {
        isRead: !currentStatus
      });
      await fetchNotifications(); // Refresh the list
    } catch (error) {
      console.error("Error updating notification:", error);
      alert("Failed to update notification");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="view-massage-container">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="view-massage-container">
      <div className="view-massage-header">
        <div className="header-title">
          <Bell size={32} className="header-icon" />
          <div>
            <h1>All Notifications</h1>
            <p>Manage and view all system notifications</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {notifications.filter(n => !n.isRead).length}
            </span>
            <span className="stat-label">Unread</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="table-container">
        <table className="notifications-table">
          <thead>
            <tr>
              <th className="status-col">Status</th>
              <th className="title-col">Title</th>
              <th className="message-col">Message</th>
              <th className="date-col">Date</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentNotifications.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No notifications found
                </td>
              </tr>
            ) : (
              currentNotifications.map((notification) => (
                <tr 
                  key={notification._id} 
                  className={notification.isRead ? 'read' : 'unread'}
                >
                  <td className="status-cell">
                    <div className="status-indicator">
                      <div className={`status-dot ${notification.isRead ? 'read' : 'unread'}`} />
                      <span className="status-text">
                        {notification.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </td>
                  <td className="title-cell">
                    <div className="title-content">
                      <strong>{notification.Title}</strong>
                    </div>
                  </td>
                  <td className="message-cell">
                    <div className="message-content">
                      {notification.Message}
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-content">
                      <Calendar size={14} />
                      {formatDate(notification.Date)}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-buttons">
                      <button
                        className="action-btn toggle-read-btn"
                        onClick={() => toggleReadStatus(notification._id, notification.isRead)}
                        title={notification.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {notification.isRead ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteNotification(notification._id)}
                        disabled={deleteLoading === notification._id}
                        title="Delete notification"
                      >
                        {deleteLoading === notification._id ? (
                          "Deleting..."
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="summary-section">
        <div className="summary-item">
          <span>Showing {currentNotifications.length} of {filteredNotifications.length} notifications</span>
        </div>
        <div className="summary-item">
          <span>{notifications.filter(n => !n.isRead).length} unread notifications</span>
        </div>
      </div>
    </div>
  );
};

export default View_All_Massage;