import React from "react";

/**
 * HandoverConfirmModal
 * Shows asset + borrower details after QR scan verification.
 * Admin confirms to complete the physical handover.
 */
export default function HandoverConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  requestData,
  isLoading = false,
  isSuccess = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {isSuccess ? (
          /* ── SUCCESS STATE ── */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Handover Complete</h2>
            <p className="text-sm text-slate-500">
              Asset has been successfully transferred. The ledger has been updated.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── CONFIRM STATE ── */
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
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
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {/* Borrower */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Borrower</span>
                <span className="text-sm font-bold text-slate-800">
                  {requestData?.user || "Unknown User"}
                </span>
              </div>

              {/* Department */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Department</span>
                <span className="text-sm font-semibold text-slate-700">
                  {requestData?.department || "-"}
                </span>
              </div>

              {/* Asset */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Asset</span>
                <span className="text-sm font-bold text-slate-800">
                  {requestData?.asset || "Unknown Asset"}
                </span>
              </div>

              {/* Request ID */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Request ID</span>
                <span className="text-sm font-mono font-semibold text-slate-700">
                  {requestData?.id || requestData?._id || "-"}
                </span>
              </div>

              {/* Risk Level */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Risk Level</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  requestData?.urgency === "High"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : requestData?.urgency === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {requestData?.urgency || "Low"}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 text-center">
                  Cryptographic verification passed. Both borrower and admin signatures are valid.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm Handover"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
