import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminOverview from "../components/AdminOverview";
import ScanLogs from "../components/ScanLogs";
import Blacklist from "../components/Blacklist";
import ReportedUrlsList from "../components/ReportedUrlsList";
import ReportDetailsModal from "../components/ReportDetailsModal";
import { supabase } from "../supabaseClient";
import "../css/AdminPage.css";

const TAB_TITLES = {
    overview: "Overview",
    logs: "Scan Logs",
    blacklist: "Blacklist",
    reports: "Reported Links",
};

function AdminPage() {

    const { token } = useParams();

    const validToken = "FYP2026Admin";

    const [selectedTab, setSelectedTab] = useState("overview");

    const [selectedReport, setSelectedReport] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0);

    const [now, setNow] = useState(new Date());

    const [pendingReports, setPendingReports] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {

        const fetchPending = async () => {
            const { count } = await supabase
                .from("reports")
                .select("id", { count: "exact", head: true })
                .eq("status", "pending");

            setPendingReports(count ?? 0);
        };

        fetchPending();
    }, [refreshKey, selectedTab]);

    if (token !== validToken) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-shell">

        <div className="admin-layout">

            <AdminSidebar
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                pendingReports={pendingReports}
            />

            <div className="admin-content">

                <div className="admin-page-header">
                    <div className="admin-page-title-group">
                        <h1>{TAB_TITLES[selectedTab]}</h1>
                        <p className="admin-page-clock">{now.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                    </div>

                    <div className="admin-page-actions">
                        <button onClick={() => setRefreshKey((k) => k + 1)}>
                            Refresh
                        </button>
                    </div>
                </div>

                {selectedTab === "overview" && <AdminOverview refreshKey={refreshKey} />}

                {selectedTab === "logs" && <ScanLogs refreshKey={refreshKey} />}

                {selectedTab === "blacklist" && <Blacklist refreshKey={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} />}

                {selectedTab === "reports" && (
                    <ReportedUrlsList
                        refreshKey={refreshKey}
                        onViewDetails={setSelectedReport}
                    />
                )}

            </div>

            <ReportDetailsModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onResolved={() => setRefreshKey((k) => k + 1)}
            />

        </div>
        </div>
    );
}

export default AdminPage;
