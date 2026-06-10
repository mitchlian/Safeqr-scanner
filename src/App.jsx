import { useState } from "react";
import QRScanner from "./components/QRScanner";
import LoadingScreen from "./components/LoadingScreen";
import ResultScreen from "./components/ResultScreen";
import "./App.css";

function App() {

  const [screen, setScreen] = useState("scanner");

  const [scanResult, setScanResult] = useState(null);

  // Called after QR code detected
  const handleScan = async (decodedText) => {

    setScreen("loading");

    // Simulate backend delay
    setTimeout(() => {

      const result = {
        url: decodedText,
        safe: false,
        reasons: [
          {
            name: "Google Safe Browsing API",
            passed: false
          },
          {
            name: "Known Phishing Database",
            passed: true
          },
          {
            name: "URL Pattern Validation",
            passed: false
          }
        ]
      };

      setScanResult(result);
      setScreen("result");

    }, 2500);
  };

  const scanAgain = () => {
    setScanResult(null);
    setScreen("scanner");
  };

  return (
    <div className="app">

      {screen === "scanner" &&
        <QRScanner onScanSuccess={handleScan} />
      }

      {screen === "loading" &&
        <LoadingScreen />
      }

      {screen === "result" &&
        <ResultScreen
          result={scanResult}
          onScanAgain={scanAgain}
        />
      }

    </div>
  );
}

export default App;