import React from 'react';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const STATUS_STYLES = {
  open: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  investigating: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-50 text-slate-500 border-slate-200',
};

const UserIncidents = ({ incidents = [], loading = false, onOpenIncidentModal }) => {
  const table = useTable(incidents, {
    accessors: {
      id: (inc) => inc.incident_code || inc.id,
      asset: (inc) => (typeof inc.asset === 'object' ? (inc.asset?.asset_name || '') : String(inc.asset || '')),
      description: (inc) => inc.description || '',
      date: (inc) => inc.created_at || inc.date,
      status: (inc) => inc.status || inc._status,
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Reported Incidents</h3>
          <p className="text-sm text-slate-500">View logs and real-time status of technical damages you reported.</p>
        </div>
        <button
          onClick={onOpenIncidentModal}
          className="px-4 py-2 bg-[#B91C1C] text-white rounded-xl text-sm font-semibold hover:bg-red-800 transition-colors shadow-sm"
        >
          Report Issue
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No incidents reported yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <SortHeader label="Incident ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Asset Name" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Issue Description" sortKey="description" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Reported Date" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((inc, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                const assetName = typeof inc.asset === 'object' ? (inc.asset?.asset_name || 'Asset') : String(inc.asset || '-');
                const incStatus = (inc.status || inc._status || 'open').toLowerCase();

                // Calculate progress step index (0 = reported, 1 = investigating, 2 = repairing, 3 = resolved)
                const stepIdx = incStatus === 'resolved' || incStatus === 'closed' ? 3 : (incStatus === 'investigating' ? 1 : 0);

                return (
                  <tr key={inc.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                    <td className="p-4 text-sm font-semibold text-slate-700">{inc.incident_code || inc.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{assetName}</td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{inc.description || '-'}</td>
                    <td className="p-4 text-sm text-slate-500">{inc.created_at ? new Date(inc.created_at).toLocaleDateString() : (inc.date || '-')}</td>
                    <td className="p-4 text-sm min-w-[240px]">
                      {/* Visual Repair Stepper */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className={stepIdx >= 0 ? 'text-amber-600' : ''}>Reported</span>
                          <span className={stepIdx >= 1 ? 'text-blue-600' : ''}>Review</span>
                          <span className={stepIdx >= 2 ? 'text-purple-600' : ''}>Repair</span>
                          <span className={stepIdx >= 3 ? 'text-emerald-600' : ''}>Resolved</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                          <div className={`h-full transition-all duration-300 ${
                            stepIdx === 3 ? 'w-full bg-emerald-500' :
                            stepIdx === 2 ? 'w-3/4 bg-purple-500' :
                            stepIdx === 1 ? 'w-1/2 bg-blue-500' : 'w-1/4 bg-amber-500'
                          }`} />
                        </div>
                      </div>
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
  );
};

export default UserIncidents;