import React from 'react';
import { formatDateTime } from '../../utils/receipt';
import { borrowerLabel, assetLabel, amountLabel, amountValue } from '../../utils/transactionLabels';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const FinancePayments = ({ payments = [], loading = false }) => {
  const table = useTable(payments, {
    accessors: {
      id: (p) => p.id || p.transaction_code || '',
      user: (p) => borrowerLabel(p),
      asset: (p) => assetLabel(p),
      action: (p) => p.action,
      date: (p) => p.occurred_at || p.created_at,
      amount: (p) => amountValue(p) ?? Number.NEGATIVE_INFINITY,
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Payment Logs</h3>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <SortHeader label="Transaction ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="User" sortKey="user" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Asset" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Action" sortKey="action" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Date" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Amount" sortKey="amount" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{pay.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{borrowerLabel(pay)}</td>
                  <td className="p-4 text-sm text-slate-600">{assetLabel(pay)}</td>
                  <td className="p-4 text-sm text-slate-600">{pay.action}</td>
                  <td className="p-4 text-sm text-slate-600">{formatDateTime(pay.occurred_at || pay.created_at)}</td>
                  <td className="p-4 text-sm font-bold text-emerald-600">{amountLabel(pay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {table.count > 0 && <Pagination {...table} />}
    </div>
  );
};

export default FinancePayments;
