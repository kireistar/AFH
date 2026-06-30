import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { apiPost } from "../../services/apiClient";

const AdminScannerModal = ({ isOpen, onClose, onHandoverSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (scannedText) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const rawString = scannedText[0].rawValue;
      const qrData = JSON.parse(rawString);
      const { payload, signature, public_key } = qrData;

      if (payload.action !== "handover" || !signature) {
        throw new Error("Invalid QR Code format or not intended for handover.");
      }

      const headers = { "x-ed25519-signature": signature };
      if (public_key) headers["x-ed25519-public-key"] = public_key;

      await apiPost("/api/v1/transactions/", payload, { headers });

      alert("Handover Verified Successfully!");
      onHandoverSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to process QR: ${err.message || "Invalid signature"}`);
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="p-4 flex justify-between items-center bg-slate-900 text-white shadow-md z-10">
        <h3 className="font-bold text-lg">Scan User QR</h3>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-rose-600 rounded-lg font-bold cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 relative bg-black">
        <Scanner
          onScan={handleScan}
          onError={(err) => console.log("Scanner error:", err)}
          formats={["qr_code"]}
          components={{ audio: false, finder: true }}
          styles={{ container: { width: "100%", height: "100%" } }}
        />

        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-bold text-xl">
              Verifying Cryptography...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScannerModal;
