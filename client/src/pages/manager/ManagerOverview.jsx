import React from 'react';

const ManagerOverview = ({ metrics }) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Pending Approvals</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.pendingApprovals}</p>
          <div className="mt-4 text-xs text-orange-600 font-semibold">High Risk Requests</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Total Active Assets</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.activeAssets}</p>
          <div className="mt-4 text-xs text-slate-400 font-medium">Across all departments</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Monthly Incidents</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.monthlyIncidents}</p>
          <div className="mt-4 text-xs text-emerald-600 font-semibold">▼ -1 from last month</div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Manager Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center">
            Review Pending Requests
          </button>
          <button className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center">
            View Risk Analytics
          </button>
          <button className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center">
            Generate Executive Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerOverview;