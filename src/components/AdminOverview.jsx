import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { supabase } from "../supabaseClient";
import "../css/AdminOverview.css";

const CHART_GRID = "rgba(148, 163, 184, 0.12)";
const CHART_TEXT = "#64748b";
const TOOLTIP_STYLE = {
  background: "#121a2e",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "var(--mono)",
};

function classify(threatScore) {
  if (threatScore >= 100) return "malicious";
  if (threatScore >= 50) return "suspicious";
  return "safe";
}

function StatTile({ label, value, subtitle, tone }) {
  return (
    <div className={`stat-tile${tone ? ` tone-${tone}` : ""}`}>
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
      {subtitle && <div className="stat-tile-subtitle">{subtitle}</div>}
    </div>
  );
}

function AdminOverview({ refreshKey }) {

  const [logs, setLogs] = useState([]);
  const [blacklistCount, setBlacklistCount] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchAll = async () => {

      setLoading(true);

      const [logsRes, blacklistRes, reportsRes] = await Promise.all([
        supabase.from("scan_logs")
          .select("id, scanned_url, threat_score, is_malicious, created_at, country, google_status, virustotal_status, blacklist_status")
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase.from("blacklist").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      if (logsRes.error) {
        setError(logsRes.error.message);
      } else {
        setLogs(logsRes.data);
        setBlacklistCount(blacklistRes.count ?? 0);
        setPendingReports(reportsRes.count ?? 0);
      }

      setLoading(false);
    };

    fetchAll();
  }, [refreshKey]);

  const stats = useMemo(() => {

    const total = logs.length;
    let safe = 0, suspicious = 0, malicious = 0, scoreSum = 0;
    const countries = new Set();

    for (const log of logs) {
      scoreSum += log.threat_score ?? 0;
      const tier = classify(log.threat_score ?? 0);
      if (tier === "safe") safe++;
      else if (tier === "suspicious") suspicious++;
      else malicious++;
      if (log.country) countries.add(log.country);
    }

    return {
      total,
      safe,
      suspicious,
      malicious,
      avgScore: total ? Math.round(scoreSum / total) : 0,
      countryCount: countries.size,
    };
  }, [logs]);

  const volumeByDay = useMemo(() => {

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), total: 0, malicious: 0 });
    }

    const byKey = Object.fromEntries(days.map(d => [d.key, d]));

    for (const log of logs) {
      const key = log.created_at?.slice(0, 10);
      if (byKey[key]) {
        byKey[key].total++;
        if (classify(log.threat_score ?? 0) === "malicious") byKey[key].malicious++;
      }
    }

    return days;
  }, [logs]);

  const resultsBreakdown = [
    { name: "Safe", value: stats.safe, color: "var(--safe)" },
    { name: "Suspicious", value: stats.suspicious, color: "var(--suspicious)" },
    { name: "Malicious", value: stats.malicious, color: "var(--malicious)" },
  ];

  const detectionsBySource = useMemo(() => {
    let blacklist = 0, google = 0, virustotal = 0;
    for (const log of logs) {
      if (log.blacklist_status === false) blacklist++;
      if (log.google_status === false) google++;
      if (log.virustotal_status === false) virustotal++;
    }
    return [
      { name: "Blacklist", count: blacklist, fill: "var(--chart-blue)" },
      { name: "Google SB", count: google, fill: "var(--chart-orange)" },
      { name: "VirusTotal", count: virustotal, fill: "var(--chart-aqua)" },
    ];
  }, [logs]);

  const topOrigins = useMemo(() => {
    const counts = {};
    for (const log of logs) {
      if (log.country) counts[log.country] = (counts[log.country] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  const recentThreats = useMemo(() => {
    return logs
      .filter(log => classify(log.threat_score ?? 0) !== "safe")
      .slice(0, 6);
  }, [logs]);

  if (loading) return <p>Loading overview...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="admin-overview">

      <div className="stat-grid">
        <StatTile label="Total Scans" value={stats.total.toLocaleString()} subtitle="All time" />
        <StatTile label="Safe URLs" value={stats.safe.toLocaleString()} subtitle={stats.total ? `${Math.round((stats.safe / stats.total) * 100)}% of total` : "—"} tone="safe" />
        <StatTile label="Suspicious" value={stats.suspicious.toLocaleString()} subtitle="Single source flagged" tone="suspicious" />
        <StatTile label="Malicious" value={stats.malicious.toLocaleString()} subtitle="Blocked & flagged" tone="malicious" />
        <StatTile label="Blacklist Rules" value={blacklistCount.toLocaleString()} subtitle="Active entries" />
        <StatTile label="Avg Threat Score" value={stats.avgScore} subtitle="0-100, all scans" />
        <StatTile label="Countries" value={stats.countryCount} subtitle="Unique origins" />
        <StatTile label="Pending Reports" value={pendingReports} subtitle="Awaiting review" tone={pendingReports > 0 ? "suspicious" : undefined} />
      </div>

      <div className="chart-grid">

        <div className="chart-panel chart-panel-wide">
          <h2>Scan Volume — Last 14 Days</h2>
          <p className="chart-subtitle">Daily totals vs. malicious detections</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={volumeByDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
              <YAxis stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--mono)" }} />
              <Line type="monotone" dataKey="total" name="Total scans" stroke="var(--chart-blue)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="malicious" name="Malicious" stroke="var(--malicious)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <h2>Scan Results</h2>
          <p className="chart-subtitle">Overall classification</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={resultsBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {resultsBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, fontFamily: "var(--mono)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <h2>Detections by Source</h2>
          <p className="chart-subtitle">Which check flagged the scan</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={detectionsBySource} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
              <YAxis stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {detectionsBySource.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <h2>Top Origins</h2>
          <p className="chart-subtitle">Scan volume by country</p>
          {topOrigins.length === 0 ? (
            <p className="chart-empty">No geolocation data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topOrigins} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={{ stroke: CHART_GRID }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                <Bar dataKey="count" fill="var(--chart-blue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-panel">
          <h2>Recent Threats</h2>
          <p className="chart-subtitle">Latest suspicious & malicious scans</p>
          <div className="threat-feed">
            {recentThreats.length === 0 && <p className="chart-empty">No threats detected yet.</p>}
            {recentThreats.map((log) => {
              const tier = classify(log.threat_score ?? 0);
              return (
                <div className="threat-feed-row" key={log.id}>
                  <span className={`severity-badge tone-${tier}`}>{tier.toUpperCase()}</span>
                  <div className="threat-feed-body">
                    <span className="threat-feed-url">{log.scanned_url}</span>
                    <span className="threat-feed-meta">{new Date(log.created_at).toLocaleString()} · Score {log.threat_score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}

export default AdminOverview;
