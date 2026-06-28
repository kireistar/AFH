import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-red-50 text-[#B91C1C] border-red-200';
    case 'handed_over':
      return 'bg-blue-50 text-[#1E3A8A] border-blue-200';
    case 'returned':
      return 'bg-slate-50 text-slate-650 border-slate-200';
    case 'pending_admin':
    case 'pending_manager':
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
};

const UserRequests = ({ onOpenRequestModal, requests = [], loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredRequests = requests.filter(req => 
    !searchQuery.trim() || 
    req.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.status.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (req.date && req.date.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredRequests.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">My Requests</h3>
          <p className="text-sm text-slate-500">Track and monitor the evaluation status of your asset applications.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Requests</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset, status..."
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
            />
          </div>

          <div className="pt-4 md:pt-0">
            <button 
              onClick={onOpenRequestModal}
              className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              + New Request
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No requests found.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Request ID</th>
                  <th className="p-4 font-semibold">Asset Requested</th>
                  <th className="p-4 font-semibold">Application Date</th>
                  <th className="p-4 font-semibold">Risk Level</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{req.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{req.asset}</td>
                    <td className="p-4 text-sm text-slate-500">{req.date}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center font-medium text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${req.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                        {req.urgency}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(req._status)}`}>
                        {req.status}
                      </span>
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

export default UserRequests;