import { useState } from "react";
import Card from "../components/Card";
import ReportedUrlsList from "../components/ReportedUrlsList";
import ReportDetailsModal from "../components/ReportDetailsModal";
import "../css/AdminPage.css";

function AdminPage() {

  const reports = [
    {
      id: 1,
      url: "https://fake-bank-login.com",
      reason: "Looks like a phishing website.",
      date: "19 Jun 2026"
    },
    {
      id: 2,
      url: "https://free-iphone-prize.com",
      reason: "Suspicious giveaway scam.",
      date: "18 Jun 2026"
    }
  ];

  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div className="app">

      <div className="dashboard">

        <Card title="User Reports">

          <ReportedUrlsList
            reports={reports}
            onViewDetails={setSelectedReport}
          />

        </Card>

      </div>

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

    </div>
  );
}

export default AdminPage;