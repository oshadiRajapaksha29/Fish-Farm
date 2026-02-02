import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./DiseaseReportPage.css";

const API_BASE = "http://localhost:5000";

export default function DiseaseReportPage() {
  const [diseaseReports, setDiseaseReports] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch disease reports + stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, statsRes] = await Promise.all([
          axios.get(`${API_BASE}/diseaseReports`),
          axios.get(`${API_BASE}/diseaseReports/stats`),
        ]);
        setDiseaseReports(reportsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch disease data:", err);
      }
    };
    fetchData();
  }, []);

  // PDF generation
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

      pdf.save("DiseaseReport.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <div className="disease-report-page">
      <h1>Disease Reports</h1>
      <button onClick={handleDownloadPDF} className="download-pdf-btn">
        Download PDF
      </button>

      <div id="pdf-content">
        {/* Header */}
        <div className="disease-report-header">
          <img src="/logo.jpg" alt="Aqua Peak Logo" className="report-logo" />
          <div>
            <h2>Aqua Peak Fish Farm</h2>
            <h3>Disease Report</h3>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* KPI Summary */}
        {stats && (
          <div className="disease-kpi-cards">
            <div className="disease-kpi-card">
              <h4>Total Reports</h4>
              <p>{stats.totalReports}</p>
            </div>
            <div className="disease-kpi-card">
              <h4>Total Sick Fish</h4>
              <p>{stats.totalSickFish}</p>
            </div>
            <div className="disease-kpi-card">
              <h4>Tanks Affected</h4>
              <p>{stats.tanksAffected}</p>
            </div>
          </div>
        )}

        {/* Disease Reports Table */}
        <table className="disease-report-table">
          <thead>
            <tr>
              <th>Date Reported</th>
              <th>Reported By</th>
              <th>Tank Number</th>
              <th>Species</th>
              <th>Number of Fish</th>
              <th>Number Sick</th>
              <th>Symptoms</th>
            </tr>
          </thead>
          <tbody>
            {diseaseReports.map((report, idx) => (
              <tr key={idx}>
                <td>{new Date(report.DateReported).toLocaleDateString()}</td>
                <td>{report.ReportedBy}</td>
                <td>{report.TankNumber}</td>
                <td>{report.FishSpecies}</td>
                <td>{report.NumberOfFish}</td>
                <td>{report.NumberOfSick}</td>
                <td>{report.Symptoms}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* High Priority / Sick Fish Section */}
        {stats?.topSickReports?.length > 0 && (
          <div className="high-sick-section">
            <h3>High Sick Reports (Top 5)</h3>
            <table className="disease-report-table">
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Tank Number</th>
                  <th>Number Sick</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSickReports.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.FishSpecies}</td>
                    <td>{r.TankNumber}</td>
                    <td>{r.NumberOfSick}</td>
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
