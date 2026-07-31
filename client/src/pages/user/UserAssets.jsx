import React from 'react';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const UserAssets = ({ requests = [], loading = false }) => {
  // Filter currently borrowed assets from active requests
  const borrowedAssets = requests.filter(req => req._status === 'handed_over');

  const table = useTable(borrowedAssets, {
    accessors: {
      id: (r) => r.id,
      asset: (r) => r.asset,
      startDate: (r) => r.startDate,
      endDate: (r) => r.endDate,
    },
  });

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
                <SortHeader label="Request ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Device Name" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Start Date" sortKey="startDate" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="End Date" sortKey="endDate" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map(req => (
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
        {table.count > 0 && <Pagination {...table} />}
      </div>
  );
};

export default UserAssets;