// Test script to verify invoice generation API
const axios = require('axios');

const testInvoiceGeneration = async () => {
  try {
    console.log('🧪 Testing Invoice Generation API...\n');

    // Get a sample order first
    const ordersResponse = await axios.get('http://localhost:5000/orderDetails');
    
    console.log('Response data:', ordersResponse.data);
    
    const orders = ordersResponse.data.orders || ordersResponse.data;
    
    if (!Array.isArray(orders) || orders.length === 0) {
      console.error('❌ No orders found in database');
      return;
    }

    const testOrder = orders[0];
    console.log(`📦 Using test order: ${testOrder._id}`);
    console.log(`   Total Amount: Rs. ${testOrder.totalAmount}`);
    console.log(`   Status: ${testOrder.status}\n`);

    // Generate invoice
    console.log('📄 Generating invoice...');
    const invoiceResponse = await axios.get(
      `http://localhost:5000/invoice/${testOrder._id}/generate`
    );

    if (invoiceResponse.data.success) {
      const invoice = invoiceResponse.data.invoice;
      
      console.log('✅ Invoice generated successfully!\n');
      console.log('Invoice Details:');
      console.log(`  Invoice Number: ${invoice.invoiceNumber}`);
      console.log(`  Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
      console.log(`  Order Date: ${new Date(invoice.orderDate).toLocaleDateString()}`);
      console.log(`  Order ID: ${invoice.orderId}`);
      console.log(`\nCompany Info:`);
      console.log(`  Name: ${invoice.company.name}`);
      console.log(`  Address: ${invoice.company.address}`);
      console.log(`\nCustomer Info:`);
      console.log(`  Name: ${invoice.customer.name}`);
      console.log(`  Email: ${invoice.customer.email}`);
      console.log(`  Phone: ${invoice.customer.phone}`);
      console.log(`\nItems: ${invoice.items.length}`);
      invoice.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - Qty: ${item.quantity} - Rs. ${item.total.toFixed(2)}`);
      });
      console.log(`\nTotals:`);
      console.log(`  Subtotal: Rs. ${invoice.subtotal.toFixed(2)}`);
      console.log(`  Tax: Rs. ${invoice.tax.toFixed(2)}`);
      console.log(`  Total: Rs. ${invoice.total.toFixed(2)}`);
      console.log(`\nPayment:`);
      console.log(`  Method: ${invoice.paymentMethod}`);
      console.log(`  Status: ${invoice.paymentStatus}`);

      // Test getting invoice again (should return same number)
      console.log('\n🔄 Testing invoice retrieval (should return same invoice number)...');
      const invoiceResponse2 = await axios.get(
        `http://localhost:5000/invoice/${testOrder._id}/generate`
      );

      if (invoiceResponse2.data.success) {
        const invoice2 = invoiceResponse2.data.invoice;
        if (invoice2.invoiceNumber === invoice.invoiceNumber) {
          console.log(`✅ Invoice number persists correctly: ${invoice2.invoiceNumber}`);
        } else {
          console.log(`❌ ERROR: Invoice number changed! First: ${invoice.invoiceNumber}, Second: ${invoice2.invoiceNumber}`);
        }
      }

      console.log('\n✅ All tests passed!');
    } else {
      console.error('❌ Failed to generate invoice:', invoiceResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error testing invoice generation:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
};

testInvoiceGeneration();
