import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const FinanceFines = ({ fines = [], loading = false, handleMarkAsPaid }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredFines = fines.filter(fine => 
    !searchQuery.trim() || 
    fine.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
    fine.reason.toLowerCase().includes(searchQuery.toLowerCase()) || 
    fine.amount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredFines.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFines = filteredFines.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Damage & Late Fines</h3>
        <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Fines</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, reason..."
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : filteredFines.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No fines found.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Fine ID</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Reason</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentFines.map(fine => (
                  <tr key={fine._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{fine.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{fine.user}</td>
                    <td className="p-4 text-sm text-slate-600">{fine.reason}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{fine.amount}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        fine._status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-[#B91C1C] border-red-200'
                      }`}>{fine.status}</span>
                    </td>
                    <td className="p-4 text-sm text-right">
                      {fine._status === 'unpaid' ? (
                        <button 
                          onClick={() => handleMarkAsPaid(fine)}
                          className="px-4 py-1.5 bg-[#1E3A8A] text-white shadow-sm hover:bg-blue-900 rounded-lg transition-all font-semibold text-xs cursor-pointer"
                        >
                          Mark as Paid
                        </button>
                      ) : <span className="text-xs font-medium text-slate-400 mr-2">Cleared</span>}
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

export default FinanceFines;