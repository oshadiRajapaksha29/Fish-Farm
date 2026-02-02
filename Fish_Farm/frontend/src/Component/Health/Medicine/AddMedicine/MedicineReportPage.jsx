import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./MedicineReportPage.css";

const API_BASE = "http://localhost:5000";

export default function MedicineReportPage() {
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch medicine stock + stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE}/medicine`),
          axios.get(`${API_BASE}/medicine/stats?low=5`),
        ]);
        setMedicines(medRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

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

      pdf.save("MedicineStockReport.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="medicine-report-page">
      <h1>Medicine Stock Report</h1>
      <button onClick={handleDownloadPDF} className="download-pdf-btn">
        Download PDF
      </button>

      <div id="pdf-content">
        {/* Header */}
        <div className="report-header">
          <img src="/logo.jpg" alt="Aqua Peak Logo" className="report-logo" />
          <div>
            <h2>Aqua Peak Fish Farm</h2>
            <h3>Medicine Stock Report</h3>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* KPI Summary */}
        {stats && (
          <div className="kpi-cards">
            <div className="kpi-card">
              <h4>Total Types</h4>
              <p>{stats.totalTypes}</p>
            </div>
            <div className="kpi-card">
              <h4>Total Quantity</h4>
              <p>{stats.totalQuantity}</p>
            </div>
            <div className="kpi-card">
              <h4>Low Stock Count</h4>
              <p>{stats.lowStockCount}</p>
            </div>
          </div>
        )}

        {/* Medicine Table */}
        <table className="report-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, index) => (
              <tr key={index}>
                <td>{med.name}</td>
                <td>{med.unit}</td>
                <td>{med.quantity}</td>
                <td>{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "N/A"}</td>
                <td>{med.description || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Low Stock Section */}
        {stats?.topLowStock?.length > 0 && (
          <div className="low-stock-section">
            <h3>Low Stock (Top 5)</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {stats.topLowStock.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.name}</td>
                    <td>{m.unit}</td>
                    <td>{m.quantity}</td>
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
