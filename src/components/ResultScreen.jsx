import { useState } from "react";
import DangerModal from "./DangerModal";
import ReportModal from "./ReportModal";

const APP_SCHEME_LABELS = {
  intent: "Android app",
  whatsapp: "WhatsApp",
  tel: "Phone dialer",
  sms: "SMS",
  mailto: "Email client",
  geo: "Maps app",
};

const QR_KIND_LABELS = {
  wifi: "WiFi Network",
  contact: "Contact Card",
  text: "Text Content",
};

function ReportAndScanAgainButtons({ url, onScanAgain, canReport = true}) {

  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className="buttons">

      {canReport && (
        <button onClick={() => setShowReportModal(true)}>
          Report This
        </button>
      )}

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
        {blacklistReason ||
          "This has been reported and added to the blocklist."}
      </div>
    </div>
  );
}


/* ---------------- PAYMENT ---------------- */

function PaymentResult({ result, onScanAgain }) {

  const p = result.payment || {};

  return (
    <>
      <div className={result.blacklisted ? "unsafe" : "info"}>
        {result.blacklisted
          ? "✗ REPORTED SCAM PAYMENT"
          : "PAYMENT QR CODE"}
      </div>

      <BlacklistWarning
        blacklisted={result.blacklisted}
        blacklistReason={result.blacklistReason}
      />

      <div className="scanned-details">

        {p.merchantName && (
          <div className="detail-row">
            <strong>Merchant:</strong>
            <span>{p.merchantName}</span>
          </div>
        )}

        {p.merchantCity && (
          <div className="detail-row">
            <strong>Location:</strong>
            <span>{p.merchantCity}</span>
          </div>
        )}

        {p.amount && (
          <div className="detail-row">
            <strong>Amount:</strong>
            <span>
              {p.amount} {p.currency || ""}
            </span>
          </div>
        )}

        {p.payee && (
          <div className="detail-row">
            <strong>Payee:</strong>
            <span>{p.payee}</span>
          </div>
        )}

        {p.countryCode && (
          <div className="detail-row">
            <strong>Country:</strong>
            <span>{p.countryCode}</span>
          </div>
        )}

      </div>

      <p className="result-caution">
        SafeQR cannot verify who actually controls this payment
        recipient. Confirm the name matches who you intend to pay
        before confirming in your payment app.
      </p>

      <ReportAndScanAgainButtons
        url={result.url}
        onScanAgain={onScanAgain}
        canReport={false}
      />
    </>
  );
}


/* ---------------- APP LINK ---------------- */

function AppLinkResult({ result, onScanAgain }) {

  const label =
    APP_SCHEME_LABELS[result.scheme] ||
    `"${result.scheme}"`;

  return (
    <>
      <div className={result.blacklisted ? "unsafe" : "info"}>
        {result.blacklisted
          ? "✗ KNOWN MALICIOUS APP LINK"
          : "APP LINK — NOT A WEBSITE"}
      </div>

      <BlacklistWarning
        blacklisted={result.blacklisted}
        blacklistReason={result.blacklistReason}
      />

      <div className="scanned-details">

        <div className="detail-row">
          <strong>Application:</strong>
          <span>{label}</span>
        </div>

        <div className="detail-row">
          <strong>Scheme:</strong>
          <span>{result.scheme}</span>
        </div>

        <div className="detail-row detail-column">
          <strong>Content:</strong>
          <span>{result.url}</span>
        </div>

      </div>

      <p className="result-caution">
        SafeQR cannot check app links the same way it checks
        websites. Only proceed if you trust where this QR code
        came from.
      </p>

      <ReportAndScanAgainButtons
        url={result.url}
        onScanAgain={onScanAgain}
        canReport={false}
      />
    </>
  );
}


/* ---------------- CONTACT ---------------- */

function ContactResult({ result, onScanAgain }) {

  const contact = parseContact(result.url);

  return (
    <>
      <div className="info">
        Contact Card
      </div>

      <div className="scanned-details">

        {contact.name && (
          <div className="detail-row">
            <strong>Name:</strong>
            <span>{contact.name}</span>
          </div>
        )}

        {contact.phone && (
          <div className="detail-row">
            <strong>Phone:</strong>
            <span>{contact.phone}</span>
          </div>
        )}

        {contact.email && (
          <div className="detail-row">
            <strong>Email:</strong>
            <span>{contact.email}</span>
          </div>
        )}

        {contact.organization && (
          <div className="detail-row">
            <strong>Organization:</strong>
            <span>{contact.organization}</span>
          </div>
        )}

        {contact.website && (
          <div className="detail-row">
            <strong>Website:</strong>
            <span>{contact.website}</span>
          </div>
        )}

      </div>

      <p className="result-caution">
        Only save this contact if you trust the source of the QR code.
      </p>

      <ReportAndScanAgainButtons
        url={result.url}
        onScanAgain={onScanAgain}
        canReport={false}
      />
    </>
  );
}


/* ---------------- WIFI ---------------- */

function WifiResult({ result, onScanAgain }) {

  const wifi = parseWifi(result.url);

  return (
    <>
      <div className="info">
        WiFi Network
      </div>

      <div className="scanned-details">

        {wifi.ssid && (
          <div className="detail-row">
            <strong>Network:</strong>
            <span>{wifi.ssid}</span>
          </div>
        )}

        {wifi.security && (
          <div className="detail-row">
            <strong>Security:</strong>
            <span>{wifi.security}</span>
          </div>
        )}

        {wifi.hidden && (
          <div className="detail-row">
            <strong>Hidden Network:</strong>
            <span>Yes</span>
          </div>
        )}

        {wifi.password && (
          <div className="detail-row">
            <strong>Password:</strong>
            <span>{wifi.password}</span>
          </div>
        )}

      </div>

      <p className="result-caution">
        Only connect to a WiFi network if you trust its source.
      </p>

      <ReportAndScanAgainButtons
        url={result.url}
        onScanAgain={onScanAgain}
        canReport={false}
      />
    </>
  );
}


/* ---------------- TEXT ---------------- */

function GenericTextResult({ result, onScanAgain }) {

  return (
    <>
      <div className="info">
        Text Content
      </div>

      <div className="scanned-details">
        <div className="detail-row detail-column">
          <strong>Content:</strong>
          <span>{result.url}</span>
        </div>
      </div>

      <ReportAndScanAgainButtons
        url={result.url}
        onScanAgain={onScanAgain}
        canReport={false}
      />
    </>
  );
}


/* ---------------- CONTACT PARSER ---------------- */

function parseContact(text) {

  const getValue = (field) => {

    const regex = new RegExp(
      `(?:^|\\n)${field}[^:]*:(.*)`,
      "i"
    );

    const match = text.match(regex);

    return match ? match[1].trim() : null;
  };

  return {
    name:
      getValue("FN") ||
      getValue("N"),

    phone:
      getValue("TEL"),

    email:
      getValue("EMAIL"),

    organization:
      getValue("ORG"),

    website:
      getValue("URL"),
  };
}


/* ---------------- WIFI PARSER ---------------- */

function parseWifi(text) {

  const getValue = (key) => {

    const regex = new RegExp(
      `${key}:([^;]*)`,
      "i"
    );

    const match = text.match(regex);

    return match ? match[1] : null;
  };

  return {
    security: getValue("T"),
    ssid: getValue("S"),
    password: getValue("P"),
    hidden: getValue("H") === "true",
  };
}


/* ---------------- WEBSITE ---------------- */

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
      <div className={
          result.classification === "safe"
            ? "safe"
            : result.classification === "suspicious"
              ? "suspicious"
              : "unsafe"
        }
      >
        {result.classification === "safe" && "✓ SAFE LINK"}

        {result.classification === "suspicious" &&
          "⚠ SUSPICIOUS LINK"}

        {result.classification === "malicious" &&
          "✗ DANGEROUS LINK"}
      </div>
      
      <div className="scanned-url">
        <strong>Scanned URL:</strong>
        <p>{result.url}</p>
      </div>

      {!result.safe && result.dangerReasons?.length > 0 && (
        <div className="danger-reasons danger-reasons-inline">

          {[
            ...new Set(result.dangerReasons)
          ].map((reason) => (

            <div
              className="danger-reason-row"
              key={reason}
            >
              {reason}
            </div>

          ))}

        </div>
      )}

      <div className="reasons">

        {result.reasons?.length > 0 ? (

          result.reasons.map((reason) => (

            <div
              className="reason-row"
              key={reason.name}
            >
              <span>{reason.name}</span>

              <span>
                {reason.passed === null
                  ? "—"
                  : reason.passed
                    ? "✓"
                    : "✗"}
              </span>
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
          {result.safe
            ? "Open Link"
            : "Why is this dangerous?"}
        </button>

        <button
          onClick={() => setShowReportModal(true)}
        >
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


/* ---------------- MAIN RESULT SCREEN ---------------- */

function ResultScreen({ result, onScanAgain }) {

  if (result.kind === "payment") {
    return (
      <PaymentResult
        result={result}
        onScanAgain={onScanAgain}
      />
    );
  }

  if (result.kind === "app-link") {
    return (
      <AppLinkResult
        result={result}
        onScanAgain={onScanAgain}
      />
    );
  }

  if (result.kind === "wifi") {
    return (
      <WifiResult
        result={result}
        onScanAgain={onScanAgain}
      />
    );
  }

  if (result.kind === "contact") {
    return (
      <ContactResult
        result={result}
        onScanAgain={onScanAgain}
      />
    );
  }

  if (result.kind === "text") {
    return (
      <GenericTextResult
        result={result}
        onScanAgain={onScanAgain}
      />
    );
  }

  return (
    <WebsiteResult
      result={result}
      onScanAgain={onScanAgain}
    />
  );
}

export default ResultScreen;