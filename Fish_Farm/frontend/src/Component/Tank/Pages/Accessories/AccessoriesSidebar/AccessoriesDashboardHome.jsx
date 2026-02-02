import React, { useEffect, useState } from "react";
import axios from "axios";
import './DashboardPage.css';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AccessoriesDashboard = () => {
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
  const [activeTab, setActiveTab] = useState("overview");

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
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filteredAccessories = accessories
    .filter((item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => (filterLowStock ? Number(item.stock) < 5 : true));

  // Enhanced CSS Styles
  const styles = {
    container: {
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#f5f7fa",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },

    topbar: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "30px",
      gap: "20px",
    },

    title: {
      fontSize: "2.5rem",
      fontWeight: "800",
      background: "linear-gradient(135deg, #0a73dd 0%, #25d0ab 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textAlign: "center",
      marginBottom: "10px",
    },

    subtitle: {
      fontSize: "1.1rem",
      color: "#666",
      textAlign: "center",
      maxWidth: "600px",
    },

    search: {
      padding: "12px 20px",
      fontSize: "1rem",
      borderRadius: "25px",
      border: "2px solid #e1e8ed",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      outline: "none",
      transition: "all 0.3s ease",
      width: "350px",
      maxWidth: "90%",
      backgroundColor: "white",
    },

    // Tabs Navigation
    tabs: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "25px",
      gap: "8px",
      flexWrap: "wrap",
    },

    tab: {
      padding: "10px 25px",
      borderRadius: "20px",
      border: "none",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backgroundColor: "#fff",
      color: "#666",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },

    activeTab: {
      backgroundColor: "#0a73dd",
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(10, 115, 221, 0.3)",
    },

    // FIXED Cards Container
    cardsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
      alignItems: "stretch",
    },

    card: {
      backgroundColor: "#fff",
      borderRadius: "15px",
      padding: "25px 20px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      textAlign: "center",
      transition: "all 0.3s ease",
      cursor: "pointer",
      border: "1px solid transparent",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "140px",
      position: "relative",
      overflow: "hidden",
    },

    cardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    },

    cardIcon: {
      fontSize: "2.5rem",
      marginBottom: "15px",
      opacity: "0.8",
    },

    cardNumber: { 
      fontSize: "2.5rem", 
      fontWeight: "800", 
      marginBottom: "8px",
      background: "linear-gradient(135deg, #0a73dd 0%, #25d0ab 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      lineHeight: "1",
    },

    cardLabel: { 
      fontSize: "1rem", 
      color: "#666",
      fontWeight: "600",
      textAlign: "center",
      lineHeight: "1.3",
    },

    // Special styling for the low stock filter card
    lowStockCard: {
      backgroundColor: filterLowStock ? "#fff9e6" : "#fff",
      border: filterLowStock ? "2px solid #f1c40f" : "1px solid transparent",
    },

    // Charts Container
    chartsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },

    chartContainer: {
      backgroundColor: "#fff",
      borderRadius: "15px",
      padding: "20px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
      height: "320px",
      display: "flex",
      flexDirection: "column",
    },

    chartTitle: {
      fontSize: "1.1rem",
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: "15px",
      textAlign: "center",
    },

    chartWrapper: {
      flex: 1,
      minHeight: "0",
    },

    // Table
    tableWrapper: { 
      overflowX: "auto", 
      marginTop: "20px",
      backgroundColor: "#fff",
      borderRadius: "15px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      padding: "15px",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      borderRadius: "10px",
    },

    th: {
      padding: "15px 12px",
      borderBottom: "2px solid #f1f3f4",
      textAlign: "left",
      backgroundColor: "#f8fafc",
      color: "#2c3e50",
      fontWeight: "700",
      fontSize: "0.9rem",
    },

    td: { 
      padding: "12px",
      borderBottom: "1px solid #f1f3f4",
      fontSize: "0.9rem",
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
    }),
  };

  // Chart data calculations and other code remains the same...
  const categoryStock = {};
  const categoryCount = {};
  const priceRanges = { "Rs. 0-500": 0, "Rs. 501-1000": 0, "Rs. 1001-2000": 0, "Rs. 2000+": 0 };

  accessories.forEach(item => {
    categoryStock[item.category] = (categoryStock[item.category] || 0) + Number(item.stock);
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    
    const price = Number(item.price);
    if (price <= 500) priceRanges["Rs. 0-500"]++;
    else if (price <= 1000) priceRanges["Rs. 501-1000"]++;
    else if (price <= 2000) priceRanges["Rs. 1001-2000"]++;
    else priceRanges["Rs. 2000+"]++;
  });

  const stockStatus = {
    "In Stock (>10)": accessories.filter(item => item.stock > 10).length,
    "Low Stock (5-10)": accessories.filter(item => item.stock >= 5 && item.stock <= 10).length,
    "Critical (<5)": accessories.filter(item => item.stock < 5).length,
  };

  const chartColors = {
    primary: ['#3498db', '#27ae60', '#f1c40f', '#e74c3c', '#9b59b6', '#16a085', '#34495e', '#fd7e14'],
    pastel: ['#a29bfe', '#fd79a8', '#fdcb6e', '#55efc4', '#74b9ff', '#ffeaa7', '#fab1a0', '#dfe6e9'],
    vibrant: ['#ff6b6b', '#48dbfb', '#1dd1a1', '#f368e0', '#ff9f43', '#54a0ff', '#5f27cd', '#00d2d3']
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 10 },
          padding: 15,
        }
      },
      title: { display: false },
      tooltip: {
        bodyFont: { size: 11 },
        titleFont: { size: 11 },
        padding: 8,
      },
    },
  };

  const stockByCategoryData = {
    labels: Object.keys(categoryStock),
    datasets: [
      {
        label: 'Stock Quantity',
        data: Object.values(categoryStock),
        backgroundColor: chartColors.primary.slice(0, Object.keys(categoryStock).length),
        borderRadius: 6,
        maxBarThickness: 25,
      },
    ],
  };

  const stockByCategoryOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: { 
        beginAtZero: true, 
        grid: { color: '#f1f3f4' },
        ticks: { font: { size: 10 } }
      },
      y: { 
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
    },
  };

  const productsByCategoryData = {
    labels: Object.keys(categoryCount),
    datasets: [
      {
        data: Object.values(categoryCount),
        backgroundColor: chartColors.pastel.slice(0, Object.keys(categoryCount).length),
        borderWidth: 1.5,
        borderColor: '#fff',
      },
    ],
  };

  const productsByCategoryOptions = { ...chartOptions };

  const priceDistributionData = {
    labels: Object.keys(priceRanges),
    datasets: [
      {
        data: Object.values(priceRanges),
        backgroundColor: chartColors.vibrant.slice(0, 4),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const priceDistributionOptions = {
    ...chartOptions,
    cutout: '55%',
  };

  const stockStatusData = {
    labels: Object.keys(stockStatus),
    datasets: [
      {
        label: 'Number of Products',
        data: Object.values(stockStatus),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const stockStatusOptions = {
    ...chartOptions,
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: '#f1f3f4' },
        ticks: { font: { size: 10 } }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
    },
  };

  return (
    <div className="accessories-dashboard-home" style={styles.container}>
      {/* Topbar */}
      <div style={styles.topbar}>
        <h1 style={styles.title}>Accessories Dashboard</h1>
        <p style={styles.subtitle}>
          Manage and monitor your accessory inventory with real-time insights and analytics
        </p>
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

      {/* Navigation Tabs
      <div style={styles.tabs}>
        {["overview", "analytics", "inventory", "reports"].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div> */}

      {/* FIXED Summary Cards */}
      <div style={styles.cardsContainer}>
        {[
          { label: "Total Accessories", value: summary.totalAccessories, icon: "📦" },
          { label: "Low Stock Items", value: summary.lowStockCount, icon: "⚠️" },
          { label: "Critical Stock", value: summary.criticalStockCount, icon: "🚨" },
          { label: "Total Stock", value: summary.totalStock, icon: "📊" },
          { label: "Total Value", value: `Rs. ${summary.totalValue.toLocaleString()}`, icon: "💰" },
        ].map((card, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              ...(index === 1 ? styles.lowStockCard : {}) // Special style for low stock card
            }}
            onMouseEnter={(e) => {
              if (index === 1) {
                e.target.style.backgroundColor = "#fff9e6";
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
              } else {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (index === 1) {
                e.target.style.backgroundColor = filterLowStock ? "#fff9e6" : "#fff";
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
              } else {
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
              }
            }}
            onClick={() => index === 1 && setFilterLowStock(!filterLowStock)}
          >
            <div style={styles.cardIcon}>{card.icon}</div>
            <div style={styles.cardNumber}>{card.value}</div>
            <div style={styles.cardLabel}>{card.label}</div>
          </div>
        ))}
      </div><br></br><br></br>

      {/* Multiple Charts Section */}
      {activeTab === "overview" && (
        <div style={styles.chartsGrid}>
          <div style={styles.chartContainer}>
            <div style={styles.chartTitle}>Stock by Category</div>
            <div style={styles.chartWrapper}>
              <Bar data={stockByCategoryData} options={stockByCategoryOptions} />
            </div>
          </div>

          <div style={styles.chartContainer}>
            <div style={styles.chartTitle}>Products by Category</div>
            <div style={styles.chartWrapper}>
              <Pie data={productsByCategoryData} options={productsByCategoryOptions} />
            </div>
          </div>

          <div style={styles.chartContainer}>
            <div style={styles.chartTitle}>Price Range Distribution</div>
            <div style={styles.chartWrapper}>
              <Doughnut data={priceDistributionData} options={priceDistributionOptions} />
            </div>
          </div>

          {/* <div style={styles.chartContainer}>
            <div style={styles.chartTitle}>Stock Status Overview</div>
            <div style={styles.chartWrapper}>
              <Line data={stockStatusData} options={stockStatusOptions} />
            </div>
          </div> */}
        </div>
      )}
      <br></br>

      {/* Accessories Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
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
                  <td style={styles.td}><strong>{item.product}</strong></td>
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
                  <td style={styles.td}><strong>Rs. {Number(item.price).toLocaleString()}</strong></td>
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
        <br></br><br></br>

    </div>
  );
};

export default AccessoriesDashboard;