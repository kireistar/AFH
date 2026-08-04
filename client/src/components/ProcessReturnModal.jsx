import React, { useState, useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function ProcessReturnModal({
  isOpen,
  onClose,
  onSubmit,
  requestData = null,
  isLoading = false,
  incidents = [],
}) {
  const [conditionNotes, setConditionNotes] = useState("Good condition");
  const [flagIssue, setFlagIssue] = useState(false);
  const [returnCondition, setReturnCondition] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConditionNotes("Good condition");
      setFlagIssue(false);
      setReturnCondition("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit = conditionNotes.trim().length > 0 && (!flagIssue || returnCondition);

  const handleSubmit = () => {
    onSubmit(conditionNotes.trim(), flagIssue ? returnCondition : null);
  };

  const assetId = requestData?._assetId || requestData?.asset_id;
  const activeIncident = incidents.find(
    inc => inc._assetId === assetId && ["severe", "lost"].includes(inc._severity) && ["open", "investigating"].includes(inc._status)
  );

  const assetName = requestData
    ? (typeof requestData.asset === "object" ? requestData.asset?.asset_name : requestData.asset) || "Asset"
    : "Asset";

  const userName = requestData
    ? (typeof requestData.user === "object" ? requestData.user?.employee_name : requestData.user) || "User"
    : "User";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Process Asset Return</h2>
              <p className="text-xs text-slate-500">Inspect the device and confirm the return.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Return Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Borrower</span>
              <span className="text-slate-800 font-bold">{userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Device</span>
              <span className="text-slate-800 font-bold">{assetName}</span>
            </div>
          </div>

          {/* Condition Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Condition Notes
            </label>
            <textarea
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="Describe the condition of the returned device..."
              rows={3}
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Active Incident Banner */}
          {activeIncident && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
              <FiAlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-amber-800">Active incident report found.</span>
                <span className="text-amber-700">
                  {" "}This device has a <strong>{activeIncident._severity}</strong> incident report — damage/loss already recorded in the user's behavior stats. Only flag below if you found <strong>additional</strong> unreported issues.
                </span>
              </div>
            </div>
          )}

          {/* Flag Device Issue Toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={flagIssue}
                  onChange={(e) => {
                    setFlagIssue(e.target.checked);
                    if (!e.target.checked) setReturnCondition("");
                  }}
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-red-500 transition-colors duration-200"></div>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-200"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <FiAlertTriangle size={14} className={flagIssue ? "text-red-500" : "text-slate-400"} />
                <span className={`text-sm font-semibold ${flagIssue ? "text-red-700" : "text-slate-600"}`}>
                  Flag Device Issue
                </span>
              </div>
            </label>

            {flagIssue && (
              <div className="ml-[52px] space-y-3 animate-in fade-in duration-200">
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  Select the condition found during physical inspection. This will update the user's behavior record and generate an automatic fine.
                </p>

                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      returnCondition === "damaged"
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnCondition"
                      value="damaged"
                      checked={returnCondition === "damaged"}
                      onChange={(e) => setReturnCondition(e.target.value)}
                      disabled={isLoading}
                      className="accent-amber-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800">Damaged</div>
                      <div className="text-[11px] text-slate-500">Device has physical damage. Fine: 1x asset value.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      returnCondition === "lost"
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnCondition"
                      value="lost"
                      checked={returnCondition === "lost"}
                      onChange={(e) => setReturnCondition(e.target.value)}
                      disabled={isLoading}
                      className="accent-red-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800">Lost / Not Returned</div>
                      <div className="text-[11px] text-slate-500">Device is missing or not the correct device. Fine: 2x asset value. Asset will be retired.</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit}
            className={`flex-1 px-4 py-2.5 font-semibold rounded-xl text-sm transition-colors duration-200 shadow-md disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer ${
              flagIssue
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-red-900/10"
                : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-900/10"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : flagIssue ? (
              "Confirm Return with Issue"
            ) : (
              "Confirm Return"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
