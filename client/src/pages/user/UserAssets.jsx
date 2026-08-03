import React, { useState } from 'react';
import { FiShield, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import RequestExtensionModal from '../../components/RequestExtensionModal';
import ProduceQRModal from '../../components/ProduceQRModal';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const UserAssets = ({ requests = [], loading = false, onRefresh }) => {
  const { user } = useAuth();
  const [extensionTarget, setExtensionTarget] = useState(null);
  const [qrTarget, setQrTarget] = useState(null);

  // Filter currently borrowed assets from active requests
  const borrowedAssets = requests.filter(req => req.status === 'handed_over' || req._status === 'handed_over');

  const table = useTable(borrowedAssets, {
    accessors: {
      id: (r) => r.request_code || r.id,
      asset: (r) => (typeof r.asset === 'object' ? (r.asset?.asset_name || '') : String(r.asset || '')),
      start: (r) => r.requested_start || r.startDate,
      end: (r) => r.requested_end || r.endDate,
    },
  });

  const renderAssetLabel = (req) => {
    if (!req.asset) return '-';
    if (typeof req.asset === 'object') {
      return req.asset.asset_name
        ? `${req.asset.asset_name}${req.asset.asset_code ? ` (${req.asset.asset_code})` : ''}`
        : 'Asset';
    }
    return String(req.asset);
  };

  const riskTier = user?.risk_score_tier || 'Low';

  return (
    <div className="space-y-6">
      {/* My Trust & Clearance Status Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
            <FiShield size={32} className="text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">My Trust & Clearance Status</h3>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                riskTier === 'Low' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40' :
                riskTier === 'Medium' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' :
                'bg-red-400/20 text-red-300 border border-red-400/40'
              }`}>
                {riskTier} Risk Tier
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
              {riskTier === 'Low'
                ? 'Your trust score is excellent. You are eligible for automated single-click request approvals!'
                : 'Returning assets on time and resolving incidents keeps your trust score high.'}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-white/10 rounded-xl text-xs text-blue-100 border border-white/10 shrink-0 font-medium">
          💡 Tip: Request returns prior to deadline to maintain Low Risk status
        </div>
      </div>

      {/* Borrowed Assets Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">My Borrowed Assets</h3>
            <p className="text-sm text-slate-500">List of devices currently assigned to you for corporate operations.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading assets...</div>
          ) : borrowedAssets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No borrowed assets found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <SortHeader label="Request ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                  <SortHeader label="Device Name" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                  <SortHeader label="Start Date" sortKey="start" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                  <SortHeader label="End Date" sortKey="end" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                  <th className="p-4 font-semibold text-right pr-6">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {table.pageItems.map((req, rowIdx) => {
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr key={req.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{req.request_code || req.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{renderAssetLabel(req)}</td>
                      <td className="p-4 text-sm text-slate-600">{req.requested_start || req.startDate || '-'}</td>
                      <td className="p-4 text-sm text-slate-500">{req.requested_end || req.endDate || '-'}</td>
                      <td className="p-4 text-sm text-right pr-6 whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => setExtensionTarget(req)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FiClock size={13} />
                          <span>Extend Loan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrTarget(req)}
                          className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <FiRefreshCw size={13} />
                          <span>Return Device</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {table.count > 0 && <Pagination {...table} />}
      </div>

      <RequestExtensionModal
        isOpen={!!extensionTarget}
        onClose={() => setExtensionTarget(null)}
        onSuccess={onRefresh}
        asset={extensionTarget}
      />

      <ProduceQRModal
        isOpen={!!qrTarget}
        onClose={() => setQrTarget(null)}
        requestData={qrTarget}
        user={user}
        timestamp={Math.floor(Date.now() / 1000)}
        onRefreshSuccess={onRefresh}
      />
    </div>
  );
};

export default UserAssets;