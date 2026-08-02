import React from "react";

const AdminHandover = ({
  handovers = [],
  activeLoans = [],
  handleCompleteHandover = () => {},
  handleProcessReturn = () => {},
  loadingHandovers = false,
  loadingLoans = false,
  refreshHandovers = () => {},
}) => {

  return (
    <div className="space-y-8">
      {/* 1. Pending Handovers Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Asset Handover List
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Assets below have been approved and are ready to be handed over.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingHandovers ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading...
            </div>
          ) : handovers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No pending handovers.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Borrower</th>
                  <th className="p-4 font-semibold">Asset</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">
                    Action (Manual Fallback)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {handovers.map((h, rowIdx) => {
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr
                      key={h.id}
                      className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}
                    >
                      <td className="p-4 text-sm font-semibold text-slate-700">
                        {h.id}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">
                          {h.user}
                        </div>
                        <div className="text-xs text-slate-500">
                          {h.department}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">
                        {h.asset}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-700 border-yellow-200">
                          {h.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        <button
                          onClick={() => handleCompleteHandover(h._id)}
                          className="px-4 py-1.5 bg-slate-200 text-slate-700 shadow-sm hover:bg-slate-300 rounded-lg transition-all font-semibold text-xs cursor-pointer"
                        >
                          Manual Handover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 2. Active Loans Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Active Loans</h3>
          <p className="text-sm text-slate-500 mt-1">
            Assets currently checked out by users. Click process return once
            they physically return it.
          </p>
        </div>
        <div className="overflow-x-auto">
          {loadingLoans ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading...
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No active loans.
            </div>
          ) : (
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
                {activeLoans.map((loan, rowIdx) => {
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr
                      key={loan.id}
                      className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}
                    >
                      <td className="p-4 text-sm font-semibold text-slate-700">
                        {loan.id}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">
                          {loan.user}
                        </div>
                        <div className="text-xs text-slate-500">
                          {loan.department}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">
                        {loan.asset}
                      </td>
                      <td className="p-4 text-sm text-slate-500 text-xs">
                        {loan.startDate} — {loan.endDate}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        <button
                          onClick={() => handleProcessReturn(loan._id)}
                          className="px-4 py-1.5 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 rounded-lg transition-all font-semibold text-xs cursor-pointer"
                        >
                          Process Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHandover;
