import React from 'react';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const FinanceInvoices = ({ invoices = [], loading = false }) => {
  const table = useTable(invoices, {
    accessors: {
      id: (i) => i.id,
      user: (i) => i.user,
      reason: (i) => i.reason,
      amount: (i) => i._rawAmount ?? i.amount,
      status: (i) => i.status || i._status,
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Asset Invoices</h3>
        <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors">
          + New Invoice
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No invoices found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <SortHeader label="Invoice ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="User" sortKey="user" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Reason" sortKey="reason" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Amount" sortKey="amount" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((inv, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr key={inv.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{inv.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{inv.user}</td>
                    <td className="p-4 text-sm text-slate-600">{inv.reason}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{inv.amount}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>{inv.status}</span>
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

export default FinanceInvoices;