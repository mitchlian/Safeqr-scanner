import { useState } from "react";

function ReportModal({ isOpen, url, onClose }) {

    const [reason, setReason] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen)
        return null;

    const handleSubmit = () => {

        // later:
        // insert into database

        if (!reason.trim()) {
            setError("Please provide a reason before submitting.");
            return;
        }

        setError("");

        console.log({
            reportedUrl: url,
            reason
        });

        setSubmitted(true);
    };

    const handleClose = () => {

        setReason("");
        setSubmitted(false);
        onClose();
    };

    return (

        <div className="modal-overlay">

            <div className="modal">

                {!submitted ? (

                    <>
                        <h2>Report Suspicious Link</h2>

                        <p>
                            <strong>URL:</strong>
                        </p>

                        <div className="reported-url">
                            {url}
                        </div>

                        <textarea
                            className="report-textarea"
                            placeholder="Provide a reason for reporting this link..."
                            value={reason}
                            onChange={(e) => {setReason(e.target.value);

                            if (error) {
                                setError("");
                            }}}
                        />

                        {error && (
                            <p className="form-error">
                                {error}
                            </p>
                        )}

                        <div className="modal-buttons">

                            <button
                                className="cancel-btn"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmit}
                            >
                                Submit Report
                            </button>

                        </div>

                    </>

                ) : (

                    <>
                        <h2>✓ Report Submitted</h2>

                        <p>
                            Thank you for helping keep users safe.
                        </p>

                        <button onClick={handleClose}>
                            Close
                        </button>
                    </>

                )}

            </div>

        </div>

    );
}

export default ReportModal;