import React from 'react';

const UserAssets = ({ requests = [], loading = false }) => {
  // Filter currently borrowed assets from active requests
  const borrowedAssets = requests.filter(req => req.status === 'handed_over' || req._status === 'handed_over');

  const renderAssetLabel = (req) => {
    if (!req.asset) return '-';
    if (typeof req.asset === 'object') {
      return req.asset.asset_name
        ? `${req.asset.asset_name}${req.asset.asset_code ? ` (${req.asset.asset_code})` : ''}`
        : 'Asset';
    }
    return String(req.asset);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">My Borrowed Assets</h3>
        <p className="text-sm text-slate-500">List of devices currently assigned to you for corporate operations.</p>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : borrowedAssets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No borrowed assets found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-semibold">Request ID</th>
                <th className="p-4 font-semibold">Device Name</th>
                <th className="p-4 font-semibold">Start Date</th>
                <th className="p-4 font-semibold">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {borrowedAssets.map((req, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr key={req.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{req.request_code || req.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{renderAssetLabel(req)}</td>
                    <td className="p-4 text-sm text-slate-600">{req.requested_start || req.startDate || '-'}</td>
                    <td className="p-4 text-sm text-slate-500">{req.requested_end || req.endDate || '-'}</td>
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

export default UserAssets;