import React from 'react';
import { exportToCSV } from '../../utils/exportCSV';

const AdminReports = ({ transactions = [], incidents = [] }) => {
  const handleExportTransactions = () => {
    exportToCSV('admin_transaction_report', 
      ['Transaction ID', 'User', 'Asset', 'Action', 'Date', 'Status'],
      transactions.map(t => [t.id, t.party, t.asset, t.action, t.date, t.status])
    );
  };

  const handleExportIncidents = () => {
    exportToCSV('admin_incident_report',
      ['Incident ID', 'Asset', 'Severity', 'Status', 'Description', 'Reported Date'],
      incidents.map(i => [i.id, i.asset, i.severity, i.status, i.description, i.date])
    );
  };

  return (
    <div className="space-y-8">
      {/* Transaction Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Transaction Report</h3>
            <p className="text-sm text-slate-500 mt-1">All asset handover, return, and incident transactions.</p>
          </div>
          <button
            onClick={handleExportTransactions}
            disabled={transactions.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Transaction ID</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Asset</th>
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{t.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{t.party}</td>
                    <td className="p-4 text-sm text-slate-600">{t.asset}</td>
                    <td className="p-4 text-sm text-slate-600">{t.action}</td>
                    <td className="p-4 text-sm text-slate-500">{t.date}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Incident Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Incident Report</h3>
            <p className="text-sm text-slate-500 mt-1">All reported device damages and malfunctions.</p>
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
                  <th className="p-4 font-semibold">Incident ID</th>
                  <th className="p-4 font-semibold">Asset</th>
                  <th className="p-4 font-semibold">Severity</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Reported Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {incidents.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{i.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{i.asset}</td>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;