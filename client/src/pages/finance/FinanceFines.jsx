import React from 'react';

const FinanceFines = ({ fines }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Damage & Late Fines</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="p-4 font-semibold">Fine ID</th>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Reason</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {fines.map(fine => (
              <tr key={fine.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">{fine.id}</td>
                <td className="p-4 text-sm font-medium text-slate-800">{fine.user}</td>
                <td className="p-4 text-sm text-slate-600">{fine.reason}</td>
                <td className="p-4 text-sm font-bold text-slate-700">{fine.amount}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    fine.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-[#B91C1C] border-red-200'
                  }`}>{fine.status}</span>
                </td>
                <td className="p-4 text-sm text-right">
                  {fine.status === 'Unpaid' ? (
                    <button className="px-4 py-1.5 bg-[#1E3A8A] text-white shadow-sm hover:bg-blue-900 rounded-lg transition-all font-semibold text-xs">
                      Mark as Paid
                    </button>
                  ) : <span className="text-xs font-medium text-slate-400 mr-2">Cleared</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceFines;