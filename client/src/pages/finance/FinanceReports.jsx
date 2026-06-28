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

const FinanceReports = ({ invoices = [], transactions = [] }) => {
  // Invoice States
  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('All');
  const [invStart, setInvStart] = useState('');
  const [invEnd, setInvEnd] = useState('');
  const [invPage, setInvPage] = useState(1);

  // Transaction States
  const [txnSearch, setTxnSearch] = useState('');
  const [txnStart, setTxnStart] = useState('');
  const [txnEnd, setTxnEnd] = useState('');
  const [txnPage, setTxnPage] = useState(1);

  useEffect(() => {
    setInvPage(1);
  }, [invSearch, invStatusFilter, invStart, invEnd]);

  useEffect(() => {
    setTxnPage(1);
  }, [txnSearch, txnStart, txnEnd]);

  // Filters logic
  const filteredInvoices = invoices.filter(i => {
    const invoiceCode = i.invoice_code || i.id || '';
    const userName = (typeof i.user === 'object' ? i.user?.employee_name : i.user) || '';
    const reason = i.reason || '';

    const matchesSearch = !invSearch.trim() ||
      invoiceCode.toLowerCase().includes(invSearch.toLowerCase()) ||
      userName.toLowerCase().includes(invSearch.toLowerCase()) ||
      reason.toLowerCase().includes(invSearch.toLowerCase());

    const statusValue = i._status || i.status || '';
    const matchesStatus = invStatusFilter === 'All' || 
      statusValue.toLowerCase() === invStatusFilter.toLowerCase();

    const dueDateStr = i.due_date || i.dueDate || '';
    const matchesDate = isDateInRange(dueDateStr, invStart, invEnd);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredTransactions = transactions.filter(t => {
    const txnCode = t.transaction_code || t.id || '';
    const userName = (typeof t.party === 'object' ? t.party?.employee_name : (t.borrower?.employee_name || t.party)) || '';
    const assetName = (typeof t.asset === 'object' ? t.asset?.asset_name : t.asset) || '';
    const action = t._action || t.action || '';
    const statusVal = t._status || t.status || '';

    const matchesSearch = !txnSearch.trim() ||
      txnCode.toLowerCase().includes(txnSearch.toLowerCase()) ||
      userName.toLowerCase().includes(txnSearch.toLowerCase()) ||
      assetName.toLowerCase().includes(txnSearch.toLowerCase()) ||
      action.toLowerCase().includes(txnSearch.toLowerCase()) ||
      statusVal.toLowerCase().includes(txnSearch.toLowerCase());

    const txnDate = t.occurred_at || t.date || '';
    const matchesDate = isDateInRange(txnDate, txnStart, txnEnd);
    return matchesSearch && matchesDate;
  });

  // Pagination bounds
  const itemsPerPage = 10;

  const totalInv = filteredInvoices.length;
  const invLast = invPage * itemsPerPage;
  const invFirst = invLast - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(invFirst, invLast);

  const totalTxn = filteredTransactions.length;
  const txnLast = txnPage * itemsPerPage;
  const txnFirst = txnLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(txnFirst, txnLast);

  const handleExportInvoices = () => {
    exportToCSV('finance_invoice_report',
      ['Invoice ID', 'User', 'Reason', 'Amount', 'Status', 'Due Date', 'Paid At'],
      filteredInvoices.map(i => [i.id, i.user, i.reason, i.amount, i.status, i.dueDate, i.paidAt || '-'])
    );
  };

  const handleExportTransactions = () => {
    exportToCSV('finance_transaction_report',
      ['Transaction ID', 'User', 'Asset', 'Action', 'Amount', 'Date', 'Status'],
      filteredTransactions.map(t => [t.id, t.party, t.asset, t.action, t.amount, t.date, t.status])
    );
  };

  return (
    <div className="space-y-8">
      {/* Invoice / Fine Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Invoice & Fine Report</h3>
            <p className="text-sm text-slate-500 mt-1">All invoices with payment status and amounts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                placeholder="Search user, ID..."
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all placeholder-slate-400"
              />
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <select
                value={invStatusFilter}
                onChange={(e) => setInvStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
              <input
                type="date"
                value={invStart}
                onChange={(e) => setInvStart(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</span>
              <input
                type="date"
                value={invEnd}
                onChange={(e) => setInvEnd(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>

            <div className="flex items-end h-full xl:self-end pt-4 xl:pt-0">
              <button
                onClick={handleExportInvoices}
                disabled={filteredInvoices.length === 0}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No invoices found.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">Invoice ID</th>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Reason</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentInvoices.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{i.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{i.user}</td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{i.reason}</td>
                      <td className="p-4 text-sm font-bold text-right text-[#B91C1C]">{i.amount}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          i._status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-red-50 text-[#B91C1C] border-red-200'
                        }`}>{i.status}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{i.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={invPage}
                totalItems={totalInv}
                itemsPerPage={itemsPerPage}
                onPageChange={setInvPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Transaction Ledger Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Transaction Ledger Report</h3>
            <p className="text-sm text-slate-500 mt-1">Complete financial transaction history.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search party, asset..."
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
                    <th className="p-4 font-semibold text-right">Amount</th>
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
                      <td className="p-4 text-sm font-bold text-right text-slate-700">{t.amount}</td>
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
    </div>
  );
};

export default FinanceReports;