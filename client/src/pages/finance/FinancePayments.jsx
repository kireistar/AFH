import React from 'react';

const FinancePayments = ({ payments }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Payment Logs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="p-4 font-semibold">Payment ID</th>
              <th className="p-4 font-semibold">From / To</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Method</th>
              <th className="p-4 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map(pay => (
              <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">{pay.id}</td>
                <td className="p-4 text-sm font-medium text-slate-800">{pay.party}</td>
                <td className="p-4 text-sm text-slate-600">{pay.date}</td>
                <td className="p-4 text-sm text-slate-600">{pay.method}</td>
                <td className="p-4 text-sm font-bold text-emerald-600">{pay.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancePayments;