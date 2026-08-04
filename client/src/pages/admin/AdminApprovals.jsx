import React, { useState } from 'react';
import { TIER_STYLES, tierRank } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const AdminApprovals = ({ approvals = [], loading = false, handleApprove, handleReject }) => {
  const [expandedId, setExpandedId] = useState(null);

  const table = useTable(approvals, {
    accessors: {
      id: (r) => r.request_code || r.id,
      user: (r) => (typeof r.user === 'object' ? (r.user?.employee_name || '') : String(r.user || '')),
      asset: (r) => (typeof r.asset === 'object' ? (r.asset?.asset_name || '') : String(r.asset || '')),
      risk: (r) => tierRank(r.risk_tier_snapshot || r.urgency || 'Low'),
      aiReason: (r) => r.ai_reason || r.aiReason || '',
      status: (r) => r.status || r._status,
    },
  });

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Asset Request Approvals</h3>
        <p className="text-sm text-slate-500 mt-1">Requests from users requiring administrative review and approval before handover.</p>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : approvals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No pending approvals.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <SortHeader label="ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Requester" sortKey="user" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Asset" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Risk Tier" sortKey="risk" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="AI Reason" sortKey="aiReason" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((req, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                const userName = typeof req.user === 'object' ? (req.user?.employee_name || 'User') : String(req.user || '-');
                const assetName = typeof req.asset === 'object' ? (req.asset?.asset_name || 'Asset') : String(req.asset || '-');
                const reqStatus = req.status || req._status || 'Pending';
                const isPending = reqStatus === 'pending_admin' || req._status === 'pending_admin' || reqStatus === 'Pending';
                const tierStyle = TIER_STYLES[req.risk_tier_snapshot] || TIER_STYLES[req.urgency] || TIER_STYLES.Low;
                const aiReason = req.ai_reason || req.aiReason || '-';
                const rowKey = req.id || req._id;
                const isExpanded = expandedId === rowKey;

                return (
                  <React.Fragment key={rowKey}>
                    <tr className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{req.request_code || req.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{userName}</td>
                      <td className="p-4 text-sm text-slate-600">{assetName}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tierStyle}`}>
                          {req.risk_tier_snapshot || req.urgency || 'Low'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 cursor-pointer" onClick={() => toggleExpand(rowKey)}>
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="truncate min-w-0">{aiReason}</span>
                          <span className={`text-[10px] text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                          reqStatus === 'approved' || reqStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          reqStatus === 'rejected' || reqStatus === 'Rejected' ? 'bg-red-50 text-[#B91C1C] border-red-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>{reqStatus}</span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        {isPending ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleApprove(req)} className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-all shadow-sm cursor-pointer">Approve</button>
                            <button onClick={() => handleReject(req)} className="px-3 py-1.5 bg-white text-[#B91C1C] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-all shadow-sm cursor-pointer">Reject</button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 mr-2">Processed</span>
                        )}
                      </td>
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

export default AdminApprovals;