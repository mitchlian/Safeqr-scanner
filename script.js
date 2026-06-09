// script.js file
let htmlscanner;
const functionUrl='https://zbfbpswmaylqjapqwbel.supabase.co/functions/v1/check-url';

function startScanner() {
    htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );
    htmlscanner.render(onScanSuccess);
}

async function onScanSuccess(decodeText, decodeResult) {
    htmlscanner.clear();
    
    try {
        // Call Edge Function 
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: decodeText })
        });

        const { isSafe } = await response.json();

        // Google check
        if (isSafe) {
            console.log("URL is safe!");
            const userConfirm = confirm(`QR Code detected: ${decodeText}. Do you want to open it?`);
            if (userConfirm) {
                window.open(decodeText, '_blank');
            }
        } else {
            alert("SECURITY ALERT: This link was flagged as malicious!");
            console.warn("Blocked malicious URL:", decodeText);
        }
    } catch (err) {
        console.error("Function error:", err);
    }
    startScanner();
}

// 3. Start it once the page is ready
document.addEventListener("DOMContentLoaded", function () {
    startScanner();
});