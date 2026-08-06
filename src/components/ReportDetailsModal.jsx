import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../css/ReportDetailsModal.css";

function ReportDetailsModal({ report, onClose, onResolved }) {

    const [updating, setUpdating] = useState(false);

    if (!report)
        return null;

    const updateStatus = async (status) => {

        setUpdating(true);

        await supabase.from("reports").update({ status }).eq("id", report.id);

        setUpdating(false);
        onResolved?.();
        onClose();
    };

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
                    <p>{new Date(report.created_at).toLocaleString()}</p>
                </div>

                <div className="admin-report-section">
                    <strong>Status:</strong>
                    <p>{report.status}</p>
                </div>

                <div className="admin-modal-buttons">

                    <button
                        className="admin-decline-btn"
                        onClick={() => updateStatus("declined")}
                        disabled={updating}
                    >
                        Decline Report
                    </button>

                    <button
                        className="admin-accept-btn"
                        onClick={() => updateStatus("accepted")}
                        disabled={updating}
                    >
                        Accept Report
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ReportDetailsModal;
