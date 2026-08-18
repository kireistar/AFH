import React from 'react';
import { formatDateTime, openReceiptInNewTab } from '../../utils/receipt';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';
import { statusBadge } from '../../utils/styles';

const UserReceipts = ({ receipts = [], loading = false }) => {
  const assetLabel = (t) => {
    const a = t.asset || {};
    return a.asset_name ? (a.asset_code ? `${a.asset_name} (${a.asset_code})` : a.asset_name) : (t.asset || '-');
  };

  const table = useTable(receipts, {
    accessors: {
      code: (t) => t.transaction_code || `TX-${t.id || ''}`,
      asset: (t) => {
        const a = t.asset || {};
        return typeof a === 'object' ? a.asset_name || '' : a;
      },
      action: (t) => t.action,
      date: (t) => t.occurred_at || t.created_at,
      status: (t) => t.status,
    },
  });

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
                <SortHeader label="Transaction Code" sortKey="code" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Asset" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Action" sortKey="action" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Date" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <th className="p-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((t, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr key={t.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${statusBadge(t.status)}`}>
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
                );
              })}
            </tbody>
            </table>
          )}
        </div>
        {table.count > 0 && <Pagination {...table} />}
      </div>
  );
};

export default UserReceipts;
