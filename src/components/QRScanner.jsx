import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

function QRScanner({ onScanSuccess }) {

  const [inputUrl, setInputUrl] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear().then(() => {
          onScanSuccess(decodedText);
        });
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const handleManualCheck = () => {

    if (!inputUrl.trim()) return;

    onScanSuccess(inputUrl);

    setInputUrl("");
  };

  return (
    <>
      <h1>Safe QR Scanner</h1>

      <div id="reader"></div>

      <div className="manual-input">

        <h3>Or enter a URL manually</h3>

        <input
          type="text"
          placeholder="https://example.com"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />

        <button onClick={handleManualCheck}>
          Check URL
        </button>

      </div>
    </>
  );
}

export default QRScanner;