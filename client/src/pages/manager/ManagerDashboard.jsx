import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ManagerOverview from './ManagerOverview';
import ManagerApprovals from './ManagerApprovals';
import ManagerRiskAssessment from './ManagerRiskAssessment';
import ManagerReports from './ManagerReports';

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const getLinkClass = (path) => {
    const isActive = currentPath === path || (path === '/manager' && currentPath === '/manager/');
    return `w-full flex items-center justify-between px-4 py-2.5 transition-all border-l-4 rounded-r-xl ${
      isActive 
        ? 'bg-blue-50/50 border-[#1E3A8A] text-[#1E3A8A] font-semibold' 
        : 'border-transparent text-slate-500 hover:bg-slate-50'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span className="text-[#B91C1C]">AFH</span>
            <span className="text-[#1E3A8A]">Manager</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-6 overflow-y-auto">
          <div>
            <p className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Menu Utama</p>
            <div className="space-y-1">
              <button onClick={() => navigate('/manager')} className={getLinkClass('/manager')}>
                <span>Dashboard</span>
              </button>
              <button onClick={() => navigate('/manager/approvals')} className={getLinkClass('/manager/approvals')}>
                <span>Approvals</span>
              </button>
              <button onClick={() => navigate('/manager/risk-assessment')} className={getLinkClass('/manager/risk-assessment')}>
                <span>Risk Assessment</span>
              </button>
              <button onClick={() => navigate('/manager/reports')} className={getLinkClass('/manager/reports')}>
                <span>Reports</span>
              </button>
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <input type="text" placeholder="Cari laporan, persetujuan..." className="w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" />
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">
              Notifikasi <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Management Dept</p>
                <p className="text-[10px] font-bold text-[#1E3A8A] uppercase">Manager</p>
              </div>
              <div className="w-10 h-10 bg-[#1E3A8A] text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-lg border-2 border-white">M</div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {currentPath === '/manager' || currentPath === '/manager/' ? 'MANAGER DASHBOARD' : 
               currentPath === '/manager/approvals' ? 'HIGH-RISK APPROVALS' : 
               currentPath === '/manager/risk-assessment' ? 'RISK ASSESSMENT' : 
               currentPath === '/manager/reports' ? 'REPORTS & ANALYTICS' : 'PAGE'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">Tinjau persetujuan, analisis risiko, dan laporan departemen.</p>
          </div>
          <Routes>
            <Route path="/" element={<ManagerOverview />} />
            <Route path="/approvals" element={<ManagerApprovals />} />
            <Route path="/risk-assessment" element={<ManagerRiskAssessment />} />
            <Route path="/reports" element={<ManagerReports />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;