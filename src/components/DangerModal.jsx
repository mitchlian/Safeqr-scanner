function DangerModal({ isOpen, onCancel, onProceed }) {

  if (!isOpen)
    return null;

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2>⚠ Dangerous Link Detected</h2>

        <p>
          This URL has been flagged as potentially malicious.
        </p>

        <p>
          Proceed at your own risk.
        </p>

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="danger-btn"
            onClick={onProceed}
          >
            Proceed Anyway
          </button>

        </div>

      </div>

    </div>

  );
}

export default DangerModal;