// src/Component/Health/Mortality/MortalityReportPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./MortalityReportPage.css";

export default function MortalityReportPage() {
  const [mortalityData, setMortalityData] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch mortality data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/mortality"),
          axios.get("http://localhost:5000/mortality/stats"),
        ]);
        setMortalityData(recordsRes.data || []);
        setStats(statsRes.data || null);
      } catch (err) {
        console.error("Failed to fetch mortality report data:", err);
      }
    };
    fetchData();
  }, []);

  // PDF generation
  const handleDownloadPDF = async () => {
    const input = document.getElementById("mortality-pdf-content");
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

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("MortalityReport.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="mortality-report-page">
      <h1>Mortality Report</h1>
      <button onClick={handleDownloadPDF} className="download-pdf-btn">
        Download PDF
      </button>

      <div id="mortality-pdf-content">
        {/* Header */}
        <div className="mortality-report-header">
          <img src="/logo.jpg" alt="Aqua Peak Logo" className="report-logo" />
          <div>
            <h2>Aqua Peak Fish Farm</h2>
            <h3>Mortality Report</h3>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* KPI Summary */}
        {stats && (
          <div className="mortality-kpi-cards">
            <div className="mortality-kpi-card">
              <h4>Total Deaths</h4>
              <p>{stats.totalDeaths}</p>
            </div>
            <div className="mortality-kpi-card">
              <h4>Total Reports</h4>
              <p>{stats.totalReports}</p>
            </div>
            <div className="mortality-kpi-card">
              <h4>Species Affected</h4>
              <p>{stats.speciesAffected}</p>
            </div>
            <div className="mortality-kpi-card">
              <h4>Tanks Affected</h4>
              <p>{stats.tanksAffected}</p>
            </div>
          </div>
        )}

        {/* Mortality Records Table */}
        <table className="mortality-report-table">
          <thead>
            <tr>
              <th>Species</th>
              <th>Tank Number</th>
              <th>Date of Death</th>
              <th>Quantity Died</th>
              <th>Cause (if known)</th>
            </tr>
          </thead>
          <tbody>
            {mortalityData.map((record, idx) => (
              <tr key={idx}>
                <td>{record.Species || "Unknown"}</td>
                <td>{record.TankNumber || "N/A"}</td>
                <td>
                  {record.DateOfDeath
                    ? new Date(record.DateOfDeath).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>{record.QuantityDied ?? 0}</td>
                <td>{record.CauseOfDeath || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Top Tanks Section */}
        {stats?.topTanks?.length > 0 && (
          <div className="top-tanks-section">
            <h3>Top 5 Worst Tanks</h3>
            <table className="mortality-report-table">
              <thead>
                <tr>
                  <th>Tank</th>
                  <th>Total Deaths</th>
                </tr>
              </thead>
              <tbody>
                {stats.topTanks.map((t, i) => (
                  <tr key={i}>
                    <td>{t.tank}</td>
                    <td>{t.deaths}</td>
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
