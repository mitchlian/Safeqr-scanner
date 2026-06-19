import "../css/ReportDetailsModal.css";

function ReportDetailsModal({ report, onClose }) {

    if (!report)
        return null;

    return (

        <div className="admin-modal-overlay">

            <div className="admin-modal">

                <div className="admin-modal-title-row">

                    <h2>Reported URL</h2>

                    <button
                        className="admin-close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>
                <div className="admin-reported-url">
                    {report.url}
                </div>

                <div className="admin-report-section">
                    <strong>Reason:</strong>
                    <p>{report.reason}</p>
                </div>

                <div className="admin-report-section">
                    <strong>Date Submitted:</strong>
                    <p>{report.date}</p>
                </div>

                <div className="admin-modal-buttons">

                    <button
                        className="admin-decline-btn"
                        onClick={onClose}
                    >
                        Decline Report
                    </button>

                    <button
                        className="admin-accept-btn"
                        onClick={onClose}
                    >
                        Accept Report
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ReportDetailsModal;