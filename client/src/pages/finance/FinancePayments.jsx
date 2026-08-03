import React from 'react';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const FinancePayments = ({ payments = [], loading = false }) => {
  const borrowerLabel = (pay) => {
    if (!pay.borrower) return '-';
    if (typeof pay.borrower === 'object') {
      return pay.borrower.employee_name || pay.borrower.name || 'User';
    }
    return String(pay.borrower);
  };

  const assetLabel = (pay) => {
    if (!pay.asset) return '-';
    if (typeof pay.asset === 'object') {
      return pay.asset.asset_name || pay.asset.name || 'Asset';
    }
    return String(pay.asset);
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '-';
    try {
      return new Date(dtStr).toLocaleString();
    } catch {
      return String(dtStr);
    }
  };

  const amountLabel = (pay) => {
    const val = pay.amount || pay.fine_amount;
    if (!val) return '-';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const table = useTable(payments, {
    accessors: {
      id: (pay) => pay.transaction_code || pay.id,
      user: (pay) => (pay.borrower && typeof pay.borrower === 'object' ? (pay.borrower.employee_name || '') : String(pay.borrower || '')),
      asset: (pay) => (pay.asset && typeof pay.asset === 'object' ? (pay.asset.asset_name || '') : String(pay.asset || '')),
      action: (pay) => pay.action || '',
      date: (pay) => pay.occurred_at || pay.created_at,
      amount: (pay) => Number(pay.amount || pay.fine_amount || 0),
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
              {table.pageItems.map((pay, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr key={pay.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{pay.transaction_code || pay.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{borrowerLabel(pay)}</td>
                    <td className="p-4 text-sm text-slate-600">{assetLabel(pay)}</td>
                    <td className="p-4 text-sm text-slate-600 capitalize">{pay.action || '-'}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDateTime(pay.occurred_at || pay.created_at)}</td>
                    <td className="p-4 text-sm font-bold text-emerald-600">{amountLabel(pay)}</td>
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

export default FinancePayments;