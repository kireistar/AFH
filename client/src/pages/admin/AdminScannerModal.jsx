import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyHandoverSignature } from '../../utils/verifyEd25519';
import { createCanonicalPayload } from '../../utils/crypto';
import ExpiredQRModal from '../../components/ExpiredQRModal';

export default function AdminScannerModal({ isOpen, onClose, onVerifySuccess }) {
  const [scanStatus, setScanStatus] = useState('Starting camera...');
  const [isExpiredQROpen, setIsExpiredQROpen] = useState(false);
  const isProcessing = useRef(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    isProcessing.current = false;
    setScanStatus('Starting camera...');

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    let startPromise = null;

    const startScanner = () => {
      setTimeout(() => {
        if (!isMounted) return;

        startPromise = html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15 },
          onScanSuccess,
          () => {}
        ).then(() => {
          if (!isMounted) {
            html5QrCode.stop().catch(() => {});
          } else {
            setScanStatus('Point the camera at a Handover QR Code.');
          }
        }).catch(() => {
          if (isMounted) setScanStatus('Camera access denied. Please allow permissions.');
        });
      }, 100);
    };

    startScanner();

    return () => {
      isMounted = false;
      if (startPromise) {
        startPromise.then(() => {
          if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        }).catch(() => {});
      }
    };
  }, [isOpen]);

  const onScanSuccess = async (decodedText) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setScanStatus('Verifying cryptographic signature...');

    try {
      let payloadString, signatureB64, pubKeyB64, parsedData;

      try {
        parsedData = JSON.parse(decodedText);

        const p = parsedData.payload;
        payloadString = createCanonicalPayload(p.action, p.borrower_id, p.asset_id, p.timestamp, p.expires_at);

        // Client-side QR expiry check
        if (p.expires_at && Math.floor(Date.now() / 1000) > parseInt(p.expires_at)) {
          if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop().catch(() => {});
          }
          onClose();
          setTimeout(() => setIsExpiredQROpen(true), 200);
          return;
        }

        signatureB64 = parsedData.signature;
        pubKeyB64 = parsedData.public_key;
      } catch (parseError) {
        [payloadString, signatureB64, pubKeyB64] = decodedText.split('|');
      }

      if (!payloadString || !signatureB64 || typeof signatureB64 === 'object') {
        throw new Error("Cryptographic data is incomplete or corrupted.");
      }

      const isValid = verifyHandoverSignature(payloadString, signatureB64, pubKeyB64);

      if (!isValid) {
        setScanStatus('Verification failed. Digital signature does not match.');
        setTimeout(() => { isProcessing.current = false; }, 2000);
        return;
      }

      setScanStatus('Signature valid! Completing handover...');

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {}
      }
      onClose();

      setTimeout(() => {
        if (onVerifySuccess) {
           onVerifySuccess(parsedData);
        }
      }, 500);

    } catch (error) {
      const safeErrorMsg = error instanceof Error ? error.message : "Unrecognized QR format";
      setScanStatus(`Error: ${safeErrorMsg}`);
      setTimeout(() => { isProcessing.current = false; }, 2000);
    }
  };

  if (!isOpen && !isExpiredQROpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Scan Handover QR</h2>
                  <p className="text-xs text-slate-500">Position the borrower's QR code in front of the camera</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Camera */}
            <div className="p-4">
              <div id="qr-reader" className="w-full bg-black rounded-xl overflow-hidden min-h-[250px] flex items-center justify-center text-white">
              </div>
            </div>

            {/* Status */}
            <div className="px-4 pb-4">
              <div className={`p-3 rounded-xl font-medium text-center text-sm ${
                scanStatus.includes('Error') || scanStatus.includes('failed') || scanStatus.includes('denied')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : scanStatus.includes('valid') || scanStatus.includes('Valid')
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {scanStatus}
              </div>
            </div>

            {/* Cancel */}
            <div className="px-4 pb-4">
              <button
                onClick={onClose}
                className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ExpiredQRModal
        isOpen={isExpiredQROpen}
        onClose={() => setIsExpiredQROpen(false)}
      />
    </>
  );
}
