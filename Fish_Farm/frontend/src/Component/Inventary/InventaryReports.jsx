import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import "./InventaryReports.css";

function InventaryReports() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/Inventory")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.inventary ?? res.data?.inventory ?? [];
        setData(list);
        setFilteredData(list);
      })
      .catch((err) => console.error("❌ Error fetching inventory:", err));
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Filter function
  const applyFilter = () => {
    let filtered = [...data];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt || item.date || item.updatedAt);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredData(filtered);
  };

  // ✅ Reset filters
  const clearFilter = () => {
    setFilters({ category: "", startDate: "", endDate: "" });
    setFilteredData(data);
  };

  // ✅ Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 10);

    const tableColumn = [
      "ID",
      "Name",
      "Category",
      "Quantity",
      "Unit",
      "Reorder Level",
    ];
    const tableRows = [];

    filteredData.forEach((item) => {
      tableRows.push([
        item._id,
        item.inventoryName,
        item.category,
        item.quantity,
        item.unit,
        item.reorder_level,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save("filtered_inventory_report.pdf");
  };

  // ✅ Export as Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "filtered_inventory_report.xlsx");
  };

  // ✅ Export as CSV
  const exportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "filtered_inventory_report.csv");
  };

  return (
    <div className="O_I_R_reports-container">
      <h1 className="O_I_R_reports-title">Inventory Reports</h1>

      {/* ✅ Filters */}
      <div className="O_I_R_filters-container">
        <div className="O_I_R_filter-group">
          <label>Category:</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="Feeding">Feeding</option>
            <option value="Cleaning Tanks">Cleaning Tanks</option>
            <option value="Packaging">Packaging</option>
            <option value="Transferring Fish">Transferring Fish</option>
            <option value="Check Water Quality">Check Water Quality</option>
            <option value="Add Medicine">Add Medicine</option>
          </select>
        </div>

        <div className="O_I_R_filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="O_I_R_filter-group">
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>

        <button onClick={applyFilter} className="O_I_R_report-btn filter-btn">
          Apply Filter
        </button>
        <button onClick={clearFilter} className="O_I_R_report-btn clear-btn">
          Clear
        </button>
      </div>

      {/* ✅ Export Buttons */}
      <div className="O_I_R_buttons-container">
        <button onClick={exportPDF} className="O_I_R_report-btn pdf-btn">
          Export as PDF
        </button>
        <button onClick={exportExcel} className="O_I_R_report-btn excel-btn">
          Export as Excel
        </button>
        <button onClick={exportCSV} className="O_I_R_report-btn csv-btn">
          Export as CSV
        </button>
      </div>

      {/* ✅ Table Preview */}
      <div className="O_I_R_report-preview">
        <h2>Filtered Inventory Data</h2>
        <table className="O_I_R_report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Inventory Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, i) => (
                <tr key={i}>
                  <td>{item._id}</td>
                  <td>{item.inventoryName}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.reorder_level}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventaryReports;
