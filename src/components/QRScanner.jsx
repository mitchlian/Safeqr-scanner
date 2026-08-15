import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

function QRScanner({ onScanSuccess }) {

  const [inputUrl, setInputUrl] = useState("");
  const [inputError, setInputError] = useState("");

  useEffect(() => {

    const readerElement = document.getElementById("reader");

    if (readerElement) {
      readerElement.innerHTML = "";
    }

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

  }, [onScanSuccess]);


  const isValidPublicDomain = (url) => {

    try {

      const parsed = new URL(url);

      // Only allow HTTP and HTTPS
      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        return false;
      }

      const hostname = parsed.hostname.toLowerCase();

      // No spaces
      if (/\s/.test(hostname)) {
        return false;
      }

      // Don't allow localhost
      if (
        hostname === "localhost" ||
        hostname.endsWith(".local")
      ) {
        return false;
      }

      // Reject IP addresses
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        return false;
      }

      // Must contain at least one dot
      if (!hostname.includes(".")) {
        return false;
      }

      // Domain format:
      // example.com
      // example.org
      // example.sg
      // example.co.uk
      const domainRegex =
        /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

      if (!domainRegex.test(hostname)) {
        return false;
      }

      return true;

    } catch {
      return false;
    }
  };


  const handleManualCheck = () => {

    const value = inputUrl.trim();

    setInputError("");

    if (!value) {
      setInputError("Please enter a website address.");
      return;
    }

    // Add HTTPS if the user didn't provide a scheme
    let url = value;

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    if (!isValidPublicDomain(url)) {
      setInputError(
        "Please enter a valid public website, such as wikipedia.org or example.com."
      );
      return;
    }

    onScanSuccess(url);

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
          onChange={(e) => {
            setInputUrl(e.target.value);

            // Clear previous error when user starts typing again
            if (inputError) {
              setInputError("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleManualCheck();
            }
          }}
        />

        <button onClick={handleManualCheck}>
          Check URL
        </button>

        {inputError && (
          <p className="form-error">
            {inputError}
          </p>
        )}

      </div>
    </>
  );
}

export default QRScanner;