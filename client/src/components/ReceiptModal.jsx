import React from "react";
import { getReceiptFields, formatDateTime, openReceiptInNewTab } from "../utils/receipt";

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const fields = getReceiptFields(receipt);
  const borrower = fields.borrower;
  const asset = fields.asset;
  const admin = fields.admin;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all">
        <div className="px-6 py-5 border-b border-dashed border-slate-300 bg-slate-50/70 text-center">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">DIGITAL RECEIPT</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Immutably recorded on the SHA-256 ledger</p>
          <div className="mt-3 inline-flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400">TRANSACTION CODE</span>
            <span className="font-mono text-sm font-bold text-[#1E3A8A] bg-blue-50 border border-blue-100 rounded-lg px-3 py-1">
              {receipt.transaction_code || `TX-${receipt.id || "-"}`}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Status</span>
            <span className="text-sm font-bold text-emerald-600 capitalize">{receipt.status || "completed"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Date &amp; Time</span>
            <span className="text-sm font-semibold text-slate-700">
              {formatDateTime(receipt.occurred_at || receipt.created_at)}
            </span>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Asset</span>
              <span className="text-sm font-bold text-slate-800 text-right">{asset.asset_name || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Code / Serial</span>
              <span className="text-sm font-mono font-semibold text-slate-700 text-right">
                {asset.asset_code || "-"} / {asset.serial_number || "-"}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Borrower</span>
              <span className="text-sm font-bold text-slate-800 text-right">{borrower.employee_name || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Department</span>
              <span className="text-sm font-semibold text-slate-700 text-right">{borrower.department || "-"}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Admin / Issuer</span>
              <span className="text-sm font-bold text-slate-800 text-right">{admin.employee_name || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Department</span>
              <span className="text-sm font-semibold text-slate-700 text-right">{admin.department || "-"}</span>
            </div>
          </div>

          {fields.notes && (
            <div className="border-t border-dashed border-slate-200 pt-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-slate-600">{fields.notes}</p>
            </div>
          )}

          <div className="border-t border-dashed border-slate-200 pt-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Non-Repudiation Proof</p>
            <p className="font-mono text-[10px] text-slate-600 break-all">SHA-256: {receipt.current_hash || "-"}</p>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={() => openReceiptInNewTab(receipt)}
            className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 active:bg-blue-950 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-200 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
