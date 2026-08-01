import React from 'react';

const FinancePayments = ({ payments = [], loading = false }) => {
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
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
<<<<<<< Updated upstream
              {payments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{pay.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{pay.party}</td>
                  <td className="p-4 text-sm text-slate-600">{pay.asset}</td>
                  <td className="p-4 text-sm text-slate-600">{pay.action}</td>
                  <td className="p-4 text-sm text-slate-600">{pay.date}</td>
                  <td className="p-4 text-sm font-bold text-emerald-600">{pay.amount}</td>
                </tr>
              ))}
=======
              {table.pageItems.map((pay, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr key={pay.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{pay.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{borrowerLabel(pay)}</td>
                    <td className="p-4 text-sm text-slate-600">{assetLabel(pay)}</td>
                    <td className="p-4 text-sm text-slate-600">{pay.action}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDateTime(pay.occurred_at || pay.created_at)}</td>
                    <td className="p-4 text-sm font-bold text-emerald-600">{amountLabel(pay)}</td>
                  </tr>
                );
              })}
>>>>>>> Stashed changes
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FinancePayments;