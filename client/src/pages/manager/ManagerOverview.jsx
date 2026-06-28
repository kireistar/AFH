import React from 'react';

const ManagerOverview = ({ metrics = {}, setActiveTab }) => {
  const getIncidentDiffText = () => {
    const diff = metrics.incidentDiff || 0;
    if (diff > 0) {
      return (
        <span className="text-rose-600 font-semibold">
          ▲ +{diff} <span className="text-slate-400 font-normal ml-1">from last month</span>
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="text-emerald-600 font-semibold">
          ▼ {diff} <span className="text-slate-400 font-normal ml-1">from last month</span>
        </span>
      );
    } else {
      return (
        <span className="text-slate-400 font-semibold">
          No change <span className="text-slate-400 font-normal ml-1">from last month</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Pending Approvals</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.pendingApprovals}</p>
          <div className="mt-4 text-xs text-orange-655 font-semibold">High Risk Requests</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Total Active Assets</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.activeAssets}</p>
          <div className="mt-4 text-xs text-slate-400 font-medium">Across all departments</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Monthly Incidents</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.monthlyIncidents}</p>
          <div className="mt-4 text-xs">
            {getIncidentDiffText()}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Manager Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveTab('Approvals')}
            className="flex-1 min-w-[150px] py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer"
          >
            Review Pending Requests
          </button>
          <button 
            onClick={() => setActiveTab('Risk Assessment')}
            className="flex-1 min-w-[150px] py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer"
          >
            View Risk Analytics
          </button>
          <button 
            onClick={() => setActiveTab('Reports')}
            className="flex-1 min-w-[150px] py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer"
          >
            Generate Executive Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerOverview;