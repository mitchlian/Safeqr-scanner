import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function ReportedUrlsList({ onViewDetails, refreshKey }) {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blacklisting, setBlacklisting] = useState(null);

    const fetchReports = async () => {

        const { data, error } = await supabase
            .from("reports")
            .select("id, url, reason, status, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setReports(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        const load = async () => { await fetchReports(); };
        load();
    }, [refreshKey]);

    const handleQuickBlacklist = async (report) => {

        setBlacklisting(report.id);

        await supabase.from("blacklist").insert([{
            url: report.url,
            reason: report.reason,
        }]);

        await supabase.from("reports").update({ status: "accepted" }).eq("id", report.id);
        
        // Update local state immediately
        setReports(prevReports =>
            prevReports.map(r =>
                r.id === report.id
                    ? { ...r, status: "accepted" }
                    : r
            )
        );

        setBlacklisting(null);
    };

  return (

    <div className="reported-list">

        <p className="admin-subtitle">{reports.length} report{reports.length === 1 ? "" : "s"} total</p>

        {loading && <p>Loading...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && reports.length === 0 && (
            <p className="chart-empty">No reports submitted yet.</p>
        )}

      {reports.map(report => (

        <div
          key={report.id}
          className="report-row"
        >

          <div>

            <strong>{report.url}</strong>

            <p>{new Date(report.created_at).toLocaleDateString()}</p>

          </div>

          <div className="report-actions">

            <span className={`report-status status-${report.status}`}>
                {report.status.toUpperCase()}
            </span>

            {(report.status === "pending" || report.status === "declined") && (
                <button
                    onClick={() => handleQuickBlacklist(report)}
                    disabled={blacklisting === report.id}
                >
                    {blacklisting === report.id ? "Blacklisting..." : "Blacklist"}
                </button>
            )}

            {report.status === "pending" && (
                <button
                    onClick={() => onViewDetails(report)}
                >
                    View Details
                </button>
            )}

          </div>

        </div>

      ))}

    </div>
  );
}

export default ReportedUrlsList;
