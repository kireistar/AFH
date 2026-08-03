import React from 'react';
import { exportToCSV } from '../../utils/exportCSV';

const FinanceReports = ({ invoices = [], transactions = [] }) => {
  const borrowerLabel = (trx) => {
    const borrower = trx.borrower || trx.party;
    if (!borrower) return '-';
    if (typeof borrower === 'object') {
      return borrower.employee_name || borrower.name || 'User';
    }
    return String(borrower);
  };

  const assetLabel = (trx) => {
    if (!trx.asset) return '-';
    if (typeof trx.asset === 'object') {
      return trx.asset.asset_name || trx.asset.name || 'Asset';
    }
    return String(trx.asset);
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '-';
    try {
      return new Date(dtStr).toLocaleString();
    } catch {
      return String(dtStr);
    }
  };

  const amountLabel = (trx) => {
    const val = trx.amount || trx.fine_amount;
    if (!val) return '-';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const handleExportInvoices = () => {
    exportToCSV('finance_invoice_report',
      ['Invoice ID', 'User', 'Reason', 'Amount', 'Status', 'Due Date', 'Paid At'],
      invoices.map(i => [i.id, i.user, i.reason, i.amount, i.status, i.dueDate, i.paidAt || '-'])
    );
  };

  const handleExportTransactions = () => {
    exportToCSV('finance_transaction_report',
      ['Transaction ID', 'User', 'Asset', 'Action', 'Amount', 'Date', 'Status'],
      transactions.map(t => [t.id, borrowerLabel(t), assetLabel(t), t.action, amountLabel(t), formatDateTime(t.occurred_at || t.created_at), t.status])
    );
  };

  return (
    <div className="space-y-8">
      {/* Invoice / Fine Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Invoice & Fine Report</h3>
            <p className="text-sm text-slate-500 mt-1">All invoices with payment status and amounts.</p>
          </div>
          <button
            onClick={handleExportInvoices}
            disabled={invoices.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No invoices found.</div>
          ) : (
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
                {invoices.map(i => (
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
          )}
        </div>
      </div>

      {/* Transaction Ledger Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Transaction Ledger Report</h3>
            <p className="text-sm text-slate-500 mt-1">Complete financial transaction history.</p>
          </div>
          <button
            onClick={handleExportTransactions}
            disabled={transactions.length === 0}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
          ) : (
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
                {transactions.map((t, rowIdx) => {
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                  return (
                    <tr key={t.id} className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{t.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{borrowerLabel(t)}</td>
                      <td className="p-4 text-sm text-slate-600">{assetLabel(t)}</td>
                      <td className="p-4 text-sm text-slate-600">{t.action}</td>
                      <td className="p-4 text-sm font-bold text-right text-slate-700">{amountLabel(t)}</td>
                      <td className="p-4 text-sm text-slate-500">{formatDateTime(t.occurred_at || t.created_at)}</td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {t.status}
                        </span>
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

export default FinanceReports;