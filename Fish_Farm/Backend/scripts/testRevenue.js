// Test to calculate current revenue from all orders
const mongoose = require("mongoose");
const Order = require("../Model/OrderDetails/orderDetailsModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Aqua-peak-Project:Aqua-peak-Member5@aqua-peak.oo1kfwc.mongodb.net/fishfarm";

async function calculateRevenue() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const orders = await Order.find({});
    
    console.log("=".repeat(70));
    console.log("💰 REVENUE CALCULATION");
    console.log("=".repeat(70));
    
    let totalRevenue = 0;
    const revenueByStatus = {};
    const revenueByDate = {};
    
    orders.forEach(order => {
      const amount = order.totalAmount || 0;
      totalRevenue += amount;
      
      // By status
      const status = order.status || 'Unknown';
      revenueByStatus[status] = (revenueByStatus[status] || 0) + amount;
      
      // By date
      const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown';
      revenueByDate[date] = (revenueByDate[date] || 0) + amount;
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total Orders: ${orders.length}`);
    console.log(`  Total Revenue: Rs. ${totalRevenue.toLocaleString()}`);
    console.log(`  Average Order Value: Rs. ${(totalRevenue / orders.length).toFixed(2)}`);
    
    console.log(`\n💵 REVENUE BY STATUS:`);
    Object.entries(revenueByStatus)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, revenue]) => {
        const percentage = ((revenue / totalRevenue) * 100).toFixed(1);
        console.log(`  ${status.padEnd(15)}: Rs. ${revenue.toLocaleString().padStart(10)} (${percentage}%)`);
      });
    
    console.log(`\n📅 REVENUE BY DATE (Last 7 days):`);
    Object.entries(revenueByDate)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, 7)
      .forEach(([date, revenue]) => {
        console.log(`  ${date.padEnd(15)}: Rs. ${revenue.toLocaleString()}`);
      });
    
    console.log("\n" + "=".repeat(70));
    
    // Test what the frontend will calculate
    console.log("\n🖥️  FRONTEND DASHBOARD WILL SHOW:");
    console.log(`  Revenue Card: Rs. ${totalRevenue.toLocaleString()}`);
    console.log(`  Orders Count: ${orders.length}`);
    console.log(`  Status Breakdown: ${Object.keys(revenueByStatus).length} different statuses`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

calculateRevenue();
