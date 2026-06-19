function ReportedUrlsList({ reports, onViewDetails }) {

  return (
    <div className="reported-list">

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