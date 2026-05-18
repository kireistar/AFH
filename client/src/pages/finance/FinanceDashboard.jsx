import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import FinanceInvoices from './FinanceInvoices';
import FinanceFines from './FinanceFines';
import FinancePayments from './FinancePayments';
import FinanceReports from './FinanceReports';

function FinanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (path) => {
    const isActive = currentPath === path || (path === '/finance' && currentPath === '/finance/');
    return `w-full flex items-center justify-between px-4 py-3 md:py-2.5 transition-all border-l-4 rounded-r-xl ${
      isActive 
        ? 'bg-blue-50/50 border-[#1E3A8A] text-[#1E3A8A] font-semibold' 
        : 'border-transparent text-slate-500 hover:bg-slate-50'
    }`;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 md:p-8 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span className="text-[#B91C1C]">AFH</span>
            <span className="text-[#1E3A8A]">Finance</span>
          </h1>
          <button className="md:hidden text-slate-500 hover:text-slate-800 p-2" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        <nav className="flex-1 px-4 mt-4 md:mt-6 space-y-6 overflow-y-auto">
          <div>
            <p className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Menu Utama</p>
            <div className="space-y-1">
              <button onClick={() => handleNavigation('/finance')} className={getLinkClass('/finance')}><span>Dashboard</span></button>
              <button onClick={() => handleNavigation('/finance/invoices')} className={getLinkClass('/finance/invoices')}><span>Invoices</span></button>
              <button onClick={() => handleNavigation('/finance/payments')} className={getLinkClass('/finance/payments')}><span>Payments</span></button>
              <button onClick={() => handleNavigation('/finance/fines')} className={getLinkClass('/finance/fines')}><span>Fine Verification</span></button>
              <button onClick={() => handleNavigation('/finance/reports')} className={getLinkClass('/finance/reports')}><span>Reports</span></button>
            </div>
          </div>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100">
          <button className="w-full text-left px-4 py-3 font-medium text-[#B91C1C] hover:bg-red-50 rounded-xl transition-colors text-sm uppercase tracking-widest font-black">
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center flex-1">
            <button className="mr-4 md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <input type="text" placeholder="Cari invoice..." className="hidden sm:block w-48 md:w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" />
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative cursor-pointer text-xs md:text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">
              <span className="hidden sm:inline">Notifikasi</span>
              <span className="sm:hidden">🔔</span>
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Finance Dept</p>
                <p className="text-[10px] font-bold text-[#1E3A8A] uppercase">Officer</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#1E3A8A] text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-sm md:text-lg border-2 border-white">F</div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {currentPath === '/finance' || currentPath === '/finance/' ? 'FINANCE OVERVIEW' : 
               currentPath === '/finance/invoices' ? 'MANAJEMEN INVOICES' : 
               currentPath === '/finance/payments' ? 'MANAJEMEN PAYMENTS' : 
               currentPath === '/finance/fines' ? 'VERIFIKASI DENDA' : 
               currentPath === '/finance/reports' ? 'LAPORAN KEUANGAN' : 'PAGE'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">Pantau arus kas dan verifikasi denda operasional aset.</p>
          </div>
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/invoices" element={<FinanceInvoices />} />
            <Route path="/payments" element={<FinancePayments />} />
            <Route path="/fines" element={<FinanceFines />} />
            <Route path="/reports" element={<FinanceReports />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

// DASHBOARD OVERVIEW 
function DashboardOverview() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-black text-slate-800">Rp 125.5M</p>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-2xl md:text-3xl font-black text-[#B91C1C]">Rp 18.2M</p>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Processed Fines</p>
          <p className="text-2xl md:text-3xl font-black text-[#1E3A8A]">47</p>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Review</p>
          <p className="text-2xl md:text-3xl font-black text-yellow-600">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* FINE VERIFICATION QUEUE PREVIEW */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100 font-bold text-slate-800 text-sm md:text-base">
            Fine Verification Queue
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3 md:p-4">Employee</th>
                  <th className="p-3 md:p-4">Amount</th>
                  <th className="p-3 md:p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-xs md:text-sm divide-y divide-slate-50">
                <tr>
                  <td className="p-3 md:p-4 font-medium">Alden Sayidina</td>
                  <td className="p-3 md:p-4">Rp 500.000</td>
                  <td className="p-3 md:p-4"><span className="bg-yellow-50 text-yellow-700 px-2 py-1 md:px-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT INVOICES PREVIEW */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100 font-bold text-slate-800 text-sm md:text-base">
            Recent Payment Reports
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3 md:p-4">Invoice ID</th>
                  <th className="p-3 md:p-4">Employee</th>
                  <th className="p-3 md:p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-xs md:text-sm divide-y divide-slate-50">
                <tr>
                  <td className="p-3 md:p-4 font-bold text-[#1E3A8A]">INV-2026-001</td>
                  <td className="p-3 md:p-4 font-medium">Ahmad Sidiq</td>
                  <td className="p-3 md:p-4"><span className="bg-green-50 text-green-700 px-2 py-1 md:px-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;