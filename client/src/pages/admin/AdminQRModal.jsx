import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import nacl from "tweetnacl";

const ProduceQRModal = ({ isOpen, onClose, requestData, user, timestamp }) => {
  const [qrValue, setQrValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !requestData) {
      setQrValue("");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Siapkan Payload yang persis sama dengan struktur log-mu
      const payloadObj = {
        action: "handover",
        asset_id: requestData._assetId || requestData.id,
        borrower_id: user?.id || "unknown_user",
        request_id: requestData._id || requestData.id,
        timestamp: timestamp,
      };

      // 2. Buat KeyPair Kriptografi
      // (Untuk demo ini kita generate baru. Nanti gunakan private key asli user)
      const keypair = nacl.sign.keyPair();

      // 3. Proses Penandatanganan (Signing)
      const payloadString = JSON.stringify(payloadObj);
      const messageUint8 = new TextEncoder().encode(payloadString);
      const signatureUint8 = nacl.sign.detached(messageUint8, keypair.secretKey);

      // 4. KRUSIAL: Konversi Uint8Array ke Base64 agar tidak menjadi objek kosong {}
      const signatureB64 = btoa(String.fromCharCode.apply(null, signatureUint8));
      const pubKeyB64 = btoa(String.fromCharCode.apply(null, keypair.publicKey));

      // 5. Gabungkan menjadi satu JSON string utuh
      const finalQrData = JSON.stringify({
        payload: payloadObj,
        signature: signatureB64,
        public_key: pubKeyB64,
      });

      setQrValue(finalQrData);
    } catch (error) {
      console.error("Gagal membuat QR Code:", error);
      setQrValue("ERROR");
    } finally {
      setIsGenerating(false);
    }
  }, [isOpen, requestData, user, timestamp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2 text-slate-800">Secure Handover QR</h2>
        <p className="text-sm text-slate-500 mb-6 text-center px-4">
          Tunjukkan QR Code ini kepada Admin untuk memverifikasi serah terima aset.
        </p>

        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 mb-6 flex justify-center items-center min-h-[250px] w-full">
          {isGenerating ? (
            <span className="text-slate-400 font-medium animate-pulse">Menghasilkan Kunci Kriptografi...</span>
          ) : qrValue && qrValue !== "ERROR" ? (
            <QRCodeSVG value={qrValue} size={220} level="H" includeMargin={true} />
          ) : (
            <span className="text-red-500 font-bold">Gagal memuat QR Code</span>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ProduceQRModal;
