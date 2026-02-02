import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  Monitor, 
  Clock,
  Shield,
  ShieldAlert,
  X,
  ChevronDown,
  RefreshCw
} from "lucide-react";

const LoginHistoryDashboard = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    country: "",
    role: "",
    startDate: "",
    endDate: "",
    email: ""
  });

  const fetchLoginHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:5000/admin/login-history?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      setLoginHistory(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });
    } catch (error) {
      console.error("Failed to fetch login history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginHistory();
  }, [pagination.page, filters]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchLoginHistory();
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      country: "",
      role: "",
      startDate: "",
      endDate: "",
      email: ""
    });
    setSearchTerm("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status === 'Success' ? '#065f46' : '#dc2626';
  };

  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    };
    if (status === 'Success') {
      return {
        ...baseStyle,
        backgroundColor: '#dcfce7',
        color: '#166534'
      };
    }
    return {
      ...baseStyle,
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    };
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '1.5rem'
    },
    maxWidth: {
      maxWidth: '80rem',
      margin: '0 auto'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#4b5563'
    },
    searchCard: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    searchContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    },
    searchContainerLg: {
      display: 'flex',
      flexDirection: 'row',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    searchInputContainer: {
      flex: 1,
      position: 'relative'
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      width: '1.25rem',
      height: '1.25rem'
    },
    searchInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.2s'
    },
    searchInputFocus: {
      borderColor: 'transparent',
      boxShadow: '0 0 0 2px #3b82f6'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.75rem'
    },
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: '#f3f4f6',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    filterButtonHover: {
      backgroundColor: '#e5e7eb'
    },
    refreshButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    refreshButtonHover: {
      backgroundColor: '#1d4ed8'
    },
    chevron: {
      width: '1rem',
      height: '1rem',
      transition: 'transform 0.2s'
    },
    chevronRotated: {
      transform: 'rotate(180deg)'
    },
    filtersContainer: {
      overflow: 'hidden'
    },
    filtersBorder: {
      borderTop: '1px solid #e5e7eb',
      marginTop: '1rem',
      paddingTop: '1rem'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem'
    },
    filtersGridMd: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    filtersGridLg: {
      gridTemplateColumns: 'repeat(4, 1fr)'
    },
    filterGroup: {
      marginBottom: '1rem'
    },
    filterLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    filterSelect: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'all 0.2s'
    },
    filterInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'all 0.2s'
    },
    clearFiltersContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '1rem'
    },
    clearFiltersButton: {
      color: '#4b5563',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    clearFiltersButtonHover: {
      color: '#1f2937',
      backgroundColor: '#f3f4f6'
    },
    resultsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem'
    },
    resultsText: {
      color: '#4b5563'
    },
    pageInfo: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    tableCard: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 0'
    },
    loadingSpinner: {
      width: '2rem',
      height: '2rem',
      color: '#2563eb',
      animation: 'spin 1s linear infinite'
    },
    loadingText: {
      marginLeft: '0.75rem',
      color: '#4b5563'
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '3rem 0'
    },
    emptyIcon: {
      width: '4rem',
      height: '4rem',
      color: '#d1d5db',
      margin: '0 auto 1rem'
    },
    emptyTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableOverflow: {
      overflowX: 'auto'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    th: {
      textAlign: 'left',
      padding: '1rem 1.5rem',
      fontWeight: '500',
      color: '#111827',
      fontSize: '0.875rem'
    },
    tbody: {
      backgroundColor: 'white'
    },
    tr: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s'
    },
    trHover: {
      backgroundColor: '#f9fafb'
    },
    td: {
      padding: '1rem 1.5rem',
      verticalAlign: 'top'
    },
    userContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    userAvatar: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '50%',
      backgroundColor: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.75rem'
    },
    userIcon: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#2563eb'
    },
    userName: {
      fontWeight: '500',
      color: '#111827'
    },
    userEmail: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      textTransform: 'capitalize'
    },
    locationContainer: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      color: '#4b5563'
    },
    locationIcon: {
      width: '1rem',
      height: '1rem',
      marginRight: '0.25rem'
    },
    timeContainer: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      color: '#4b5563'
    },
    clockIcon: {
      width: '1rem',
      height: '1rem',
      marginRight: '0.25rem'
    },
    ipAddress: {
      fontSize: '0.875rem',
      color: '#4b5563',
      fontFamily: 'monospace'
    },
    viewDetailsButton: {
      color: '#2563eb',
      fontWeight: '500',
      fontSize: '0.875rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    viewDetailsButtonHover: {
      color: '#1d4ed8'
    },
    paginationContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '1.5rem',
      gap: '0.5rem'
    },
    paginationButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    paginationButtonHover: {
      backgroundColor: '#f9fafb'
    },
    paginationButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    paginationButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 10000000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      maxWidth: '42rem',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    modalHeaderContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827'
    },
    modalCloseButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    modalCloseButtonHover: {
      backgroundColor: '#f3f4f6'
    },
    modalBody: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    modalGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    modalGridMd: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    modalSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    modalFieldLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.25rem'
    },
    modalFieldContent: {
      backgroundColor: '#f9fafb',
      padding: '1rem',
      borderRadius: '0.5rem'
    },
    modalUserName: {
      fontWeight: '500',
      color: '#111827'
    },
    modalUserEmail: {
      fontSize: '0.875rem',
      color: '#4b5563'
    },
    modalUserRole: {
      fontSize: '0.75rem',
      color: '#6b7280',
      textTransform: 'capitalize',
      marginTop: '0.25rem'
    },
    modalLocationItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    },
    modalLocationIcon: {
      width: '1rem',
      height: '1rem',
      marginRight: '0.5rem',
      color: '#9ca3af'
    },
    modalLocationText: {
      fontSize: '0.875rem',
      color: '#4b5563'
    },
    modalTechDetail: {
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    },
    modalTechLabel: {
      fontWeight: '500'
    },
    modalTechValue: {
      marginLeft: '0.5rem',
      color: '#4b5563'
    },
    modalTechValueMono: {
      marginLeft: '0.5rem',
      fontFamily: 'monospace',
      color: '#4b5563'
    },
    modalUserAgentContainer: {
      display: 'flex',
      alignItems: 'flex-start'
    },
    modalUserAgentIcon: {
      width: '1.25rem',
      height: '1.25rem',
      marginRight: '0.5rem',
      color: '#9ca3af',
      marginTop: '0.125rem'
    },
    modalUserAgentText: {
      fontSize: '0.875rem',
      color: '#4b5563',
      lineHeight: '1.5'
    }
  };

  // Add keyframes for spinner animation
  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{spinKeyframes}</style>
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Login History</h1>
            <p style={styles.subtitle}>Monitor user authentication activities and security events</p>
          </div>

          {/* Search and Filter Bar */}
          <div style={styles.searchCard}>
            <div style={window.innerWidth >= 1024 ? styles.searchContainerLg : styles.searchContainer}>
              <div style={styles.searchInputContainer}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by email, name, or IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearch}
                  style={styles.searchInput}
                  onFocus={(e) => Object.assign(e.target.style, styles.searchInputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.searchInput)}
                />
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={styles.filterButton}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.filterButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.filterButton)}
                >
                  <Filter style={{ width: '1.25rem', height: '1.25rem' }} />
                  Filters
                  <ChevronDown style={{
                    ...styles.chevron,
                    ...(showFilters ? styles.chevronRotated : {})
                  }} />
                </button>
                <button
                  onClick={fetchLoginHistory}
                  style={styles.refreshButton}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.refreshButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.refreshButton)}
                >
                  <RefreshCw style={{ width: '1.25rem', height: '1.25rem' }} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={styles.filtersContainer}
                >
                  <div style={styles.filtersBorder}>
                    <div style={{
                      ...styles.filtersGrid,
                      ...(window.innerWidth >= 768 ? styles.filtersGridMd : {}),
                      ...(window.innerWidth >= 1024 ? styles.filtersGridLg : {})
                    }}>
                      <div>
                        <label style={styles.filterLabel}>Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                          style={styles.filterSelect}
                        >
                          <option value="">All Statuses</option>
                          <option value="Success">Success</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                      <div>
                        <label style={styles.filterLabel}>Role</label>
                        <select
                          value={filters.role}
                          onChange={(e) => setFilters({...filters, role: e.target.value})}
                          style={styles.filterSelect}
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="employee">Employee</option>
                          <option value="customer">User</option>
                        </select>
                      </div>
                      <div>
                        <label style={styles.filterLabel}>Start Date</label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                          style={styles.filterInput}
                        />
                      </div>
                      <div>
                        <label style={styles.filterLabel}>End Date</label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                          style={styles.filterInput}
                        />
                      </div>
                    </div>
                    <div style={styles.clearFiltersContainer}>
                      <button
                        onClick={clearFilters}
                        style={styles.clearFiltersButton}
                        onMouseEnter={(e) => Object.assign(e.target.style, styles.clearFiltersButtonHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, styles.clearFiltersButton)}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Summary */}
          <div style={styles.resultsContainer}>
            <p style={styles.resultsText}>
              Showing {loginHistory.length} of {pagination.total} login attempts
            </p>
            <div style={styles.pageInfo}>
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {/* Login History Table */}
          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <RefreshCw style={styles.loadingSpinner} />
                <span style={styles.loadingText}>Loading login history...</span>
              </div>
            ) : loginHistory.length === 0 ? (
              <div style={styles.emptyContainer}>
                <Shield style={styles.emptyIcon} />
                <h3 style={styles.emptyTitle}>No login history found</h3>
                <p style={styles.emptyText}>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div style={styles.tableOverflow}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.th}>User</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Login Time</th>
                      <th style={styles.th}>IP Address</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={styles.tbody}>
                    {loginHistory.map((entry) => (
                      <motion.tr
                        key={entry._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={styles.tr}
                        onMouseEnter={(e) => Object.assign(e.target.style, styles.trHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, styles.tr)}
                      >
                        <td style={styles.td}>
                          <div style={styles.userContainer}>
                            <div style={styles.userAvatar}>
                              <User style={styles.userIcon} />
                            </div>
                            <div>
                              <div style={styles.userName}>{entry.user?.name || 'Unknown'}</div>
                              <div style={styles.userEmail}>{entry.email}</div>
                              <div style={styles.userRole}>{entry.user?.role || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadge(entry.status)}>
                            {entry.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.locationContainer}>
                            <MapPin style={styles.locationIcon} />
                            {entry.location.city}, {entry.location.country}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.timeContainer}>
                            <Clock style={styles.clockIcon} />
                            {formatDate(entry.loginTime)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.ipAddress}>
                            {entry.ipAddress}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            style={styles.viewDetailsButton}
                            onMouseEnter={(e) => Object.assign(e.target.style, styles.viewDetailsButtonHover)}
                            onMouseLeave={(e) => Object.assign(e.target.style, styles.viewDetailsButton)}
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={styles.paginationContainer}>
              <button
                onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                disabled={pagination.page === 1}
                style={{
                  ...styles.paginationButton,
                  ...(pagination.page === 1 ? styles.paginationButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (pagination.page !== 1) {
                    Object.assign(e.target.style, styles.paginationButtonHover);
                  }
                }}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.paginationButton)}
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination({...pagination, page: pageNum})}
                    style={{
                      ...styles.paginationButton,
                      ...(pageNum === pagination.page ? styles.paginationButtonActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (pageNum !== pagination.page) {
                        Object.assign(e.target.style, styles.paginationButtonHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      const baseStyle = pageNum === pagination.page 
                        ? styles.paginationButtonActive 
                        : styles.paginationButton;
                      Object.assign(e.target.style, baseStyle);
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination({...pagination, page: Math.min(pagination.totalPages, pagination.page + 1)})}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  ...styles.paginationButton,
                  ...(pagination.page === pagination.totalPages ? styles.paginationButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (pagination.page !== pagination.totalPages) {
                    Object.assign(e.target.style, styles.paginationButtonHover);
                  }
                }}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.paginationButton)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={styles.modal}
              >
                <div style={styles.modalHeader}>
                  <div style={styles.modalHeaderContent}>
                    <h3 style={styles.modalTitle}>Login Details</h3>
                    <button
                      onClick={() => setSelectedEntry(null)}
                      style={styles.modalCloseButton}
                      onMouseEnter={(e) => Object.assign(e.target.style, styles.modalCloseButtonHover)}
                      onMouseLeave={(e) => Object.assign(e.target.style, styles.modalCloseButton)}
                    >
                      <X style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  </div>
                </div>
                
                <div style={styles.modalBody}>
                  <div style={{
                    ...styles.modalGrid,
                    ...(window.innerWidth >= 768 ? styles.modalGridMd : {})
                  }}>
                    <div style={styles.modalSection}>
                      <div>
                        <label style={styles.modalFieldLabel}>User Information</label>
                        <div style={styles.modalFieldContent}>
                          <div style={styles.modalUserName}>{selectedEntry.user?.name || 'Unknown User'}</div>
                          <div style={styles.modalUserEmail}>{selectedEntry.email}</div>
                          <div style={styles.modalUserRole}>{selectedEntry.user?.role || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label style={styles.modalFieldLabel}>Location Details</label>
                        <div style={styles.modalFieldContent}>
                          <div style={styles.modalLocationItem}>
                            <MapPin style={styles.modalLocationIcon} />
                            {selectedEntry.location.city}, {selectedEntry.location.region}
                          </div>
                          <div style={styles.modalLocationText}>Country: {selectedEntry.location.country}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.modalSection}>
                      <div>
                        <label style={styles.modalFieldLabel}>Login Status</label>
                        <div style={styles.modalFieldContent}>
                          <span style={getStatusBadge(selectedEntry.status)}>
                            {selectedEntry.status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label style={styles.modalFieldLabel}>Technical Details</label>
                        <div style={styles.modalFieldContent}>
                          <div style={styles.modalTechDetail}>
                            <span style={styles.modalTechLabel}>IP Address:</span>
                            <span style={styles.modalTechValueMono}>{selectedEntry.ipAddress}</span>
                          </div>
                          <div style={styles.modalTechDetail}>
                            <span style={styles.modalTechLabel}>Login Time:</span>
                            <span style={styles.modalTechValue}>{formatDate(selectedEntry.loginTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label style={styles.modalFieldLabel}>User Agent</label>
                    <div style={styles.modalFieldContent}>
                      <div style={styles.modalUserAgentContainer}>
                        <Monitor style={styles.modalUserAgentIcon} />
                        <div style={styles.modalUserAgentText}>
                          {selectedEntry.userAgent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LoginHistoryDashboard;