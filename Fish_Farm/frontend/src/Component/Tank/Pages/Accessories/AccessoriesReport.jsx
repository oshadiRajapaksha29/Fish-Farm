import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./logo.png";

const AccessoriesReport = () => {
  const [accessories, setAccessories] = useState([]);
  const [summary, setSummary] = useState({
    totalAccessories: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    totalStock: 0,
    totalValue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/accessories");
        const data = res.data.accessories;
        setAccessories(data);

        const totalStock = data.reduce((sum, item) => sum + Number(item.stock), 0);
        const totalValue = data.reduce((sum, item) => sum + (Number(item.price) * Number(item.stock)), 0);
        const lowStockCount = data.filter((item) => Number(item.stock) < 5).length;
        const criticalStockCount = data.filter((item) => Number(item.stock) <= 1).length;

        setSummary({
          totalAccessories: data.length,
          lowStockCount,
          criticalStockCount,
          totalStock,
          totalValue,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAccessories = accessories
    .filter((item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => (filterLowStock ? Number(item.stock) < 5 : true));

  // ----------------- Enhanced PDF Export -----------------
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add Logo and Header
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, "PNG", 14, 10, 30, 30);
      
      // Company Info
      doc.setFontSize(20);
      doc.setTextColor(10, 115, 221);
      doc.text("Aqua Peak", 50, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Fish Farm & Accessories", 50, 27);
      doc.text("Contact: +94 77 123 4567", 50, 34);
      doc.text("Email: info@aquapeak.com", 50, 41);

      // Report Title
      doc.setFontSize(24);
      doc.setTextColor(40);
      doc.text("ACCESSORIES INVENTORY REPORT", pageWidth / 2, 60, { align: "center" });

      // Report Details
      doc.setFontSize(12);
      doc.setTextColor(80);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 75);
      doc.text(`Report Period: ${new Date().getFullYear()}`, 14, 82);

      // Summary Section
      doc.setFontSize(14);
      doc.setTextColor(10, 115, 221);
      doc.text("SUMMARY OVERVIEW", 14, 95);
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Total Accessories: ${summary.totalAccessories}`, 14, 105);
      doc.text(`Low Stock Items (<5): ${summary.lowStockCount}`, 14, 112);
      doc.text(`Critical Stock (≤1): ${summary.criticalStockCount}`, 14, 119);
      doc.text(`Total Stock Quantity: ${summary.totalStock}`, 14, 126);
      doc.text(`Total Inventory Value: Rs. ${summary.totalValue.toLocaleString()}`, 14, 133);

      // Table Data
      const tableColumn = ["Product", "Category", "Price (Rs.)", "Stock", "Status"];
      const tableRows = [];

      filteredAccessories.forEach((item) => {
        const status = item.stock <= 1 ? "Critical" : item.stock < 5 ? "Low" : "Good";
        const rowData = [
          item.product,
          item.category,
          Number(item.price).toLocaleString(),
          item.stock,
          status
        ];
        tableRows.push(rowData);
      });

      // Table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 140,
        styles: { 
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: { 
          fillColor: [10, 115, 221],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 }
        },
        margin: { left: 14, right: 14 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
        doc.text("Confidential - Aqua Peak Internal Use", pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
      }

      doc.save(`Accessories_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };
  };

  // ---------- Enhanced Full-Page Styles ----------
  const styles = {
    container: {
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f5f7fa",
      padding: "20px",
      margin: 0,
      boxSizing: "border-box",
      overflowX: "hidden",
    },

    topbar: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "30px",
      gap: "20px",
      width: "100%",
    },

    title: {
      fontSize: "clamp(2rem, 4vw, 2.5rem)",
      fontWeight: "800",
      background: "linear-gradient(135deg, #0a73dd 0%, #25d0ab 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textAlign: "center",
      marginBottom: "10px",
      width: "100%",
    },

    subtitle: {
      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
      color: "#666",
      textAlign: "center",
      maxWidth: "800px",
      width: "90%",
    },

    search: {
      padding: "12px 20px",
      fontSize: "1rem",
      borderRadius: "25px",
      border: "2px solid #e1e8ed",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      outline: "none",
      transition: "all 0.3s ease",
      width: "min(400px, 90vw)",
      backgroundColor: "white",
    },

    // Controls Section
    controls: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      gap: "15px",
      flexWrap: "wrap",
      width: "100%",
    },

    filterButton: {
      padding: "10px 20px",
      borderRadius: "20px",
      border: "none",
      backgroundColor: "#f1c40f",
      color: "#333",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      whiteSpace: "nowrap",
    },

    activeFilter: {
      backgroundColor: "#e74c3c",
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
    },

    pdfButton: {
      padding: "12px 24px",
      borderRadius: "25px",
      border: "none",
      backgroundColor: "#0a73dd",
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(10, 115, 221, 0.3)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap",
    },

    // Summary Cards
    cardsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "25px",
      width: "100%",
    },

    card: {
      backgroundColor: "#fff",
      borderRadius: "15px",
      padding: "20px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      textAlign: "center",
      borderLeft: "4px solid #0a73dd",
      minWidth: "0",
    },

    cardNumber: {
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "800",
      color: "#0a73dd",
      marginBottom: "5px",
    },

    cardLabel: {
      fontSize: "0.9rem",
      color: "#666",
      fontWeight: "600",
    },

    // Table Styles
    tableWrapper: {
      overflowX: "auto",
      backgroundColor: "#fff",
      borderRadius: "15px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      padding: "15px",
      width: "100%",
      maxWidth: "100%",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      borderRadius: "10px",
      minWidth: "800px",
    },

    th: {
      padding: "15px 12px",
      borderBottom: "2px solid #f1f3f4",
      textAlign: "left",
      backgroundColor: "#f8fafc",
      color: "#2c3e50",
      fontWeight: "700",
      fontSize: "0.9rem",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "12px",
      borderBottom: "1px solid #f1f3f4",
      fontSize: "0.9rem",
      whiteSpace: "nowrap",
    },

    lowStockRow: {
      backgroundColor: "#fff5f5",
      borderLeft: "4px solid #fc5c65",
    },

    criticalStockRow: {
      backgroundColor: "#fff0f0",
      borderLeft: "4px solid #eb3b5a",
    },

    img: {
      width: "50px",
      height: "50px",
      objectFit: "cover",
      borderRadius: "8px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },

    statusBadge: (stock) => ({
      padding: "6px 12px",
      borderRadius: "15px",
      backgroundColor: stock <= 1 ? "#ffeaa7" : stock < 5 ? "#fd79a8" : "#55efc4",
      color: stock <= 1 ? "#e17055" : stock < 5 ? "#e84393" : "#00b894",
      fontWeight: "600",
      fontSize: "0.8rem",
      display: "inline-block",
      whiteSpace: "nowrap",
    }),

    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "1.2rem",
      color: "#666",
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading accessories data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Topbar */}
      <div style={styles.topbar}>
        <h1 style={styles.title}>Accessories Inventory Report</h1>
        <p style={styles.subtitle}>
          Comprehensive overview of your accessory inventory with export capabilities
        </p>
        
        {/* Search inside topbar for better layout */}
        <input
          type="text"
          placeholder="🔍 Search accessories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#e1e8ed")}
        />
      </div>

      {/* Controls Section */}
      <div style={styles.controls}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            style={{
              ...styles.filterButton,
              ...(filterLowStock ? styles.activeFilter : {})
            }}
            onClick={() => setFilterLowStock(!filterLowStock)}
          >
            {filterLowStock ? "✅ Show All" : "⚠️ Low Stock Only"}
          </button>

          <button style={styles.pdfButton} onClick={exportPDF}>
            📊 Download PDF Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <div style={styles.cardNumber}>{summary.totalAccessories}</div>
          <div style={styles.cardLabel}>Total Accessories</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardNumber}>{summary.lowStockCount}</div>
          <div style={styles.cardLabel}>Low Stock Items</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardNumber}>{summary.criticalStockCount}</div>
          <div style={styles.cardLabel}>Critical Stock</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardNumber}>{summary.totalStock}</div>
          <div style={styles.cardLabel}>Total Stock</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardNumber}>Rs. {summary.totalValue.toLocaleString()}</div>
          <div style={styles.cardLabel}>Total Value</div>
        </div>
      </div>

      {/* Accessories Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price (Rs.)</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Image</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccessories.length > 0 ? (
              filteredAccessories.map((item) => (
                <tr 
                  key={item._id} 
                  style={item.stock <= 1 ? styles.criticalStockRow : item.stock < 5 ? styles.lowStockRow : {}}
                >
                  <td style={styles.td}>
                    <strong>{item.product}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      backgroundColor: "#f1f3f4",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <strong>Rs. {Number(item.price).toLocaleString()}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      fontWeight: "700",
                      color: item.stock <= 1 ? "#eb3b5a" : item.stock < 5 ? "#fc5c65" : "#26de81"
                    }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(item.stock)}>
                      {item.stock <= 1 ? "Critical" : item.stock < 5 ? "Low" : "In Stock"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {item.imageProduct && (
                      <img
                        src={`http://localhost:5000/${item.imageProduct}`}
                        alt={item.product}
                        style={styles.img}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50x50/3498db/white?text=📷";
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                  <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>🔍</div>
                  No accessories found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessoriesReport;