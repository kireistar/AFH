import React from 'react';

const UserIncidents = ({ onOpenIncidentModal }) => {
  const myIncidents = [
    { id: 'INC-001', asset: 'Lenovo ThinkPad X1', issue: 'Screen flickering heavily', date: 'Oct 29, 2023', status: 'In Review' }
  ];

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
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="p-4 font-semibold">Incident ID</th>
              <th className="p-4 font-semibold">Asset Name</th>
              <th className="p-4 font-semibold">Issue Description</th>
              <th className="p-4 font-semibold">Reported Date</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {myIncidents.map(inc => (
              <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">{inc.id}</td>
                <td className="p-4 text-sm font-medium text-slate-800">{inc.asset}</td>
                <td className="p-4 text-sm text-slate-600">{inc.issue}</td>
                <td className="p-4 text-sm text-slate-500">{inc.date}</td>
                <td className="p-4 text-sm">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-50 text-[#1E3A8A] border-blue-200">
                    {inc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserIncidents;