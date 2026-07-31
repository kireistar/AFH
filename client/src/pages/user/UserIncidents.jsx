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
      id: (i) => i.id,
      asset: (i) => i.asset,
      description: (i) => i.description,
      date: (i) => i.date,
      status: (i) => i.status || i._status,
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
              {table.pageItems.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-700">{inc.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{inc.asset}</td>
                  <td className="p-4 text-sm text-slate-600">{inc.description}</td>
                  <td className="p-4 text-sm text-slate-500">{inc.date}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[inc._status] || STATUS_STYLES.open}`}>
                      {inc.status}
                    </span>
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

export default UserIncidents;