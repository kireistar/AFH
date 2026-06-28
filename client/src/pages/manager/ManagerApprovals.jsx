import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const TIER_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-[#B91C1C] border-red-200',
};

const ManagerApprovals = ({ approvals = [], loading = false, handleApprove, handleReject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredApprovals = approvals.filter(req => 
    !searchQuery.trim() || 
    req.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.urgency.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.aiReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredApprovals.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApprovals = filteredApprovals.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">High-Risk Request Approvals</h3>
          <p className="text-sm text-slate-500 mt-1">Requests escalated by AI requiring manual managerial review.</p>
        </div>
        <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Reviews</span>
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
        ) : filteredApprovals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No pending approvals.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Requester</th>
                  <th className="p-4 font-semibold">Asset</th>
                  <th className="p-4 font-semibold">Risk Tier</th>
                  <th className="p-4 font-semibold">AI Reason</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentApprovals.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{req.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{req.user}</td>
                    <td className="p-4 text-sm text-slate-600">{req.asset}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${TIER_STYLES[req.urgency] || TIER_STYLES.Low}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{req.aiReason}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        req.status === 'Rejected' ? 'bg-red-50 text-[#B91C1C] border-red-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>{req.status}</span>
                    </td>
                    <td className="p-4 text-sm text-right">
                      {req._status === 'pending_manager' ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleApprove(req)} className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-all shadow-sm cursor-pointer">Approve</button>
                          <button onClick={() => handleReject(req)} className="px-3 py-1.5 bg-white text-[#B91C1C] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-all shadow-sm cursor-pointer">Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 mr-2">Processed</span>
                      )}
                    </td>
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

export default ManagerApprovals;