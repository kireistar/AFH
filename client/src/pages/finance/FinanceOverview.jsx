import React from 'react';

const FinanceOverview = ({ financeStats = {}, recentTransactions = [], alerts = [], onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Total Collected Fines</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{financeStats.collectedFines}</p>
          <div className="mt-4 text-xs text-emerald-600 font-semibold">
            {financeStats.paidCount} invoice{financeStats.paidCount !== 1 ? 's' : ''} paid
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Unpaid Invoices</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{financeStats.unpaidFines}</p>
          <div className="mt-4 text-xs text-orange-600 font-medium">Awaiting payment processing</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Outstanding Amount</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{financeStats.outstandingAmount}</p>
          <div className="mt-4 text-xs text-[#B91C1C] font-semibold">
            {financeStats.unpaidFines > 0 ? 'Action required' : 'All cleared'}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Quick Access</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => onNavigate?.('Fines')} className="flex-1 min-w-[150px] py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer">
            Manage Fines
          </button>
          <button onClick={() => onNavigate?.('Payments')} className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer">
            Payment History
          </button>
          <button onClick={() => onNavigate?.('Reports')} className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer">
            Financial Report
          </button>
        </div>
      </div>

      {/* Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Invoices</h3>
            <button onClick={() => onNavigate?.('Invoices')} className="text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer">View All</button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No invoices yet.</p>
              ) : recentTransactions.map((trx) => (
                <div key={trx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${trx.type === 'Income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{trx.description}</p>
                      <p className="text-xs text-slate-400">{trx.user} • {trx.type === 'Income' ? 'Paid' : 'Unpaid'}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${trx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Financial Alerts</h3>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-400">No active alerts.</p>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-xl border-l-4 ${alert.urgency === 'High' ? 'bg-red-50 border-[#B91C1C]' : 'bg-orange-50 border-orange-500'}`}>
                    <p className="text-xs font-bold text-slate-800">{alert.type}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;