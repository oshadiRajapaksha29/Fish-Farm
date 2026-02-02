const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const moment = require("moment");
const Inventory = require("../../../Model/Inventory/Inventorymodel.js");
const Order = require("../../../Model/OrderDetails/orderDetailsModel.js");

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

exports.generateInventoryOrdersReport = async (req, res) => {
  try {
    // 1. Stats
    const totalInventory = await Inventory.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$totalAmount" } } }]);
    const totalRevenueValue = totalRevenue[0]?.revenue || 0;

    // Inventory by category
    const categoryStats = await Inventory.aggregate([
      { $group: { _id: "$category", total: { $sum: "$quantity" } } },
    ]);

    // Low stock items
    const lowStockItems = await Inventory.find({ $expr: { $lte: ["$quantity", "$reorder_level"] } });

    // Orders by status
    const statusStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Monthly order trends
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Top-selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    // 2. Prepare chart data
    const categoryLabels = categoryStats.map((c) => c._id || "Uncategorized");
    const categoryCounts = categoryStats.map((c) => c.total);

    const statusLabels = statusStats.map((s) => s._id);
    const statusCounts = statusStats.map((s) => s.count);

    const monthlyLabels = monthlyOrders.map((m) => `${m._id.month}/${m._id.year}`);
    const monthlyCounts = monthlyOrders.map((m) => m.count);
    const monthlyRevenue = monthlyOrders.map((m) => m.revenue);

    // Charts
    const categoryPie = await chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: { labels: categoryLabels, datasets: [{ data: categoryCounts, backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#9c27b0"] }] },
    });

    const statusPie = await chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: { labels: statusLabels, datasets: [{ data: statusCounts, backgroundColor: ["#009688", "#3f51b5", "#ff5722", "#8bc34a", "#9e9e9e"] }] },
    });

    const ordersLine = await chartJSNodeCanvas.renderToBuffer({
      type: "line",
      data: {
        labels: monthlyLabels,
        datasets: [
          { label: "Orders", data: monthlyCounts, borderColor: "#3f51b5", fill: false },
          { label: "Revenue", data: monthlyRevenue, borderColor: "#ff9800", fill: false },
        ],
      },
    });

    // 3. Setup PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", "attachment; filename=inventory_orders_report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // COVER PAGE
    doc.fontSize(28).text("Inventory & Orders Report", { align: "center" }).moveDown(2);
    doc.fontSize(16).text(`Generated: ${moment().format("LLL")}`, { align: "center" });
    doc.fontSize(14).text("Period: Last 12 Months", { align: "center" });
    doc.addPage();

    // TOC
    doc.fontSize(20).text("Table of Contents").moveDown(1);
    doc.fontSize(12).list([
      "1. Executive Summary",
      "2. Inventory Insights",
      "3. Orders Insights",
      "4. Recent Orders",
      "5. Recommendations",
    ]);
    doc.addPage();

    // EXECUTIVE SUMMARY
    doc.fontSize(20).text("1. Executive Summary").moveDown(1);
    doc.fontSize(12).text(`- Total Inventory Items: ${totalInventory}`);
    doc.text(`- Total Orders: ${totalOrders}`);
    doc.text(`- Total Revenue: $${totalRevenueValue.toFixed(2)}`);
    doc.text(`- Categories Tracked: ${categoryStats.length}`);
    doc.addPage();

    // INVENTORY INSIGHTS
    doc.fontSize(20).text("2. Inventory Insights").moveDown(1);
    doc.fontSize(14).text("Stock by Category").moveDown(0.5);
    doc.image(categoryPie, { fit: [450, 300], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Low-Stock & Reorder Alerts").moveDown(0.5);
    if (lowStockItems.length === 0) {
      doc.text("✅ All items are above reorder levels.");
    } else {
      lowStockItems.forEach((item, idx) => {
        doc.text(`${idx + 1}. ${item.inventoryName} | Qty: ${item.quantity} | Reorder Level: ${item.reorder_level}`);
      });
    }
    doc.addPage();

    // ORDERS INSIGHTS
    doc.fontSize(20).text("3. Orders Insights").moveDown(1);
    doc.fontSize(14).text("Orders by Status").moveDown(0.5);
    doc.image(statusPie, { fit: [450, 300], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Monthly Orders & Revenue").moveDown(0.5);
    doc.image(ordersLine, { fit: [500, 350], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Top Selling Products").moveDown(0.5);
    if (topProducts.length === 0) {
      doc.text("No sales data available.");
    } else {
      topProducts.forEach((p, idx) => {
        doc.text(`${idx + 1}. Product ID: ${p._id} | Units Sold: ${p.totalSold}`);
      });
    }
    doc.addPage();

    // RECENT ORDERS
    doc.fontSize(20).text("4. Recent Orders").moveDown(1);
    recentOrders.forEach((order, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. ${moment(order.createdAt).format("LLL")} | Total: $${order.totalAmount} | Status: ${order.status} | Contact: ${order.contact.emailOrPhone}`
      );
    });
    doc.addPage();

    // RECOMMENDATIONS
    doc.fontSize(20).text("5. Recommendations").moveDown(1);
    doc.fontSize(12).text("- Monitor low-stock items to avoid shortages.");
    doc.text("- Track cancelled orders to identify customer issues.");
    doc.text("- Focus marketing on top-selling products.");
    doc.text("- Review order trends to optimize inventory planning.");

    doc.moveDown(2);
    doc.fontSize(10).text("Confidential - For Internal Use Only", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};
