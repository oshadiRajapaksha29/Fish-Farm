
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBox, FaMedkit, FaChartBar, FaClipboardList, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import './FoodAndMedicineDashboardHome.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function FoodAndMedicineDashboardHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarClosed, setSidebarClosed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: [],
    recentlyAdded: [],
    productCategories: { food: 0, medicine: 0 },
    topSellingItems: [],
    monthlySales: []
  });

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, you'd fetch from your backend
        // For now, we'll simulate with mock data after a delay
        
        setTimeout(() => {
          // Mock data
          const mockData = {
            totalProducts: 36,
            totalStock: 476,
            lowStockItems: [
              { _id: '1', productName: 'TetraMin Flakes', stock: 5, threshold: 10, price: 450 },
              { _id: '2', productName: 'Aquarium Salt', stock: 3, threshold: 8, price: 300 },
              { _id: '3', productName: 'Bacterial Treatment', stock: 2, threshold: 5, price: 750 }
            ],
            recentlyAdded: [
              { _id: '4', productName: 'Omega One Fish Food', stock: 25, category: 'Food', addedOn: '2025-09-15', price: 550 },
              { _id: '5', productName: 'API Stress Coat', stock: 15, category: 'Medicine', addedOn: '2025-09-14', price: 650 },
              { _id: '6', productName: 'Hikari Bio-Gold', stock: 30, category: 'Food', addedOn: '2025-09-12', price: 480 },
              { _id: '7', productName: 'Fluval Cycle', stock: 10, category: 'Medicine', addedOn: '2025-09-10', price: 850 }
            ],
            productCategories: { food: 22, medicine: 14 },
            topSellingItems: [
              { _id: '8', productName: 'Tetra Fish Flakes', sold: 45, stock: 18, price: 400 },
              { _id: '9', productName: 'API Aquarium Salt', sold: 38, stock: 12, price: 300 },
              { _id: '10', productName: 'Seachem Prime', sold: 32, stock: 8, price: 950 },
              { _id: '11', productName: 'Fluval Bug Bites', sold: 29, stock: 15, price: 650 },
              { _id: '12', productName: 'API Stress Coat+', sold: 24, stock: 7, price: 780 }
            ],
            monthlySales: [
              { month: 'Apr', food: 32, medicine: 18 },
              { month: 'May', food: 38, medicine: 22 },
              { month: 'Jun', food: 30, medicine: 25 },
              { month: 'Jul', food: 40, medicine: 20 },
              { month: 'Aug', food: 35, medicine: 28 },
              { month: 'Sep', food: 42, medicine: 30 }
            ]
          };
          
          setDashboardData(mockData);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate highest month values for chart scaling
  const maxMonthlyValue = dashboardData.monthlySales.length > 0 ? 
    Math.max(...dashboardData.monthlySales.map(item => Math.max(item.food, item.medicine))) : 0;
    
  // Function to get status class based on status
  const getStatusClass = (status) => {
    switch (status) {
      case 'good': return 'good';
      case 'medium': return 'medium';
      case 'low': return 'low';
      case 'critical': return 'critical';
      default: return '';
    }
  };

  return (
    <div className={`r_fm_d_container ${isSidebarClosed ? 'sidebar-closed' : ''}`}>
      <h1 className="r_fm_d_title">Food & Medicine Dashboard</h1>

      {isLoading ? (
        <div className="r_fm_d_loading">
          <div className="r_fm_d_spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div className="r_fm_d_content">
          {/* Top Stats Cards */}
          <div className="r_fm_d_summary_cards">
            <div className="r_fm_d_card">
              <h3>Total Products</h3>
              <div className="r_fm_d_card_value">{dashboardData.totalProducts}</div>
              <div className="r_fm_d_card_split">
                <div className="r_fm_d_split_item">
                  <span className="r_fm_d_split_label">Food Items ({dashboardData.productCategories.food})</span>
                  <div className="r_fm_d_split_bar">
                    <div 
                      className="r_fm_d_split_fill food" 
                      style={{ width: `${(dashboardData.productCategories.food / dashboardData.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="r_fm_d_split_value">
                    {((dashboardData.productCategories.food / dashboardData.totalProducts) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="r_fm_d_split_item">
                  <span className="r_fm_d_split_label">Medicine Items ({dashboardData.productCategories.medicine})</span>
                  <div className="r_fm_d_split_bar">
                    <div 
                      className="r_fm_d_split_fill medicine" 
                      style={{ width: `${(dashboardData.productCategories.medicine / dashboardData.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="r_fm_d_split_value">
                    {((dashboardData.productCategories.medicine / dashboardData.totalProducts) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="r_fm_d_card">
              <h3>Total Stock</h3>
              <div className="r_fm_d_card_value">{dashboardData.totalStock}</div>
              <div className="r_fm_d_card_footer">
                <div className="r_fm_d_stock_indicator">
                  <span className="r_fm_d_status_dot low"></span>
                  <span>{dashboardData.lowStockItems.length} Low Stock Items</span>
                </div>
              </div>
            </div>

            <div className="r_fm_d_card">
              <h3>Monthly Sales Overview</h3>
              <div className="r_fm_d_mini_chart">
                {dashboardData.monthlySales.slice(-3).map((month, index) => (
                  <div key={index} className="r_fm_d_mini_bar">
                    <div className="r_fm_d_mini_column">
                      <div 
                        className="r_fm_d_mini_segment food"
                        style={{ height: `${maxMonthlyValue ? (month.food / maxMonthlyValue) * 80 : 0}%` }}
                      ></div>
                      <div 
                        className="r_fm_d_mini_segment medicine"
                        style={{ height: `${maxMonthlyValue ? (month.medicine / maxMonthlyValue) * 80 : 0}%` }}
                      ></div>
                    </div>
                    <div className="r_fm_d_mini_label">{month.month}</div>
                  </div>
                ))}
              </div>
              <div className="r_fm_d_view_more">
                <Link to="/dashboard/FoodAndMedicine/reports">View Full Reports</Link>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="r_fm_d_action_cards">
            <Link to="/dashboard/FoodAndMedicine/AddNewFoodAndMedicine" className="r_fm_d_action_card">
              <div className="r_fm_d_action_icon">
                <FaPlus />
              </div>
              <div className="r_fm_d_action_content">
                <h3>Add New Product</h3>
                <p>Add food or medicine to your inventory</p>
              </div>
            </Link>
            
            <Link to="/dashboard/FoodAndMedicine/ViewFoodAndMedicine" className="r_fm_d_action_card">
              <div className="r_fm_d_action_icon">
                <FaClipboardList />
              </div>
              <div className="r_fm_d_action_content">
                <h3>View Inventory</h3>
                <p>Manage your existing products</p>
              </div>
            </Link>

            <Link to="/dashboard/FoodAndMedicine/reports" className="r_fm_d_action_card">
              <div className="r_fm_d_action_icon">
                <FaChartBar />
              </div>
              <div className="r_fm_d_action_content">
                <h3>View Reports</h3>
                <p>See detailed analytics and reports</p>
              </div>
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="r_fm_d_two_columns">
            {/* Low Stock Items */}
            <div className="r_fm_d_section r_fm_d_low_stock">
              <h2>Low Stock Items</h2>
              {dashboardData.lowStockItems.length > 0 ? (
                <div className="r_fm_d_table_container">
                  <table className="r_fm_d_table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Current Stock</th>
                        <th>Threshold</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.lowStockItems.map(item => (
                        <tr key={item._id}>
                          <td>{item.productName}</td>
                          <td>{item.stock}</td>
                          <td>{item.threshold}</td>
                          <td>
                            <span className={`r_fm_d_status ${getStatusClass(item.stock <= item.threshold / 2 ? 'critical' : 'low')}`}>
                              {item.stock <= item.threshold / 2 ? 'Critical' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="r_fm_d_empty">
                  <FaExclamationTriangle />
                  <p>No low stock items found</p>
                  <p>All your products have sufficient stock levels</p>
                </div>
              )}
            </div>

            {/* Recently Added Items */}
            <div className="r_fm_d_section r_fm_d_recent">
              <h2>Recently Added Products</h2>
              {dashboardData.recentlyAdded.length > 0 ? (
                <div className="r_fm_d_table_container">
                  <table className="r_fm_d_table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Added On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentlyAdded.map(item => (
                        <tr key={item._id}>
                          <td>{item.productName}</td>
                          <td>
                            <span className={`r_fm_d_category ${item.category.toLowerCase()}`}>
                              {item.category}
                            </span>
                          </td>
                          <td>{item.stock}</td>
                          <td>{new Date(item.addedOn).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="r_fm_d_empty">
                  <FaBox />
                  <p>No recently added products</p>
                  <p>New products will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="r_fm_d_section r_fm_d_top_selling">
            <h2>Top Selling Products</h2>
            <div className="r_fm_d_table_container">
              <table className="r_fm_d_table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Units Sold</th>
                    <th>Current Stock</th>
                    <th>Price (Rs)</th>
                    <th>Revenue (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topSellingItems.map(item => (
                    <tr key={item._id}>
                      <td>{item.productName}</td>
                      <td>{item.sold}</td>
                      <td>{item.stock}</td>
                      <td>{item.price}</td>
                      <td>{(item.sold * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Sales Chart */}
          <div className="r_fm_d_section r_fm_d_monthly_sales">
            <h2>Monthly Sales Breakdown</h2>
            <div className="r_fm_d_chart_legend">
              <div className="r_fm_d_legend_item">
                <span className="r_fm_d_legend_color food"></span>
                <span>Food</span>
              </div>
              <div className="r_fm_d_legend_item">
                <span className="r_fm_d_legend_color medicine"></span>
                <span>Medicine</span>
              </div>
            </div>
            
            <div className="r_fm_d_chart_container">
              <Bar 
                data={{
                  labels: dashboardData.monthlySales.map(item => item.month),
                  datasets: [
                    {
                      label: 'Food',
                      data: dashboardData.monthlySales.map(item => item.food),
                      backgroundColor: '#3498db',
                    },
                    {
                      label: 'Medicine',
                      data: dashboardData.monthlySales.map(item => item.medicine),
                      backgroundColor: '#2ecc71',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false },
                    },
                    y: {
                      stacked: true,
                      grid: { color: '#ecf0f1' },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: Rs.${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
            <div className="r_fm_d_view_more">
              <Link to="/dashboard/FoodAndMedicine/reports">View Detailed Reports</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodAndMedicineDashboardHome;
