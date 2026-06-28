import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminSecurity from './AdminSecurity';
import AdminApprovals from './AdminApprovals';
import { useAuth } from '../../hooks/useAuth';
import useAssets from '../../hooks/useAssets';
import useUsers from '../../hooks/useUsers';
import useRequests from '../../hooks/useRequests';
import useIncidents from '../../hooks/useIncidents';
import useTransactions from '../../hooks/useTransactions';
import { verifyLedger, submitTransaction } from '../../services/transactionService';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [autoOpenAddAsset, setAutoOpenAddAsset] = useState(false);
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

  const { assets, loading: loadingAssets, refresh: refreshAssets } = useAssets();
  const { users, loading: loadingUsers, refresh: refreshUsers } = useUsers();
  
  // Requests pending admin review
  const { requests: approvals, loading: loadingApprovals, refresh: refreshApprovals, approve, reject } = useRequests('all', 'pending_admin');

  // Request yang sudah approved dan siap dihandover
  const { requests: handovers, loading: loadingHandovers, refresh: refreshHandovers } = useRequests('all', 'approved');

  // Active loans (currently borrowed assets)
  const { requests: activeLoans, loading: loadingLoans, refresh: refreshLoans, returnAsset } = useRequests('all', 'handed_over');

  const { incidents } = useIncidents();
  const { transactions, loading: loadingTransactions, refresh: refreshTransactions } = useTransactions();

  const assetGrowth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthAssets = assets.filter(a => {
      if (!a._createdAt) return false;
      const d = new Date(a._createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthAssets = assets.filter(a => {
      if (!a._createdAt) return false;
      const d = new Date(a._createdAt);
      const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const thisMonthCount = thisMonthAssets.length;
    const lastMonthCount = lastMonthAssets.length;

    if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
    return ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  }, [assets]);

  // Hitung stats dari real data
  const assetStats = {
    available: assets.filter(a => a.status === 'Available').length,
    borrowed: assets.filter(a => a.status === 'Borrowed').length,
    maintenance: assets.filter(a => a.status === 'Maintenance').length,
    total: assets.length,
    assetGrowth: assetGrowth,
  };

  const pendingHandoverCount = handovers.length;
  const pendingApprovalCount = approvals.length;

  const handleApprove = (req) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Approve Request',
      message: `Are you sure you want to approve the asset request for "${req.asset}" by ${req.user}?`,
      showInput: false,
      confirmText: 'Approve',
      isDanger: false,
      onConfirm: async () => {
        try {
          await approve(req._id);
          toast.success("Request approved successfully!");
          refreshHandovers();
          refreshApprovals();
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
      message: `Provide a reason for rejecting the request for "${req.asset}" by ${req.user}:`,
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
          refreshApprovals();
        } catch (err) {
          toast.error("Failed to reject request: " + err.message);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCompleteHandover = (requestId) => {
    const req = handovers.find(h => h._id === requestId);
    if (!req) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Complete Handover',
      message: `Are you sure you want to complete the handover of "${req.asset}" to ${req.user}?`,
      showInput: false,
      confirmText: 'Handover',
      isDanger: false,
      onConfirm: async () => {
        try {
          await submitTransaction({
            action: 'handover',
            asset_id: req._assetId,
            borrower_id: req._borrowerId,
            request_id: req._id,
            admin_id: user.id,
            payload: { notes: "Handover executed via Admin Dashboard" }
          });
          toast.success("Handover completed successfully!");
          refreshHandovers();
          refreshTransactions();
        } catch (err) {
          toast.error("Failed to complete handover: " + err.message);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleProcessReturn = (requestId) => {
    const req = activeLoans.find(h => h._id === requestId);
    if (!req) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Process Return',
      message: `Provide condition notes for returning "${req.asset}" from ${req.user}:`,
      showInput: true,
      inputPlaceholder: 'Device return condition notes (optional)...',
      defaultValue: 'Good condition',
      confirmText: 'Process Return',
      isDanger: false,
      onConfirm: async (conditionNotes) => {
        try {
          await returnAsset(req._id, conditionNotes || "Good condition");
          toast.success("Asset return processed successfully!");
          refreshLoans();
          refreshTransactions();
        } catch (err) {
          toast.error("Failed to process return: " + err.message);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const activeIncidentCount = incidents.filter(i => i._status === 'open' || i._status === 'investigating').length;

  const recentActivities = transactions.slice(0, 5).map(txn => ({
    id: txn.id,
    user: txn.party,
    action: txn.action.toLowerCase().includes('handover') ? 'handed over' :
            txn.action.toLowerCase().includes('return') ? 'returned' :
            'reported on',
    asset: txn.asset,
    time: txn.date,
    status: txn.status,
  }));

  const systemAlerts = incidents.filter(i => i._status === 'open' || i._status === 'investigating').slice(0, 3).map(inc => ({
    id: inc.id,
    type: `${inc.severity} Incident`,
    message:`${inc.asset} - ${inc.description}`,
    urgency: inc._severity === 'high' || inc._severity === 'critical' ? 'High' : 'Medium',
  }));

  const adminProfile = {
    name: user?.employee_name || 'Administrator',
    subTitle: user?.department || 'Admin',
    email: user?.email || '',
    avatarLetter: (user?.employee_name || 'A')[0].toUpperCase(),
  };

  const [ledgerStatus, setLedgerStatus] = useState({ valid: true, tamperedIds: [] });

  const checkLedgerIntegrity = async () => {
    try {
      const result = await verifyLedger();
      setLedgerStatus({ valid: result.valid, tamperedIds: result.tampered_transaction_ids });
    } catch (err) {
      console.error('Failed to verify ledger integrity on load:', err);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      checkLedgerIntegrity();
    }
  }, [transactions]);

  const adminMenuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Assets', badge: null },
    { name: 'Approvals', badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Pending` : null, badgeColor: 'bg-orange-100 text-orange-700' },
    { name: 'Handover', badge: pendingHandoverCount > 0 ? `${pendingHandoverCount} Pending` : null, badgeColor: 'bg-blue-100 text-[#1E3A8A]' },
    { name: 'Users', badge: null },
    { name: 'Reports', badge: null },
    { 
      name: 'Security', 
      badge: !ledgerStatus.valid ? 'Tampered' : 'Secure', 
      badgeColor: !ledgerStatus.valid ? 'bg-rose-100 text-rose-800 animate-pulse font-bold' : 'bg-emerald-100 text-emerald-800' 
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <AdminOverview
            assetStats={assetStats}
            pendingHandoverCount={pendingHandoverCount}
            recentActivities={recentActivities}
            systemAlerts={systemAlerts}
            activeIncidentCount={activeIncidentCount}
            onAddAssetClick={() => {
              setActiveTab('Assets');
              setAutoOpenAddAsset(true);
            }}
            setActiveTab={setActiveTab}
          />
        );
      case 'Assets':
        return (
          <AdminAssets
            assets={assets}
            loading={loadingAssets}
            onRefresh={refreshAssets}
            autoOpenAdd={autoOpenAddAsset}
            onAddModalClosed={() => setAutoOpenAddAsset(false)}
          />
        );
      case 'Approvals':
        return (
          <AdminApprovals
            approvals={approvals}
            loading={loadingApprovals}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        );
      case 'Handover':
        return (
          <AdminHandover
            handovers={handovers}
            activeLoans={activeLoans}
            handleCompleteHandover={handleCompleteHandover}
            handleProcessReturn={handleProcessReturn}
            loadingHandovers={loadingHandovers}
            loadingLoans={loadingLoans}
          />
        );
      case 'Users':
        return <AdminUsers users={users} loading={loadingUsers} onRefresh={refreshUsers} />;
      case 'Reports':
        return <AdminReports transactions={transactions} incidents={incidents} />;
      case 'Security':
        return (
          <AdminSecurity 
            transactions={transactions} 
            loadingTransactions={loadingTransactions} 
            onRefreshTransactions={refreshTransactions} 
          />
        );
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
      {!ledgerStatus.valid && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl shadow-sm text-rose-800 flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold text-sm">SECURITY ALERT:</span>
              <p className="text-xs mt-0.5 font-medium">Unauthorized modification detected in the transaction history database! Check the Security logs immediately.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('Security')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Investigate
          </button>
        </div>
      )}
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

export default AdminDashboard;