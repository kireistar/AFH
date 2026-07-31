import React, { useState, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ManagerOverview from './ManagerOverview';
import ManagerApprovals from './ManagerApprovals';
import ManagerRiskAssessment from './ManagerRiskAssessment';
import ManagerReports from './ManagerReports';
import ConfirmModal from '../../components/ConfirmModal';
import InputModal from '../../components/InputModal';
import Toast, { createToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';
import useRequests from '../../hooks/useRequests';
import useAssets from '../../hooks/useAssets';
import useIncidents from '../../hooks/useIncidents';
import useDashboardRoute from '../../hooks/useDashboardRoute';
import usePageMeta from '../../hooks/usePageMeta';

const MANAGER_TABS = ['Dashboard', 'Approvals', 'Risk Assessment', 'Reports'];

const MANAGER_META = {
  Dashboard: { title: 'AFH Manager — Dashboard', description: 'Monitor approvals, assets, and incidents.' },
  Approvals: { title: 'AFH Manager — Approvals', description: 'Approve or reject pending asset requests.' },
  'Risk Assessment': { title: 'AFH Manager — Risk Assessment', description: 'Review AI-driven risk scores for asset requests.' },
  Reports: { title: 'AFH Manager — Reports', description: 'Managerial reports for requests and incidents.' },
};

const ManagerDashboard = () => {
  const { activeTab, setActiveTab } = useDashboardRoute('/manager', MANAGER_TABS);
  const { user } = useAuth();

  usePageMeta(MANAGER_META[activeTab] || MANAGER_META.Dashboard);

  const { requests: approvals, loading, approve, reject } = useRequests('all', 'pending_manager');
  const { requests: allRequests, loading: allRequestsLoading } = useRequests('all');
  const pendingApprovalCount = approvals.length;
  const { assets } = useAssets();
  const { incidents } = useIncidents();

  const activeAssetCount = assets.filter(a => a.status === 'Borrowed').length;
  const incidentCount = incidents.length;

  // Approve confirm modal
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);

  // Reject input modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  // Loading states for modals
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type) => {
    setToasts(prev => [...prev, createToast(message, type)]);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleApprove = (req) => {
    setApproveTarget(req);
    setIsApproveOpen(true);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    try {
      await approve(approveTarget._id);
      setIsApproveOpen(false);
      setApproveTarget(null);
      addToast("High-risk request approved.", "success");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = (req) => {
    setRejectTarget(req);
    setIsRejectOpen(true);
  };

  const submitReject = async (reason) => {
    if (!rejectTarget || !reason) return;
    setIsRejecting(true);
    try {
      await reject(rejectTarget._id, reason);
      setIsRejectOpen(false);
      setRejectTarget(null);
      addToast("Request rejected.", "success");
    } finally {
      setIsRejecting(false);
    }
  };

  const managerProfile = {
    name: user?.employee_name || 'Manager',
    subTitle: user?.department || 'Management',
    email: user?.email || '',
    avatarLetter: (user?.employee_name || 'M')[0].toUpperCase(),
  };

  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Approvals', badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Urgent` : null, badgeColor: 'bg-orange-100 text-orange-700' },
    { name: 'Risk Assessment', badge: null },
    { name: 'Reports', badge: null },
  ];

  const metrics = {
    pendingApprovals: pendingApprovalCount,
    activeAssets: activeAssetCount,
    monthlyIncidents: incidentCount,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <ManagerOverview metrics={metrics} />;
      case 'Approvals': return <ManagerApprovals approvals={approvals} loading={loading} handleApprove={handleApprove} handleReject={handleReject} />;
      case 'Risk Assessment': return <ManagerRiskAssessment riskLogs={allRequests} loading={allRequestsLoading} />;
      case 'Reports': return <ManagerReports requests={allRequests} incidents={incidents} />;
      default: return null;
    }
  };

  return (
    <>
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

      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => { setIsApproveOpen(false); setApproveTarget(null); }}
        onConfirm={confirmApprove}
        title="Approve High-Risk Request"
        message={`Are you sure you want to approve this high-risk request from ${approveTarget?.user || 'this user'}? This action will authorize the asset handover process.`}
        confirmLabel="Approve"
        variant="primary"
        isLoading={isApproving}
      />

      <InputModal
        isOpen={isRejectOpen}
        onClose={() => { setIsRejectOpen(false); setRejectTarget(null); }}
        onSubmit={submitReject}
        title="Reject Request"
        label="Please provide a reason for rejecting this request"
        placeholder="e.g., Risk too high, alternative device available..."
        multiline
        isLoading={isRejecting}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default ManagerDashboard;
