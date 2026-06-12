import { useState } from "react";
import DangerModal from "./DangerModal";


function ResultScreen({ result, onScanAgain }) {

  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

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

        {result.safe ? "✓ SAFE LINK" : "✗ MALICIOUS LINK"}

      </div>

      <div className="reasons">

        {result.reasons?.length > 0 ? (
          result.reasons.map((reason) => (
            <div className="reason-row" key={reason.name}>
              <span>{reason.name}</span>
              <span>{reason.passed ? "✓" : "✗"}</span>
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
          Open Link
        </button>

        <button>
          Report Link
        </button>

        <button onClick={onScanAgain}>
          Scan Another QR
        </button>

      </div>
      <DangerModal

        isOpen={isDangerModalOpen}

        onCancel={() => setIsDangerModalOpen(false)}

        onProceed={() => {

            window.open(result.url, "_blank");

            setIsDangerModalOpen(false);

        }}
       />

    </>
  );
}

export default ResultScreen;