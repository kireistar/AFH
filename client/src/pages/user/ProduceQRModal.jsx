import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { signPayload, getPublicKeyBase64 } from "../../utils/crypto";

const ProduceQRModal = ({ isOpen, onClose, requestData, user, timestamp }) => {
  const qrString = useMemo(() => {
    if (!isOpen || !requestData || !user || !timestamp) return "";

    const payload = {
      action: "handover",
      asset_id: requestData._assetId,
      borrower_id: user.id,
      request_id: requestData._id,
      timestamp: timestamp,
    };

    const signature = signPayload(payload);

    const finalData = {
      payload,
      signature,
      public_key: localStorage.getItem("isKeyRegistered")
        ? null
        : getPublicKeyBase64(),
    };

    return JSON.stringify(finalData);
  }, [isOpen, requestData, user, timestamp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center relative">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Scan to Collect Asset
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Show this QR Code to the Admin on-site to receive{" "}
          <b>{requestData?.asset}</b>.
        </p>

        <div className="bg-white p-4 inline-block rounded-xl border-2 border-slate-100 shadow-sm">
          {qrString ? (
            <QRCodeSVG
              value={qrString}
              size={256}
              level="L"
              includeMargin={true}
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-slate-50">
              <span className="text-slate-400">Generating QR...</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProduceQRModal;
