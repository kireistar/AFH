import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // --- MOCKUP DATA ---
  const assetStats = { available: 85, borrowed: 30, maintenance: 9, total: 124 };
  const [handovers, setHandovers] = useState([{ id: 'HND-001', user: 'Budi Santoso', department: 'IT', asset: 'MacBook Pro M2', approvedBy: 'AI (Low Risk)', status: 'Pending Handover' }]);
  const [assets] = useState([{ id: 'AST-101', name: 'MacBook Pro M2', category: 'Laptop', condition: 'Good', status: 'Available' }]);
  const [users] = useState([{ id: 'USR-01', name: 'Budi Santoso', email: 'budi@afh.com', department: 'IT', status: 'Active' }]);
  const [reports] = useState([{ id: 'REP-001', user: 'Budi Santoso', asset: 'Wireless Mouse', returnDate: 'Oct 28, 2023', condition: 'Good', late: 'No', fine: 'Rp 0' }]);
  const recentActivities = [{ id: 1, user: 'Budi Santoso', action: 'returned', asset: 'Wireless Mouse', time: '10 mins ago', status: 'Success' }];
  const systemAlerts = [{ id: 1, type: 'Overdue', message: 'Epson Projector has not been returned', urgency: 'High' }];

  const pendingHandoverCount = handovers.filter(h => h.status === 'Pending Handover').length;

  const handleCompleteHandover = (id) => {
    if (window.confirm("Confirm asset handover to user?")) {
      setHandovers(handovers.map(h => h.id === id ? { ...h, status: 'Handed Over' } : h));
    }
  };

  // Konfigurasi Profile khusus Admin
  const adminProfile = {
    name: 'Administrator',
    subTitle: 'Super Admin',
    email: 'admin@afh.com',
    avatarLetter: 'A'
  };

  // Menu List khusus Admin
  const adminMenuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Assets', badge: null },
    { name: 'Handover', badge: pendingHandoverCount > 0 ? `${pendingHandoverCount} Pending` : null, badgeColor: 'bg-blue-100 text-[#1E3A8A]' },
    { name: 'Users', badge: null },
    { name: 'Reports', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <AdminOverview assetStats={assetStats} pendingHandoverCount={pendingHandoverCount} recentActivities={recentActivities} systemAlerts={systemAlerts} />;
      case 'Assets': return <AdminAssets assets={assets} />;
      case 'Handover': return <AdminHandover handovers={handovers} handleCompleteHandover={handleCompleteHandover} />;
      case 'Users': return <AdminUsers users={users} />;
      case 'Reports': return <AdminReports reports={reports} />;
      default: return null;
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
      {/* Isi konten dikirimkan ke dalam slot {children} */}
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;