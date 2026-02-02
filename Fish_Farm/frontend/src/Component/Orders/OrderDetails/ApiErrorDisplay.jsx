import React, { useState } from 'react';
import './r_a_o_styles.css';

/**
 * ApiErrorDisplay - A reusable component for displaying API errors with debugging information
 * 
 * @param {Object} props
 * @param {string} props.error - The error message to display
 * @param {string} props.endpoint - The API endpoint that failed
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {boolean} props.showDebug - Whether to show debug information
 */
const ApiErrorDisplay = ({ 
  error, 
  endpoint = '', 
  onRetry, 
  showDebug = true
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  
  // Determine if it's a 500 server error
  const is500Error = error && error.includes('500');
  
  // Determine if it's a connection error
  const isConnectionError = error && (
    error.includes('Network Error') || 
    error.includes('connect') ||
    error.includes('timeout')
  );
  
  return (
    <div className="r_a_o_error">
      <h2>❌ Error Loading Data</h2>
      <p className="r_a_o_error-message">{error}</p>
      
      <div className="r_a_o_error-actions">
        {onRetry && (
          <button onClick={onRetry} className="r_a_o_retry-btn">
            🔄 Retry Request
          </button>
        )}
        
        <button 
          onClick={() => setDetailsExpanded(!detailsExpanded)} 
          className="r_a_o_details-btn"
        >
          {detailsExpanded ? '🔼 Hide Details' : '🔽 Show Details'}
        </button>
      </div>
      
      {detailsExpanded && (
        <div className="r_a_o_debug">
          <h3>🔧 Troubleshooting Guide:</h3>
          <p><strong>API endpoint:</strong> {endpoint}</p>
          
          {is500Error && (
            <div className="r_a_o_error-specific">
              <h4>📋 Server Error (500) Checklist:</h4>
              <ul>
                <li>The backend server is running but encountered an error processing the request</li>
                <li>Database connection issues (MongoDB Atlas connectivity)</li>
                <li>Errors in the API controller code</li>
                <li>Check backend server logs for detailed error messages</li>
              </ul>
              <p><strong>Next steps:</strong> Check the terminal where the backend server is running for error logs</p>
            </div>
          )}
          
          {isConnectionError && (
            <div className="r_a_o_error-specific">
              <h4>🔌 Connection Error Checklist:</h4>
              <ul>
                <li>Verify the backend server is running at http://localhost:5000</li>
                <li>Check for error messages in the terminal where the server is running</li>
                <li>API might be taking too long to respond (timeout)</li>
              </ul>
            </div>
          )}
          
          <h4>🔍 Common Issues:</h4>
          <ul>
            <li>Backend server may not be running on port 5000</li>
            <li>Database connection issues with MongoDB Atlas</li>
            <li>The endpoint may not be correctly implemented in the controller</li>
            <li>Network connectivity issues between frontend and backend</li>
            <li>CORS policy configuration</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiErrorDisplay;