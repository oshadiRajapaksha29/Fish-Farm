import React, { useEffect, useMemo, useState } from "react";
import { getMedicineStats, getMedicineTimeseries } from "../../../../api/medicine";

import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import "./MedicineDashboardHome.css";

function fmtNumber(n) {
  if (n == null) return "-";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(Math.round(n));
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

export default function MedicineDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [ts, setTs] = useState(null);
  const [lowThreshold, setLowThreshold] = useState(5);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoading(true);
        const [s, t] = await Promise.all([
          getMedicineStats(lowThreshold),
          getMedicineTimeseries(30),
        ]);
        if (!alive) return;
        setStats(s.data || null);
        setTs(t.data || { range: { start: new Date(), end: new Date() }, addedPerDay: [] });
      } catch (e) {
        if (!alive) return;
        const msg = e?.response?.data?.message || e?.message || "Failed to load dashboard data";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [lowThreshold]);

  // Latest Activity data
  const activity = useMemo(() => {
    if (!ts?.range) return [];
    const addedMap = Object.fromEntries((ts.addedPerDay || []).map(x => [x.date.slice(0, 10), Number(x.quantity) || 0]));
    return daysBetween(ts.range.start, ts.range.end).map(date => ({ date, added: addedMap[date] ?? 0 }));
  }, [ts]);

  // Map byMedicine to ensure 'name' exists
  const byMedicine = useMemo(() => {
    if (!stats?.byMedicine) return [];
    return stats.byMedicine.map(m => ({
      name: m.name || m.type || "Unknown",
      quantity: Number(m.quantity) || 0,
    }));
  }, [stats]);

  const lowList = stats?.topLowStock || [];

  const BAR_PALETTE = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
    "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"
  ];

  if (loading) return <div className="md-container"><div className="md-skeleton">Loading…</div></div>;

  return (
    <div className="md-container">
      <div className="md-header">
        <h1>Medicine Stock Dashboard</h1>
        <div className="md-actions">
          <label className="md-low">
            Low stock ≤
            <input type="number" min={0} value={lowThreshold} onChange={e => setLowThreshold(Number(e.target.value || 0))} />
          </label>
        </div>
      </div>

      {error && <div className="md-error">{error}</div>}

      <div className="md-cards">
        <div className="md-card">
          <div className="md-card-label">Total Quantity</div>
          <div className="md-card-value">{fmtNumber(stats?.totalQuantity ?? 0)}</div>
          <div className="md-card-foot">All medicines combined</div>
        </div>
        <div className="md-card">
          <div className="md-card-label">Low Stock</div>
          <div className="md-card-value">{fmtNumber(stats?.lowStockCount ?? 0)}</div>
          <div className="md-card-foot">≤ {stats?.lowStockThreshold ?? lowThreshold}</div>
        </div>
      </div>

      <div className="md-row">
        <div className="md-panel">
          <div className="md-panel-title">Latest Activity (last 30 days)</div>
          <div className="md-chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="areaAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area name="Added Qty" type="monotone" dataKey="added" stroke="var(--chart-2)" fill="url(#areaAdded)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {activity.length === 0 && <div style={{ textAlign: "center", padding: 8, color: "#64748b" }}>No recent activity.</div>}
        </div>

        <div className="md-panel md-panel-right">
          <div className="md-panel-title">Low Stock (top 5)</div>
          <ul className="md-list">
            {lowList.length ? lowList.map(m => (
              <li key={m.name}>
                <div className="md-list-main">
                  <span className="md-list-title">{m.name}</span>
                  {m.type && m.type !== "-" && <span className="md-list-sub">({m.type})</span>}
                </div>
                <span className={`md-chip ${m.quantity <= (stats?.lowStockThreshold ?? lowThreshold) ? "danger" : ""}`}>{m.quantity}</span>
              </li>
            )) : <li className="md-empty">No items</li>}
          </ul>
        </div>
      </div>

      <div className="md-panel">
        <div className="md-panel-title">Quantity by Medicine</div>
        <div className="md-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={byMedicine}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" name="Quantity">
                {byMedicine.map((entry, index) => <Cell key={`cell-${index}`} fill={BAR_PALETTE[index % BAR_PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {byMedicine.length === 0 && <div style={{ textAlign: "center", padding: 8, color: "#64748b" }}>No medicine data to display.</div>}
        </div>
      </div>
    </div>
  );
}
