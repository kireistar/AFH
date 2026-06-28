import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const AdminHandover = ({ 
  handovers = [], 
  activeLoans = [],
  handleCompleteHandover = () => {}, 
  handleProcessReturn = () => {},
  loadingHandovers = false,
  loadingLoans = false
}) => {
  const [handoverSearchQuery, setHandoverSearchQuery] = useState('');
  const [handoverPage, setHandoverPage] = useState(1);

  const [loansSearchQuery, setLoansSearchQuery] = useState('');
  const [loansPage, setLoansPage] = useState(1);

  useEffect(() => {
    setHandoverPage(1);
  }, [handoverSearchQuery]);

  useEffect(() => {
    setLoansPage(1);
  }, [loansSearchQuery]);

  // Filter Handovers
  const filteredHandovers = handovers.filter(h => 
    !handoverSearchQuery.trim() || 
    h.user.toLowerCase().includes(handoverSearchQuery.toLowerCase()) || 
    h.department.toLowerCase().includes(handoverSearchQuery.toLowerCase()) ||
    h.asset.toLowerCase().includes(handoverSearchQuery.toLowerCase())
  );

  // Paginate Handovers
  const itemsPerPage = 10;
  const totalHandovers = filteredHandovers.length;
  const handoverLastIndex = handoverPage * itemsPerPage;
  const handoverFirstIndex = handoverLastIndex - itemsPerPage;
  const currentHandovers = filteredHandovers.slice(handoverFirstIndex, handoverLastIndex);

  // Filter Loans
  const filteredLoans = activeLoans.filter(loan => 
    !loansSearchQuery.trim() || 
    loan.user.toLowerCase().includes(loansSearchQuery.toLowerCase()) || 
    loan.department.toLowerCase().includes(loansSearchQuery.toLowerCase()) ||
    loan.asset.toLowerCase().includes(loansSearchQuery.toLowerCase())
  );

  // Paginate Loans
  const totalLoans = filteredLoans.length;
  const loansLastIndex = loansPage * itemsPerPage;
  const loansFirstIndex = loansLastIndex - itemsPerPage;
  const currentLoans = filteredLoans.slice(loansFirstIndex, loansLastIndex);

  return (
    <div className="space-y-8">
      {/* 1. Pending Handovers Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Asset Handover List</h3>
            <p className="text-sm text-slate-500 mt-1">Assets below have been approved and are ready to be handed over to the borrower.</p>
          </div>
          <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Handovers</span>
            <input
              type="text"
              value={handoverSearchQuery}
              onChange={(e) => setHandoverSearchQuery(e.target.value)}
              placeholder="Search borrower, asset..."
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loadingHandovers ? (
            <TableSkeleton columns={5} rows={5} />
          ) : filteredHandovers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No pending handovers.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Borrower</th>
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentHandovers.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{h.id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">{h.user}</div>
                        <div className="text-xs text-slate-500">{h.department}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{h.asset}</td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-700 border-yellow-200">
                          {h.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        <button onClick={() => handleCompleteHandover(h._id)} className="px-4 py-1.5 bg-[#1E3A8A] text-white shadow-sm hover:bg-blue-900 rounded-lg transition-all font-semibold text-xs cursor-pointer">
                          Handover Asset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={handoverPage}
                totalItems={totalHandovers}
                itemsPerPage={itemsPerPage}
                onPageChange={setHandoverPage}
              />
            </>
          )}
        </div>
      </div>

      {/* 2. Active Loans Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Active Loans</h3>
            <p className="text-sm text-slate-500 mt-1">Assets currently checked out by users. Click process return once they physically return it.</p>
          </div>
          <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Loans</span>
            <input
              type="text"
              value={loansSearchQuery}
              onChange={(e) => setLoansSearchQuery(e.target.value)}
              placeholder="Search borrower, asset..."
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loadingLoans ? (
            <TableSkeleton columns={6} rows={5} />
          ) : filteredLoans.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No active loans.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Borrower</th>
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Duration</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentLoans.map(loan => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{loan.id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">{loan.user}</div>
                        <div className="text-xs text-slate-500">{loan.department}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{loan.asset}</td>
                      <td className="p-4 text-sm text-slate-500 text-xs">
                        {loan.startDate} — {loan.endDate}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        <button onClick={() => handleProcessReturn(loan._id)} className="px-4 py-1.5 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 rounded-lg transition-all font-semibold text-xs cursor-pointer">
                          Process Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={loansPage}
                totalItems={totalLoans}
                itemsPerPage={itemsPerPage}
                onPageChange={setLoansPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHandover;