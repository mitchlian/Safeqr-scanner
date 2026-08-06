function DangerModal({ isOpen, reasons, onClose }) {

  if (!isOpen)
    return null;

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2 className="danger-modal-title">⚠ Dangerous Link Blocked</h2>

        <p>
          This link has not been opened because it was flagged as dangerous:
        </p>

        <div className="danger-reasons">
          {reasons?.length > 0 ? (
            reasons.map((reason) => (
              <div className="danger-reason-row" key={reason}>
                {reason}
              </div>
            ))
          ) : (
            <div className="danger-reason-row">
              This URL matched one or more threat indicators.
            </div>
          )}
        </div>

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </div>

  );
}

export default DangerModal;
