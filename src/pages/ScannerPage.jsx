import { useState } from "react";
import QRScanner from "../components/QRScanner";
import LoadingScreen from "../components/LoadingScreen";
import ResultScreen from "../components/ResultScreen";
import KnownMaliciousSites from "../components/KnownMaliciousSites";
import Card from "../components/Card";
import { supabase } from "../supabaseClient";
import { classifyQrContent } from "../utils/classifyQrContent";

const functionUrl =
  "https://zbfbpswmaylqjapqwbel.supabase.co/functions/v1/check-url";

function ScannerPage() {

  const [screen, setScreen] = useState("scanner");
  const [scanResult, setScanResult] = useState(null);

  // Called after QR code detected or URL entered manually
  const handleScan = async (decodedText) => {

    // This classification determines WHAT KIND of QR code it is:
    // website, payment, app-link, wifi, contact, text, etc.
    const qrClassification = classifyQrContent(decodedText);

    /*
     * NON-WEBSITE QR CODES
     *
     * Payment QR, app links, WiFi, contacts, etc.
     * are not sent to Google Safe Browsing / VirusTotal.
     */
    if (qrClassification.type !== "website") {

      setScreen("loading");

      const { data: blacklistHit } = await supabase
        .from("blacklist")
        .select("reason")
        .eq("url", qrClassification.raw)
        .maybeSingle();

      setScanResult({
        url: decodedText,
        kind: qrClassification.type,
        scheme: qrClassification.scheme,
        payment: qrClassification.payment,
        blacklisted: !!blacklistHit,
        blacklistReason: blacklistHit?.reason ?? null,
      });

      setScreen("result");

      return;
    }

    /*
     * WEBSITE
     *
     * Send the URL to the Supabase Edge Function.
     */
    setScreen("loading");

    try {

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: decodedText,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `check-url returned ${response.status}`
        );
      }

      /*
       * IMPORTANT:
       *
       * qrClassification = website/payment/etc.
       *
       * threatClassification = safe/suspicious/malicious
       */
      const {
        isSafe,
        classification: threatClassification,
        checks,
        dangerReasons,
      } = await response.json();

      /*
       * Store the result for ResultScreen.
       */
      setScanResult({
        url: decodedText,

        // This is the QR content type.
        kind: "website",

        // Basic safe boolean.
        safe: isSafe,

        // This is the threat classification:
        // "safe"
        // "suspicious"
        // "malicious"
        classification: threatClassification,

        dangerReasons,

        reasons: [
          {
            name: "Blacklist",
            passed: checks.blacklist.checked
              ? !checks.blacklist.malicious
              : null,
          },

          {
            name: "Google Safe Browsing",
            passed: checks.googleSafeBrowsing.checked
              ? !checks.googleSafeBrowsing.malicious
              : null,
          },

          {
            name: "VirusTotal",
            passed: checks.virusTotal.checked
              ? (
                  !checks.virusTotal.malicious &&
                  !checks.virusTotal.suspicious
                )
              : null,
          },
        ],
      });

      setScreen("result");

    } catch (err) {

      console.error("Function error:", err);

      /*
       * The scan failed rather than the URL necessarily being malicious.
       *
       * We use "unknown" here so we don't incorrectly tell the user
       * that a failed security check means the URL is malicious.
       */
      setScanResult({
        url: decodedText,
        kind: "website",
        safe: false,
        classification: "unknown",
        dangerReasons: [
          "Unable to complete the security analysis.",
        ],
        reasons: [
          {
            name: "Blacklist",
            passed: null,
          },
          {
            name: "Google Safe Browsing",
            passed: null,
          },
          {
            name: "VirusTotal",
            passed: null,
          },
        ],
        error: true,
      });

      setScreen("result");
    }
  };

  const scanAgain = () => {
    setScanResult(null);
    setScreen("scanner");
  };

  return (
    <div className="app">

      <div className="dashboard">

        <div className="main-grid">

          <Card
            title="Scan & Analysis"
            className="analysis-card"
          >

            {screen === "scanner" && (
              <QRScanner
                onScanSuccess={handleScan}
              />
            )}

            {screen === "loading" && (
              <LoadingScreen />
            )}

            {screen === "result" && (
              <ResultScreen
                result={scanResult}
                onScanAgain={scanAgain}
              />
            )}

          </Card>

        </div>

        <div className="bottom-grid">

          <Card title="Known Malicious Sites">
            <KnownMaliciousSites />
          </Card>

        </div>

      </div>

    </div>
  );
}

export default ScannerPage;