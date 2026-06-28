import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const UserAssets = ({ requests = [], loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter currently borrowed assets from active requests
  const borrowedAssets = requests.filter(req => req._status === 'handed_over');

  // Filter based on Search Query
  const filteredAssets = borrowedAssets.filter(req => 
    !searchQuery.trim() ||
    req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.startDate && req.startDate.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (req.endDate && req.endDate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredAssets.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">My Borrowed Assets</h3>
          <p className="text-sm text-slate-500">List of devices currently assigned to you for corporate operations.</p>
        </div>
        <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Assets</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device name..."
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton columns={4} rows={3} />
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No borrowed assets found.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Request ID</th>
                  <th className="p-4 font-semibold">Device Name</th>
                  <th className="p-4 font-semibold">Start Date</th>
                  <th className="p-4 font-semibold">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentAssets.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{req.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{req.asset}</td>
                    <td className="p-4 text-sm text-slate-600">{req.startDate}</td>
                    <td className="p-4 text-sm text-slate-500">{req.endDate}</td>
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

export default UserAssets;