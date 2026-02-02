// src/Component/Health/Mortality/Sidebar/MortalityDashboardHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import mortalityApi from "../../../../api/mortality";

import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import "./MortalityDashboardHome.css";

/* ---------- helpers ---------- */
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

/* ---------- component ---------- */
export default function MortalityDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [ts, setTs] = useState(null);
  const [bySpeciesFallback, setBySpeciesFallback] = useState([]);
  const [topTanksFallback, setTopTanksFallback] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoading(true);

        const [s, t, allMortality] = await Promise.all([
          mortalityApi.getMortalityStats(),
          mortalityApi.getMortalityTimeseries(30),
          mortalityApi.listMortality(),
        ]);

        if (!alive) return;

        const statsData = s.data || {};
        const timeseriesData = t.data || {};
        const records = Array.isArray(allMortality.data) ? allMortality.data : [];

        // Compute fallback for species & tanks
        const speciesMap = new Map();
        const tankMap = new Map();
        let totalReports = records.length;

        records.forEach(r => {
          const species = r.Species ?? "Unknown";
          const tank = r.TankNumber ?? "Unknown";
          const died = Number(r.QuantityDied ?? 0);

          if (Number.isFinite(died)) {
            speciesMap.set(species, (speciesMap.get(species) || 0) + died);
            tankMap.set(tank, (tankMap.get(tank) || 0) + died);
          }
        });

        const speciesArr = Array.from(speciesMap.entries())
          .map(([Species, deaths]) => ({ Species, deaths }))
          .sort((a, b) => b.deaths - a.deaths);
        setBySpeciesFallback(speciesArr);

        const tankArr = Array.from(tankMap.entries())
          .map(([tank, deaths]) => ({ tank, deaths }))
          .sort((a, b) => b.deaths - a.deaths);
        setTopTanksFallback(tankArr);

        // Build final stats object
        setStats({
          totalDeaths: statsData.totalDeaths ?? [...speciesMap.values()].reduce((a, b) => a + b, 0),
          totalReports: totalReports,
          speciesAffected: statsData.affectedSpecies ?? speciesMap.size,
          tanksAffected: tankMap.size,
          topTanks: tankArr.slice(0, 5),
          bySpecies: speciesArr,
        });

        // normalize timeseries
        if (timeseriesData?.range?.start && timeseriesData?.range?.end) {
          setTs(timeseriesData);
        } else {
          // fallback: build last 30 days from records
          const today = new Date();
          const start = new Date(today);
          start.setDate(today.getDate() - 29);
          const deathsPerDay = {};

          records.forEach(r => {
            const d = new Date(r.DateOfDeath).toISOString().slice(0, 10);
            deathsPerDay[d] = (deathsPerDay[d] || 0) + Number(r.QuantityDied || 0);
          });

          setTs({
            range: { start: start.toISOString().slice(0, 10), end: today.toISOString().slice(0, 10), days: 30 },
            deathsPerDay: Object.entries(deathsPerDay).map(([date, count]) => ({ date, count })),
          });
        }

      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load mortality dashboard";
        setError(String(msg));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ---------- normalize activity ---------- */
  const activity = useMemo(() => {
    if (!ts?.range) return [];
    const deathsArr = ts.deathsPerDay || [];
    return daysBetween(ts.range.start, ts.range.end).map(date => ({
      date,
      deaths: deathsArr.find(x => x.date === date)?.count ?? 0,
      reports: 0,
    }));
  }, [ts]);

  /* ---------- species & tanks data ---------- */
  const bySpecies = useMemo(() => stats?.bySpecies ?? bySpeciesFallback, [stats, bySpeciesFallback]);
  const topTanks = useMemo(() => stats?.topTanks ?? topTanksFallback, [stats, topTanksFallback]);

  const BAR_PALETTE = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
    "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"
  ];

  if (loading) {
    return (
      <div className="fd-container" style={{ minHeight: "60vh" }}>
        <div className="fd-header"><h1>Mortality Dashboard</h1></div>
        <div className="fd-skeleton" />
      </div>
    );
  }

  return (
    <div className="fd-container" style={{ minHeight: "60vh" }}>
      <div className="fd-header"><h1>Mortality Dashboard</h1></div>

      {error && (
        <div style={{
          padding: 8, background: "#fee2e2", border: "1px solid #fecaca",
          borderRadius: 8, marginBottom: 12, color: "#7f1d1d"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="fd-cards">
        <div className="fd-card">
          <div className="fd-card-label">Total Deaths</div>
          <div className="fd-card-value">{fmtNumber(stats.totalDeaths)}</div>
          <div className="fd-card-foot">All species & tanks</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Reports</div>
          <div className="fd-card-value">{fmtNumber(stats.totalReports)}</div>
          <div className="fd-card-foot">Total records</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Species Affected</div>
          <div className="fd-card-value">{fmtNumber(stats.speciesAffected)}</div>
          <div className="fd-card-foot">Distinct species</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Tanks Affected</div>
          <div className="fd-card-value">{fmtNumber(stats.tanksAffected)}</div>
          <div className="fd-card-foot">Distinct tanks</div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Worst Tank</div>
          <div className="fd-card-value">
            {topTanks[0]?.tank != null ? `${topTanks[0].tank}` : "-"}
          </div>
          <div className="fd-card-foot">
            {topTanks[0]?.deaths != null ? `${fmtNumber(topTanks[0].deaths)} deaths` : "—"}
          </div>
        </div>
        <div className="fd-card">
          <div className="fd-card-label">Last 30 days</div>
          <div className="fd-card-value">
            {fmtNumber(activity.reduce((s, x) => s + x.deaths, 0))}
          </div>
          <div className="fd-card-foot">Total deaths</div>
        </div>
      </div>

      {/* Charts + right list */}
      <div className="fd-row">
        <div className="fd-panel">
          <div className="fd-panel-title">
            Recent Activity {ts?.range?.days ? `(last ${ts.range.days} days)` : ""}
          </div>
          <div className="fd-chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activity} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaDeaths" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-4)" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="var(--chart-4)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area name="Deaths" type="monotone" dataKey="deaths" stroke="var(--chart-4)" fill="url(#areaDeaths)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fd-panel fd-panel-right">
          <div className="fd-panel-title">Top Tanks (deaths)</div>
          <ul className="fd-list">
            {topTanks.map((t, i) => (
              <li key={`${t.tank}-${i}`}>
                <div className="fd-list-main">
                  <span className="fd-list-title">Tank {t.tank}</span>
                </div>
                <span className={`fd-chip ${t.deaths > 0 ? "danger" : ""}`}>
                  {fmtNumber(t.deaths)}
                </span>
              </li>
            ))}
            {topTanks.length === 0 && <li className="fd-empty">No items</li>}
          </ul>
        </div>
      </div>

      {/* Deaths by Species */}
      <div className="fd-panel">
        <div className="fd-panel-title">Deaths by Species</div>
        <div className="fd-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bySpecies} margin={{ left: 6, right: 6, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="Species" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="deaths" name="Deaths">
                {bySpecies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_PALETTE[index % BAR_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {bySpecies.length === 0 && (
          <div style={{ textAlign: "center", padding: 8, color: "#64748b" }}>
            No species data to display.
          </div>
        )}
      </div>
    </div>
  );
}
