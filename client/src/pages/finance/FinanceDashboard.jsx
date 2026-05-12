import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import FinanceInvoices from './FinanceInvoices';
import FinanceFines from './FinanceFines';
import FinancePayments from './FinancePayments';
import FinanceReports from './FinanceReports';

function FinanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
          Capstone IT
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/finance')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/finance' || currentPath === '/finance/' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/finance/invoices')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/finance/invoices' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Invoice
          </button>
          <button 
            onClick={() => navigate('/finance/payments')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/finance/payments' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Payments
          </button>
          <button 
            onClick={() => navigate('/finance/fines')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/finance/fines' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Fine Verification
          </button>
          <button 
            onClick={() => navigate('/finance/reports')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/finance/reports' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Reports
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
          Logged in as: <span className="text-white">Finance</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
          <h1 className="text-xl font-semibold text-gray-700">
            {currentPath === '/finance' || currentPath === '/finance/' ? 'Overview' : 
             currentPath === '/finance/invoices' ? 'Invoices' : 
             currentPath === '/finance/payments' ? 'Payments' : 
             currentPath === '/finance/fines' ? 'Fine Verification' : 
             currentPath === '/finance/reports' ? 'Finance Reports' : 'Page'}
          </h1>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
            Logout
          </button>
        </header>

        {/* CONTENT ROUTES */}
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/invoices" element={<FinanceInvoices />} />
          <Route path="/payments" element={<FinancePayments />} />
          <Route path="/fines" element={<FinanceFines />} />
          <Route path="/reports" element={<FinanceReports />} />
        </Routes>
      </main>
    </div>
  );
}

// DASHBOARD OVERVIEW (Diletakkan di dalam file yang sama)
function DashboardOverview() {
  return (
    <section className="p-8 overflow-y-auto">
      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-800">Rp 125.5M</p>
          <p className="text-xs text-gray-400 mt-2">This Month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Outstanding</p>
          <p className="text-3xl font-bold text-gray-800">Rp 18.2M</p>
          <p className="text-xs text-gray-400 mt-2">Pending Collection</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Processed Fines</p>
          <p className="text-3xl font-bold text-gray-800">47</p>
          <p className="text-xs text-gray-400 mt-2">This Month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Pending Verification</p>
          <p className="text-3xl font-bold text-gray-800">12</p>
          <p className="text-xs text-gray-400 mt-2">Awaiting Review</p>
        </div>
      </div>

      {/* FINE VERIFICATION QUEUE PREVIEW */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Fine Verification Queue
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Fine Amount</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-4">Alden Sayidina</td>
              <td className="p-4">Rp 500.000</td>
              <td className="p-4">Late Return (3 Days)</td>
              <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Pending</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RECENT INVOICES PREVIEW */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Recent Payment Reports
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Invoice ID</th>
              <th className="p-4">Employee</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-4 font-semibold">INV-2026-001</td>
              <td className="p-4">Ahmad Sidiq</td>
              <td className="p-4">Rp 500.000</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Paid</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default FinanceDashboard;