import React from 'react';
import { TIER_STYLES } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const ManagerApprovals = ({ approvals = [], loading = false, handleApprove, handleReject }) => {
  const table = useTable(approvals, {
    accessors: {
      id: (r) => r.id,
      user: (r) => r.user,
      asset: (r) => r.asset,
      urgency: (r) => r.urgency,
      aiReason: (r) => r.aiReason,
      status: (r) => r.status,
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">High-Risk Request Approvals</h3>
        <p className="text-sm text-slate-500 mt-1">Requests escalated by AI requiring manual managerial review.</p>
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
                <SortHeader label="Risk Tier" sortKey="urgency" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="AI Reason" sortKey="aiReason" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map(req => (
                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{req.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{req.user}</td>
                  <td className="p-4 text-sm text-slate-600">{req.asset}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[req.urgency] || TIER_STYLES.Low}`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{req.aiReason}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      req.status === 'Rejected' ? 'bg-red-50 text-[#B91C1C] border-red-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>{req.status}</span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    {req._status === 'pending_manager' ? (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleApprove(req)} className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-all shadow-sm">Approve</button>
                        <button onClick={() => handleReject(req)} className="px-3 py-1.5 bg-white text-[#B91C1C] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-all shadow-sm">Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 mr-2">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>
        {table.count > 0 && <Pagination {...table} />}
      </div>
  );
};

export default ManagerApprovals;