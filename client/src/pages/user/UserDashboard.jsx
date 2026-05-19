import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import UserAssets from './UserAssets';
import UserRequests from './UserRequests';
import UserIncidents from './UserIncidents';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Profile metadata for Employee
  const userProfile = {
    name: 'Budi Santoso',
    subTitle: 'IT Engineering Staff',
    email: 'budi.santoso@president.ac.id',
    avatarLetter: 'B'
  };

  // Flat sidebar menu items for Employee Portal
  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Assets', badge: null },
    { name: 'Requests', badge: null },
    { name: 'Incidents', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Need a Device for Work?</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Submit an automated application for laptops, peripherals, or hardware infrastructure. 
                  Our system evaluates risk scoring instantaneously.
                </p>
              </div>
              <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="mt-6 w-full py-3 bg-[#1E3A8A] text-white font-bold rounded-xl text-sm hover:bg-blue-900 transition-all text-center"
              >
                Request Asset Now
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Found Hardware Issues?</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Report immediate device breakdowns, accidental asset damages, or hardware malfunctions to prevent processing penalization.
                </p>
              </div>
              <button 
                onClick={() => setIsIncidentModalOpen(true)}
                className="mt-6 w-full py-3 bg-[#B91C1C] text-white font-bold rounded-xl text-sm hover:bg-red-800 transition-all text-center"
              >
                Report Broken Device
              </button>
            </div>
          </div>
        );
      case 'Assets': 
        return <UserAssets />;
      case 'Requests': 
        return <UserRequests onOpenRequestModal={() => setIsRequestModalOpen(true)} />;
      case 'Incidents': 
        return <UserIncidents onOpenIncidentModal={() => setIsIncidentModalOpen(true)} />;
      default: 
        return null;
    }
  };

  return (
    <DashboardLayout
      roleTitle="Portal"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userProfile={userProfile}
      pageHeaderTitle={activeTab === 'Dashboard' ? 'EMPLOYEE PORTAL' : `MY ${activeTab.toUpperCase()}`}
      pageHeaderSubtitle={activeTab === 'Dashboard' ? 'Manage your corporate devices and submit asset forms securely.' : `View status of your current ${activeTab.toLowerCase()}.`}
    >
      {renderContent()}

      {/* Placeholder binding slots for modal components */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h4 className="text-lg font-bold text-slate-800">New Request Application</h4>
            <p className="text-slate-500 text-xs mt-1">Simulated modal connection for NewRequestModal.</p>
            <button onClick={() => setIsRequestModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200">Close Window</button>
          </div>
        </div>
      )}

      {isIncidentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h4 className="text-lg font-bold text-slate-800">Report System Incident</h4>
            <p className="text-slate-500 text-xs mt-1">Simulated modal connection for ReportIncidentModal.</p>
            <button onClick={() => setIsIncidentModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200">Close Window</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;