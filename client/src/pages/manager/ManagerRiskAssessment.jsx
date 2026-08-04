import React, { useState } from 'react';
import { TIER_STYLES, tierRank } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const ManagerRiskAssessment = ({ riskLogs = [], loading = false }) => {
  const [expandedId, setExpandedId] = useState(null);

  const table = useTable(riskLogs, {
    accessors: {
      id: (log) => log.request_code || log.id,
      user: (log) => (typeof log.user === 'object' ? (log.user?.employee_name || '') : String(log.user || '')),
      asset: (log) => (typeof log.asset === 'object' ? (log.asset?.asset_name || '') : String(log.asset || '')),
      tier: (log) => tierRank(log.risk_tier_snapshot || log.urgency || 'Low'),
      score: (log) => (log.risk_score !== undefined ? log.risk_score : (log.riskScore || 0)),
      aiReason: (log) => log.ai_reason || log.aiReason || '',
      date: (log) => log.created_at || log.date,
    },
  });

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

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
                const aiReason = log.ai_reason || log.aiReason || '-';
                const rowKey = log.id || log._id;
                const isExpanded = expandedId === rowKey;

                return (
                  <React.Fragment key={rowKey}>
                    <tr className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80 cursor-pointer`} onClick={() => toggleExpand(rowKey)}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{log.request_code || log.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{userName}</td>
                      <td className="p-4 text-sm text-slate-600">{assetName}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tierStyle}`}>
                          {log.risk_tier_snapshot || log.urgency || 'Low'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-700">{log.risk_score !== undefined ? log.risk_score : (log.riskScore || 0)}/10</td>
                      <td className="p-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="truncate min-w-0">{aiReason}</span>
                          <span className={`text-[10px] text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{log.created_at ? new Date(log.created_at).toLocaleDateString() : (log.date || '-')}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Decision Reason</div>
                            <div className="text-sm text-slate-800 leading-relaxed">{aiReason}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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