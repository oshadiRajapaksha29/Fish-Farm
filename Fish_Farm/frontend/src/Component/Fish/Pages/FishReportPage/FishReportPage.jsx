import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./FishReportPage.css";

export default function FishReportPage() {
  const [fishData, setFishData] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch fish stock + stats
  const fetchData = async () => {
    try {
      const [fishRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/fish"),
        axios.get("http://localhost:5000/fish/stats?low=10"),
      ]);
      setFishData(fishRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ auto-refresh when mortality reduces stock
    const interval = setInterval(fetchData, 5000); // every 5s
    return () => clearInterval(interval);
  }, []);

  // PDF generation with multi-page support
  const handleDownloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("FishStockReport.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="fish-report-page">
      <h1>Fish Stock Report</h1>
      <button onClick={handleDownloadPDF} className="download-pdf-btn">
        Download PDF
      </button>

      <div id="pdf-content">
        <div className="fish-report-header">
          <img src="/logo.jpg" alt="Aqua Peak Logo" className="report-logo" />
          <div>
            <h2>Aqua Peak Fish Farm</h2>
            <h3>Fish Stock Report</h3>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {stats && (
          <div className="fish-kpi-cards">
            <div className="fish-kpi-card">
              <h4>Total Species</h4>
              <p>{stats.totalSpecies}</p>
            </div>
            <div className="fish-kpi-card">
              <h4>Total Quantity</h4>
              <p>{stats.totalQuantity}</p>
            </div>
            <div className="fish-kpi-card">
              <h4>Low Stock Count</h4>
              <p>{stats.lowStockCount}</p>
            </div>
          </div>
        )}

        <table className="fish-report-table">
          <thead>
            <tr>
              <th>Species</th>
              <th>Sub-species</th>
              <th>Quantity</th>
              <th>Tank Number</th>
              <th>Date of Arrival</th>
              <th>Average Weight</th>
            </tr>
          </thead>
          <tbody>
            {fishData.map((fish, index) => (
              <tr key={index}>
                <td>{fish.Species}</td>
                <td>{fish.subSpecies}</td>
                <td>{fish.Quantity}</td>
                <td>{fish.TankNumber}</td>
                <td>
                  {fish.DateOfArrival
                    ? new Date(fish.DateOfArrival).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  {fish.AverageWeight ? `${fish.AverageWeight} kg` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stats?.topLowStock?.length > 0 && (
          <div className="low-stock-section">
            <h3>Low Stock (Top 5)</h3>
            <table className="fish-report-table">
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Sub-species</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {stats.topLowStock.map((f, idx) => (
                  <tr key={idx}>
                    <td>{f.Species}</td>
                    <td>{f.subSpecies}</td>
                    <td>{f.Quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
