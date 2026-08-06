import logo from "../assets/logo.png";

const TABS = [
    { key: "overview", label: "Overview" },
    { key: "logs", label: "Scan Logs" },
    { key: "blacklist", label: "Blacklist" },
    { key: "reports", label: "Reported Links" },
];

function AdminSidebar({ selectedTab, setSelectedTab, pendingReports }) {

    return (

        <div className="admin-sidebar">

            <div className="admin-brand">
                <img src={logo} alt="SafeQR" className="admin-brand-logo" />
                <div>
                    <div className="admin-brand-name">SAFE<span style={{ color: "var(--accent)" }}>QR</span></div>
                    <div className="admin-brand-sub">ADMIN CONSOLE</div>
                </div>
            </div>

            <div className="admin-status">
                <span className="admin-status-dot" />
                SYSTEM ONLINE
            </div>

            <div className="admin-nav">

                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`admin-nav-item${selectedTab === tab.key ? " active" : ""}`}
                        onClick={() => setSelectedTab(tab.key)}
                    >
                        {tab.label}
                        {tab.key === "reports" && pendingReports > 0 && (
                            <span className="admin-nav-badge">{pendingReports}</span>
                        )}
                    </button>
                ))}

            </div>

        </div>

    );
}

export default AdminSidebar;
