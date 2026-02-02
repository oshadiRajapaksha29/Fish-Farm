// Quick test script to check the latest order in the database
const mongoose = require("mongoose");
const Order = require("../Model/OrderDetails/orderDetailsModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Aqua-peak-Project:Aqua-peak-Member5@aqua-peak.oo1kfwc.mongodb.net/fishfarm";

async function checkLatestOrder() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📦 Fetching latest order...");
    const order = await Order.findOne().sort({ createdAt: -1 });
    
    if (!order) {
      console.log("❌ No orders found in database");
      return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📄 LATEST ORDER DETAILS:");
    console.log("=".repeat(60));
    console.log(`Order ID: ${order._id}`);
    console.log(`Created: ${order.createdAt}`);
    console.log(`Contact: ${order.contact?.emailOrPhone}`);
    console.log(`Status: ${order.status}`);
    console.log(`Total Amount: Rs. ${order.totalAmount}`);
    console.log(`\n📦 ORDER ITEMS (${order.items.length}):`);
    
    order.items.forEach((item, index) => {
      console.log(`\n  Item ${index + 1}:`);
      console.log(`    Product ID: ${item.product}`);
      console.log(`    Product Type: ${item.productType}`);
      console.log(`    Quantity: ${item.quantity}`);
      console.log(`    Price: Rs. ${item.price || 'MISSING! ❌'}`);
      console.log(`    Total: Rs. ${(item.price || 0) * item.quantity}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n📋 RAW ORDER DATA:");
    console.log(JSON.stringify(order, null, 2));
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

checkLatestOrder();
