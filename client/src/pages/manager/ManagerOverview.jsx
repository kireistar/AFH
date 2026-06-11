import React from 'react';
import { 
  FiCheckSquare, 
  FiBox, 
  FiAlertCircle, 
  FiShield, 
  FiFileText 
} from 'react-icons/fi';

const ManagerOverview = ({ metrics }) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Pending Approvals</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.pendingApprovals}</p>
            <div className="mt-4 text-xs text-orange-600 font-semibold">High Risk Requests</div>
          </div>
          <div className="hidden lg:block p-3 bg-orange-50 text-orange-600 rounded-xl">
            <FiCheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Total Active Assets */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Total Active Assets</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.activeAssets}</p>
            <div className="mt-4 text-xs text-slate-400 font-medium">Across all departments</div>
          </div>
          <div className="hidden lg:block p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FiBox className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Incidents */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Monthly Incidents</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{metrics.monthlyIncidents}</p>
            <div className="mt-4 text-xs text-emerald-600 font-semibold">▼ -1 from last month</div>
          </div>
          <div className="hidden lg:block p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FiAlertCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Manager Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button className="flex-1 py-4 px-6 bg-linear-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5 group cursor-pointer text-center">
            <FiCheckSquare className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span>Review Pending Requests</span>
          </button>
          
          <button className="flex-1 py-4 px-6 bg-linear-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5 group cursor-pointer text-center">
            <FiShield className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span>View Risk Analytics</span>
          </button>
          
          <button className="flex-1 py-4 px-6 bg-linear-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5 group cursor-pointer text-center">
            <FiFileText className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span>Generate Executive Report</span>
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default ManagerOverview;