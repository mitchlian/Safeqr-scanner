function AdminSidebar({ selectedTab, setSelectedTab }) {

    return (

        <div className="admin-sidebar">

            <button
                onClick={() => setSelectedTab("logs")}
            >
                Scan Logs
            </button>

            <button
                onClick={() => setSelectedTab("blacklist")}
            >
                Blacklist
            </button>

            <button
                onClick={() => setSelectedTab("reports")}
            >
                Reported Links
            </button>

        </div>

    );
}

export default AdminSidebar;