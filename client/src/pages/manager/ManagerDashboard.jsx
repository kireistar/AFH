import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ManagerOverview from './ManagerOverview';
import ManagerApprovals from './ManagerApprovals';
import ManagerRiskAssessment from './ManagerRiskAssessment';
import ManagerReports from './ManagerReports';
import { useAuth } from '../../hooks/useAuth';
import useRequests from '../../hooks/useRequests';
import useAssets from '../../hooks/useAssets';
import useIncidents from '../../hooks/useIncidents';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();
  const toast = useToast();

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    showInput: false,
    inputPlaceholder: '',
    defaultValue: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    onConfirm: () => {},
  });

  // Hanya fetch request yang perlu review manager
  const { requests: approvals, loading, approve, reject } = useRequests('all', 'pending_manager');

  const { requests: allRequests, loading: allRequestsLoading } = useRequests('all');

  const pendingApprovalCount = approvals.length;

  const { assets } = useAssets();
  const { incidents } = useIncidents();

  const activeAssetCount = assets.filter(a => a.status === 'Borrowed').length;
  const incidentCount = incidents.length;

  const handleApprove = (req) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Approve Escalate Request',
      message: `Are you sure you want to approve this high-risk request for "${req.asset}" by ${req.user}?`,
      showInput: false,
      confirmText: 'Approve',
      isDanger: false,
      onConfirm: async () => {
        try {
          await approve(req._id);
          toast.success("Request approved successfully!");
        } catch (err) {
          toast.error("Failed to approve request: " + err.message);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleReject = (req) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reject Request',
      message: `Provide a reason for rejecting the high-risk request for "${req.asset}" by ${req.user}:`,
      showInput: true,
      inputPlaceholder: 'Reason for rejection...',
      defaultValue: '',
      confirmText: 'Reject',
      isDanger: true,
      onConfirm: async (reason) => {
        if (!reason.trim()) {
          toast.error("Rejection reason cannot be empty");
          return;
        }
        try {
          await reject(req._id, reason);
          toast.success("Request rejected successfully!");
        } catch (err) {
          toast.error("Failed to reject request: " + err.message);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
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

  const incidentDiff = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthInc = incidents.filter(inc => {
      const d = new Date(inc.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthInc = incidents.filter(inc => {
      const d = new Date(inc.date);
      const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    return thisMonthInc.length - lastMonthInc.length;
  }, [incidents]);

  const metrics = {
    pendingApprovals: pendingApprovalCount,
    activeAssets: activeAssetCount,      // Bisa dienhance dengan AI jobdesk
    monthlyIncidents: incidentCount,  // Bisa dienhance dengan AI jobdesk
    incidentDiff: incidentDiff,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <ManagerOverview metrics={metrics} setActiveTab={setActiveTab} />;
      case 'Approvals': return <ManagerApprovals approvals={approvals} loading={loading} handleApprove={handleApprove} handleReject={handleReject} />;
      case 'Risk Assessment': return <ManagerRiskAssessment riskLogs={allRequests} loading={allRequestsLoading} />;
      case 'Reports': return <ManagerReports requests={allRequests} incidents={incidents} />;
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
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        showInput={confirmConfig.showInput}
        inputPlaceholder={confirmConfig.inputPlaceholder}
        defaultValue={confirmConfig.defaultValue}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </DashboardLayout>
  );
};

export default ManagerDashboard;