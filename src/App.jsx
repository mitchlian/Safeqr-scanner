import { useState } from "react";
import QRScanner from "./components/QRScanner";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";
import Card from "./components/Card";
import { supabase } from "./supabaseClient";
const functionUrl='https://zbfbpswmaylqjapqwbel.supabase.co/functions/v1/check-url';
import "./App.css";

function App() {

  const [screen, setScreen] = useState("scanner");

  const [scanResult, setScanResult] = useState(null);

  // Called after QR code detected
  const handleScan = async (decodedText) => {

    setScreen("loading");

    // // Simulate backend delay
    // setTimeout(() => {

    //   const result = {
    //     url: decodedText,
    //     safe: false,
    //     reasons: [
    //       {
    //         name: "Google Safe Browsing API",
    //         passed: false
    //       },
    //       {
    //         name: "Known Phishing Database",
    //         passed: true
    //       },
    //       {
    //         name: "URL Pattern Validation",
    //         passed: false
    //       }
    //     ]
    //   };

    //   setScanResult(result);
    //   setScreen("result");

    // }, 2500);
    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: decodedText })
      });

      const { isSafe } = await response.json();

      // still show result UI
      setScanResult({
        url: decodedText,
        safe: isSafe,
        reasons: [],
      });

      setScreen("result");

    } catch (err) {
      console.error("Function error:", err);

      setScanResult({
        url: decodedText,
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

            {/* <Card title="Recent Scans">
              <ScanHistory history={history} />
            </Card> */}

          </div>

        </div>

    </div>
  );
}

export default App;