const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const moment = require("moment");
const Fish = require("../../../Model/fish/fish.js"); // adjust path if needed
const DiseaseReport = require("../../../Model/diseaseReport/diseaseReport.js");

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

exports.generateAquacultureReport = async (req, res) => {
  try {
    // 1. Stats
    const totalFish = await Fish.aggregate([{ $group: { _id: null, total: { $sum: "$Quantity" } } }]);
    const totalFishCount = totalFish[0]?.total || 0;

    const totalSpecies = await Fish.distinct("Species");

    const tankStats = await Fish.aggregate([
      { $group: { _id: "$TankNumber", count: { $sum: "$Quantity" } } },
      { $sort: { _id: 1 } },
    ]);

    const stageStats = await Fish.aggregate([
      { $group: { _id: "$Stage", count: { $sum: "$Quantity" } } },
    ]);

    const monthlyArrivals = await Fish.aggregate([
      {
        $group: {
          _id: { year: { $year: "$DateOfArrival" }, month: { $month: "$DateOfArrival" } },
          count: { $sum: "$Quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Disease stats
    const totalReports = await DiseaseReport.countDocuments();
    const diseaseByMonth = await DiseaseReport.aggregate([
      {
        $group: {
          _id: { year: { $year: "$DateReported" }, month: { $month: "$DateReported" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const recentReports = await DiseaseReport.find().sort({ DateReported: -1 }).limit(5);

    // 2. Chart data
    const tankLabels = tankStats.map((t) => `Tank ${t._id}`);
    const tankCounts = tankStats.map((t) => t.count);

    const stageLabels = stageStats.map((s) => s._id);
    const stageCounts = stageStats.map((s) => s.count);

    const monthlyLabels = monthlyArrivals.map((m) => `${m._id.month}/${m._id.year}`);
    const monthlyCounts = monthlyArrivals.map((m) => m.count);

    const diseaseLabels = diseaseByMonth.map((m) => `${m._id.month}/${m._id.year}`);
    const diseaseCounts = diseaseByMonth.map((m) => m.count);

    // Charts
    const stagePie = await chartJSNodeCanvas.renderToBuffer({
      type: "pie",
      data: { labels: stageLabels, datasets: [{ data: stageCounts, backgroundColor: ["#4caf50", "#2196f3", "#ff9800"] }] },
    });

    const tankBar = await chartJSNodeCanvas.renderToBuffer({
      type: "bar",
      data: {
        labels: tankLabels,
        datasets: [{ label: "Fish Count", data: tankCounts, backgroundColor: "#3f51b5" }],
      },
      options: { indexAxis: "y" },
    });

    const arrivalLine = await chartJSNodeCanvas.renderToBuffer({
      type: "line",
      data: {
        labels: monthlyLabels,
        datasets: [{ label: "New Fish Arrivals", data: monthlyCounts, borderColor: "#009688", fill: false }],
      },
    });

    const diseaseLine = await chartJSNodeCanvas.renderToBuffer({
      type: "line",
      data: {
        labels: diseaseLabels,
        datasets: [{ label: "Disease Reports", data: diseaseCounts, borderColor: "#f44336", fill: false }],
      },
    });

    // 3. Setup PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", "attachment; filename=aquaculture_report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // COVER PAGE
    doc.fontSize(28).text("Aquaculture Stock & Health Report", { align: "center" }).moveDown(2);
    doc.fontSize(16).text(`Generated: ${moment().format("LLL")}`, { align: "center" });
    doc.fontSize(14).text("Period: Last 12 Months", { align: "center" });
    doc.addPage();

    // TOC
    doc.fontSize(20).text("Table of Contents").moveDown(1);
    doc.fontSize(12).list([
      "1. Executive Summary",
      "2. Key Statistics",
      "3. Stock Distribution",
      "4. Disease Reports",
      "5. Recommendations",
    ]);
    doc.addPage();

    // EXECUTIVE SUMMARY
    doc.fontSize(20).text("1. Executive Summary").moveDown(1);
    doc.fontSize(12).text(`- Total Fish Stock: ${totalFishCount}`);
    doc.text(`- Species Count: ${totalSpecies.length}`);
    doc.text(`- Total Tanks in Use: ${tankStats.length}`);
    doc.text(`- Total Disease Reports: ${totalReports}`);
    doc.addPage();

    // STOCK DISTRIBUTION
    doc.fontSize(20).text("2. Stock Distribution").moveDown(1);
    doc.fontSize(14).text("Fish Stage Distribution").moveDown(0.5);
    doc.image(stagePie, { fit: [450, 300], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Tank-wise Stock Levels").moveDown(0.5);
    doc.image(tankBar, { fit: [500, 350], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Monthly Arrivals Trend").moveDown(0.5);
    doc.image(arrivalLine, { fit: [500, 350], align: "center" }).moveDown(1);
    doc.addPage();

    // DISEASE REPORTS
    doc.fontSize(20).text("3. Disease Reports").moveDown(1);
    doc.fontSize(14).text("Trend of Reported Cases").moveDown(0.5);
    doc.image(diseaseLine, { fit: [500, 350], align: "center" }).moveDown(1);

    doc.fontSize(14).text("Recent Reports").moveDown(0.5);
    recentReports.forEach((report, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. ${moment(report.DateReported).format("LLL")} | Tank ${report.TankNumber} | ${report.FishSpecies} | Sick: ${report.NumberOfSick}/${report.NumberOfFish} | Symptoms: ${report.Symptoms}`
      ).moveDown(0.3);
    });
    doc.addPage();

    // RECOMMENDATIONS
    doc.fontSize(20).text("4. Recommendations").moveDown(1);
    doc.fontSize(12).text("- Ensure quarantine for new arrivals to reduce disease spread.");
    doc.text("- Regularly monitor tanks with higher disease incidents.");
    doc.text("- Balance fish stock across tanks to prevent overcrowding.");
    doc.text("- Track species with recurring health issues for supplier quality check.");

    doc.moveDown(2);
    doc.fontSize(10).text("Confidential - For Internal Use Only", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating aquaculture report:", error);
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};
