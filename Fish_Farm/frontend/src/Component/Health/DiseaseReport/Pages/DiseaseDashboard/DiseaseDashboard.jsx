import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DiseaseDashboard.css";

const API_BASE = "http://localhost:5000";

export default function DiseaseDashboard() {
  const [diseaseReports, setDiseaseReports] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch reports
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/disease`);
      setDiseaseReports(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Disease Management Dashboard</h1>

      <button
        onClick={() => navigate("/dashboard/disease/add")}
        className="btn-add"
      >
        + Add New Report
      </button>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reported By</th>
            <th>Tank</th>
            <th>Species</th>
            <th>Sick / Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diseaseReports.length > 0 ? (
            diseaseReports.map((report) => (
              <tr key={report._id}>
                <td>{new Date(report.DateReported).toLocaleDateString()}</td>
                <td>{report.ReportedBy}</td>
                <td>{report.TankNumber}</td>
                <td>{report.FishSpecies}</td>
                <td>
                  {report.NumberOfSick} / {report.NumberOfFish}
                </td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/dashboard/disease/${report._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No reports available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
