// frontend/src/Component/Inventary/InventarySidebar/InventoryDashboardHome.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./InventoryDashboard.css";

function InventoryDashboardHome() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/Inventory")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.inventary ?? res.data?.inventory ?? [];
        setData(list);
      })
      .catch((err) => console.error("Error fetching inventory:", err));
  }, []);

  // ================= CALCULATE STATISTICS =================
  const totalProducts = data.length;

  const feedingItems = data.filter(
    (item) => item.category?.toLowerCase() === "feeding"
  );
  const cleaningItems = data.filter(
    (item) => item.category?.toLowerCase() === "cleaning tanks"
  );
  const packagingItems = data.filter(
    (item) => item.category?.toLowerCase() === "packaging"
  );
  const transferringItems = data.filter(
    (item) => item.category?.toLowerCase() === "transferring fish"
  );
  const waterCheckItems = data.filter(
    (item) => item.category?.toLowerCase() === "check water quality"
  );
  const medicineItems = data.filter(
    (item) => item.category?.toLowerCase() === "add medicine"
  );

  const totalStock = data.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0
  );
  const lowStockItems = data.filter(
    (item) =>
      (parseInt(item.quantity) || 0) <= (parseInt(item.reorder_level) || 0)
  ).length;

  // ================= CHART COLORS =================
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B10DC9", "#9C27B0"];

  return (
    <div className="O_DH_dashboard-container">
      <h1 className="O_DH_dashboard-title">Inventory Dashboard</h1>

      {/* Top Stats Row */}
      <div className="O_DH_stats-container">
        {/* Total Products Card */}
        <div className="O_DH_stat-card">
          <div className="O_DH_stat-main">
            <h2 className="O_DH_stat-number">{totalProducts}</h2>
            <p className="O_DH_stat-label">Total Items</p>
          </div>
          <div className="O_DH_stat-details">
            {/* Feeding Items */}
            <div className="O_DH_detail-item">
              <span className="O_DH_detail-label">Feeding</span>
              <span className="O_DH_detail-value">{feedingItems.length}</span>
            </div>
            <div className="O_DH_food-list">
              {feedingItems.length > 0 ? (
                feedingItems.map((item, index) => (
                  <div key={index} className="O_DH_food-item">
                    • {item.inventoryName} ({item.quantity})
                  </div>
                ))
              ) : (
                <p>No feeding items available</p>
              )}
            </div>

            {/* Cleaning Items */}
            <div className="O_DH_detail-item">
              <span className="O_DH_detail-label">Cleaning Tanks</span>
              <span className="O_DH_detail-value">{cleaningItems.length}</span>
            </div>
            <div className="O_DH_food-list">
              {cleaningItems.length > 0 ? (
                cleaningItems.map((item, index) => (
                  <div key={index} className="O_DH_food-item">
                    • {item.inventoryName} ({item.quantity})
                  </div>
                ))
              ) : (
                <p>No cleaning items available</p>
              )}
            </div>

            {/* Packaging */}
            <div className="O_DH_detail-item">
              <span className="O_DH_detail-label">Packaging</span>
              <span className="O_DH_detail-value">{packagingItems.length}</span>
            </div>

            {/* Transferring Fish */}
            <div className="O_DH_detail-item">
              <span className="O_DH_detail-label">Transferring Fish</span>
              <span className="O_DH_detail-value">{transferringItems.length}</span>
            </div>

            {/* Water Quality Check */}
            <div className="O_DH_detail-item">
              <span className="O_DH_detail-label">Check Water Quality</span>
              <span className="O_DH_detail-value">{waterCheckItems.length}</span>
            </div>

            {/* Add Medicine */}
            <div className="O_DH_detail-item">
              <span className="O_DH_detail-label">Add Medicine</span>
              <span className="O_DH_detail-value">{medicineItems.length}</span>
            </div>
          </div>
        </div>

        {/* Total Stock Card */}
        <div className="O_DH_stat-card">
          <div className="O_DH_stat-main">
            <h2 className="O_DH_stat-number">{totalStock}</h2>
            <p className="O_DH_stat-label">Total Stock</p>
            <div className="O_DH_warning-badge">- {lowStockItems} Low Stock Items</div>
          </div>
          <div className="O_DH_sales-overview">
            <h3>Monthly Item Overview</h3>
            <div className="O_DH_sales-chart-placeholder">
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
            </div>
            <button className="O_DH_view-reports-btn">View Full Reports</button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="O_DH_actions-card">
          <h3>Quick Actions</h3>
          <div className="O_DH_action-item">
            <div className="O_DH_action-icon">+</div>
            <div className="O_DH_action-text">
              <h4>Add New Product</h4>
              <p>Add items related to feeding, cleaning, or medicine</p>
            </div>
          </div>
          <div className="O_DH_action-item">
            <div className="O_DH_action-icon">📋</div>
            <div className="O_DH_action-text">
              <h4>View Inventory</h4>
              <p>Manage your existing products</p>
            </div>
          </div>
          <div className="O_DH_action-item">
            <div className="O_DH_action-icon">📊</div>
            <div className="O_DH_action-text">
              <h4>View Reports</h4>
              <p>See detailed analytics and reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="O_DH_bottom-section">
        {/* Low Stock Items */}
        <div className="O_DH_info-card">
          <h3>Low Stock Items</h3>
          <div className="O_DH_low-stock-list">
            {data
              .filter(
                (item) =>
                  (parseInt(item.quantity) || 0) <=
                  (parseInt(item.reorder_level) || 0)
              )
              .slice(0, 5)
              .map((item, index) => (
                <div key={index} className="O_DH_stock-item">
                  <span className="O_DH_item-name">{item.inventoryName}</span>
                  <span className="O_DH_item-quantity">{item.quantity} left</span>
                </div>
              ))}
            {lowStockItems === 0 && (
              <p className="O_DH_no-items">No low stock items</p>
            )}
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="O_DH_info-card">
          <h3>Recently Added Products</h3>
          <div className="O_DH_recent-items-list">
            {data.slice(0, 5).map((item, index) => (
              <div key={index} className="O_DH_recent-item">
                <span className="O_DH_item-name">{item.inventoryName}</span>
                <span className="O_DH_item-category">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="O_DH_charts-container">
        <div className="O_DH_chart-box">
          <h2 className="O_DH_chart-title">Stock by Item</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="inventoryName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#4CAF50" />
              <Bar dataKey="reorder_level" fill="#FF5733" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="O_DH_chart-box">
          <h2 className="O_DH_chart-title">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="quantity"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default InventoryDashboardHome;
