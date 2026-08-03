import React from 'react';
import { exportToCSV } from '../../utils/exportCSV';
import { TIER_STYLES } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const ManagerReports = ({ requests = [], incidents = [] }) => {
  const requestTable = useTable(requests, {
    accessors: {
      id: (r) => r.id || r._id || '',
      user: (r) => (r.user && typeof r.user === 'object' ? (r.user?.employee_name || '') : String(r.user || '')),
      asset: (r) => (r.asset && typeof r.asset === 'object' ? (r.asset?.asset_name || '') : String(r.asset || '')),
      tier: (r) => r.urgency || '',
      score: (r) => r.riskScore || 0,
      aiReason: (r) => r.aiReason || '',
      status: (r) => r.status || '',
      date: (r) => r.date || r.created_at,
    },
  });

  const incidentTable = useTable(incidents, {
    accessors: {
      id: (i) => i.id || i._id || '',
      reporter: (i) => (i.reporter && typeof i.reporter === 'object' ? (i.reporter?.employee_name || '') : String(i.reporter || '')),
      asset: (i) => (i.asset && typeof i.asset === 'object' ? (i.asset?.asset_name || '') : String(i.asset || '')),
      severity: (i) => i.severity || '',
      status: (i) => i.status || i._status || '',
      description: (i) => i.description || '',
      date: (i) => i.date || i.created_at,
    },
  });

  const handleExportRequests = () => {
    exportToCSV('manager_request_risk_report',
      ['Request ID', 'Requester', 'Asset', 'Risk Tier', 'Risk Score', 'AI Reason', 'Status', 'Date'],
      requests.map(r => [r.id, r.user, r.asset, r.urgency, r.riskScore, r.aiReason, r.status, r.date])
    );
  };

  const handleExportIncidents = () => {
    exportToCSV('manager_incident_report',
      ['Incident ID', 'Reporter', 'Asset', 'Severity', 'Status', 'Description', 'Reported Date'],
      incidents.map(i => [i.id, i.reporter, i.asset, i.severity, i.status, i.description, i.date])
    );
  };

  return (
    <div className="space-y-8">
      {/* Request Risk Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Request & Risk Analysis Report</h3>
            <p className="text-sm text-slate-500 mt-1">All asset requests with AI risk scoring data.</p>
          </div>
          <button
            onClick={handleExportRequests}
            disabled={requests.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No requests found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <SortHeader label="Request ID" sortKey="id" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="Requester" sortKey="user" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="Asset" sortKey="asset" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="Risk Tier" sortKey="tier" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="Risk Score" sortKey="score" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="AI Reason" sortKey="aiReason" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="Status" sortKey="status" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                  <SortHeader label="Date" sortKey="date" onSort={requestTable.onSort} activeKey={requestTable.sortKey} sortDir={requestTable.sortDir} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requestTable.pageItems.map(r => (
                  <tr key={r.id || r._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{r.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{r.user}</td>
                    <td className="p-4 text-sm text-slate-600">{r.asset}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[r.urgency] || TIER_STYLES.Low}`}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{r.riskScore}/10</td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{r.aiReason}</td>
                    <td className="p-4 text-sm text-slate-600">{r.status}</td>
                    <td className="p-4 text-sm text-slate-500">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {requestTable.count > 0 && <Pagination {...requestTable} />}
      </div>

      {/* Incident Analysis Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Incident Analysis Report</h3>
            <p className="text-sm text-slate-500 mt-1">Device damage trends and severity breakdown.</p>
          </div>
          <button
            onClick={handleExportIncidents}
            disabled={incidents.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          {incidents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No incidents found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <SortHeader label="Incident ID" sortKey="id" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Reporter" sortKey="reporter" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Asset" sortKey="asset" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Severity" sortKey="severity" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Status" sortKey="status" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Description" sortKey="description" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Reported Date" sortKey="date" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {incidentTable.pageItems.map((i, rowIdx) => {
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr key={i.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{i.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{i.reporter}</td>
                      <td className="p-4 text-sm text-slate-600">{i.asset}</td>
                      <td className="p-4 text-sm text-slate-600">{i.severity}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          i._status === 'open' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          i._status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-blue-50 text-[#1E3A8A] border-blue-200'
                        }`}>{i.status}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{i.description}</td>
                      <td className="p-4 text-sm text-slate-500">{i.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {incidentTable.count > 0 && <Pagination {...incidentTable} />}
      </div>
    </div>
  );
};

export default ManagerReports;