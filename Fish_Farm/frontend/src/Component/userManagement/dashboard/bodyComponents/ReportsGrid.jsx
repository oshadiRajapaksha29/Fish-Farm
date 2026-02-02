import React from "react";
import { motion } from "framer-motion";
import { Download, Users, Activity, BarChart, Truck, AlertCircle, ListOrdered } from "lucide-react";
import axios from "axios";

const reports = [
  { 
    id: 1, 
    icon: <Users className="icon" />, 
    title: "User Registration Report", 
    description: "Tracks the number of new users joining the system.", 
    color: "blue",
    url: "/report/user-report",
    filename: "user_registration_report.pdf"
  },
  { 
    id: 2, 
    icon: <Activity className="icon" />, 
    title: "System Login Activity Report", 
    description: "Monitors login frequency and peak usage times.", 
    color: "green", 
    colSpan: 2,
    url: "/report/login-report",
    filename: "login_activities_report.pdf"
  },
  { 
    id: 3, 
    icon: <BarChart className="icon" />, 
    title: "Aquaculture Stock & Health Report", 
    description: "Analyzes total fish, tank distribution, disease cases, healthy.", 
    color: "purple", 
    colSpan: 4,
    url: "/report/aquaculture-report",
    filename: "Aquaculture_Stock_&_Health_Report.pdf"
  },
  { 
    id: 4, 
    icon: <ListOrdered className="icon" />, 
    title: "Inventory & Orders Report", 
    description: "Total inventory items, total stock value, total orders, revenue.", 
    color: "orange", 
    colSpan: 1,
    url: "/report/inventory-orders-report",
    filename: "Inventory_&_Orders_Report.pdf"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
  }),
};

function ReportsGrid() {
  const downloadReport = async (report) => {
    try {
      console.log(`Downloading ${report.title}...`);
      
      const response = await axios.get(`http://localhost:5000/admin${report.url}`, { 
        responseType: "blob",
        withCredentials: true // Add this if you need authentication
      });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", report.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
      
      console.log(`${report.title} downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${report.title}:`, error);
      // You can add user-friendly error handling here
      alert(`Failed to download ${report.title}. Please try again.`);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" className="grid-container">
      {reports.map((report, index) => (
        <motion.div
          key={report.id}
          variants={cardVariants}
          custom={index}
          whileHover={{ scale: 1.05 }}
          className={`card ${report.color} ${report.colSpan ? `col-span-${report.colSpan}` : ""} ${report.rowSpan ? `row-span-${report.rowSpan}` : ""}`}
        >
          {report.icon}
          <h3 className="card-title">{report.title}</h3>
          <p className="card-desc">{report.description}</p>
          <button onClick={() => downloadReport(report)} className="download-btn">
            <Download className="download-icon" /> Download
          </button>
        </motion.div>
      ))}
      <style>{`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: minmax(120px, auto);
          gap: 20px;
          padding: 24px;
          grid-auto-flow: dense;
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
          border-radius: 16px;
          border: 2px solid transparent;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .icon { width: 56px; height: 56px; margin-bottom: 12px; }
        .card-title { font-weight: bold; font-size: 16px; margin: 8px 0; }
        .card-desc { font-size: 12px; color: #374151; margin-bottom: 12px; }
        .download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }
        .download-icon { width: 24px; height: 24px; }

        /* Colors */
        .blue { border-color: #93c5fd; background: rgba(147,197,253,0.2); color: #1d4ed8; }
        .green { border-color: #86efac; background: rgba(134,239,172,0.2); color: #15803d; }
        .purple { border-color: #c4b5fd; background: rgba(196,181,253,0.2); color: #6d28d9; }
        .orange { border-color: #fdba74; background: rgba(253,186,116,0.2); color: #c2410c; }
        .red { border-color: #fca5a5; background: rgba(252,165,165,0.2); color: #b91c1c; }
        .indigo { border-color: #a5b4fc; background: rgba(165,180,252,0.2); color: #3730a3; }

        /* Grid spans */
        .col-span-2 { grid-column: span 2; }
        .col-span-4 { grid-column: span 4; }
        .row-span-2 { grid-row: span 2; }
      `}</style>
    </motion.div>
  );
}

export default ReportsGrid;