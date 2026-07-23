import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyHandoverSignature } from '../../utils/verifyEd25519';
import { createCanonicalPayload } from '../../utils/crypto'; // Import pembuat canonical payload

export default function AdminScannerModal({ isOpen, onClose, onVerifySuccess }) {
  const [scanStatus, setScanStatus] = useState('Starting camera...');
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
      // Beri waktu 100ms agar div "qr-reader" benar-benar tercipta di layar
      setTimeout(() => {
        if (!isMounted) return;

        startPromise = html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15 },
          onScanSuccess,
          () => { /* Abaikan error pencarian frame */ }
        ).then(() => {
          if (!isMounted) {
            // Jika komponen ditutup saat kamera baru selesai loading, langsung matikan
            html5QrCode.stop().catch(() => {});
          } else {
            setScanStatus('Point the QR Code at the camera.');
          }
        }).catch(() => {
          if (isMounted) setScanStatus('Camera access denied. Please allow permissions.');
        });
      }, 100);
    };

    startScanner();

    // CLEANUP AMAN DARI STRICT MODE
    return () => {
      isMounted = false;
      if (startPromise) {
        // Tunggu proses start selesai dulu, baru panggil stop
        startPromise.then(() => {
          if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onScanSuccess = async (decodedText) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setScanStatus('Verifying cryptography...');

    try {
      let payloadString, signatureB64, pubKeyB64, parsedData;

      try {
        parsedData = JSON.parse(decodedText);

        // [PERBAIKAN KRUSIAL]
        // Polisi lokal sekarang menggunakan Canonical Payload, BUKAN JSON.stringify
        const p = parsedData.payload;
        payloadString = createCanonicalPayload(p.action, p.borrower_id, p.asset_id, p.timestamp);

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
        setScanStatus('❌ Verification Failed! Digital signature mismatch.');
        setTimeout(() => { isProcessing.current = false; }, 2000);
        return;
      }

      setScanStatus('✅ Valid! Completing Handover...');

      // 1. Matikan kamera (jika ada) dan TUTUP modalnya TERLEBIH DAHULU
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Abaikan error jika kamera sudah terlanjur mati
        }
      }
      onClose(); // Modal menghilang dari layar

      // 2. Tunggu 500ms agar layar tenang, lalu lempar data ke Dashboard
      setTimeout(() => {
        if (onVerifySuccess) {
           // Tetap kirim parsedData utuh ke Dashboard agar bisa diteruskan ke Backend
           onVerifySuccess(parsedData);
        }
      }, 500);

    } catch (error) {
      const safeErrorMsg = error instanceof Error ? error.message : "Unrecognized QR Format";
      setScanStatus(`❌ Error: ${safeErrorMsg}`);
      setTimeout(() => { isProcessing.current = false; }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Scan QR Handover</h2>

        <div id="qr-reader" className="w-full bg-black rounded overflow-hidden mb-4 min-h-[250px] flex items-center justify-center text-white">
        </div>

        <div className={`p-3 rounded font-medium text-center ${
          scanStatus.includes('❌') ? 'bg-red-100 text-red-700' :
          scanStatus.includes('✅') ? 'bg-green-100 text-green-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {scanStatus}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-200 font-semibold rounded hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
