import React from 'react';
import { 
  FiTrendingUp, 
  FiFileText, 
  FiAlertCircle, 
  FiCreditCard 
} from 'react-icons/fi';

const FinanceOverview = ({ financeStats, recentTransactions, alerts }) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Collected Fines */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Total Collected Fines</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{financeStats.collectedFines}</p>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold">
              ▲ +5% <span className="text-slate-400 font-normal ml-1">from last month</span>
            </div>
          </div>
          <div className="hidden lg:block p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiTrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Pending Invoices</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{financeStats.pendingInvoices}</p>
            <div className="mt-4 text-xs text-orange-600 font-medium">Awaiting payment processing</div>
          </div>
          <div className="hidden lg:block p-3 bg-orange-50 text-orange-600 rounded-xl">
            <FiFileText className="w-6 h-6" />
          </div>
        </div>

        {/* Unpaid Fines */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Unpaid Fines</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{financeStats.unpaidFines}</p>
            <div className="mt-4 text-xs text-rose-600 font-semibold">
              Action required
            </div>
          </div>
          <div className="hidden lg:block p-3 bg-rose-50 text-rose-600 rounded-xl">
            <FiAlertCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button className="flex-1 py-4 px-6 bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5 group cursor-pointer text-center">
            <FiFileText className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span>Create Invoice</span>
          </button>
          
          <button className="flex-1 py-4 px-6 bg-linear-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5 group cursor-pointer text-center">
            <FiCreditCard className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span>Record Payment</span>
          </button>
          
          <button className="flex-1 py-4 px-6 bg-linear-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5 group cursor-pointer text-center">
            <FiTrendingUp className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span>Financial Report</span>
          </button>
          
        </div>
      </div>

      {/* Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentTransactions.map((trx) => (
                <div key={trx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${trx.type === 'Income' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{trx.description}</p>
                      <p className="text-xs text-slate-400">{trx.user} • {trx.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${trx.type === 'Income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {trx.type === 'Income' ? '+' : ''}{trx.amount}
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
              {alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-xl border-l-4 ${alert.urgency === 'High' ? 'bg-red-50 border-[#B91C1C]' : 'bg-orange-50 border-orange-500'}`}>
                  <p className="text-xs font-bold text-slate-800">{alert.type}</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;