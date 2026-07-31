import React from "react";
import { TIER_STYLES } from "../utils/styles";
import ReceiptModal from "./ReceiptModal";

export default function HandoverConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  requestData,
  isLoading = false,
  isSuccess = false,
  receipt = null,
}) {
  if (!isOpen) return null;

  if (isSuccess) {
    return <ReceiptModal receipt={receipt} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all">
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Confirm Handover</h2>
                  <p className="text-xs text-slate-500">Verify details before transferring the asset</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Borrower</span>
                <span className="text-sm font-bold text-slate-800">
                  {requestData?.user || "Unknown User"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Department</span>
                <span className="text-sm font-semibold text-slate-700">
                  {requestData?.department || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Asset</span>
                <span className="text-sm font-bold text-slate-800">
                  {requestData?.asset || "Unknown Asset"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Request ID</span>
                <span className="text-sm font-mono font-semibold text-slate-700">
                  {requestData?.id || requestData?._id || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Risk Level</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${TIER_STYLES[requestData?.urgency] || TIER_STYLES.Low}`}>
                  {requestData?.urgency || "Low"}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 text-center">
                  Digital signature verified. Transaction will be appended to the immutable ledger.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 active:bg-blue-950 text-white font-semibold rounded-xl text-sm transition-colors duration-200 shadow-md shadow-blue-900/10 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  "Confirm Handover"
                )}
              </button>
            </div>
          </>
      </div>
    </div>
  );
}
