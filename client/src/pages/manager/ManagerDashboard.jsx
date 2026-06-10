import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ManagerOverview from './ManagerOverview';
import ManagerApprovals from './ManagerApprovals';
import ManagerRiskAssessment from './ManagerRiskAssessment';
import ManagerReports from './ManagerReports';
import { useAuth } from '../../hooks/useAuth';
import useRequests from '../../hooks/useRequests';
import useAssets from '../../hooks/useAssets';
import useIncidents from '../../hooks/useIncidents';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();

  // Hanya fetch request yang perlu review manager
  const { requests: approvals, loading, approve, reject } = useRequests('all', 'pending_manager');

  const { requests: allRequests, loading: allRequestsLoading } = useRequests('all');

  const pendingApprovalCount = approvals.length;

  const { assets } = useAssets();
  const { incidents } = useIncidents();

  const activeAssetCount = assets.filter(a => a.status === 'Borrowed').length;
  const incidentCount = incidents.length;

  const handleApprove = async (req) => {
    if (window.confirm("Approve this high-risk request?")) {
      await approve(req._id); // _id = integer id asli
    }
  };

  const handleReject = async (req) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      await reject(req._id, reason);
    }
  };

  // Profile configuration for Manager
  const managerProfile = {
    name: user?.employee_name || 'Manager',
    subTitle: user?.department || 'Management',
    email: user?.email || '',
    avatarLetter: (user?.employee_name || 'M')[0].toUpperCase(),
  };

  // Flat sidebar menu items for Manager
  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Approvals', badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Urgent` : null, badgeColor: 'bg-orange-100 text-orange-700' },
    { name: 'Risk Assessment', badge: null },
    { name: 'Reports', badge: null },
  ];

  const metrics = {
    pendingApprovals: pendingApprovalCount,
    activeAssets: activeAssetCount,      // Bisa dienhance dengan AI jobdesk
    monthlyIncidents: incidentCount,  // Bisa dienhance dengan AI jobdesk
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <ManagerOverview metrics={metrics} />;
      case 'Approvals': return <ManagerApprovals approvals={approvals} loading={loading} handleApprove={handleApprove} handleReject={handleReject} />;
      case 'Risk Assessment': return <ManagerRiskAssessment riskLogs={allRequests} loading={allRequestsLoading} />;
      case 'Reports': return <ManagerReports />;
      default: return null;
    }
  };

  return (
    <DashboardLayout
      roleTitle="Manager"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userProfile={managerProfile}
      pageHeaderTitle={activeTab === 'Dashboard' ? 'MANAGEMENT OVERVIEW' : `${activeTab.toUpperCase()} PANEL`}
      pageHeaderSubtitle={activeTab === 'Dashboard' ? 'Review high-risk requests and operational analytics.' : `Process ${activeTab.toLowerCase()} metrics.`}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ManagerDashboard;