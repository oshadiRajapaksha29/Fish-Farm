const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const moment = require("moment");
const path = require("path");
const User = require("../../../Model/Admin/User");

// chart generator
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

exports.generateUserReport = async (req, res) => {
  try {
    // 1. Gather stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: true });
    const deactivatedUsers = await User.countDocuments({ status: false });

    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate(),
      },
    });

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    // 2. Prepare chart data
    const roleLabels = roleStats.map((r) => r._id || "Unknown");
    const roleCounts = roleStats.map((r) => r.count);

    const monthlyLabels = monthlyRegistrations.map(
      (m) => `${m._id.month}/${m._id.year}`
    );
    const monthlyCounts = monthlyRegistrations.map((m) => m.count);

    // Render charts as images
    const activePie = await chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: {
        labels: ["Active", "Deactivated"],
        datasets: [{ data: [activeUsers, deactivatedUsers], backgroundColor: ["#4caf50", "#f44336"] }],
      },
    });

    const rolePie = await chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: {
        labels: roleLabels,
        datasets: [{ data: roleCounts, backgroundColor: ["#2196f3", "#ff9800", "#9c27b0", "#009688"] }],
      },
    });

    const monthlyLine = await chartJSNodeCanvas.renderToBuffer({
      type: "line",
      data: {
        labels: monthlyLabels,
        datasets: [{ label: "Registrations", data: monthlyCounts, borderColor: "#3f51b5", fill: false }],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });

    // 3. Setup PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", "attachment; filename=user_report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // --- COVER PAGE ---
    doc.fontSize(28).text("User Registration Report", { align: "center" }).moveDown(2);
    doc.fontSize(18).text("Company: AquaPeak Inc.", { align: "center" }).moveDown(1);
    doc.fontSize(14).text(`Report Generated: ${moment().format("LLL")}`, { align: "center" });
    doc.fontSize(14).text(`Period: Last 12 Months`, { align: "center" });
    doc.addPage();

    // --- TABLE OF CONTENTS ---
    doc.fontSize(20).text("Table of Contents").moveDown(1);
    doc.fontSize(12).list([
      "1. Executive Summary",
      "2. Key Statistics",
      "3. Visual Insights",
      "4. Recent Registrations",
      "5. Recommendations",
    ]);
    doc.addPage();

    // --- EXECUTIVE SUMMARY ---
    doc.fontSize(20).text("1. Executive Summary").moveDown(1);
    doc.fontSize(12).text(
      `This report provides an overview of user registrations, activity levels, and trends over the last 12 months.`
    ).moveDown(1);
    doc.text(`- Total Users: ${totalUsers}`);
    doc.text(`- Active Users: ${activeUsers}`);
    doc.text(`- Deactivated Users: ${deactivatedUsers}`);
    doc.text(`- New Users This Month: ${newUsersThisMonth}`);
    doc.moveDown(2);
    doc.addPage();

    // --- KEY STATISTICS & CHARTS ---
    doc.fontSize(20).text("2. Key Statistics").moveDown(1);
    doc.fontSize(14).text("Active vs Deactivated Users").moveDown(0.5);
    doc.image(activePie, { fit: [450, 300], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Role Distribution").moveDown(0.5);
    doc.image(rolePie, { fit: [450, 300], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Monthly Registrations Trend").moveDown(0.5);
    doc.image(monthlyLine, { fit: [450, 300], align: "center" });
    doc.addPage();

    // --- RECENT REGISTRATIONS ---
    doc.fontSize(20).text("3. Recent Registrations").moveDown(1);
    recentUsers.forEach((user, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. ${user.name} (${user.email}) | Role: ${user.role} | Joined: ${moment(user.createdAt).format("LLL")}`
      );
    });
    doc.addPage();

    // --- RECOMMENDATIONS ---
    doc.fontSize(20).text("4. Recommendations").moveDown(1);
    doc.fontSize(12).text(
      `- Monitor role distribution to ensure balanced platform participation.`
    );
    doc.text(`- Investigate high deactivation rates if above 10%.`);
    doc.text(`- Track monthly trends to identify peak registration periods.`);
    doc.text(`- Encourage onboarding of new users with tailored campaigns.`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text("Confidential - For Admin Use Only", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};
