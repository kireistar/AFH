import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import UserAssets from './UserAssets';
import UserRequests from './UserRequests';
import UserIncidents from './UserIncidents';
import UserReceipts from './UserReceipts';
// Import komponen Modal
import NewRequestModal from './NewRequestModal';
import ReportIncidentModal from './ReportIncidentModal';
import { useAuth } from '../../hooks/useAuth';
import useRequests from '../../hooks/useRequests';
import useIncidents from '../../hooks/useIncidents';
import useMyTransactions from '../../hooks/useMyTransactions';
import useDashboardRoute from '../../hooks/useDashboardRoute';
import usePageMeta from '../../hooks/usePageMeta';

const USER_TABS = ['Dashboard', 'Assets', 'Requests', 'Receipts', 'Incidents'];

const USER_META = {
  Dashboard: { title: 'AFH — Employee Portal', description: 'Manage your corporate devices and submit asset forms securely.' },
  Assets: { title: 'AFH — My Assets', description: 'View the assets currently assigned to you.' },
  Requests: { title: 'AFH — My Requests', description: 'Track and monitor the evaluation status of your asset applications.' },
  Receipts: { title: 'AFH — My Receipts', description: 'Digital receipts for every asset handover, recorded immutably on the SHA-256 ledger.' },
  Incidents: { title: 'AFH — My Incidents', description: 'Report and track device damages and malfunctions.' },
};

const UserDashboard = () => {
  const { activeTab, setActiveTab } = useDashboardRoute('/user', USER_TABS);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const { user } = useAuth();

  usePageMeta(USER_META[activeTab] || USER_META.Dashboard);

  // Fetch user requests
  const { requests, loading, refresh } = useRequests('mine');

  const { incidents, loading: incidentsLoading, refresh: refreshIncidents } = useIncidents();

  const { transactions: myTransactions, loading: myTransactionsLoading } = useMyTransactions(user?.id);

  // Profile metadata for Employee
  const userProfile = {
    name: user?.employee_name || 'User',
    subTitle: user?.department || '',
    email: user?.email || '',
    avatarLetter: (user?.employee_name || 'U')[0].toUpperCase(),
  };

  // Flat sidebar menu items for Employee Portal
  // Flat sidebar menu items for Employee Portal
  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Assets', badge: null },
    { name: 'Requests', badge: null },
    { name: 'Receipts', badge: null },
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
                  Report immediate device breakdowns, accidental asset damages, or hardware malfunctions.
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
        return <UserAssets requests={requests} loading={loading} />;
      case 'Requests':
        return <UserRequests requests={requests} loading={loading} onOpenRequestModal={() => setIsRequestModalOpen(true)} onRefresh={refresh} />;
      case 'Receipts':
        return <UserReceipts receipts={myTransactions} loading={myTransactionsLoading} />;
      case 'Incidents':
        return <UserIncidents incidents={incidents} loading={incidentsLoading} onOpenIncidentModal={() => setIsIncidentModalOpen(true)} />;
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
      <NewRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={refresh}  // refresh list setelah submit berhasil
      />
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSuccess={refreshIncidents}
        requests={requests}
        requestsLoading={loading}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;