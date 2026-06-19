function ReportedUrlsList({ reports, onViewDetails }) {
  
     reports = [

        {
            id: 1,
            url: "https://fake-bank-login.com",
            reason: "Website impersonates a banking portal.",
            date: "19 Jun 2026"
        },

        {
            id: 2,
            url: "https://free-iphone-prize.com",
            reason: "Suspicious giveaway scam.",
            date: "18 Jun 2026"
        },

        {
            id: 3,
            url: "https://paypal-security-check.com",
            reason: "Possible phishing website.",
            date: "17 Jun 2026"
        }

    ];

  return (

    <div className="reported-list">

        <h1>Reported URLs</h1>

      {reports.map(report => (

        <div
          key={report.id}
          className="report-row"
        >

          <div>

            <strong>{report.url}</strong>

            <p>{report.date}</p>

          </div>

          <button
            onClick={() => onViewDetails(report)}
          >
            View Details
          </button>

        </div>

      ))}

    </div>
  );
}

export default ReportedUrlsList;