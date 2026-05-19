import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ManagerOverview from './ManagerOverview';
import ManagerApprovals from './ManagerApprovals';
import ManagerRiskAssessment from './ManagerRiskAssessment';
import ManagerReports from './ManagerReports';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // --- MOCKUP DATA ---
  const metrics = { pendingApprovals: 2, activeAssets: 115, monthlyIncidents: 4 };

  const [approvals, setApprovals] = useState([
    { id: 'REQ-013', user: 'Dewi Lestari', asset: 'iPad Pro', reason: 'Field Work Client Meeting', risk: 'High', status: 'Pending' },
    { id: 'REQ-014', user: 'Agus Pratama', asset: 'Server Rack', reason: 'Data Center Expansion', risk: 'High', status: 'Pending' }
  ]);

  const riskLogs = [
    { id: 'LOG-991', reqId: 'REQ-012', decision: 'Auto-Approved', score: 15, reason: 'Standard Peripheral Request' },
    { id: 'LOG-992', reqId: 'REQ-013', decision: 'Escalated', score: 85, reason: 'High-Value Asset & Field Work' },
    { id: 'LOG-993', reqId: 'REQ-014', decision: 'Escalated', score: 90, reason: 'Infrastructure Modification' }
  ];

  const pendingApprovalCount = approvals.filter(req => req.status === 'Pending').length;

  const handleApprove = (id) => {
    if (window.confirm("Approve this high-risk request?")) {
      setApprovals(approvals.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
    }
  };

  const handleReject = (id) => {
    if (window.confirm("Reject this high-risk request?")) {
      setApprovals(approvals.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
    }
  };

  // Profile configuration for Manager
  const managerProfile = {
    name: 'Operations Manager',
    subTitle: 'Management',
    email: 'manager@afh.com',
    avatarLetter: 'M'
  };

  // Flat sidebar menu items for Manager
  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Approvals', badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Urgent` : null, badgeColor: 'bg-orange-100 text-orange-700' },
    { name: 'Risk Assessment', badge: null },
    { name: 'Reports', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <ManagerOverview metrics={metrics} />;
      case 'Approvals': return <ManagerApprovals approvals={approvals} handleApprove={handleApprove} handleReject={handleReject} />;
      case 'Risk Assessment': return <ManagerRiskAssessment riskLogs={riskLogs} />;
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