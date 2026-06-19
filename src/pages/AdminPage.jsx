import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import ScanLogs from "../components/ScanLogs";
import Blacklist from "../components/Blacklist";
import ReportedUrlsList from "../components/ReportedUrlsList";
import ReportDetailsModal from "../components/ReportDetailsModal";
import "../css/AdminPage.css";

function AdminPage() {

    const { token } = useParams();

    const validToken = "FYP2026Admin";

    const [selectedTab, setSelectedTab] = useState("logs");

    const [selectedReport, setSelectedReport] = useState(null);

    if (token !== validToken) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-layout">

            <AdminSidebar
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />

            <div className="admin-content">

                {selectedTab === "logs" && <ScanLogs />}

                {selectedTab === "blacklist" && <Blacklist />}

                {selectedTab === "reports" && (
                    <ReportedUrlsList
                        onViewDetails={setSelectedReport}
                    />
                )}

            </div>

            <ReportDetailsModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
            />

        </div>
    );
}

export default AdminPage;