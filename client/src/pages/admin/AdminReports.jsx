import React from 'react';

const AdminReports = ({ reports = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Return Evaluation</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="p-4 font-semibold">Report ID</th>
              <th className="p-4 font-semibold">Borrower</th>
              <th className="p-4 font-semibold">Condition</th>
              <th className="p-4 font-semibold text-right">Fine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reports.map(rep => (
              <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">{rep.id}</td>
                <td className="p-4 text-sm font-medium text-slate-800">
                  {rep.user} <span className="text-xs text-slate-400 block">{rep.asset}</span>
                </td>
                <td className="p-4 text-sm font-bold text-emerald-700">{rep.condition}</td>
                <td className="p-4 text-sm font-bold text-right text-[#B91C1C]">{rep.fine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;