// Order Email Service - Send notifications to customers about their orders

const { sendEmail } = require('../services/mail.service');

// Company Information
const COMPANY_INFO = {
  name: "Aqua Peak Fish Farm",
  email: process.env.SMTP_USER || "info@aquapeak.lk",
  phone: "+94 77 123 4567",
  website: "www.aquapeak.lk",
  address: "123/A ,Wijayapura Road,Kekirawa,Anuradapura"
};

// Email Template Base
const getEmailTemplate = (content, title = "Order Notification") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
        }
        .email-body {
          padding: 30px 20px;
        }
        .email-footer {
          background: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e0e0e0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #0066cc;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 10px 0;
        }
        .order-summary {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .order-summary h3 {
          margin-top: 0;
          color: #0066cc;
        }
        .order-item {
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .total-amount {
          font-size: 24px;
          color: #0066cc;
          font-weight: bold;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #cfe2ff; color: #084298; }
        .status-shipped { background: #e2d9f3; color: #6c2eaf; }
        .status-delivered { background: #d1e7dd; color: #0f5132; }
        .status-cancelled { background: #f8d7da; color: #842029; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>${COMPANY_INFO.name}</h1>
          <p>Quality Fish & Aquarium Supplies</p>
        </div>
        <div class="email-body">
          ${content}
        </div>
        <div class="email-footer">
          <p><strong>${COMPANY_INFO.name}</strong></p>
          <p>${COMPANY_INFO.address}</p>
          <p>Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}</p>
          <p>Website: ${COMPANY_INFO.website}</p>
          <p style="margin-top: 15px; color: #999;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Get status badge HTML
const getStatusBadge = (status) => {
  const statusClass = `status-${status.toLowerCase()}`;
  return `<span class="status-badge ${statusClass}">${status}</span>`;
};

// Format order items for email
const formatOrderItems = (items) => {
  return items.map((item, index) => `
    <div class="order-item">
      <strong>${index + 1}. ${item.product?.productName || item.product?.Species || item.product?.product || 'Product'}</strong>
      <br>
      Quantity: ${item.quantity} × Rs. ${item.price.toFixed(2)} = Rs. ${(item.quantity * item.price).toFixed(2)}
    </div>
  `).join('');
};

// 1. ORDER CONFIRMATION EMAIL
exports.sendOrderConfirmation = async (order) => {
  try {
    console.log(`📧 Attempting to send order confirmation email for order: ${order._id}`);
    
    const customerEmail = order.contact?.emailOrPhone;
    const customerName = `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'Customer';
    
    console.log(`   Customer email/phone value: "${customerEmail}"`);
    console.log(`   Customer name: "${customerName}"`);
    
    if (!customerEmail) {
      console.log('⚠️ No email/phone value found in order.contact.emailOrPhone');
      return { success: false, message: 'No contact information provided' };
    }
    
    if (!customerEmail.includes('@')) {
      console.log(`⚠️ Contact field "${customerEmail}" appears to be a phone number, not an email. Skipping email notification.`);
      return { success: false, message: 'Phone number provided instead of email' };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      console.log(`⚠️ Invalid email format: "${customerEmail}"`);
      return { success: false, message: 'Invalid email format' };
    }
    
    console.log(`   ✓ Valid email found: ${customerEmail}`);

    const content = `
      <h2>Thank You for Your Order!</h2>
      <p>Dear ${customerName},</p>
      <p>We have received your order and it is being processed. Here are your order details:</p>
      
      <div class="order-summary">
        <h3>Order Information</h3>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Status:</strong> ${getStatusBadge(order.status)}</p>
        <p><strong>Payment Method:</strong> ${order.payment?.method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
      </div>

      <div class="order-summary">
        <h3>Order Items</h3>
        ${formatOrderItems(order.items)}
        <br>
        <p style="text-align: right; margin-top: 15px;">
          <strong>Total Amount: <span class="total-amount">Rs. ${order.totalAmount.toFixed(2)}</span></strong>
        </p>
      </div>

      <div class="order-summary">
        <h3>Delivery Address</h3>
        <p>
          ${order.delivery?.firstName} ${order.delivery?.lastName}<br>
          ${order.delivery?.address}<br>
          ${order.delivery?.apartment ? order.delivery.apartment + '<br>' : ''}
          ${order.delivery?.city}, ${order.delivery?.state} ${order.delivery?.pinCode}<br>
          Phone: ${order.delivery?.phone}
        </p>
      </div>

      <p>We will notify you once your order has been shipped.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <center>
        <a href="http://localhost:3000/my-orders" class="button">Track Your Order</a>
      </center>

      <p>Thank you for choosing ${COMPANY_INFO.name}!</p>
    `;

    const result = await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - ${COMPANY_INFO.name} #${order._id.toString().slice(-8).toUpperCase()}`,
      html: getEmailTemplate(content, 'Order Confirmation')
    });

    console.log(`✅ Order confirmation email sent successfully to ${customerEmail}`);
    console.log(`   Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    console.error('   Full error:', error);
    return { success: false, error: error.message };
  }
};

// 2. ORDER STATUS UPDATE EMAIL
exports.sendStatusUpdateEmail = async (order, oldStatus) => {
  try {
    console.log(`📧 Attempting to send status update email for order: ${order._id}`);
    
    const customerEmail = order.contact?.emailOrPhone;
    const customerName = `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'Customer';
    
    console.log(`   Customer email/phone value: "${customerEmail}"`);
    console.log(`   Status change: ${oldStatus} → ${order.status}`);
    
    if (!customerEmail || !customerEmail.includes('@')) {
      console.log(`⚠️ Cannot send status update email - contact field "${customerEmail}" is not a valid email`);
      return { success: false, message: 'No valid email address' };
    }

    let statusMessage = '';
    let actionButton = '';

    switch (order.status) {
      case 'Confirmed':
        statusMessage = 'Your order has been confirmed and is being prepared.';
        break;
      case 'Shipped':
        statusMessage = 'Great news! Your order has been shipped and is on its way to you.';
        break;
      case 'Delivered':
        statusMessage = 'Your order has been delivered! We hope you enjoy your purchase.';
        actionButton = '<center><a href="http://localhost:3000/my-orders" class="button">Download Invoice</a></center>';
        break;
      case 'Cancelled':
        statusMessage = 'Your order has been cancelled. If you did not request this, please contact us immediately.';
        break;
      default:
        statusMessage = 'Your order status has been updated.';
    }

    const content = `
      <h2>Order Status Update</h2>
      <p>Dear ${customerName},</p>
      <p>${statusMessage}</p>
      
      <div class="order-summary">
        <h3>Order Information</h3>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Previous Status:</strong> ${getStatusBadge(oldStatus)}</p>
        <p><strong>Current Status:</strong> ${getStatusBadge(order.status)}</p>
        <p><strong>Total Amount:</strong> <span class="total-amount">Rs. ${order.totalAmount.toFixed(2)}</span></p>
      </div>

      ${actionButton}

      <p>Thank you for shopping with ${COMPANY_INFO.name}!</p>
    `;

    const result = await sendEmail({
      to: customerEmail,
      subject: `Order ${order.status} - ${COMPANY_INFO.name} #${order._id.toString().slice(-8).toUpperCase()}`,
      html: getEmailTemplate(content, 'Order Status Update')
    });

    console.log('✅ Status update email sent successfully');
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    return { success: false, error: error.message };
  }
};

// 3. INVOICE EMAIL
exports.sendInvoiceEmail = async (order, invoiceNumber) => {
  try {
    console.log(`📧 Sending invoice email for order: ${order._id}`);
    
    const customerEmail = order.contact?.emailOrPhone;
    const customerName = `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'Customer';
    
    if (!customerEmail || !customerEmail.includes('@')) {
      console.log('⚠️ No valid email address found for customer');
      return { success: false, message: 'No valid email address' };
    }

    const content = `
      <h2>Your Invoice is Ready</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for your purchase! Your invoice is now available.</p>
      
      <div class="order-summary">
        <h3>Invoice Details</h3>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Total Amount:</strong> <span class="total-amount">Rs. ${order.totalAmount.toFixed(2)}</span></p>
      </div>

      <p>You can download your invoice by clicking the button below:</p>

      <center>
        <a href="http://localhost:3000/my-orders/${order._id}" class="button">Download Invoice</a>
      </center>

      <p>Please keep this invoice for your records.</p>
      <p>Thank you for choosing ${COMPANY_INFO.name}!</p>
    `;

    const result = await sendEmail({
      to: customerEmail,
      subject: `Invoice ${invoiceNumber} - ${COMPANY_INFO.name}`,
      html: getEmailTemplate(content, 'Invoice Ready')
    });

    console.log('✅ Invoice email sent successfully');
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

// 4. DELIVERY NOTIFICATION EMAIL
exports.sendDeliveryNotification = async (order) => {
  try {
    console.log(`📧 Sending delivery notification for order: ${order._id}`);
    
    const customerEmail = order.contact?.emailOrPhone;
    const customerName = `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'Customer';
    
    if (!customerEmail || !customerEmail.includes('@')) {
      console.log('⚠️ No valid email address found for customer');
      return { success: false, message: 'No valid email address' };
    }

    const content = `
      <h2>🎉 Your Order Has Been Delivered!</h2>
      <p>Dear ${customerName},</p>
      <p>We're happy to inform you that your order has been successfully delivered!</p>
      
      <div class="order-summary">
        <h3>Delivery Information</h3>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>Delivery Address:</strong><br>
          ${order.delivery?.address}, ${order.delivery?.city}, ${order.delivery?.state} ${order.delivery?.pinCode}
        </p>
      </div>

      <p>We hope you enjoy your purchase! If you have any issues with your order, please contact us within 24 hours.</p>

      <center>
        <a href="http://localhost:3000/my-orders/${order._id}" class="button">View Order Details</a>
      </center>

      <p>Thank you for shopping with ${COMPANY_INFO.name}!</p>
      <p>We look forward to serving you again.</p>
    `;

    const result = await sendEmail({
      to: customerEmail,
      subject: `Order Delivered - ${COMPANY_INFO.name} #${order._id.toString().slice(-8).toUpperCase()}`,
      html: getEmailTemplate(content, 'Order Delivered')
    });

    console.log('✅ Delivery notification email sent successfully');
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending delivery notification:', error);
    return { success: false, error: error.message };
  }
};

// Test email function
exports.sendTestEmail = async (toEmail) => {
  try {
    const content = `
      <h2>Email System Test</h2>
      <p>This is a test email from ${COMPANY_INFO.name}.</p>
      <p>If you received this email, the email notification system is working correctly!</p>
      <p>Timestamp: ${new Date().toLocaleString()}</p>
    `;

    const result = await sendEmail({
      to: toEmail,
      subject: `Test Email - ${COMPANY_INFO.name}`,
      html: getEmailTemplate(content, 'Test Email')
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return { success: false, error: error.message };
  }
};

// 6. RETURN REQUEST STATUS UPDATE EMAIL
exports.sendReturnStatusUpdateEmail = async (returnRequest) => {
  try {
    console.log(`📧 Sending return status update email to ${returnRequest.customerEmail}`);

    // Status-specific content and styling
    const getStatusInfo = (status) => {
      switch (status) {
        case 'Approved':
          return {
            icon: '✅',
            color: '#28a745',
            message: 'Your return request has been approved!',
            description: 'We will process your return shortly.'
          };
        case 'Rejected':
          return {
            icon: '❌',
            color: '#dc3545',
            message: 'Your return request has been reviewed',
            description: 'Unfortunately, we cannot approve this return request.'
          };
        case 'Processing':
          return {
            icon: '⚙️',
            color: '#007bff',
            message: 'Your return is being processed',
            description: 'We are currently processing your return request.'
          };
        case 'Completed':
          return {
            icon: '🎉',
            color: '#28a745',
            message: 'Your return has been completed!',
            description: 'Your refund has been processed successfully.'
          };
        default:
          return {
            icon: 'ℹ️',
            color: '#6c757d',
            message: 'Return request status updated',
            description: `Your return request status is now: ${status}`
          };
      }
    };

    const statusInfo = getStatusInfo(returnRequest.status);

    // Format return items
    const formatReturnItems = () => {
      if (!returnRequest.items || returnRequest.items.length === 0) {
        return '<p>No items specified</p>';
      }
      return returnRequest.items.map((item, index) => `
        <div class="order-item">
          <strong>${index + 1}. ${item.productName || 'Product'}</strong>
          <br>
          Quantity: ${item.quantity}
          ${item.reason ? `<br><em>Reason: ${item.reason}</em>` : ''}
        </div>
      `).join('');
    };

    // Refund details HTML if status is Completed
    const getRefundDetails = () => {
      if (returnRequest.status === 'Completed' && returnRequest.refundAmount) {
        return `
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #28a745;">💰 Refund Information</h3>
            <p><strong>Refund Amount:</strong> Rs. ${parseFloat(returnRequest.refundAmount).toFixed(2)}</p>
            <p><strong>Refund Method:</strong> ${returnRequest.refundMethod || 'Bank Transfer'}</p>
            <p><strong>Processed On:</strong> ${new Date(returnRequest.refundedAt || returnRequest.updatedAt).toLocaleDateString()}</p>
            <p style="margin-bottom: 0; color: #666; font-size: 14px;">
              ${returnRequest.refundMethod === 'Bank Transfer' 
                ? 'The refund will be credited to your account within 3-5 business days.' 
                : 'The refund has been processed through your original payment method.'}
            </p>
          </div>
        `;
      }
      return '';
    };

    const content = `
      <div style="text-align: center; padding: 20px 0;">
        <div style="font-size: 60px; margin-bottom: 10px;">${statusInfo.icon}</div>
        <h2 style="color: ${statusInfo.color}; margin: 0;">${statusInfo.message}</h2>
        <p style="color: #666; font-size: 16px;">${statusInfo.description}</p>
      </div>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0066cc;">📋 Return Request Details</h3>
        <p><strong>Request ID:</strong> ${returnRequest._id}</p>
        <p><strong>Order ID:</strong> ${returnRequest.order?._id || returnRequest.order || 'N/A'}</p>
        <p><strong>Return Type:</strong> ${returnRequest.returnType || 'Refund'}</p>
        <p><strong>Reason:</strong> ${returnRequest.reason}</p>
        <p><strong>Status:</strong> ${getStatusBadge(returnRequest.status)}</p>
        <p><strong>Submitted On:</strong> ${new Date(returnRequest.createdAt).toLocaleDateString()}</p>
        <p style="margin-bottom: 0;"><strong>Last Updated:</strong> ${new Date(returnRequest.updatedAt).toLocaleDateString()}</p>
      </div>

      ${returnRequest.adminResponse && returnRequest.adminResponse.message ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">💬 Admin Response</h3>
          <p style="margin-bottom: 0;">${returnRequest.adminResponse.message}</p>
          ${returnRequest.adminResponse.respondedBy ? `
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              - ${returnRequest.adminResponse.respondedBy}, 
              ${new Date(returnRequest.adminResponse.respondedAt).toLocaleDateString()}
            </p>
          ` : ''}
        </div>
      ` : ''}

      ${getRefundDetails()}

      <div class="order-summary">
        <h3>📦 Items in Return Request</h3>
        ${formatReturnItems()}
      </div>

      ${returnRequest.description ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #0066cc;">📝 Your Description</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${returnRequest.description}
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0 20px 0;">
        <p style="color: #666; margin-bottom: 15px;">
          ${returnRequest.status === 'Completed' 
            ? 'Thank you for your patience. If you have any questions, please contact us.' 
            : 'If you have any questions about your return request, please contact us.'}
        </p>
        <a href="mailto:${COMPANY_INFO.email}" class="button">Contact Support</a>
      </div>

      <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          <strong>Need Help?</strong><br>
          Contact us at ${COMPANY_INFO.phone} or ${COMPANY_INFO.email}
        </p>
      </div>
    `;

    const subject = `Return Request Update: ${returnRequest.status} - Order #${returnRequest.order?._id || returnRequest.order || 'N/A'}`;

    const result = await sendEmail({
      to: returnRequest.customerEmail,
      subject: subject,
      html: getEmailTemplate(content, 'Return Request Update')
    });

    console.log(`✅ Return status update email sent successfully to ${returnRequest.customerEmail}`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending return status update email:', error);
    return { success: false, error: error.message };
  }
};
