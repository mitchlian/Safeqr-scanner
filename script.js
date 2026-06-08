// script.js file
let htmlscanner;

function startScanner() {
    htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );
    htmlscanner.render(onScanSuccess);
}

function onScanSuccess(decodeText, decodeResult) {
    // Now this works because htmlscanner is globally defined
    htmlscanner.clear().then(() => {
        const userConfirm = confirm(`QR Code detected: ${decodeText}. Do you want to open it?`);

        if (userConfirm) {
            window.open(decodeText, '_blank');
            
        } 
        startScanner();
    }).catch((error) => {
        console.error("Error clearing the scanner: ", error);
        startScanner();
    });
}

// 3. Start it once the page is ready
document.addEventListener("DOMContentLoaded", function () {
    startScanner();
});