import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import "./r_om_styles.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const OrderManagementDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Stock management state
  const [stockView, setStockView] = useState('fish'); // 'fish', 'food', 'accessories'
  const [fishStock, setFishStock] = useState([]);
  const [foodStock, setFoodStock] = useState([]);
  const [accessoriesStock, setAccessoriesStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/orderDetails");

      if (res?.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else if (Array.isArray(res?.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError(err?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch stock data
  const fetchStockData = async () => {
    setStockLoading(true);
    try {
      console.log("Fetching stock data...");
      
      // Fetch all stock data in parallel
      const [fishRes, foodRes, accessoriesRes] = await Promise.all([
        api.get("/fish").catch(err => {
          console.error("Fish API error:", err.response?.data || err.message);
          return { data: [] };
        }),
        api.get("/foodAndMedicine").catch(err => {
          console.error("Food & Medicine API error:", err.response?.data || err.message);
          return { data: { foodAndMedicine: [] } };
        }),
        api.get("/accessories").catch(err => {
          console.error("Accessories API error:", err.response?.data || err.message);
          return { data: { accessories: [] } };
        })
      ]);

      console.log("Fish raw response:", fishRes.data);
      console.log("Food raw response:", foodRes.data);
      console.log("Accessories raw response:", accessoriesRes.data);

      // Extract data from responses
      // Fish returns array directly
      const fishData = Array.isArray(fishRes.data) ? fishRes.data : [];
      
      // Food & Medicine returns { foodAndMedicine: [...] }
      const foodData = Array.isArray(foodRes.data?.foodAndMedicine) 
        ? foodRes.data.foodAndMedicine 
        : (Array.isArray(foodRes.data) ? foodRes.data : []);
      
      // Accessories returns { accessories: [...] }
      const accessoriesData = Array.isArray(accessoriesRes.data?.accessories)
        ? accessoriesRes.data.accessories
        : (Array.isArray(accessoriesRes.data) ? accessoriesRes.data : []);

      console.log("Fish extracted:", fishData.length, "items");
      console.log("Food extracted:", foodData.length, "items");
      console.log("Accessories extracted:", accessoriesData.length, "items");

      setFishStock(fishData);
      setFoodStock(foodData);
      setAccessoriesStock(accessoriesData);
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
    } finally {
      setStockLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchStockData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchStockData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const byStatus = orders.reduce((acc, o) => {
      const key = (o?.status || "unknown").toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const revenue = orders.reduce((sum, o) => {
      // ✅ Fix: Use totalAmount field from order model
      const amount = Number(o?.totalAmount || o?.payment?.amount || o?.total || 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return { total, byStatus, revenue };
  }, [orders]);

  // Stock statistics
  const stockStats = useMemo(() => {
    console.log("Calculating stock stats...");
    console.log("Fish stock length:", fishStock.length);
    console.log("Food stock length:", foodStock.length);
    console.log("Accessories stock length:", accessoriesStock.length);
    
    const fishTotal = fishStock.reduce((sum, f) => sum + (f.Quantity || 0), 0);
    const fishLowStock = fishStock.filter(f => (f.Quantity || 0) <= 10).length;
    
    const foodTotal = foodStock.reduce((sum, f) => sum + (f.stock || 0), 0);
    const foodLowStock = foodStock.filter(f => (f.stock || 0) <= 5).length;
    
    const accessoriesTotal = accessoriesStock.reduce((sum, a) => sum + (a.stock || 0), 0);
    const accessoriesLowStock = accessoriesStock.filter(a => (a.stock || 0) <= 3).length;

    const stats = {
      fish: { total: fishTotal, lowStock: fishLowStock, items: fishStock.length },
      food: { total: foodTotal, lowStock: foodLowStock, items: foodStock.length },
      accessories: { total: accessoriesTotal, lowStock: accessoriesLowStock, items: accessoriesStock.length }
    };
    
    console.log("Calculated stats:", stats);
    return stats;
  }, [fishStock, foodStock, accessoriesStock]);

  const charts = useMemo(() => {
    // Orders over time (last 14 days)
    const byDateMap = new Map();
    orders.forEach((o) => {
      const d = o?.createdAt ? new Date(o.createdAt) : null;
      if (!d) return;
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      byDateMap.set(key, (byDateMap.get(key) || 0) + 1);
    });
    const dateKeys = Array.from(byDateMap.keys()).sort();
    const lineLabels = dateKeys.map((k) => new Date(k).toLocaleDateString());
    const lineData = dateKeys.map((k) => byDateMap.get(k));

    // Status donut
    const statusLabels = Object.keys(stats.byStatus);
    const statusValues = Object.values(stats.byStatus);

    // Revenue by date (bar)
    const revByDate = new Map();
    orders.forEach((o) => {
      const d = o?.createdAt ? new Date(o.createdAt) : null;
      if (!d) return;
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      // ✅ Fix: Use totalAmount field from order model
      const amount = Number(o?.totalAmount || o?.payment?.amount || o?.total || 0);
      revByDate.set(key, (revByDate.get(key) || 0) + (Number.isFinite(amount) ? amount : 0));
    });
    const revKeys = Array.from(revByDate.keys()).sort();
    const barLabels = revKeys.map((k) => new Date(k).toLocaleDateString());
    const barData = revKeys.map((k) => revByDate.get(k));

    return {
      ordersOverTime: {
        labels: lineLabels,
        datasets: [
          {
            label: "Orders",
            data: lineData,
            borderColor: "#0d6efd",
            backgroundColor: "rgba(13,110,253,0.15)",
            tension: 0.3,
            fill: true
          }
        ]
      },
      statusBreakdown: {
        labels: statusLabels.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [
          {
            label: "Orders by status",
            data: statusValues,
            backgroundColor: [
              "#6c757d",
              "#ffc107",
              "#0dcaf0",
              "#198754",
              "#dc3545",
              "#0d6efd"
            ]
          }
        ]
      },
      revenueByDate: {
        labels: barLabels,
        datasets: [
          {
            label: "Revenue",
            data: barData,
            backgroundColor: "rgba(25,135,84,0.35)",
            borderColor: "#198754"
          }
        ]
      }
    };
  }, [orders, stats.byStatus]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'orange';
      case 'confirmed':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Helper function to format customer name/email
  const formatCustomer = (contact) => {
    if (!contact) return 'N/A';
    const emailOrPhone = contact.emailOrPhone || contact.email || contact.phone || '';
    
    // If it's an email, show first part
    if (emailOrPhone.includes('@')) {
      const username = emailOrPhone.split('@')[0];
      return username.length > 10 ? username.substring(0, 10) + '...' : username;
    }
    
    // If it's a phone number, show last 4 digits
    if (emailOrPhone.length >= 4) {
      return '***' + emailOrPhone.slice(-4);
    }
    
    return emailOrPhone.substring(0, 10) || 'N/A';
  };

  if (loading && orders.length === 0) {
    return <div className="r_om_loading"><div className="r_om_spinner"></div><div>Loading orders…</div></div>;
  }

  if (error) {
    return <div className="r_om_empty"><div>{error}</div></div>;
  }

  return (
    <div className="r_om_container">
      <div className="r_om_header">
        <h1 className="r_om_title">Order Management Dashboard</h1>
        <div className="r_om_actions">
          <Link className="r_om_badge blue" to="/dashboard/admin/orders">View Orders</Link>
          <Link className="r_om_badge green" to="/dashboard/admin/orders/report">Reports</Link>
        </div>
      </div>
      <div className="r_om_content">

      <div className="r_om_summary_cards">
        <div className="r_om_card">
          <div className="r_om_card_header">
            <h3 className="r_om_card_label">Total Orders</h3>
            <div className="r_om_card_icon blue">🛒</div>
          </div>
          <div className="r_om_card_value">{stats.total}</div>
          <div className="r_om_card_footer">
            <span>All time orders</span>
          </div>
        </div>
        <div className="r_om_card">
          <div className="r_om_card_header">
            <h3 className="r_om_card_label">Revenue</h3>
            <div className="r_om_card_icon green">💰</div>
          </div>
          <div className="r_om_card_value">Rs. {stats.revenue.toLocaleString()}</div>
          <div className="r_om_card_footer">
            <span>Total sales amount</span>
          </div>
        </div>
        {Object.entries(stats.byStatus).slice(0, 1).map(([status, count]) => (
          <div className="r_om_card" key={status}>
            <div className="r_om_card_header">
              <h3 className="r_om_card_label">{status.charAt(0).toUpperCase() + status.slice(1)} Orders</h3>
              <div className="r_om_card_icon orange">⚡</div>
            </div>
            <div className="r_om_card_value">{count}</div>
            <div className="r_om_card_footer">
              <span>{Math.round((count/stats.total)*100)}% of total orders</span>
            </div>
          </div>
        ))}
      </div>

      <div className="r_om_section r_om_monthly_sales">
        <div className="r_om_section_header">
          <h2 className="r_om_panel_title">Orders Over Time</h2>
          <div className="r_om_section_controls">
            <button 
              className="r_om_section_button" 
              onClick={fetchOrders}
              title="Refresh data"
              style={{ cursor: 'pointer' }}
            >
              ⟳
            </button>
          </div>
        </div>
        <div className="r_om_chart_container">
          <Line data={charts.ordersOverTime} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>
      
      <div className="r_om_analytics">
        <div className="r_om_section">
          <div className="r_om_section_header">
            <h2 className="r_om_panel_title">Status Breakdown</h2>
          </div>
          <div className="r_om_chart_container" style={{height: 250}}>
            <Doughnut data={charts.statusBreakdown} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="r_om_section">
          <div className="r_om_section_header">
            <h2 className="r_om_panel_title">Revenue By Date</h2>
          </div>
          <div className="r_om_chart_container">
            <Bar data={charts.revenueByDate} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Stock Inventory Section */}
      <div className="r_om_section r_om_stock_section">
        <div className="r_om_section_header">
          <div className="r_om_table_title">
            <span className="r_om_blue_dot"></span>
            Inventory Stock 
          </div>
          <div className="r_om_section_controls">
            <button 
              className="r_om_section_button" 
              onClick={fetchStockData}
              title="Refresh stock data"
              style={{ cursor: 'pointer' }}
            >
              ⟳ Refresh
            </button>
          </div>
        </div>

        {/* Stock Overview Cards */}
        <div className="r_om_stock_overview">
          <div className="r_om_stock_card" onClick={() => setStockView('fish')} style={{ cursor: 'pointer', borderColor: stockView === 'fish' ? '#0d6efd' : '#e9ecef' }}>
            <div className="r_om_stock_icon">🐠</div>
            <div className="r_om_stock_info">
              <h4>Fish Stock</h4>
              <div className="r_om_stock_number">{stockStats.fish.total}</div>
              <div className="r_om_stock_meta">
                <span>{stockStats.fish.items} types</span>
                {stockStats.fish.lowStock > 0 && (
                  <span className="r_om_stock_warning">⚠️ {stockStats.fish.lowStock} low</span>
                )}
              </div>
            </div>
          </div>

          <div className="r_om_stock_card" onClick={() => setStockView('food')} style={{ cursor: 'pointer', borderColor: stockView === 'food' ? '#0d6efd' : '#e9ecef' }}>
            <div className="r_om_stock_icon">🍽️</div>
            <div className="r_om_stock_info">
              <h4>Food & Medicine</h4>
              <div className="r_om_stock_number">{stockStats.food.total}</div>
              <div className="r_om_stock_meta">
                <span>{stockStats.food.items} products</span>
                {stockStats.food.lowStock > 0 && (
                  <span className="r_om_stock_warning">⚠️ {stockStats.food.lowStock} low</span>
                )}
              </div>
            </div>
          </div>

          <div className="r_om_stock_card" onClick={() => setStockView('accessories')} style={{ cursor: 'pointer', borderColor: stockView === 'accessories' ? '#0d6efd' : '#e9ecef' }}>
            <div className="r_om_stock_icon">🛠️</div>
            <div className="r_om_stock_info">
              <h4>Accessories</h4>
              <div className="r_om_stock_number">{stockStats.accessories.total}</div>
              <div className="r_om_stock_meta">
                <span>{stockStats.accessories.items} items</span>
                {stockStats.accessories.lowStock > 0 && (
                  <span className="r_om_stock_warning">⚠️ {stockStats.accessories.lowStock} low</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stock Details Table */}
        <div className="r_om_stock_details">
          <h3 className="r_om_stock_title">
            {stockView === 'fish' && '🐠 Fish Stock Details'}
            {stockView === 'food' && '🍽️ Food & Medicine Stock Details'}
            {stockView === 'accessories' && '🛠️ Accessories Stock Details'}
          </h3>

          {stockLoading ? (
            <div className="r_om_loading"><div className="r_om_spinner"></div><div>Loading stock data...</div></div>
          ) : (
            <div className="r_om_table_container">
              <table className="r_om_table r_om_stock_table">
                <thead>
                  <tr>
                    {stockView === 'fish' && (
                      <>
                        <th>Species</th>
                        <th>Sub-Species</th>
                        <th>Stage</th>
                        <th>Tank</th>
                        <th>Quantity</th>
                        <th>Price/Couple</th>
                        <th>Status</th>
                      </>
                    )}
                    {stockView === 'food' && (
                      <>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Size</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Status</th>
                      </>
                    )}
                    {stockView === 'accessories' && (
                      <>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Special Price</th>
                        <th>Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {stockView === 'fish' && fishStock.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                        No fish stock data available
                      </td>
                    </tr>
                  )}
                  
                  {stockView === 'fish' && fishStock.map((fish) => (
                    <tr key={fish._id}>
                      <td>{fish.Species}</td>
                      <td><strong>{fish.subSpecies}</strong></td>
                      <td>{fish.Stage}</td>
                      <td>{fish.TankNumber}</td>
                      <td>
                        <span className={`r_om_stock_qty ${fish.Quantity <= 10 ? 'low' : fish.Quantity <= 20 ? 'medium' : 'high'}`}>
                          {fish.Quantity}
                        </span>
                      </td>
                      <td>Rs. {fish.PricePerCouple?.toLocaleString()}</td>
                      <td>
                        {fish.Quantity === 0 && <span className="r_om_status_badge out-of-stock">Out of Stock</span>}
                        {fish.Quantity > 0 && fish.Quantity <= 10 && <span className="r_om_status_badge low-stock">Low Stock</span>}
                        {fish.Quantity > 10 && <span className="r_om_status_badge in-stock">In Stock</span>}
                      </td>
                    </tr>
                  ))}

                  {stockView === 'food' && foodStock.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                        No food & medicine data available
                      </td>
                    </tr>
                  )}

                  {stockView === 'food' && foodStock.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.productName}</strong></td>
                      <td>{item.category}</td>
                      <td>{item.size}</td>
                      <td>
                        <span className={`r_om_stock_qty ${item.stock <= 5 ? 'low' : item.stock <= 15 ? 'medium' : 'high'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td>Rs. {item.price?.toLocaleString()}</td>
                      <td>
                        {item.stock === 0 && <span className="r_om_status_badge out-of-stock">Out of Stock</span>}
                        {item.stock > 0 && item.stock <= 5 && <span className="r_om_status_badge low-stock">Low Stock</span>}
                        {item.stock > 5 && <span className="r_om_status_badge in-stock">In Stock</span>}
                      </td>
                    </tr>
                  ))}

                  {stockView === 'accessories' && accessoriesStock.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                        No accessories data available
                      </td>
                    </tr>
                  )}

                  {stockView === 'accessories' && accessoriesStock.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.product}</strong></td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`r_om_stock_qty ${item.stock <= 3 ? 'low' : item.stock <= 10 ? 'medium' : 'high'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td>Rs. {item.price?.toLocaleString()}</td>
                      <td>{item.specialPrice ? `Rs. ${item.specialPrice.toLocaleString()}` : '-'}</td>
                      <td>
                        {item.stock === 0 && <span className="r_om_status_badge out-of-stock">Out of Stock</span>}
                        {item.stock > 0 && item.stock <= 3 && <span className="r_om_status_badge low-stock">Low Stock</span>}
                        {item.stock > 3 && <span className="r_om_status_badge in-stock">In Stock</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="r_om_section">
        <div className="r_om_section_header">
          <div className="r_om_table_title">
            <span className="r_om_blue_dot"></span>
            Recent Orders
            <span style={{ fontSize: '0.8rem', color: '#6c757d', marginLeft: '10px' }}>
              (Last updated: {lastRefresh.toLocaleTimeString()})
            </span>
          </div>
          <div className="r_om_section_controls">
            <button 
              className="r_om_section_button" 
              onClick={fetchOrders}
              title="Refresh orders"
              style={{ marginRight: '10px', cursor: 'pointer' }}
            >
              ⟳ Refresh
            </button>
            <Link className="r_om_chip blue" to="/dashboard/admin/orders">View All</Link>
          </div>
        </div>
        <div className="r_om_table_container">
          <table className="r_om_table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => {
                const statusColor = getStatusColor(o?.status);
                return (
                  <tr key={o._id}>
                    <td><span className="r_om_order_id">{o._id?.slice(-8)}</span></td>
                    <td>
                      <div 
                        className="r_om_customer_email" 
                        title={o?.contact?.emailOrPhone || o?.contact?.email || o?.contact?.phone || "No contact"}
                      >
                        {formatCustomer(o?.contact)}
                      </div>
                    </td>
                    <td>
                      <span className="r_om_status">
                        <span 
                          className="r_om_status_dot" 
                          style={{ 
                            backgroundColor: statusColor === 'green' ? '#28a745' : 
                                           statusColor === 'blue' ? '#007bff' : 
                                           statusColor === 'orange' ? '#fd7e14' : 
                                           statusColor === 'purple' ? '#6f42c1' : 
                                           statusColor === 'red' ? '#dc3545' : '#6c757d' 
                          }}
                        ></span>
                        <span className="r_om_status_text">{o?.status || "-"}</span>
                      </span>
                    </td>
                    <td>Rs. {(o?.totalAmount || 0).toLocaleString()}</td>
                    <td>{o?.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                    <td style={{textAlign: 'center'}}>
                      <Link 
                        className="r_om_chip" 
                        style={{background: '#EDF1FF', color: '#5B7AFC', borderRadius: '6px'}} 
                        to={`/dashboard/admin/orders/${o._id}`}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default OrderManagementDashboard;


