import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getFishStats, getFishTimeseries } from "../../../api/fish";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import "./FishDashboardHome.css";

function fmtNumber(n) {
  if (n == null) return "-";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(Math.round(n));
}
function fmtCurrency(n) {
  if (n == null) return "-";
  return "Rs. " + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function daysBetween(startISO, endISO) {
  const out = [];
  if (!startISO || !endISO) return out;
  const start = new Date(startISO + "T00:00:00Z");
  const end = new Date(endISO + "T00:00:00Z");
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function FishDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [ts, setTs] = useState(null);
  const [lowThreshold, setLowThreshold] = useState(10);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ✅ reusable function to fetch stats & timeseries
  const reloadStats = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [s, t] = await Promise.all([
        getFishStats(lowThreshold),
        getFishTimeseries(30),
      ]);
      setStats(s.data || null);
      setTs(t.data || null);
      setLastUpdated(new Date());
      console.log("[FishDashboardHome] /fish/stats →", s.data);
      console.log("[FishDashboardHome] /fish/stats/timeseries →", t.data);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load dashboard data";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, [lowThreshold]);

  // run on mount + whenever lowThreshold changes
  useEffect(() => {
    reloadStats();
  }, [reloadStats]);

  // NEW: Listen for multiple events to refresh data
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log("[FishDashboardHome] Data update detected → refreshing stats");
      reloadStats();
    };

    // Listen for various update events
    window.addEventListener("mortality-updated", handleDataUpdate);
    window.addEventListener("cart-updated", handleDataUpdate);
    window.addEventListener("fish-data-updated", handleDataUpdate);
    
    // Also set up periodic refresh every 30 seconds
    const interval = setInterval(reloadStats, 30000);
    
    return () => {
      window.removeEventListener("mortality-updated", handleDataUpdate);
      window.removeEventListener("cart-updated", handleDataUpdate);
      window.removeEventListener("fish-data-updated", handleDataUpdate);
      clearInterval(interval);
    };
  }, [reloadStats]);

  const activity = useMemo(() => {
    if (!ts?.range) return [];
    const mapCreated = Object.fromEntries((ts.createdPerDay || []).map(x => [x.date, x.count]));
    const mapQty = Object.fromEntries((ts.quantityAddedPerDay || []).map(x => [x.date, x.quantity]));
    return daysBetween(ts.range.start, ts.range.end).map(date => ({
      date,
      created: mapCreated[date] ?? 0,
      qtyAdded: mapQty[date] ?? 0,
    }));
  }, [ts]);

  const DebugBanner = () => (
    <div style={{
      padding: "8px",
      background: "#fffbeb",
      border: "1px solid #fde68a",
      borderRadius: 8,
      marginBottom: 8
    }}>
      <strong>FishDashboardHome mounted.</strong>
      <span style={{marginLeft: '10px', fontSize: '0.9em', color: '#666'}}>
        Last updated: {lastUpdated.toLocaleTimeString()}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="fd-container" style={{ minHeight: "60vh" }}>
        <div className="fd-header">
          <h1>Fish Stock Dashboard</h1>
          <button 
            className="fd-refresh-btn" 
            onClick={reloadStats}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
        <DebugBanner />
        <div className="fd-skeleton">Loading…</div>
      </div>
    );
  }

  const hasStats = !!stats;
  const hasTs = !!ts;
  const bySpecies = (stats?.bySpecies ?? []);
  const lowList = (stats?.topLowStock ?? []);

  const BAR_PALETTE = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
    "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"
  ];

  return (
    <div className="fd-container" style={{ minHeight: "60vh" }}>
      <div className="fd-header">
        <h1>Fish Stock Dashboard</h1>
        <div className="fd-actions">
          <button 
            className="fd-refresh-btn" 
            onClick={reloadStats}
            disabled={loading}
            title="Refresh data"
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
          <label className="fd-low">
            Low stock ≤
            <input
              type="number"
              min={0}
              value={lowThreshold}
              onChange={(e) => setLowThreshold(Number(e.target.value || 0))}
            />
          </label>
        </div>
      </div>

      <DebugBanner />

      {error && (
        <div style={{
          padding: "8px",
          background: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          marginBottom: 8,
          color: "#7f1d1d"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && (!hasStats || !hasTs) && (
        <div style={{
          padding: "8px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          marginBottom: 8,
          color: "#1e3a8a"
        }}>
          No data available yet. Add fish records to see charts and metrics.
        </div>
      )}

      {/* KPI Cards */}
      <div className="fd-cards">
        <div className="fd-card">
          <div className="fd-card-label">Total Quantity</div>
          <div className="fd-card-value">{fmtNumber(stats?.totalQuantity ?? 0)}</div>
          <div className="fd-card-foot">All species combined</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Species</div>
          <div className="fd-card-value">{fmtNumber(stats?.totalSpecies ?? 0)}</div>
          <div className="fd-card-foot">Distinct Species</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Sub-species</div>
          <div className="fd-card-value">{fmtNumber(stats?.totalSubSpecies ?? 0)}</div>
          <div className="fd-card-foot">Distinct subSpecies</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Low stock</div>
          <div className="fd-card-value">{fmtNumber(stats?.lowStockCount ?? 0)}</div>
          <div className="fd-card-foot">≤ {stats?.lowStockThreshold ?? lowThreshold}</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Inventory Value</div>
          <div className="fd-card-value">{fmtCurrency(stats?.totalInventoryValue ?? 0)}</div>
          <div className="fd-card-foot">∑ Qty × PricePerCouple</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Avg Price / Couple</div>
          <div className="fd-card-value">{fmtCurrency(stats?.avgPricePerCouple ?? 0)}</div>
          <div className="fd-card-foot">Across all items</div>
        </div>
      </div>

      {/* Charts + right list */}
      <div className="fd-row">
        <div className="fd-panel">
          <div className="fd-panel-title">
            Latest Activity {hasTs && ts?.range?.days ? `last ${ts.range.days} days` : ""}
          </div>
          <div className="fd-chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activity} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--chart-2)" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="areaCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  name="Qty added"
                  type="monotone"
                  dataKey="qtyAdded"
                  stroke="var(--chart-2)"
                  fill="url(#areaQty)"
                />
                <Area
                  name="Batches created"
                  type="monotone"
                  dataKey="created"
                  stroke="var(--chart-1)"
                  fill="url(#areaCreated)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {activity.length === 0 && (
            <div style={{ textAlign: "center", padding: "8px", color: "#64748b" }}>
              No recent activity.
            </div>
          )}
        </div>

        <div className="fd-panel fd-panel-right">
          <div className="fd-panel-title">Low Stock (top 5)</div>
          <ul className="fd-list">
            {lowList.map((f) => (
              <li key={`${f.Species}-${f.subSpecies}`}>
                <div className="fd-list-main">
                  <span className="fd-list-title">{f.subSpecies}</span>
                  <span className="fd-list-sub">({f.Species})</span>
                </div>
                <span
                  className={`fd-chip ${f.Quantity <= (stats?.lowStockThreshold ?? lowThreshold) ? "danger" : ""}`}
                  style={{ borderColor: "transparent" }}
                >
                  {f.Quantity}
                </span>
              </li>
            ))}
            {lowList.length === 0 && <li className="fd-empty">No items</li>}
          </ul>
        </div>
      </div>

      {/* By Species bar chart */}
      <div className="fd-panel">
        <div className="fd-panel-title">Quantity by Species</div>
        <div className="fd-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bySpecies} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="Species" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" name="Quantity">
                {bySpecies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_PALETTE[index % BAR_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {bySpecies.length === 0 && (
          <div style={{ textAlign: "center", padding: "8px", color: "#64748b" }}>
            No species data to display.
          </div>
        )}
      </div>
    </div>
  );
}