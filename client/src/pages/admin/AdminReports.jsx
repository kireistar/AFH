import React, { useState, useEffect } from 'react';
import { exportToCSV } from '../../utils/exportCSV';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const isDateInRange = (dateStr, startStr, endStr) => {
  if (!dateStr || dateStr === '-') return true;
  const itemDate = new Date(dateStr);
  itemDate.setHours(0, 0, 0, 0);

  if (startStr) {
    const startDate = new Date(startStr);
    startDate.setHours(0, 0, 0, 0);
    if (itemDate < startDate) return false;
  }

  if (endStr) {
    const endDate = new Date(endStr);
    endDate.setHours(0, 0, 0, 0);
    if (itemDate > endDate) return false;
  }

  return true;
};

const AdminReports = ({ transactions = [], incidents = [] }) => {
  // Transaction States
  const [txnSearch, setTxnSearch] = useState('');
  const [txnStart, setTxnStart] = useState('');
  const [txnEnd, setTxnEnd] = useState('');
  const [txnPage, setTxnPage] = useState(1);

  // Incident States
  const [incSearch, setIncSearch] = useState('');
  const [incStart, setIncStart] = useState('');
  const [incEnd, setIncEnd] = useState('');
  const [incPage, setIncPage] = useState(1);

  useEffect(() => {
    setTxnPage(1);
  }, [txnSearch, txnStart, txnEnd]);

  useEffect(() => {
    setIncPage(1);
  }, [incSearch, incStart, incEnd]);

  // Filters logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !txnSearch.trim() ||
      t.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.party.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.asset.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.action.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.status.toLowerCase().includes(txnSearch.toLowerCase());

    const matchesDate = isDateInRange(t.date, txnStart, txnEnd);
    return matchesSearch && matchesDate;
  });

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = !incSearch.trim() ||
      i.id.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.asset.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.severity.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.status.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.description.toLowerCase().includes(incSearch.toLowerCase());

    const matchesDate = isDateInRange(i.date, incStart, incEnd);
    return matchesSearch && matchesDate;
  });

  // Pagination bounds
  const itemsPerPage = 10;

  const totalTxn = filteredTransactions.length;
  const txnLast = txnPage * itemsPerPage;
  const txnFirst = txnLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(txnFirst, txnLast);

  const totalInc = filteredIncidents.length;
  const incLast = incPage * itemsPerPage;
  const incFirst = incLast - itemsPerPage;
  const currentIncidents = filteredIncidents.slice(incFirst, incLast);

  const handleExportTransactions = () => {
    exportToCSV('admin_transaction_report', 
      ['Transaction ID', 'User', 'Asset', 'Action', 'Date', 'Status'],
      filteredTransactions.map(t => [t.id, t.party, t.asset, t.action, t.date, t.status])
    );
  };

  const handleExportIncidents = () => {
    exportToCSV('admin_incident_report',
      ['Incident ID', 'Asset', 'Severity', 'Status', 'Description', 'Reported Date'],
      filteredIncidents.map(i => [i.id, i.asset, i.severity, i.status, i.description, i.date])
    );
  };

  return (
    <div className="space-y-8">
      {/* Transaction Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Transaction Report</h3>
            <p className="text-sm text-slate-500 mt-1">All asset handover, return, and incident transactions.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search user, asset..."
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all placeholder-slate-400"
              />
            </div>
            
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
              <input
                type="date"
                value={txnStart}
                onChange={(e) => setTxnStart(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</span>
              <input
                type="date"
                value={txnEnd}
                onChange={(e) => setTxnEnd(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            <div className="flex items-end h-full xl:self-end pt-4 xl:pt-0">
              <button
                onClick={handleExportTransactions}
                disabled={filteredTransactions.length === 0}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
          ) : (
            <>
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
                  {currentTransactions.map(t => (
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
              <Pagination
                currentPage={txnPage}
                totalItems={totalTxn}
                itemsPerPage={itemsPerPage}
                onPageChange={setTxnPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Incident Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Incident Report</h3>
            <p className="text-sm text-slate-500 mt-1">All reported device damages and malfunctions.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={incSearch}
                onChange={(e) => setIncSearch(e.target.value)}
                placeholder="Search asset, severity..."
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all placeholder-slate-400"
              />
            </div>
            
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
              <input
                type="date"
                value={incStart}
                onChange={(e) => setIncStart(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</span>
              <input
                type="date"
                value={incEnd}
                onChange={(e) => setIncEnd(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            <div className="flex items-end h-full xl:self-end pt-4 xl:pt-0">
              <button
                onClick={handleExportIncidents}
                disabled={filteredIncidents.length === 0}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No incidents found.</div>
          ) : (
            <>
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
                  {currentIncidents.map(i => (
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
              <Pagination
                currentPage={incPage}
                totalItems={totalInc}
                itemsPerPage={itemsPerPage}
                onPageChange={setIncPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;