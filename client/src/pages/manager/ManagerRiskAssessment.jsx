import React from 'react';

const TIER_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-[#B91C1C] border-red-200',
};

const ManagerRiskAssessment = ({ riskLogs = [], loading = false }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">AI Risk Assessment Logs</h3>
        <p className="text-sm text-slate-500 mt-1">This module displays automated risk scoring data by the AI engine.</p>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : riskLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No risk assessment logs found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-semibold">Request ID</th>
                <th className="p-4 font-semibold">Requester</th>
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold">Risk Tier</th>
                <th className="p-4 font-semibold">Risk Score</th>
                <th className="p-4 font-semibold">AI Reason</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {riskLogs.map(log => (
                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{log.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{log.user}</td>
                  <td className="p-4 text-sm text-slate-600">{log.asset}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[log.urgency] || TIER_STYLES.Low}`}>
                      {log.urgency}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700">{log.riskScore}/10</td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{log.aiReason}</td>
                  <td className="p-4 text-sm text-slate-500">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerRiskAssessment;