import React from 'react';
import { exportToCSV } from '../../utils/exportCSV';
import { openReceiptInNewTab } from '../../utils/receipt';
import { severityRank } from '../../utils/styles';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

/**
 * Helper function untuk mengekstrak nilai string aman dari variabel yang bisa berupa
 * string, number, atau nested object (Asset/User) dari API backend.
 */
const renderSafeValue = (val, fallback = 'N/A') => {
  if (val === null || val === undefined) return fallback;

  if (typeof val === 'object') {
    // Jika berupa objek Asset
    if (val.asset_name) {
      return val.asset_code ? `${val.asset_name} (${val.asset_code})` : val.asset_name;
    }
    // Jika berupa objek User
    if (val.employee_name || val.full_name || val.username) {
      return val.employee_name || val.full_name || val.username;
    }
    // Fallback properti standar lainnya
    if (val.name) return val.name;
    if (val.code) return val.code;
    if (val.id) return String(val.id);

    // Fallback terakhir agar tidak crash
    return JSON.stringify(val);
  }

  return String(val);
};

const AdminReports = ({ transactions = [], incidents = [] }) => {
  const transactionTable = useTable(transactions, {
    accessors: {
      id: (t) => t.id || t._id || '',
      user: (t) => {
        const v = t.party || t.borrower || t.user;
        if (v && typeof v === 'object') return v.employee_name || v.full_name || v.username || v.name || '';
        return typeof v === 'string' ? v : '';
      },
      asset: (t) => {
        const v = t.asset;
        if (v && typeof v === 'object') return v.asset_name || v.name || '';
        return typeof v === 'string' ? v : '';
      },
      action: (t) => t.action || '',
      date: (t) => t.date || t.occurred_at,
      status: (t) => t.status || '',
    },
  });

  const incidentTable = useTable(incidents, {
    accessors: {
      id: (i) => i.id || i._id || '',
      asset: (i) => {
        const v = i.asset;
        if (v && typeof v === 'object') return v.asset_name || v.name || '';
        return typeof v === 'string' ? v : '';
      },
      severity: (i) => severityRank(i.severity),
      status: (i) => i.status || i._status || '',
      description: (i) => i.description || '',
      date: (i) => i.date || i.created_at,
    },
  });

  const handleExportTransactions = () => {
    exportToCSV(
      'admin_transaction_report',
      ['Transaction ID', 'User', 'Asset', 'Action', 'Date', 'Status'],
      transactions.map(t => [
        renderSafeValue(t.id),
        renderSafeValue(t.party || t.borrower || t.user),
        renderSafeValue(t.asset),
        renderSafeValue(t.action),
        renderSafeValue(t.date || t.occurred_at),
        renderSafeValue(t.status),
      ])
    );
  };

  const handleExportIncidents = () => {
    exportToCSV(
      'admin_incident_report',
      ['Incident ID', 'Asset', 'Severity', 'Status', 'Description', 'Reported Date'],
      incidents.map(i => [
        renderSafeValue(i.id),
        renderSafeValue(i.asset),
        renderSafeValue(i.severity),
        renderSafeValue(i.status),
        renderSafeValue(i.description),
        renderSafeValue(i.date || i.created_at),
      ])
    );
  };

  return (
    <div className="space-y-8">
      {/* Transaction Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Transaction Report</h3>
            <p className="text-sm text-slate-500 mt-1">All asset handover, return, and incident transactions.</p>
          </div>
          <button
            onClick={handleExportTransactions}
            disabled={transactions.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
                  <SortHeader label="Transaction ID" sortKey="id" onSort={transactionTable.onSort} activeKey={transactionTable.sortKey} sortDir={transactionTable.sortDir} />
                  <SortHeader label="User" sortKey="user" onSort={transactionTable.onSort} activeKey={transactionTable.sortKey} sortDir={transactionTable.sortDir} />
                  <SortHeader label="Asset" sortKey="asset" onSort={transactionTable.onSort} activeKey={transactionTable.sortKey} sortDir={transactionTable.sortDir} />
                  <SortHeader label="Action" sortKey="action" onSort={transactionTable.onSort} activeKey={transactionTable.sortKey} sortDir={transactionTable.sortDir} />
                  <SortHeader label="Date" sortKey="date" onSort={transactionTable.onSort} activeKey={transactionTable.sortKey} sortDir={transactionTable.sortDir} />
                  <SortHeader label="Status" sortKey="status" onSort={transactionTable.onSort} activeKey={transactionTable.sortKey} sortDir={transactionTable.sortDir} />
                  <th className="p-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactionTable.pageItems.map((t, rowIdx) => {
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr key={t.id || Math.random()} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">
                        {renderSafeValue(t.id)}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-800">
                        {renderSafeValue(t.party || t.borrower || t.user)}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {renderSafeValue(t.asset)}
                      </td>
                      <td className="p-4 text-sm text-slate-600 capitalize">
                        {renderSafeValue(t.action)}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {renderSafeValue(t.date || t.occurred_at)}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase">
                          {renderSafeValue(t.status, 'COMPLETED')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right whitespace-nowrap">
                        <button
                          onClick={() => openReceiptInNewTab(t)}
                          className="px-2.5 py-1 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-900 transition-all font-semibold text-xs cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {transactionTable.count > 0 && <Pagination {...transactionTable} />}
      </div>

      {/* Incident Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Incident Report</h3>
            <p className="text-sm text-slate-500 mt-1">All reported device damages and malfunctions.</p>
          </div>
          <button
            onClick={handleExportIncidents}
            disabled={incidents.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
                  <SortHeader label="Asset" sortKey="asset" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Severity" sortKey="severity" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Status" sortKey="status" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Description" sortKey="description" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                  <SortHeader label="Reported Date" sortKey="date" onSort={incidentTable.onSort} activeKey={incidentTable.sortKey} sortDir={incidentTable.sortDir} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {incidentTable.pageItems.map((i, rowIdx) => {
                  const statusVal = renderSafeValue(i.status || i._status, 'open').toLowerCase();
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr key={i.id || Math.random()} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">
                        {renderSafeValue(i.id)}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-800">
                        {renderSafeValue(i.asset)}
                      </td>
                      <td className="p-4 text-sm text-slate-600 capitalize">
                        {renderSafeValue(i.severity)}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                          statusVal === 'open' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          statusVal === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-blue-50 text-[#1E3A8A] border-blue-200'
                        }`}>
                          {statusVal}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                        {renderSafeValue(i.description)}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {renderSafeValue(i.date || i.created_at)}
                      </td>
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

export default AdminReports;
