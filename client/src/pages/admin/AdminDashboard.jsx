import React, { useState, useEffect, useRef } from 'react';
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

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Handover confirm modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmRequestData, setConfirmRequestData] = useState(null);
  const [pendingHandoverPayload, setPendingHandoverPayload] = useState(null);
  const [isHandoverLoading, setIsHandoverLoading] = useState(false);
  const [isHandoverSuccess, setIsHandoverSuccess] = useState(false);

  const { user } = useAuth();
  const { assets, loading: loadingAssets, refresh: refreshAssets } = useAssets();
  const { users, loading: loadingUsers, refresh: refreshUsers } = useUsers();

  const { requests: approvals, loading: loadingApprovals, refresh: refreshApprovals, approve, reject } = useRequests('all', 'pending_admin');
  const { requests: handovers, loading: loadingHandovers, refresh: refreshHandovers } = useRequests('all', 'approved');
  const { requests: activeLoans, loading: loadingLoans, refresh: refreshLoans, returnAsset } = useRequests('all', 'handed_over');
  const { incidents } = useIncidents();
  const { transactions, loading: loadingTransactions, refresh: refreshTransactions } = useTransactions();

  // ── Auto-refresh: keep data live for both admin and user ──
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

  const handleApprove = async (req) => {
    if (window.confirm("Approve this asset request?")) {
      await approve(req._id || req.id);
      refreshHandovers();
      refreshApprovals();
    }
  };

  const handleReject = async (req) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      await reject(req._id || req.id, reason);
      refreshApprovals();
    }
  };

  // ── Shared: execute handover on backend ──
  const executeHandover = async (requestData, payload, notes) => {
    setIsHandoverLoading(true);
    try {
      if (payload) {
        // QR path: borrower's crypto payload
        await submitTransaction({
          payload: payload.payload,
          signature: payload.signature,
          public_key: payload.public_key,
          admin_id: user?.id || user?._id || 'admin',
        });
      } else {
        // Manual path
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
      alert("Failed to complete handover: " + errorMessage);
    }
  };

  // ── Confirm modal handlers ──
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
    openConfirmModal(req, null);
  };

  // ── QR scanner success trigger ──
  const handleScannerSuccess = (scannedText) => {
    let parsedQR;
    try {
      parsedQR = typeof scannedText === 'string' ? JSON.parse(scannedText) : scannedText;
    } catch (err) {
      alert("Invalid QR Code format. Please scan a valid Handover QR.");
      return;
    }

    const scannedData = parsedQR.payload || parsedQR.data || parsedQR;
    const scannedId = scannedData?.request_id || scannedData?.id || scannedData?._id;
    if (!scannedId) {
      alert("QR Code does not contain a valid Request ID.");
      return;
    }

    const req = handovers.find(h => String(h._id) === String(scannedId) || String(h.id) === String(scannedId));
    if (!req) {
      alert(`Request ID [${scannedId}] not found in current Handover table.`);
      return;
    }

    openConfirmModal(req, parsedQR);
  };

  const handleProcessReturn = async (requestId) => {
    const req = activeLoans.find(h => h._id === requestId || h.id === requestId);
    if (!req) return;

    const conditionNotes = window.prompt("Enter device return condition notes (optional):", "Good condition");
    if (conditionNotes !== null) {
      try {
        await returnAsset(req._id || req.id, conditionNotes);
        alert("Asset return processed successfully!");
        refreshLoans();
        refreshTransactions();
      } catch (err) {
        const errorMessage = err?.message || "Server error";
        alert("Failed to process return: " + errorMessage);
      }
    }
  };

  const activeIncidentCount = incidents.filter(i => i._status === 'open' || i._status === 'investigating').length;

  const recentActivities = transactions.slice(0, 5).map(txn => ({
    id: txn.id || txn._id,
    user: txn.party,
    action: txn.action?.toLowerCase().includes('handover') ? 'handed over' :
            txn.action?.toLowerCase().includes('return') ? 'returned' :
            'reported on',
    asset: txn.asset,
    time: txn.date,
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
      </DashboardLayout>

      {/* Scanner Modal */}
      <AdminScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerifySuccess={handleScannerSuccess}
      />

      {/* Handover Confirmation Modal */}
      <HandoverConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmHandover}
        requestData={confirmRequestData}
        isLoading={isHandoverLoading}
        isSuccess={isHandoverSuccess}
      />
    </>
  );
};

export default AdminDashboard;
