import React from 'react';
import { TIER_STYLES } from '../../utils/styles';

const ManagerApprovals = ({ approvals = [], loading = false, handleApprove, handleReject }) => {
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
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Requester</th>
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold">Risk Tier</th>
                <th className="p-4 font-semibold">AI Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {approvals.map((req, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                const userName = typeof req.user === 'object' ? (req.user?.employee_name || 'User') : String(req.user || '-');
                const assetName = typeof req.asset === 'object' ? (req.asset?.asset_name || 'Asset') : String(req.asset || '-');
                const reqStatus = req.status || req._status || 'Pending';
                const isPending = reqStatus === 'pending_manager' || req._status === 'pending_manager' || reqStatus === 'Pending';
                const tierStyle = TIER_STYLES[req.risk_tier_snapshot] || TIER_STYLES[req.urgency] || TIER_STYLES.Low;
                return (
                  <tr key={req.id || req._id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{req.request_code || req.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{userName}</td>
                    <td className="p-4 text-sm text-slate-600">{assetName}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tierStyle}`}>
                        {req.risk_tier_snapshot || req.urgency || 'Low'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{req.ai_reason || req.aiReason || '-'}</td>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerApprovals;