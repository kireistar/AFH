import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const TIER_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-[#B91C1C] border-red-200',
};

const ManagerRiskAssessment = ({ riskLogs = [], loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredLogs = riskLogs.filter(log => 
    !searchQuery.trim() || 
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.urgency.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.aiReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(log.riskScore).includes(searchQuery)
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredLogs.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">AI Risk Assessment Logs</h3>
          <p className="text-sm text-slate-500 mt-1">This module displays automated risk scoring data by the AI engine.</p>
        </div>
        <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Risk Logs</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requester, asset..."
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No risk assessment logs found.</div>
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
                  <th className="p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{log.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{log.user}</td>
                    <td className="p-4 text-sm text-slate-600">{log.asset}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[log.urgency] || TIER_STYLES.Low}`}>
                        {log.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{log.riskScore}/100</td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{log.aiReason}</td>
                    <td className="p-4 text-sm text-slate-500">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerRiskAssessment;