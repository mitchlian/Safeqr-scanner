import { useState } from "react";
import DangerModal from "./DangerModal";
import ReportModal from "./ReportModal";

const APP_SCHEME_LABELS = {
  intent: "Android app",
  whatsapp: "WhatsApp",
  tel: "phone dialer",
  sms: "SMS",
  mailto: "email client",
  geo: "maps app",
};

const QR_KIND_LABELS = {
  wifi: "WiFi Network Details",
  contact: "Contact Card",
  text: "Text Content",
};

function ReportAndScanAgainButtons({ url, onScanAgain }) {

  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className="buttons">

      <button onClick={() => setShowReportModal(true)}>
        Report This
      </button>

      <button onClick={onScanAgain}>
        Scan Another QR
      </button>

      <ReportModal
        isOpen={showReportModal}
        url={url}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}

function BlacklistWarning({ blacklisted, blacklistReason }) {

  if (!blacklisted) return null;

  return (
    <div className="danger-reasons">
      <div className="danger-reason-row">
        {blacklistReason || "This has been reported and added to the blocklist."}
      </div>
    </div>
  );
}

function PaymentResult({ result, onScanAgain }) {

  const p = result.payment || {};

  return (
    <>
      <div className={result.blacklisted ? "unsafe" : "info"}>
        {result.blacklisted ? "✗ REPORTED SCAM PAYMENT" : "PAYMENT QR CODE"}
      </div>

      <BlacklistWarning blacklisted={result.blacklisted} blacklistReason={result.blacklistReason} />

      <div className="scanned-url">
        <strong>Paying:</strong>
        <p>{p.merchantName || p.payee || "Unknown recipient"}</p>

        {(p.amount || p.currency) && (
          <>
            <strong>Amount:</strong>
            <p>{[p.amount, p.currency].filter(Boolean).join(" ")}</p>
          </>
        )}

        {p.payee && (
          <>
            <strong>Payee ID:</strong>
            <p>{p.payee}</p>
          </>
        )}
      </div>

      <p className="result-caution">
        SafeQR cannot verify who actually controls this payment recipient. Confirm the name matches who you intend to pay before confirming in your payment app.
      </p>

      <ReportAndScanAgainButtons url={result.url} onScanAgain={onScanAgain} />
    </>
  );
}

function AppLinkResult({ result, onScanAgain }) {

  const label = APP_SCHEME_LABELS[result.scheme] || `"${result.scheme}"`;

  return (
    <>
      <div className={result.blacklisted ? "unsafe" : "info"}>
        {result.blacklisted ? "✗ KNOWN MALICIOUS APP LINK" : "APP LINK — NOT A WEBSITE"}
      </div>

      <BlacklistWarning blacklisted={result.blacklisted} blacklistReason={result.blacklistReason} />

      <div className="scanned-url">
        <strong>This QR code opens {label}:</strong>
        <p>{result.url}</p>
      </div>

      <p className="result-caution">
        SafeQR cannot check app links the way it checks websites. Only proceed if you trust where this QR code came from.
      </p>

      <ReportAndScanAgainButtons url={result.url} onScanAgain={onScanAgain} />
    </>
  );
}

function GenericQrResult({ result, onScanAgain }) {

  return (
    <>
      <div className="info">
        {QR_KIND_LABELS[result.kind] || "QR Code Content"}
      </div>

      <div className="scanned-url">
        <p>{result.url}</p>
      </div>

      <ReportAndScanAgainButtons url={result.url} onScanAgain={onScanAgain} />
    </>
  );
}

function WebsiteResult({ result, onScanAgain }) {

  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleOpen = () => {

    if (result.safe) {

        window.open(result.url, "_blank");
    }
    else {

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

function ResultScreen({ result, onScanAgain }) {

  if (result.kind === "payment") return <PaymentResult result={result} onScanAgain={onScanAgain} />;
  if (result.kind === "app-link") return <AppLinkResult result={result} onScanAgain={onScanAgain} />;
  if (result.kind === "wifi" || result.kind === "contact" || result.kind === "text") {
    return <GenericQrResult result={result} onScanAgain={onScanAgain} />;
  }

  return <WebsiteResult result={result} onScanAgain={onScanAgain} />;
}

export default ResultScreen;
