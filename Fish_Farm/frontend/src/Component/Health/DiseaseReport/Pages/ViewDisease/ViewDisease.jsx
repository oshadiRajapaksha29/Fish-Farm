import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewDisease.css";

const API_BASE = "http://localhost:5000";

export default function ViewDisease() {
  const [diseaseReports, setDiseaseReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vetReplies, setVetReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});

  // Fetch all reports
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE}/diseaseReports`);
      const reports = res.data || [];
      setDiseaseReports(reports);
      setFilteredReports(reports);
      fetchVetReplies(reports);
    } catch (err) {
      console.error("Error fetching disease reports:", err);
    }
  };

  // Fetch vet replies
  const fetchVetReplies = async (reports) => {
    try {
      const repliesObj = {};
      await Promise.all(
        reports.map(async (report) => {
          try {
            const res = await axios.get(`${API_BASE}/api/vetReplies/${report._id}`);
            repliesObj[report._id] = res.data || [];
          } catch (err) {
            console.error(`Error fetching replies for report ${report._id}:`, err);
            repliesObj[report._id] = [];
          }
        })
      );
      setVetReplies(repliesObj);
    } catch (err) {
      console.error("Error fetching vet replies:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = diseaseReports.filter(
      (report) =>
        report.FishSpecies.toLowerCase().includes(query) ||
        String(report.TankNumber).includes(query) ||
        report.ReportedBy.toLowerCase().includes(query)
    );
    setFilteredReports(filtered);
  }, [searchQuery, diseaseReports]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`${API_BASE}/diseaseReports/${id}`);
        const updated = diseaseReports.filter((r) => r._id !== id);
        setDiseaseReports(updated);
        setFilteredReports(updated);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const openEditModal = (report) => {
    setSelectedReport(report);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${API_BASE}/diseaseReports/${selectedReport._id}`, selectedReport);
      setShowEditModal(false);
      fetchReports();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSendToVet = async (report) => {
    try {
      const emailData = {
        doctorEmail: "vet@example.com",
        subject: `Disease Report [Report ID: ${report._id}] - ${report.FishSpecies} - Tank ${report.TankNumber}`,
        message: `
          Fish Species: ${report.FishSpecies}
          Tank Number: ${report.TankNumber}
          Reported By: ${report.ReportedBy}
          Number of Fish: ${report.NumberOfFish}
          Number Sick: ${report.NumberOfSick}
          Symptoms: ${report.Symptoms}
          Report Date: ${new Date(report.DateReported).toLocaleDateString()}
        `,
        photos: report.Photos?.map((photo) =>
          `${API_BASE}${photo.startsWith("/") ? photo : "/" + photo}`
        ),
      };
      const response = await axios.post(`${API_BASE}/api/email/send`, emailData);
      alert(response.data.message || "Report sent to Vet Doctor successfully!");
    } catch (err) {
      console.error("Sending email failed:", err);
      alert("Failed to send report to Vet Doctor.");
    }
  };

  // 🧠 Handle Ask AI
  const handleAskAI = async (report) => {
    try {
      const aiRequest = {
        fishSpecies: report.FishSpecies,
        symptoms: report.Symptoms,
        waterTemp: report.WaterTemp || 28,
        behavior: "unknown",
      };

      const res = await axios.post(`${API_BASE}/api/ai/advice`, aiRequest);
      alert(
        `🧠 AI Suggestion:\n\nDiagnosis: ${res.data.diagnosis}\nRecommendation: ${res.data.recommendation}`
      );
    } catch (err) {
      console.error("AI request failed:", err);
      alert("AI assistant could not process this request.");
    }
  };

  const toggleReplies = (reportId) => {
    setShowReplies((prev) => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  return (
    <div className="S_VD_view-disease-container">
      <div className="S_VD_view-header">
        <h1>Disease Reports</h1>
      </div>

      <div className="S_VD_search-bar">
        <input
          type="text"
          placeholder="🔍 Search by Fish Species, Tank Number, or Reporter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="S_VD_disease-boxes">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report._id} className="S_VD_disease-box">
              <div className="S_VD_disease-box-head">
                <div className="S_VD_title">
                  <span className="S_VD_subtype">Tank {report.TankNumber}</span>
                  <span className="S_VD_type">{report.FishSpecies}</span>
                </div>
                <span className="S_VD_badge">
                  {new Date(report.DateReported).toLocaleDateString()}
                </span>
              </div>

              <div className="S_VD_rows">
                <div className="S_VD_row">
                  <b>Reported By:</b> {report.ReportedBy}
                </div>
                <div className="S_VD_row">
                  <b>Number of Fish:</b> {report.NumberOfFish}
                </div>
                <div className="S_VD_row">
                  <b>Sick:</b> {report.NumberOfSick}
                </div>
                <div className="S_VD_row">
                  <b>Symptoms:</b> {report.Symptoms}
                </div>
              </div>

              {report.Photos && report.Photos.length > 0 && (
                <div className="S_VD_photo-grid">
                  {report.Photos.map((photo, i) => (
                    <img
                      key={i}
                      src={`${API_BASE}${photo.startsWith("/") ? photo : "/" + photo}`}
                      alt="disease"
                    />
                  ))}
                </div>
              )}

              <div className="S_VD_actions">
                <button
                  className="S_VD_btn S_VD_secondary"
                  onClick={() => openEditModal(report)}
                >
                  Edit
                </button>
                <button
                  className="S_VD_btn S_VD_danger"
                  onClick={() => handleDelete(report._id)}
                >
                  Delete
                </button>
                <button
                  className="S_VD_btn S_VD_vet"
                  onClick={() => handleSendToVet(report)}
                >
                  Send to Vet Doctor
                </button>
                {/* 🧠 Ask AI button */}
                <button
                  className="S_VD_btn S_VD_ai"
                  onClick={() => handleAskAI(report)}
                >
                  Ask AI
                </button>
                <button
                  className="S_VD_btn S_VD_show-replies"
                  onClick={() => toggleReplies(report._id)}
                >
                  {showReplies[report._id] ? "Hide Replies" : "Show Replies"}
                </button>
              </div>

              {showReplies[report._id] && (
                <div className="S_VD_vet-replies">
                  <h4>Vet Replies:</h4>
                  {vetReplies[report._id]?.length > 0 ? (
                    vetReplies[report._id].map((reply) => (
                      <div key={reply._id} className="S_VD_vet-reply-card">
                        <div className="S_VD_reply-header">
                          <span className="S_VD_reply-from">
                            <b>From:</b> {reply.from}
                          </span>
                          <span className="S_VD_reply-date">
                            {new Date(reply.date).toLocaleString()}
                          </span>
                        </div>
                        <div className="S_VD_reply-subject">
                          <b>Subject:</b> {reply.subject}
                        </div>
                        <div className="S_VD_reply-message">
                          {reply.bodyText}
                        </div>
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="S_VD_reply-attachments">
                            {reply.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={`${API_BASE}${att.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {att.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="S_VD_no-replies">No replies yet.</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="S_VD_loading">No disease reports found.</p>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedReport && (
        <div className="S_VD_modal-backdrop">
          <div className="S_VD_modal">
            <h3>Edit Disease Report</h3>
            <div className="S_VD_edit-form S_VD_grid">
              <label>
                Date Reported
                <input
                  type="date"
                  value={new Date(selectedReport.DateReported)
                    .toISOString()
                    .split("T")[0]}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      DateReported: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Reported By
                <input
                  type="text"
                  value={selectedReport.ReportedBy}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      ReportedBy: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Tank Number
                <input
                  type="number"
                  value={selectedReport.TankNumber}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      TankNumber: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Fish Species
                <input
                  type="text"
                  value={selectedReport.FishSpecies}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      FishSpecies: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Number of Fish
                <input
                  type="number"
                  value={selectedReport.NumberOfFish}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      NumberOfFish: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Number of Sick
                <input
                  type="number"
                  value={selectedReport.NumberOfSick}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      NumberOfSick: e.target.value,
                    })
                  }
                />
              </label>
              <label className="S_VD_col-span-2">
                Symptoms
                <textarea
                  value={selectedReport.Symptoms}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      Symptoms: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <div className="S_VD_modal-actions">
              <button
                className="S_VD_btn S_VD_secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="S_VD_btn" onClick={handleEditSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
