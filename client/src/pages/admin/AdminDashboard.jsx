import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminSecurity from './AdminSecurity';
import AdminApprovals from './AdminApprovals';
import AdminScannerModal from './AdminScannerModal';
import HandoverConfirmModal from '../../components/HandoverConfirmModal';
import ManualHandoverModal from '../../components/ManualHandoverModal';
import ConfirmModal from '../../components/ConfirmModal';
import InputModal from '../../components/InputModal';
import Toast, { createToast } from '../../components/Toast';

import { useAuth } from '../../hooks/useAuth';
import useAssets from '../../hooks/useAssets';
import useUsers from '../../hooks/useUsers';
import useRequests from '../../hooks/useRequests';
import useIncidents from '../../hooks/useIncidents';
import useTransactions from '../../hooks/useTransactions';
import { verifyLedger, submitTransaction } from '../../services/transactionService';

const AUTO_REFRESH_INTERVAL = 8000;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [autoOpenAddAsset, setAutoOpenAddAsset] = useState(false);

  // Scanner modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Handover confirm modal (QR flow)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmRequestData, setConfirmRequestData] = useState(null);
  const [pendingHandoverPayload, setPendingHandoverPayload] = useState(null);
  const [isHandoverLoading, setIsHandoverLoading] = useState(false);
  const [isHandoverSuccess, setIsHandoverSuccess] = useState(false);

  // Manual handover modal (non-QR flow)
  const [isManualConfirmOpen, setIsManualConfirmOpen] = useState(false);
  const [manualConfirmRequestData, setManualConfirmRequestData] = useState(null);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isManualSuccess, setIsManualSuccess] = useState(false);

  // Approve confirm modal
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);

  // Reject input modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  // Return input modal
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);

  // Loading states for modals
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type) => {
    setToasts(prev => [...prev, createToast(message, type)]);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const { user } = useAuth();
  const { assets, loading: loadingAssets, pollingFailed: assetsPollingFailed, refresh: refreshAssets } = useAssets();
  const { users, loading: loadingUsers, refresh: refreshUsers } = useUsers();

  const { requests: approvals, loading: loadingApprovals, pollingFailed: approvalsPollingFailed, refresh: refreshApprovals, approve, reject } = useRequests('all', 'pending_admin');
  const { requests: handovers, loading: loadingHandovers, refresh: refreshHandovers } = useRequests('all', 'approved');
  const { requests: activeLoans, loading: loadingLoans, refresh: refreshLoans, returnAsset } = useRequests('all', 'handed_over');
  const { incidents } = useIncidents();
  const { transactions, loading: loadingTransactions, pollingFailed: txPollingFailed, refresh: refreshTransactions } = useTransactions();

  const anyPollingFailed = assetsPollingFailed || approvalsPollingFailed || txPollingFailed;

  // ── Auto-refresh: silent background polling ──
  const refreshAll = useRef(() => {
    refreshHandovers();
    refreshTransactions();
    refreshLoans();
    refreshApprovals();
    refreshAssets();
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshAll.current();
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const assetStats = {
    available: assets.filter(a => a.status === 'Available').length,
    borrowed: assets.filter(a => a.status === 'Borrowed').length,
    maintenance: assets.filter(a => a.status === 'Maintenance').length,
    total: assets.length,
  };

  const pendingHandoverCount = handovers.length;
  const pendingApprovalCount = approvals.length;

  // ── Approve handler ──
  const handleApprove = (req) => {
    setApproveTarget(req);
    setIsApproveOpen(true);
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setIsApproving(true);
    try {
      await approve(approveTarget._id || approveTarget.id);
      refreshHandovers();
      refreshApprovals();
      setIsApproveOpen(false);
      setApproveTarget(null);
      addToast("Request approved successfully.", "success");
    } finally {
      setIsApproving(false);
    }
  };

  // ── Reject handler ──
  const handleReject = (req) => {
    setRejectTarget(req);
    setIsRejectOpen(true);
  };

  const submitReject = async (reason) => {
    if (!rejectTarget || !reason) return;
    setIsRejecting(true);
    try {
      await reject(rejectTarget._id || rejectTarget.id, reason);
      refreshApprovals();
      setIsRejectOpen(false);
      setRejectTarget(null);
      addToast("Request rejected.", "success");
    } finally {
      setIsRejecting(false);
    }
  };

  // ── Shared: execute handover on backend ──
  const executeHandover = async (requestData, payload, notes) => {
    setIsHandoverLoading(true);
    try {
      if (payload) {
        await submitTransaction({
          payload: payload.payload,
          signature: payload.signature,
          public_key: payload.public_key,
          admin_id: user?.id || user?._id || 'admin',
        });
      } else {
        await submitTransaction({
          action: 'handover',
          asset_id: requestData._assetId || requestData.asset_id,
          borrower_id: requestData._borrowerId || requestData.borrower_id,
          request_id: requestData._id || requestData.id,
          admin_id: user?.id || user?._id || 'admin',
          payload: { notes: notes || "Handover executed via Admin Dashboard" },
        });
      }

      setIsHandoverSuccess(true);
      refreshHandovers();
      refreshTransactions();
      refreshLoans();
    } catch (err) {
      const errorMessage = err?.message || "Server error";
      setIsHandoverLoading(false);
      setIsConfirmOpen(false);
      addToast("Failed to complete handover: " + errorMessage, "error");
    }
  };

  // ── Handover confirm modal handlers ──
  const openConfirmModal = (requestData, handoverPayload) => {
    setConfirmRequestData(requestData);
    setPendingHandoverPayload(handoverPayload);
    setIsHandoverLoading(false);
    setIsHandoverSuccess(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmHandover = () => {
    executeHandover(confirmRequestData, pendingHandoverPayload);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmOpen(false);
    setConfirmRequestData(null);
    setPendingHandoverPayload(null);
    setIsHandoverLoading(false);
    setIsHandoverSuccess(false);
    setIsScannerOpen(false);
  };

  // ── Manual handover trigger (button) ──
  const handleCompleteHandover = (requestId) => {
    const req = handovers.find(h => String(h._id) === String(requestId) || String(h.id) === String(requestId));
    if (!req) return;
    setManualConfirmRequestData(req);
    setIsManualLoading(false);
    setIsManualSuccess(false);
    setIsManualConfirmOpen(true);
  };

  const handleConfirmManualHandover = async (notes) => {
    setIsManualLoading(true);
    try {
      await submitTransaction({
        action: 'handover',
        asset_id: manualConfirmRequestData._assetId || manualConfirmRequestData.asset_id,
        borrower_id: manualConfirmRequestData._borrowerId || manualConfirmRequestData.borrower_id,
        request_id: manualConfirmRequestData._id || manualConfirmRequestData.id,
        admin_id: user?.id || user?._id || 'admin',
        payload: { notes: notes || "Handover executed via Admin Dashboard" },
      });

      setIsManualSuccess(true);
      refreshHandovers();
      refreshTransactions();
      refreshLoans();
    } catch (err) {
      setIsManualLoading(false);
      setIsManualConfirmOpen(false);
      addToast("Failed to complete handover: " + (err?.message || "Server error"), "error");
    }
  };

  const handleCloseManualConfirm = () => {
    setIsManualConfirmOpen(false);
    setManualConfirmRequestData(null);
    setIsManualLoading(false);
    setIsManualSuccess(false);
  };

  // ── QR scanner success trigger ──
  const handleScannerSuccess = (scannedText) => {
    let parsedQR;
    try {
      parsedQR = typeof scannedText === 'string' ? JSON.parse(scannedText) : scannedText;
    } catch {
      addToast("Invalid QR Code format. Please scan a valid Handover QR.", "error");
      return;
    }

    const scannedData = parsedQR.payload || parsedQR.data || parsedQR;
    const scannedId = scannedData?.request_id || scannedData?.id || scannedData?._id;
    if (!scannedId) {
      addToast("QR Code does not contain a valid Request ID.", "error");
      return;
    }

    const req = handovers.find(h => String(h._id) === String(scannedId) || String(h.id) === String(scannedId));
    if (!req) {
      addToast(`Request ID [${scannedId}] not found in current Handover table.`, "error");
      return;
    }

    openConfirmModal(req, parsedQR);
  };

  // ── Return handler ──
  const handleProcessReturn = (requestId) => {
    const req = activeLoans.find(h => h._id === requestId || h.id === requestId);
    if (!req) return;
    setReturnTarget(req);
    setIsReturnOpen(true);
  };

  const submitReturn = async (conditionNotes) => {
    if (!returnTarget) return;
    setIsReturning(true);
    try {
      await returnAsset(returnTarget._id || returnTarget.id, conditionNotes || "Good condition");
      refreshLoans();
      refreshTransactions();
      setIsReturnOpen(false);
      setReturnTarget(null);
      addToast("Asset return processed successfully!", "success");
    } catch (err) {
      const errorMessage = err?.message || "Server error";
      addToast("Failed to process return: " + errorMessage, "error");
    } finally {
      setIsReturning(false);
    }
  };

  const activeIncidentCount = incidents.filter(i => i._status === 'open' || i._status === 'investigating').length;

  const recentActivities = transactions.slice(0, 5).map(txn => ({
    id: txn.id || txn._id,
    user: txn.borrower || txn.party,
    action: txn.action?.toLowerCase().includes('handover') ? 'handed over' :
            txn.action?.toLowerCase().includes('return') ? 'returned' :
            'reported on',
    asset: txn.asset,
    time: txn.occurred_at || txn.created_at || txn.date
      ? new Date(txn.occurred_at || txn.created_at || txn.date).toLocaleString()
      : '',
    status: txn.status,
  }));

  const systemAlerts = incidents.filter(i => i._status === 'open' || i._status === 'investigating').slice(0, 3).map(inc => ({
    id: inc.id || inc._id,
    type: `${inc.severity} Incident`,
    message: `${inc.asset} - ${inc.description}`,
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
    } catch {
      // silent
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
            onOpenScanner={() => setIsScannerOpen(true)}
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
            activeLoans={activeLoans}
            users={users}
            transactions={transactions}
            onNavigateToUsers={() => setActiveTab('Users')}
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
            onOpenScanner={() => setIsScannerOpen(true)}
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
    <>
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
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl shadow-sm text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
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

        {anyPollingFailed && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl shadow-sm text-amber-800 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold text-sm">CONNECTION ISSUE:</span>
              <p className="text-xs mt-0.5 font-medium">Unable to refresh data. Some information may be outdated. Check your network connection.</p>
            </div>
          </div>
        )}

        {renderContent()}
      </DashboardLayout>

      {/* Scanner Modal */}
      <AdminScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerifySuccess={handleScannerSuccess}
      />

      {/* Handover Confirmation Modal (QR flow) */}
      <HandoverConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmHandover}
        requestData={confirmRequestData}
        isLoading={isHandoverLoading}
        isSuccess={isHandoverSuccess}
      />

      {/* Manual Handover Modal (non-QR flow) */}
      <ManualHandoverModal
        isOpen={isManualConfirmOpen}
        onClose={handleCloseManualConfirm}
        onConfirm={handleConfirmManualHandover}
        requestData={manualConfirmRequestData}
        isLoading={isManualLoading}
        isSuccess={isManualSuccess}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => { setIsApproveOpen(false); setApproveTarget(null); }}
        onConfirm={confirmApprove}
        title="Approve Request"
        message={`Are you sure you want to approve this asset request from ${approveTarget?.user || 'this user'}? The request will move to the Handover queue.`}
        confirmLabel="Approve"
        variant="primary"
        isLoading={isApproving}
      />

      {/* Reject Input Modal */}
      <InputModal
        isOpen={isRejectOpen}
        onClose={() => { setIsRejectOpen(false); setRejectTarget(null); }}
        onSubmit={submitReject}
        title="Reject Request"
        label="Please provide a reason for rejecting this request"
        placeholder="e.g., Asset not available, insufficient justification..."
        multiline
        isLoading={isRejecting}
      />

      {/* Return Condition Modal */}
      <InputModal
        isOpen={isReturnOpen}
        onClose={() => { setIsReturnOpen(false); setReturnTarget(null); }}
        onSubmit={submitReturn}
        title="Process Asset Return"
        label="Enter the condition of the returned device"
        placeholder="Good condition"
        multiline
        defaultValue="Good condition"
        isLoading={isReturning}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default AdminDashboard;
