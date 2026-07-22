import React from 'react';

/**
 * Helper function to safely extract string values from populated backend objects.
 * Prevents React "Objects are not valid as a React child" errors.
 */
const renderSafeString = (val) => {
  if (!val) return 'Unknown';
  if (typeof val === 'object') {
    return val.employee_name || val.username || val.full_name || val.asset_name || val.asset_code || 'Unknown';
  }
  return String(val);
};

const AdminOverview = ({
  assetStats,
  pendingHandoverCount,
  recentActivities,
  systemAlerts,
  activeIncidentCount,
  onAddAssetClick
}) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Total Assets</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{assetStats?.total || 0}</p>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold">
            ▲ +12% <span className="text-slate-400 font-normal ml-1">from last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Pending Handovers</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{pendingHandoverCount || 0}</p>
          <div className="mt-4 text-xs text-slate-400 font-medium">Ready for physical handover</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium">Active Incidents</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{activeIncidentCount || 0}</p>
          <div className="mt-4 text-xs text-slate-400 font-medium">Open & investigating</div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Quick Access</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex-1 min-w-[150px] py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer">
            Scan Handover QR
          </button>
          <button
            onClick={onAddAssetClick}
            className="flex-1 min-w-[150px] py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center cursor-pointer"
          >
            Add New Asset
          </button>
        </div>
      </div>

      {/* Logs & Status Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Activities</h3>
            <button className="text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer">See All</button>
          </div>
          <div className="p-4">
            {!recentActivities || recentActivities.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No recent activities.</div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id || Math.random()} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${act.status === 'Declined' ? 'bg-[#B91C1C]' : 'bg-emerald-500'}`}></div>
                      <div>
                        {/* SAFE RENDERING APPLIED HERE */}
                        <p className="text-sm font-bold text-slate-800">
                          {renderSafeString(act.user)} <span className="font-normal text-slate-500">{act.action}</span> {renderSafeString(act.asset)}
                        </p>
                        <p className="text-xs text-slate-400">{act.time || act.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Alerts */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-600 uppercase">Available</span>
                  <span>{assetStats?.available || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#1E3A8A] uppercase">Borrowed</span>
                  <span>{assetStats?.borrowed || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#B91C1C] uppercase">Maintenance</span>
                  <span>{assetStats?.maintenance || 0}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 uppercase">Total Assets</span>
                  <span>{assetStats?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">System Alerts</h3>
            <div className="space-y-3">
              {!systemAlerts || systemAlerts.length === 0 ? (
                <p className="text-sm text-slate-400">No active alerts.</p>
              ) : (
                systemAlerts.map(alert => (
                  <div key={alert.id || Math.random()} className={`p-3 rounded-xl border-l-4 ${alert.urgency === 'High' ? 'bg-red-50 border-[#B91C1C]' : 'bg-orange-50 border-orange-500'}`}>
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

export default AdminOverview;
