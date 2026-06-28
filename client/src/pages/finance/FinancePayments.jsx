import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const FinancePayments = ({ payments = [], loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredPayments = payments.filter(pay => 
    !searchQuery.trim() || 
    pay.party.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pay.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pay.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pay.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pay.amount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredPayments.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Payment Logs</h3>
        <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Payments</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, asset, date..."
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : filteredPayments.length === 0 ? (
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
                  <th className="p-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{pay.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{pay.party}</td>
                    <td className="p-4 text-sm text-slate-600">{pay.asset}</td>
                    <td className="p-4 text-sm text-slate-600">{pay.action}</td>
                    <td className="p-4 text-sm text-slate-600">{pay.date}</td>
                    <td className="p-4 text-sm font-bold text-emerald-600">{pay.amount}</td>
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

export default FinancePayments;