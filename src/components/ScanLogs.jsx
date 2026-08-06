import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

const FILTERS = ["all", "safe", "suspicious", "malicious"];

function classify(threatScore) {
  if (threatScore >= 100) return "malicious";
  if (threatScore >= 50) return "suspicious";
  return "safe";
}

function ScanLogs({ refreshKey }) {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {

        const fetchLogs = async () => {

            const { data, error } = await supabase
                .from("scan_logs")
                .select("id, scanned_url, threat_score, created_at, country")
                .order("created_at", { ascending: false })
                .limit(200);

            if (error) {
                setError(error.message);
            } else {
                setLogs(data);
            }

            setLoading(false);
        };

        fetchLogs();
    }, [refreshKey]);

    const filteredLogs = useMemo(() => {

        const term = search.trim().toLowerCase();

        return logs.filter((log) => {
            const tier = classify(log.threat_score ?? 0);
            if (filter !== "all" && tier !== filter) return false;
            if (term && !log.scanned_url.toLowerCase().includes(term)) return false;
            return true;
        });
    }, [logs, filter, search]);

    return (

        <div className="scan-logs">

            <div className="admin-toolbar">

                <div className="filter-tabs">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            className={`filter-tab${filter === f ? " active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="Search URL..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="admin-search"
                />

            </div>

            {loading && <p>Loading...</p>}

            {error && <p className="form-error">{error}</p>}

            {!loading && !error && (

                <div className="scan-logs-table">

                    <div className="scan-logs-row scan-logs-head">
                        <span>Timestamp</span>
                        <span>URL</span>
                        <span>Status</span>
                        <span>Risk</span>
                        <span>Country</span>
                    </div>

                    {filteredLogs.length === 0 && (
                        <p className="chart-empty">No scans match this filter.</p>
                    )}

                    {filteredLogs.map((log) => {
                        const tier = classify(log.threat_score ?? 0);
                        return (
                            <div className="scan-logs-row" key={log.id}>
                                <span className="scan-logs-time">{new Date(log.created_at).toLocaleString()}</span>
                                <span className="scan-logs-url">{log.scanned_url}</span>
                                <span className={`severity-badge tone-${tier}`}>{tier.toUpperCase()}</span>
                                <span className="scan-logs-risk">{log.threat_score}</span>
                                <span className="scan-logs-country">{log.country ?? "—"}</span>
                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default ScanLogs;
