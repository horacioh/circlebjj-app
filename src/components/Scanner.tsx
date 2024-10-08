import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

export function Scanner({ onScan, onCancel }: { onScan: (userId: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [, setQrOn] = useState(false);

  function onScanSuccess(result: QrScanner.ScanResult) {
    // ✅ Handle success.
    // 😎 You can do whatever you want with the scanned result.
    onScan(result.data);
  }

  // Fail
  const onScanFail = (err: string | Error) => {
    // 🖨 Print the "err" to browser console.
    console.log(err);
  };

  useEffect(() => {
    const vRef = videoRef.current;
    if (videoRef?.current && !qrScannerRef.current) {
      // 👉 Instantiate the QR Scanner
      qrScannerRef.current = new QrScanner(videoRef?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
        preferredCamera: "environment",
        // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
        highlightScanRegion: true,
        // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
        highlightCodeOutline: true,
        // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
        overlay: qrBoxEl?.current || undefined,
        maxScansPerSecond: 1,
      });

      // 🚀 Start QR Scanner
      qrScannerRef?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    // 🧹 Clean up on unmount.
    // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
    return () => {
      if (!vRef) {
        qrScannerRef?.current?.stop();
      }
    };
  }, []);

  // ❌ If "camera" is not allowed in browser permissions, show an alert.
  // useEffect(() => {
  //   if (!qrOn)
  //     alert(
  //       "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
  //     );
  // }, [qrOn]);

  return (
    <div className="mt-4 fixed top-0 left-0 w-full h-full p-4 bg-slate-900">
      {/* QR */}
      <div className="relative w-full h-full">
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-white text-black rounded-md shadow-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <video ref={videoRef} className="w-full h-full object-cover"></video>
        <div ref={qrBoxEl} className="qr-box" />
      </div>
    </div>
  );
}
