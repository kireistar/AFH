import React from 'react';
import { TIER_STYLES } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const ManagerRiskAssessment = ({ riskLogs = [], loading = false }) => {
  const table = useTable(riskLogs, {
    accessors: {
      id: (l) => l.id,
      user: (l) => l.user,
      asset: (l) => l.asset,
      urgency: (l) => l.urgency,
      riskScore: (l) => l.riskScore,
      aiReason: (l) => l.aiReason,
      date: (l) => l.date,
    },
  });

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
                <SortHeader label="Request ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Requester" sortKey="user" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Asset" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Risk Tier" sortKey="urgency" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Risk Score" sortKey="riskScore" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="AI Reason" sortKey="aiReason" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Date" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((log, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr key={log._id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{log.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{log.user}</td>
                    <td className="p-4 text-sm text-slate-600">{log.asset}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[log.urgency] || TIER_STYLES.Low}`}>
                        {log.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{log.riskScore}/100</td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{log.aiReason}</td>
                    <td className="p-4 text-sm text-slate-500">{log.date}</td>
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

export default ManagerRiskAssessment;