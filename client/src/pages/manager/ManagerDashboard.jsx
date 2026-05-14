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

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
          Capstone IT
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/manager')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/manager' || currentPath === '/manager/' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/manager/approvals')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/manager/approvals' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Approvals
          </button>
          <button 
            onClick={() => navigate('/manager/risk-assessment')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/manager/risk-assessment' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Risk Assessment
          </button>
          <button 
            onClick={() => navigate('/manager/reports')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/manager/reports' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Reports
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
          Logged in as: <span className="text-white">Manager</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
          <h1 className="text-xl font-semibold text-gray-700">
            {currentPath === '/manager' || currentPath === '/manager/' ? 'Dashboard' : currentPath === '/manager/approvals' ? 'High-Risk Approvals' : currentPath === '/manager/risk-assessment' ? 'Risk Assessment' : currentPath === '/manager/reports' ? 'Reports & Analytics' : 'Page'}
          </h1>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
            Logout
          </button>
        </header>

        {/* CONTENT ROUTES */}
        <Routes>
          <Route path="/" element={<ManagerOverview />} />
          <Route path="/approvals" element={<ManagerApprovals />} />
          <Route path="/risk-assessment" element={<ManagerRiskAssessment />} />
          <Route path="/reports" element={<ManagerReports />} />
        </Routes>
      </main>
    </div>
  );
}

export default ManagerDashboard;