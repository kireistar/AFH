import React, { useEffect, useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

import { getOrGenerateKeyPair, createCanonicalPayload, signPayload } from "../../utils/crypto";
import { apiGet } from "../../services/apiClient";

const QR_TTL_SECONDS = 30;

const ProduceQRModal = ({ isOpen, onClose, requestData, user, timestamp, onRefreshSuccess }) => {
  const [qrValue, setQrValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [handoverStatus, setHandoverStatus] = useState("waiting");
  const [countdown, setCountdown] = useState(QR_TTL_SECONDS);
  const countdownRef = useRef(null);
  const expiryRef = useRef(null);

  const generateQR = useCallback(async () => {
    if (!isOpen || !requestData) return;
    setIsGenerating(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + QR_TTL_SECONDS;
      expiryRef.current = expiresAt;

      const payloadObj = {
        action: "handover",
        asset_id: String(requestData._assetId || requestData.id),
        borrower_id: String(user?.id || "unknown_user"),
        request_id: String(requestData._id || requestData.id),
        timestamp: String(timestamp),
        expires_at: String(expiresAt),
      };

      const { privKey, pubKeyBase64 } = await getOrGenerateKeyPair();

      const canonicalString = createCanonicalPayload(
        payloadObj.action,
        payloadObj.borrower_id,
        payloadObj.asset_id,
        payloadObj.timestamp,
        payloadObj.expires_at
      );

      const signatureB64 = await signPayload(canonicalString, privKey);

      const finalQrData = JSON.stringify({
        payload: payloadObj,
        signature: signatureB64,
        public_key: pubKeyBase64,
      });

      setQrValue(finalQrData);
      setCountdown(QR_TTL_SECONDS);
    } catch (error) {
      console.error("Gagal membuat QR Code:", error);
      setQrValue("ERROR");
    } finally {
      setIsGenerating(false);
    }
  }, [isOpen, requestData, user, timestamp]);

  // Countdown timer — auto-regenerate QR when expired
  useEffect(() => {
    if (!isOpen || handoverStatus !== "waiting" || !expiryRef.current) return;

    countdownRef.current = setInterval(() => {
      const remaining = expiryRef.current - Math.floor(Date.now() / 1000);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        generateQR();
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isOpen, handoverStatus, generateQR, qrValue]);

  // 1. Logika Pembuatan QR Code
  useEffect(() => {
    if (!isOpen || !requestData) {
      setQrValue("");
      setHandoverStatus("waiting");
      return;
    }

    generateQR();
  }, [isOpen, requestData, user, timestamp, generateQR]);

  // 2. Logika Polling
  useEffect(() => {
    let intervalId;

    if (isOpen && requestData && handoverStatus === "waiting") {
      intervalId = setInterval(async () => {
        try {
          const reqId = requestData._id || requestData.id;

          const data = await apiGet(`/api/v1/asset-requests/${reqId}`);
          const currentStatus = data?.status || data?.data?.status || data?._status;

          if (!currentStatus) return;

          const statusLower = String(currentStatus).toLowerCase();

          if (
            statusLower === "handed over" ||
            statusLower === "handed_over" ||
            statusLower === "active" ||
            statusLower === "active loan"
          ) {
            setHandoverStatus("success");
            clearInterval(intervalId);

            setTimeout(() => {
              if (onRefreshSuccess) onRefreshSuccess();
              onClose();
            }, 2500);
          }
        } catch (error) {
          console.error("Error polling:", error.message);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, requestData, handoverStatus, onClose, onRefreshSuccess]);

  if (!isOpen) return null;

  const countdownColor =
    countdown <= 10 ? "text-red-500" :
    countdown <= 20 ? "text-amber-500" :
    "text-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center transform transition-all">
        {handoverStatus === "waiting" ? (
          <>
            <h2 className="text-xl font-bold mb-2 text-slate-800">Scan untuk Serah Terima</h2>
            <p className="text-sm text-slate-500 mb-4 text-center">
              Tunjukkan QR Code ini kepada Admin.
            </p>

            <div className={`text-xs font-bold mb-4 ${countdownColor}`}>
              QR berlaku dalam {countdown} detik
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-blue-200 mb-6 flex flex-col justify-center items-center min-h-[250px] w-full relative">
              {isGenerating ? (
                <span className="text-slate-400 font-medium animate-pulse">Menghasilkan Kriptografi...</span>
              ) : qrValue && qrValue !== "ERROR" ? (
                <>
                  <QRCodeSVG value={qrValue} size={220} level="L" includeMargin={true} />
                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 animate-pulse">
                    Menunggu Admin memindai...
                  </div>
                </>
              ) : (
                <span className="text-red-500 font-bold">Gagal memuat QR Code</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Berhasil!</h2>
            <p className="text-sm text-slate-500 text-center">
              Penyerahan aset telah diverifikasi.<br/>Aset sekarang berada di tanggung jawabmu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProduceQRModal;
