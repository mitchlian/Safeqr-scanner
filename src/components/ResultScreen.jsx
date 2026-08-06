import { useState } from "react";
import DangerModal from "./DangerModal";
import ReportModal from "./ReportModal";

function ResultScreen({ result, onScanAgain }) {

  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleOpen = () => {

    if(result.safe){

        window.open(result.url, "_blank");
    }
    else{

        setIsDangerModalOpen(true);
    }
  };

  return (

    <>

      <div className={result.safe ? "safe" : "unsafe"}>

        {result.safe ? "✓ SAFE LINK" : "✗ DANGEROUS LINK"}

      </div>

      <div className="scanned-url">
        <strong>Scanned URL:</strong>
        <p>{result.url}</p>
      </div>

      {!result.safe && result.dangerReasons?.length > 0 && (
        <div className="danger-reasons danger-reasons-inline">
          {result.dangerReasons.map((reason) => (
            <div className="danger-reason-row" key={reason}>
              {reason}
            </div>
          ))}
        </div>
      )}

      <div className="reasons">

        {result.reasons?.length > 0 ? (
          result.reasons.map((reason) => (
            <div className="reason-row" key={reason.name}>
              <span>{reason.name}</span>
              <span>{reason.passed === null ? "—" : reason.passed ? "✓" : "✗"}</span>
            </div>
          ))
        ) : (
          <div className="reason-row">
            <span>No analysis data available</span>
          </div>
        )}

      </div>

      <div className="buttons">

        <button onClick={handleOpen}>
          {result.safe ? "Open Link" : "Why is this dangerous?"}
        </button>

        <button onClick={() => setShowReportModal(true)}>
          Report Link
        </button>

        <button onClick={onScanAgain}>
          Scan Another QR
        </button>

      </div>
      <DangerModal

        isOpen={isDangerModalOpen}

        reasons={result.dangerReasons}

        onClose={() => setIsDangerModalOpen(false)}
      />
      <ReportModal

        isOpen={showReportModal}

        url={result.url}

        onClose={() => setShowReportModal(false)}

      />

    </>
  );
}

export default ResultScreen;