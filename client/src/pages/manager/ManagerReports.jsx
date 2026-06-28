import React, { useState, useEffect } from 'react';
import { exportToCSV } from '../../utils/exportCSV';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const TIER_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-[#B91C1C] border-red-200',
};

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

const ManagerReports = ({ requests = [], incidents = [] }) => {
  // Request States
  const [reqSearch, setReqSearch] = useState('');
  const [reqStart, setReqStart] = useState('');
  const [reqEnd, setReqEnd] = useState('');
  const [reqPage, setReqPage] = useState(1);

  // Incident States
  const [incSearch, setIncSearch] = useState('');
  const [incStart, setIncStart] = useState('');
  const [incEnd, setIncEnd] = useState('');
  const [incPage, setIncPage] = useState(1);

  useEffect(() => {
    setReqPage(1);
  }, [reqSearch, reqStart, reqEnd]);

  useEffect(() => {
    setIncPage(1);
  }, [incSearch, incStart, incEnd]);

  // Filters logic
  const filteredRequests = requests.filter(r => {
    const matchesSearch = !reqSearch.trim() ||
      r.id.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.user.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.asset.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.urgency.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.status.toLowerCase().includes(reqSearch.toLowerCase());

    const matchesDate = isDateInRange(r.date, reqStart, reqEnd);
    return matchesSearch && matchesDate;
  });

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = !incSearch.trim() ||
      i.id.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.reporter.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.asset.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.severity.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.status.toLowerCase().includes(incSearch.toLowerCase()) ||
      i.description.toLowerCase().includes(incSearch.toLowerCase());

    const matchesDate = isDateInRange(i.date, incStart, incEnd);
    return matchesSearch && matchesDate;
  });

  // Pagination bounds
  const itemsPerPage = 10;

  const totalReq = filteredRequests.length;
  const reqLast = reqPage * itemsPerPage;
  const reqFirst = reqLast - itemsPerPage;
  const currentRequests = filteredRequests.slice(reqFirst, reqLast);

  const totalInc = filteredIncidents.length;
  const incLast = incPage * itemsPerPage;
  const incFirst = incLast - itemsPerPage;
  const currentIncidents = filteredIncidents.slice(incFirst, incLast);

  const handleExportRequests = () => {
    exportToCSV('manager_request_risk_report',
      ['Request ID', 'Requester', 'Asset', 'Risk Tier', 'Risk Score', 'AI Reason', 'Status', 'Date'],
      filteredRequests.map(r => [r.id, r.user, r.asset, r.urgency, r.riskScore, r.aiReason, r.status, r.date])
    );
  };

  const handleExportIncidents = () => {
    exportToCSV('manager_incident_report',
      ['Incident ID', 'Reporter', 'Asset', 'Severity', 'Status', 'Description', 'Reported Date'],
      filteredIncidents.map(i => [i.id, i.reporter, i.asset, i.severity, i.status, i.description, i.date])
    );
  };

  return (
    <div className="space-y-8">
      {/* Request Risk Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Request & Risk Analysis Report</h3>
            <p className="text-sm text-slate-500 mt-1">All asset requests with AI risk scoring data.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                placeholder="Search user, asset..."
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all placeholder-slate-400"
              />
            </div>
            
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
              <input
                type="date"
                value={reqStart}
                onChange={(e) => setReqStart(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</span>
              <input
                type="date"
                value={reqEnd}
                onChange={(e) => setReqEnd(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            <div className="flex items-end h-full xl:self-end pt-4 xl:pt-0">
              <button
                onClick={handleExportRequests}
                disabled={filteredRequests.length === 0}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No requests found.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">Request ID</th>
                    <th className="p-4 font-semibold">Requester</th>
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Risk Tier</th>
                    <th className="p-4 font-semibold">Risk Score</th>
                    <th className="p-4 font-semibold">AI Reason</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentRequests.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{r.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{r.user}</td>
                      <td className="p-4 text-sm text-slate-600">{r.asset}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[r.urgency] || TIER_STYLES.Low}`}>
                          {r.urgency}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-700">{r.riskScore}/100</td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{r.aiReason}</td>
                      <td className="p-4 text-sm text-slate-600">{r.status}</td>
                      <td className="p-4 text-sm text-slate-500">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={reqPage}
                totalItems={totalReq}
                itemsPerPage={itemsPerPage}
                onPageChange={setReqPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Incident Analysis Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Incident Analysis Report</h3>
            <p className="text-sm text-slate-500 mt-1">Device damage trends and severity breakdown.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={incSearch}
                onChange={(e) => setIncSearch(e.target.value)}
                placeholder="Search reporter, asset..."
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
                    <th className="p-4 font-semibold">Reporter</th>
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

export default ManagerReports;