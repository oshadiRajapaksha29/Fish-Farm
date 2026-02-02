import React, { useEffect, useMemo, useState } from "react";
import { getDiseaseStats, getDiseaseTimeseries } from "../../../../api/diseaseReport";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import "./DiseaseReportDashboardHome.css";

/* ---------- tiny format helpers ---------- */
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

export default function DiseaseReportDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [ts, setTs] = useState(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoading(true);
        const [s, t] = await Promise.all([
          getDiseaseStats(),
          getDiseaseTimeseries(days),
        ]);
        if (!alive) return;
        setStats(s.data || null);
        setTs(t.data || null);
        console.log("[DiseaseDashboard] /diseaseReports/stats →", s.data);
        console.log("[DiseaseDashboard] /diseaseReports/stats/timeseries →", t.data);
      } catch (e) {
        if (!alive) return;
        const msg = e?.response?.data?.message || e?.message || "Failed to load disease dashboard data";
        setError(String(msg));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [days]);

  const activity = useMemo(() => {
    if (!ts?.range) return [];
    const mapReports = Object.fromEntries((ts.reportsPerDay || []).map(x => [x.date, x.count]));
    const mapSick    = Object.fromEntries((ts.sickPerDay    || []).map(x => [x.date, x.count]));
    return daysBetween(ts.range.start, ts.range.end).map(date => ({
      date,
      reports: mapReports[date] ?? 0,
      sick:    mapSick[date] ?? 0,
    }));
  }, [ts]);

  const hasStats    = !!stats;
  const bySpecies   = stats?.bySpecies   || [];
  const topSymptoms = stats?.topSymptoms || [];

  const BAR_PALETTE = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
    "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"
  ];

  if (loading) {
    return (
      <div className="fd-container" style={{ minHeight: "60vh" }}>
        <div className="fd-header"><h1>Disease Reports Dashboard</h1></div>
        <div className="fd-skeleton">Loading…</div>
      </div>
    );
  }

  return (
    <div className="fd-container" style={{ minHeight: "60vh" }}>
      <div className="fd-header">
        <h1>Disease Reports Dashboard</h1>
        <div className="fd-actions">
          <label className="fd-low">
            Range (days)
            <input
              type="number"
              min={7}
              value={days}
              onChange={(e) => setDays(Math.max(7, Number(e.target.value || 30)))}
            />
          </label>
        </div>
      </div>

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

      {!error && !hasStats && (
        <div style={{
          padding: "8px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          marginBottom: 8,
          color: "#1e3a8a"
        }}>
          No data yet. Add disease reports to see charts and metrics.
        </div>
      )}

      <div className="fd-cards">
        <div className="fd-card">
          <div className="fd-card-label">Total Reports</div>
          <div className="fd-card-value">{fmtNumber(stats?.totalReports ?? 0)}</div>
          <div className="fd-card-foot">All time</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Total Sick Fish</div>
          <div className="fd-card-value">{fmtNumber(stats?.totalSickFish ?? 0)}</div>
          <div className="fd-card-foot">Across all reports</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Avg Sick / Report</div>
          <div className="fd-card-value">{fmtNumber(stats?.avgSickPerReport ?? 0)}</div>
          <div className="fd-card-foot">Mean value</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Tanks Affected</div>
          <div className="fd-card-value">{fmtNumber(stats?.tanksAffected ?? 0)}</div>
          <div className="fd-card-foot">Distinct tanks</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Species Seen</div>
          <div className="fd-card-value">{fmtNumber(stats?.totalSpecies ?? 0)}</div>
          <div className="fd-card-foot">Distinct species</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Latest Report</div>
          <div className="fd-card-value">
            {stats?.latestReportDate ? new Date(stats.latestReportDate).toLocaleDateString() : "-"}
          </div>
          <div className="fd-card-foot">Most recent</div>
        </div>
      </div>

      <div className="fd-row">
        <div className="fd-panel">
          <div className="fd-panel-title">
            Recent Activity {ts?.range?.days ? `(last ${ts.range.days} days)` : ""}
          </div>
          <div className="fd-chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activity} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="areaSick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--chart-4)" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="var(--chart-4)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  name="Reports"
                  type="monotone"
                  dataKey="reports"
                  stroke="var(--chart-1)"
                  fill="url(#areaReports)"
                />
                <Area
                  name="Sick Fish"
                  type="monotone"
                  dataKey="sick"
                  stroke="var(--chart-4)"
                  fill="url(#areaSick)"
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
          <div className="fd-panel-title">Top Symptoms</div>
          <ul className="fd-list">
            {(topSymptoms || []).map((s, i) => (
              <li key={`${s.symptom}-${i}`}>
                <div className="fd-list-main">
                  <span className="fd-list-title">{s.symptom}</span>
                  <span className="fd-list-sub">symptom</span>
                </div>
                <span className="fd-chip">{s.count ?? 0}</span>
              </li>
            ))}
            {(topSymptoms || []).length === 0 && <li className="fd-empty">No symptoms data</li>}
          </ul>
        </div>
      </div>

      <div className="fd-panel">
        <div className="fd-panel-title">Cases by Species</div>
        <div className="fd-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bySpecies} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="Species" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="reports" name="Reports">
                {bySpecies.map((_, i) => (
                  <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {(bySpecies || []).length === 0 && (
          <div style={{ textAlign: "center", padding: "8px", color: "#64748b" }}>
            No species data to display.
          </div>
        )}
      </div>
    </div>
  );
}
