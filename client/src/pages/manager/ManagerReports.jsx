import React from 'react';

const ManagerReports = () => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Executive Reports</h3>
      <p className="text-sm text-slate-500">Generate analytics and operational efficiency reports.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-slate-200 rounded-xl hover:border-[#1E3A8A] transition-colors cursor-pointer group">
          <h4 className="font-bold text-slate-800 group-hover:text-[#1E3A8A]">Asset Utilization Report</h4>
          <p className="text-xs text-slate-500 mt-2">Export comprehensive data on asset usage across departments.</p>
          <button className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold group-hover:bg-[#1E3A8A] group-hover:text-white transition-all">Download PDF</button>
        </div>
        <div className="p-6 border border-slate-200 rounded-xl hover:border-[#1E3A8A] transition-colors cursor-pointer group">
          <h4 className="font-bold text-slate-800 group-hover:text-[#1E3A8A]">Incident & Risk Analysis</h4>
          <p className="text-xs text-slate-500 mt-2">View trends in asset damages and AI escalation accuracy.</p>
          <button className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold group-hover:bg-[#1E3A8A] group-hover:text-white transition-all">Download CSV</button>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;