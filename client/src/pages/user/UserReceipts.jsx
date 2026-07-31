import React from 'react';
import { formatDateTime, openReceiptInNewTab } from '../../utils/receipt';

const UserReceipts = ({ receipts = [], loading = false }) => {
  const assetLabel = (t) => {
    const a = t.asset || {};
    return a.asset_name ? (a.asset_code ? `${a.asset_name} (${a.asset_code})` : a.asset_name) : (t.asset || '-');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">My Receipts</h3>
        <p className="text-sm text-slate-500 mt-1">
          Your digital receipts for every asset handover, recorded immutably on the SHA-256 ledger.
        </p>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No receipts found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-semibold">Transaction Code</th>
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {receipts.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold font-mono text-slate-700">
                    {t.transaction_code || `TX-${t.id || '-'}`}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-800">
                    {assetLabel(t)}
                  </td>
                  <td className="p-4 text-sm text-slate-600 capitalize">
                    {t.action || 'handover'}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {formatDateTime(t.occurred_at || t.created_at)}
                  </td>
                  <td className="p-4 text-sm">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase">
                      {t.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right whitespace-nowrap">
                    <button
                      onClick={() => openReceiptInNewTab(t)}
                      className="px-2.5 py-1 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-900 transition-all font-semibold text-xs cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserReceipts;
