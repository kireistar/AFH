import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import UserAssets from './UserAssets';
import UserRequests from './UserRequests';
import UserIncidents from './UserIncidents';
// Import komponen Modal yang telah kamu buat
import NewRequestModal from './NewRequestModal';
import ReportIncidentModal from './ReportIncidentModal';
import { FiPlusCircle, FiAlertCircle } from 'react-icons/fi';

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
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100/60 bg-linear-to-b from-white to-blue-50/20 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FiPlusCircle className="w-5 h-5" /></span>
                  Need a Device for Work?
                </h3>
                <p className="text-slate-500 text-sm mt-4 leading-relaxed">
                  Submit an automated application for laptops, peripherals, or hardware infrastructure. 
                  Our system evaluates risk scoring instantaneously.
                </p>
              </div>
              <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="mt-8 w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiPlusCircle className="w-4 h-4" />
                Request Asset Now
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100/60 bg-linear-to-b from-white to-rose-50/20 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-lg"><FiAlertCircle className="w-5 h-5" /></span>
                  Found Hardware Issues?
                </h3>
                <p className="text-slate-500 text-sm mt-4 leading-relaxed">
                  Report immediate device breakdowns, accidental asset damages, or hardware malfunctions to prevent processing penalization.
                </p>
              </div>
              <button 
                onClick={() => setIsIncidentModalOpen(true)}
                className="mt-8 w-full py-3.5 bg-linear-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-500/10 hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiAlertCircle className="w-4 h-4" />
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

      {/* Komponen Modal yang Terintegrasi Penuh */}
      <NewRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
      
      <ReportIncidentModal 
        isOpen={isIncidentModalOpen} 
        onClose={() => setIsIncidentModalOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default UserDashboard;