// frontend/src/Components/AI/AiModal.jsx
import React from "react";
import "./../../styles/AiModal.css";

const AiModal = ({ show, onClose, aiResponse }) => {
  if (!show) return null;

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal">
        <h2>AI Suggestion</h2>
        <p><strong>Diagnosis:</strong> {aiResponse?.diagnosis}</p>
        <p><strong>Recommendation:</strong> {aiResponse?.recommendation}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AiModal;
