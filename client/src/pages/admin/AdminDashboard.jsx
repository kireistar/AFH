import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import { useAuth } from '../../hooks/useAuth';
import useAssets from '../../hooks/useAssets';
import useUsers from '../../hooks/useUsers';
import useRequests from '../../hooks/useRequests';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();

  const { assets, loading: loadingAssets } = useAssets();
  const { users, loading: loadingUsers } = useUsers();
  // Request yang sudah approved dan siap dihandover
  const { requests: handovers, loading: loadingHandovers, refresh: refreshHandovers } = useRequests('all', 'approved');

  // Hitung stats dari real data
  const assetStats = {
    available: assets.filter(a => a.status === 'Available').length,
    borrowed: assets.filter(a => a.status === 'Borrowed').length,
    maintenance: assets.filter(a => a.status === 'Maintenance').length,
    total: assets.length,
  };

  const pendingHandoverCount = handovers.length;

  const adminProfile = {
    name: user?.employee_name || 'Administrator',
    subTitle: user?.department || 'Admin',
    email: user?.email || '',
    avatarLetter: (user?.employee_name || 'A')[0].toUpperCase(),
  };

  const adminMenuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Assets', badge: null },
    { name: 'Handover', badge: pendingHandoverCount > 0 ? `${pendingHandoverCount} Pending` : null, badgeColor: 'bg-blue-100 text-[#1E3A8A]' },
    { name: 'Users', badge: null },
    { name: 'Reports', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <AdminOverview assetStats={assetStats} pendingHandoverCount={pendingHandoverCount} recentActivities={[]} systemAlerts={[]} />;
      case 'Assets':
        return <AdminAssets assets={assets} loading={loadingAssets} />;
      case 'Handover':
        return <AdminHandover handovers={handovers} loading={loadingHandovers} onRefresh={refreshHandovers} />;
      case 'Users':
        return <AdminUsers users={users} loading={loadingUsers} />;
      case 'Reports':
        return <AdminReports />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      roleTitle="Admin"
      menuItems={adminMenuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userProfile={adminProfile}
      pageHeaderTitle={activeTab === 'Dashboard' ? 'SYSTEM OVERVIEW' : `${activeTab.toUpperCase()} MANAGEMENT`}
      pageHeaderSubtitle={activeTab === 'Dashboard' ? 'Monitor company asset operations in real-time.' : `Manage your ${activeTab.toLowerCase()} database here.`}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;