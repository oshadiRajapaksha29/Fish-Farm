import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Danger from '../../../../assets/userManagement/danger.jpg';
import CoverPhoto from '../../../../assets/userManagement/coverPhoto.jpg';
import DefaultDP from '../../../../assets/userManagement/defaultDP.png';
import './AccountsTable.css'; // Import the CSS file

function AccountsTable() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accountStatuses, setAccountStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRole, setSelectedRole] = useState('all');

  const fetchAccounts = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/auth/user/q", {
        params: {
          search: searchTerm,
          status: selectedStatus,
          role: selectedRole
        }
      })
      .then(response => {
        const fetchedAccounts = response.data.users.map(account => ({
          id: account._id,
          name: account.name,
          email: account.email,
          phone: account.number,
          role: account.role,
          nic: account.NIC || "N/A",
          image: account.displayPicture ? `http://localhost:5000${account.displayPicture}` : DefaultDP,
          cover: account.cover || "https://via.placeholder.com/400",
          status: (account.status === undefined || account.status === true) ? "Active" : "Deactivated"
        }));

        setAccounts(fetchedAccounts);
        setAccountStatuses(
          fetchedAccounts.reduce((acc, account) => {
            acc[account.id] = account.status;
            return acc;
          }, {})
        );
      })
      .catch(error => console.error("Error fetching accounts:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, [searchTerm, selectedStatus, selectedRole]);

  const areSelectedDeactivated = selectedAccounts.length > 0 &&
    selectedAccounts.every(id => accountStatuses[id] === "Deactivated");

  const handleSelect = (id) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(accountId => accountId !== id) : [...prev, id]
    );
  };

  const handleSeeMore = (user) => {
    setSelectedUser(user);
    setShowPopup(true);
  };

  const confirmToggleStatus = () => {
    let userIds = [];
    let newStatus;
    if (selectedUser) {
      userIds = [selectedUser.id];
      newStatus = accountStatuses[selectedUser.id] === "Deactivated" ? true : false;
    } else {
      userIds = selectedAccounts;
      newStatus = areSelectedDeactivated ? true : false;
    }
    const endpoint = newStatus
      ? "http://localhost:5000/admin/reactivate"
      : "http://localhost:5000/admin/deactivate";
    axios.post(endpoint, { userIds, status: newStatus })
      .then(() => {
        setAccountStatuses(prev => {
          const updated = { ...prev };
          userIds.forEach(id => {
            updated[id] = newStatus ? "Active" : "Deactivated";
          });
          return updated;
        });
      })
      .catch(error => console.error("Error updating user status:", error))
      .finally(() => {
        setSelectedAccounts([]);
        setShowConfirmPopup(false);
        setShowPopup(false);
      });
  };

  return (
    <div className="accounts-table">
      {/* Search + Bulk Button */}
      <div className="accounts-table__header">
        <input
          className="accounts-table__search"
          type="search"
          placeholder="Type Something..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setSelectedUser(null);
            setShowConfirmPopup(true);
          }}
          className={`accounts-table__bulk-btn ${areSelectedDeactivated ? "green" : "red"}`}
        >
          {areSelectedDeactivated ? "Activate Selected" : "Deactivate Selected"}
        </button>
      </div>

      {/* Filters */}
      <div className="accounts-table__filters">
        <div className="accounts-table__filter-group">
          <label className="accounts-table__label">Status</label>
          <select
            className="accounts-table__select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Deactivated</option>
          </select>
        </div>
        <div className="accounts-table__filter-group">
          <label className="accounts-table__label">Role</label>
          <select
            className="accounts-table__select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All</option>
            <option value="marketmanager">marketmanager</option>
            <option value="farmer">Farmer</option>
            <option value="shopowner">Shop Owner</option>
            <option value="financemanager">Finance Manager</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="accounts-table__wrapper">
        {loading ? (
          <p className="accounts-table__loading">Loading accounts...</p>
        ) : (
          <table className="accounts-table__table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Display Picture</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <motion.tr
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedAccounts.includes(account.id)} 
                      onChange={() => handleSelect(account.id)} 
                    />
                  </td>
                  <td>
                    <img 
                      src={`${account.image}`} 
                      alt={account.name} 
                      className="accounts-table__dp" 
                    />
                  </td>
                  <td>{account.name}</td>
                  <td>{account.email}</td>
                  <td className={`accounts-table__status ${accountStatuses[account.id] === "Deactivated" ? "deactivated" : "active"}`}>
                    {accountStatuses[account.id]}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleSeeMore(account)} 
                      className="accounts-table__see-more"
                    >
                      See More
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Details Popup */}
      {showPopup && selectedUser && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>User Details</h3>
              <button 
                className="popup-close"
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="user-profile">
                <img 
                  src={selectedUser.image} 
                  alt={selectedUser.name} 
                  className="popup-dp"
                />
                <div className="user-info">
                  <h4>{selectedUser.name}</h4>
                  <p className={`status ${accountStatuses[selectedUser.id] === "Deactivated" ? "deactivated" : "active"}`}>
                    {accountStatuses[selectedUser.id]}
                  </p>
                </div>
              </div>
              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{selectedUser.role}</span>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button 
                onClick={() => {
                  setShowConfirmPopup(true);
                }}
                className={`status-toggle-btn ${accountStatuses[selectedUser.id] === "Deactivated" ? "activate" : "deactivate"}`}
              >
                {accountStatuses[selectedUser.id] === "Deactivated" ? "Activate User" : "Deactivate User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="popup-overlay" onClick={() => setShowConfirmPopup(false)}>
          <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <img src={Danger} alt="Warning" className="warning-icon" />
              <h3>Confirm Action</h3>
            </div>
            <div className="confirm-body">
              <p>
                {selectedUser 
                  ? `Are you sure you want to ${accountStatuses[selectedUser.id] === "Deactivated" ? "activate" : "deactivate"} ${selectedUser.name}?`
                  : `Are you sure you want to ${areSelectedDeactivated ? "activate" : "deactivate"} the selected users?`
                }
              </p>
            </div>
            <div className="confirm-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancel
              </button>
              <button 
                className={`confirm-btn ${areSelectedDeactivated || (selectedUser && accountStatuses[selectedUser.id] === "Deactivated") ? "activate" : "deactivate"}`}
                onClick={confirmToggleStatus}
              >
                {areSelectedDeactivated || (selectedUser && accountStatuses[selectedUser.id] === "Deactivated") ? "Activate" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsTable;