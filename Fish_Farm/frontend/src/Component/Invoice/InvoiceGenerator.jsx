import React, { useState } from 'react';
import axios from 'axios';
import { downloadInvoice, printInvoice } from '../../utils/invoicePDF';
import './InvoiceGenerator.css';

const InvoiceGenerator = ({ orderId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const generateInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/invoice/${orderId}/generate`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setInvoiceData(response.data.invoice);
      } else {
        setError(response.data.message || 'Failed to generate invoice');
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (invoiceData) {
      console.log('Downloading invoice...', invoiceData.invoiceNumber);
      try {
        downloadInvoice(invoiceData);
        console.log('Invoice download initiated');
      } catch (error) {
        console.error('Download error:', error);
        setError('Failed to download invoice');
      }
    } else {
      console.error('No invoice data available');
      setError('Invoice data not available');
    }
  };

  const handlePrint = () => {
    if (invoiceData) {
      console.log('Printing invoice...', invoiceData.invoiceNumber);
      try {
        printInvoice(invoiceData);
        console.log('Invoice print initiated');
      } catch (error) {
        console.error('Print error:', error);
        setError('Failed to print invoice');
      }
    } else {
      console.error('No invoice data available');
      setError('Invoice data not available');
    }
  };

  React.useEffect(() => {
    generateInvoice();
  }, [orderId]);

  return (
    <div className="r_i_g_modal">
      <div className="r_i_g_content">
        <div className="r_i_g_header">
          <h2>Invoice Generator</h2>
          <button className="r_i_g_close_btn" onClick={onClose}>×</button>
        </div>

        <div className="r_i_g_body">
          {loading && (
            <div className="r_i_g_loading_state">
              <div className="r_i_g_spinner"></div>
              <p>Generating invoice...</p>
            </div>
          )}

          {error && (
            <div className="r_i_g_error_state">
              <div className="r_i_g_error_icon">⚠️</div>
              <p>{error}</p>
              <button onClick={generateInvoice}>Try Again</button>
            </div>
          )}

          {invoiceData && !loading && (
            <div className="r_i_g_preview">
              <div className="r_i_g_info">
                <h3>Invoice Generated Successfully!</h3>
                <div className="r_i_g_details">
                  <div className="r_i_g_detail_row">
                    <span className="r_i_g_label">Invoice Number:</span>
                    <span className="r_i_g_value">{invoiceData.invoiceNumber}</span>
                  </div>
                  <div className="r_i_g_detail_row">
                    <span className="r_i_g_label">Invoice Date:</span>
                    <span className="r_i_g_value">
                      {new Date(invoiceData.invoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="r_i_g_detail_row">
                    <span className="r_i_g_label">Customer:</span>
                    <span className="r_i_g_value">{invoiceData.customer.name}</span>
                  </div>
                  <div className="r_i_g_detail_row">
                    <span className="r_i_g_label">Total Amount:</span>
                    <span className="r_i_g_value r_i_g_total">Rs. {invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="r_i_g_items">
                <h4>Items ({invoiceData.items.length})</h4>
                <div className="r_i_g_items_list">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className="r_i_g_item_row">
                      <span className="r_i_g_item_no">{index + 1}.</span>
                      <span className="r_i_g_item_name">{item.name}</span>
                      <span className="r_i_g_item_qty">×{item.quantity}</span>
                      <span className="r_i_g_item_total">Rs. {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="r_i_g_actions">
                <button className="r_i_g_btn_download" onClick={handleDownload}>
                  <span className="r_i_g_icon">📥</span>
                  Download PDF
                </button>
                <button className="r_i_g_btn_print" onClick={handlePrint}>
                  <span className="r_i_g_icon">🖨️</span>
                  Print Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
