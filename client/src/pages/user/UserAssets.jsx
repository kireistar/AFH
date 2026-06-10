import React from 'react';

const UserAssets = ({ requests = [], loading = false }) => {
  // Mockup data for currently borrowed items
  const borrowedAssets = requests.filter(req => req._status === 'handed_over');

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
              {borrowedAssets.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{req.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{req.asset}</td>
                  <td className="p-4 text-sm text-slate-600">{req.startDate}</td>
                  <td className="p-4 text-sm text-slate-500">{req.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserAssets;