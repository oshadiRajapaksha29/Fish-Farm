const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const moment = require("moment");

const LoginHistory = require("../../../Model/Admin/LoginModel.js");
const User = require("../../../Model/Admin/User.js");

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

exports.generateLoginReport = async (req, res) => {
  try {
    // 1. Collect stats
    const totalLogins = await LoginHistory.countDocuments();
    const uniqueUsers = await LoginHistory.distinct("user");
    const successCount = await LoginHistory.countDocuments({ status: "Success" });
    const failedCount = await LoginHistory.countDocuments({ status: "Failed" });

    // Logins by role
    const roleStats = await LoginHistory.aggregate([
      { $match: { status: "Success", user: { $ne: null } } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      { $group: { _id: "$userInfo.role", count: { $sum: 1 } } },
    ]);

    // Top 5 users by login count
    const topUsers = await LoginHistory.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Logins by location
    const locationStats = await LoginHistory.aggregate([
      {
        $group: {
          _id: "$location.country",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent logins
    const recentLogins = await LoginHistory.find().sort({ createdAt: -1 }).limit(10);

    // 2. Prepare chart data
    const statusChart = await chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: {
        labels: ["Success", "Failed"],
        datasets: [{ data: [successCount, failedCount], backgroundColor: ["#4caf50", "#f44336"] }],
      },
    });

    const roleChart = await chartJSNodeCanvas.renderToBuffer({
      type: "bar",
      data: {
        labels: roleStats.map((r) => r._id || "Unknown"),
        datasets: [
          { label: "Logins", data: roleStats.map((r) => r.count), backgroundColor: "#2196f3" },
        ],
      },
    });

    // 3. Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", "attachment; filename=login_report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Title Page
    doc.fontSize(28).text("User Login Activity Report", { align: "center" }).moveDown(2);
    doc.fontSize(14).text(`Generated: ${moment().format("LLLL")}`, { align: "center" });
    doc.addPage();

    // Executive Summary
    doc.fontSize(20).text("Executive Summary").moveDown(1);
    doc.fontSize(12).text(`Total Logins: ${totalLogins}`);
    doc.text(`Unique Users: ${uniqueUsers.length}`);
    doc.text(`Successful Logins: ${successCount}`);
    doc.text(`Failed Logins: ${failedCount}`).moveDown(2);

    // Status Pie Chart
    doc.fontSize(14).text("Login Success vs Failed").moveDown(0.5);
    doc.image(statusChart, { fit: [450, 300], align: "center" });
    doc.addPage();

    // Role Stats
    doc.fontSize(14).text("Logins by Role").moveDown(0.5);
    doc.image(roleChart, { fit: [500, 350], align: "center" });
    doc.addPage();

    // Top Users
    doc.fontSize(20).text("Top 5 Users by Login Count").moveDown(1);
    topUsers.forEach((u, i) => {
      doc.fontSize(12).text(`${i + 1}. ${u._id} — ${u.count} logins`);
    });
    doc.addPage();

    // Location Stats
    doc.fontSize(20).text("Login Distribution by Location").moveDown(1);
    locationStats.slice(0, 10).forEach((loc, i) => {
      doc.fontSize(12).text(`${i + 1}. ${loc._id || "Unknown"} — ${loc.count} logins`);
    });
    doc.addPage();

    // Recent Logins
    doc.fontSize(20).text("Recent Login Attempts").moveDown(1);
    recentLogins.forEach((l, i) => {
      doc.fontSize(12).text(
        `${i + 1}. ${moment(l.loginTime).format("LLL")} | ${l.email} | ${l.ipAddress} | ${
          l.location?.country || "Unknown"
        } | ${l.status}`
      );
    });
    doc.addPage();

    // Recommendations
    doc.fontSize(20).text("Recommendations").moveDown(1);
    doc.fontSize(12).text("- Investigate repeated failed login attempts.");
    doc.text("- Track high login frequency from unusual locations.");
    doc.text("- Review accounts with abnormal login patterns.");
    doc.text("- Ensure inactive accounts remain deactivated.");

    doc.moveDown(2);
    doc.fontSize(10).text("Confidential - For Admin Use Only", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating login report:", error);
    res.status(500).json({ success: false, message: "Failed to generate login report" });
  }
};
