// Test the API endpoint for a specific order
const axios = require('axios');

const ORDER_ID = '68ede80a913d707eae38d036'; // From your screenshot
const API_URL = `http://localhost:5000/orderDetails/${ORDER_ID}`;

async function testOrderAPI() {
  try {
    console.log(`🔍 Testing API endpoint: ${API_URL}\n`);
    
    const response = await axios.get(API_URL);
    
    console.log("✅ API Response received");
    console.log("=".repeat(60));
    console.log("📦 Response data:");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("=".repeat(60));
    
    if (response.data.success && response.data.order) {
      const order = response.data.order;
      console.log("\n📋 ORDER ITEMS:");
      order.items.forEach((item, index) => {
        console.log(`\n  Item ${index + 1}:`);
        console.log(`    Product Object:`, item.product);
        console.log(`    Product Name:`, item.product?.productName || item.product?.product || item.product?.Species);
        console.log(`    Price from product:`, item.product?.price || item.product?.PricePerCouple);
        console.log(`    Price from item:`, item.price);
        console.log(`    Quantity:`, item.quantity);
      });
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testOrderAPI();
