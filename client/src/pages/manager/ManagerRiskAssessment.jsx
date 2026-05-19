import React from 'react';

const ManagerRiskAssessment = ({ riskLogs }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">AI Risk Assessment Logs</h3>
        <p className="text-sm text-slate-500 mt-1">This module displays automated risk scoring data by the AI engine.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="p-4 font-semibold">Log ID</th>
              <th className="p-4 font-semibold">Request ID</th>
              <th className="p-4 font-semibold">AI Decision</th>
              <th className="p-4 font-semibold">Risk Score</th>
              <th className="p-4 font-semibold">Flag Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {riskLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">{log.id}</td>
                <td className="p-4 text-sm font-medium text-slate-800">{log.reqId}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    log.decision === 'Escalated' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>{log.decision}</span>
                </td>
                <td className="p-4 text-sm font-bold text-slate-700">{log.score}/100</td>
                <td className="p-4 text-sm text-slate-600">{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerRiskAssessment;