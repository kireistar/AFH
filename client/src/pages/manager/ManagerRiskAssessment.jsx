import React from 'react';
import { TIER_STYLES } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const ManagerRiskAssessment = ({ riskLogs = [], loading = false }) => {
  const table = useTable(riskLogs, {
    accessors: {
      id: (log) => log.request_code || log.id,
      user: (log) => (typeof log.user === 'object' ? (log.user?.employee_name || '') : String(log.user || '')),
      asset: (log) => (typeof log.asset === 'object' ? (log.asset?.asset_name || '') : String(log.asset || '')),
      tier: (log) => log.risk_tier_snapshot || log.urgency || 'Low',
      score: (log) => (log.risk_score !== undefined ? log.risk_score : (log.riskScore || 0)),
      aiReason: (log) => log.ai_reason || log.aiReason || '',
      date: (log) => log.created_at || log.date,
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
                <SortHeader label="Risk Tier" sortKey="tier" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Risk Score" sortKey="score" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="AI Reason" sortKey="aiReason" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Date" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((log, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                const userName = typeof log.user === 'object' ? (log.user?.employee_name || 'User') : String(log.user || '-');
                const assetName = typeof log.asset === 'object' ? (log.asset?.asset_name || 'Asset') : String(log.asset || '-');
                const tierStyle = TIER_STYLES[log.risk_tier_snapshot] || TIER_STYLES[log.urgency] || TIER_STYLES.Low;
                return (
                  <tr key={log.id || log._id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{log.request_code || log.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{userName}</td>
                    <td className="p-4 text-sm text-slate-600">{assetName}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tierStyle}`}>
                        {log.risk_tier_snapshot || log.urgency || 'Low'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{log.risk_score !== undefined ? log.risk_score : (log.riskScore || 0)}/10</td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{log.ai_reason || log.aiReason || '-'}</td>
                    <td className="p-4 text-sm text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleDateString() : (log.date || '-')}</td>
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