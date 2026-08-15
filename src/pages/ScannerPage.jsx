import { useState } from "react";
import QRScanner from "../components/QRScanner";
import LoadingScreen from "../components/LoadingScreen";
import ResultScreen from "../components/ResultScreen";
import KnownMaliciousSites from "../components/KnownMaliciousSites";
import Card from "../components/Card";
import { supabase } from "../supabaseClient";
import { classifyQrContent } from "../utils/classifyQrContent";
const functionUrl='https://zbfbpswmaylqjapqwbel.supabase.co/functions/v1/check-url';

function ScannerPage() {

  const [screen, setScreen] = useState("scanner");

  const [scanResult, setScanResult] = useState(null);

  // Called after QR code detected
  const handleScan = async (decodedText) => {

    const classification = classifyQrContent(decodedText);

    // Only website URLs can be checked against Safe Browsing / VirusTotal.
    // Everything else (payment QR, app links, wifi, contact, plain text)
    // gets its own result view instead of being force-fit through that check.
    if (classification.type !== "website") {

      setScreen("loading");

      const { data: blacklistHit } = await supabase
        .from("blacklist")
        .select("reason")
        .eq("url", classification.raw)
        .maybeSingle();

      setScanResult({
        url: decodedText,
        kind: classification.type,
        scheme: classification.scheme,
        payment: classification.payment,
        blacklisted: !!blacklistHit,
        blacklistReason: blacklistHit?.reason ?? null,
      });

      setScreen("result");
      return;
    }

    setScreen("loading");

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: decodedText })
      });

      if (!response.ok) {
        throw new Error(`check-url returned ${response.status}`);
      }

      const { isSafe, checks, dangerReasons } = await response.json();

      setScanResult({
        url: decodedText,
        kind: "website",
        safe: isSafe,
        classification,
        dangerReasons,
        reasons: [
          { name: "Blacklist", passed: !checks.blacklist.malicious },
          { name: "Google Safe Browsing", passed: checks.googleSafeBrowsing.checked ? !checks.googleSafeBrowsing.malicious : null },
          { name: "VirusTotal", passed: checks.virusTotal.checked ? !checks.virusTotal.malicious && !checks.virusTotal.suspicious : null },
        ],
      });

      setScreen("result");

    } catch (err) {
      console.error("Function error:", err);

      setScanResult({
        url: decodedText,
        kind: "website",
        safe: false,
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

          {/* <h1>Safe QR Scanner</h1> */}

          <div className="main-grid">

            <Card title="Scan & Analysis" className="analysis-card">

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