import React, { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import FinanceOverview from './FinanceOverview';
import FinanceFines from './FinanceFines';
import FinanceInvoices from './FinanceInvoices';
import FinancePayments from './FinancePayments';
import FinanceReports from './FinanceReports';
import ConfirmModal from '../../components/ConfirmModal';
import Toast, { createToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';
import useInvoices from '../../hooks/useInvoices';
import useTransactions from '../../hooks/useTransactions';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();

  const { invoices, loading, markAsPaid } = useInvoices();

  const fines = useMemo(() => invoices.filter(i => i._status === 'unpaid'), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter(i => i._status === 'paid'), [invoices]);

  const unpaidCount = fines.length;

  const collectedFines = useMemo(() => {
    const total = paidInvoices.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);
    return 'Rp ' + total.toLocaleString('id-ID');
  }, [paidInvoices]);

  const outstandingAmount = useMemo(() => {
    const total = fines.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);
    return 'Rp ' + total.toLocaleString('id-ID');
  }, [fines]);

  const { transactions, loading: loadingTransactions } = useTransactions();

  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5).map(inv => ({
      id: inv.id,
      description: inv.reason || 'Fine',
      user: typeof inv.user === 'object' ? (inv.user?.employee_name || 'User') : String(inv.user || 'User'),
      time: inv.paidAt || inv.dueDate || '-',
      type: inv._status === 'paid' ? 'Income' : 'Expense',
      amount: inv.amount,
    }));
  }, [invoices]);

  // Payment confirm modal
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type) => {
    setToasts(prev => [...prev, createToast(message, type)]);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleMarkAsPaid = (fine) => {
    setPayTarget(fine);
    setIsPayConfirmOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!payTarget) return;
    setIsPaying(true);
    try {
      await markAsPaid(payTarget._id);
      setIsPayConfirmOpen(false);
      setPayTarget(null);
      addToast("Payment recorded successfully.", "success");
    } catch (err) {
      addToast("Failed to record payment: " + (err?.message || "Server error"), "error");
    } finally {
      setIsPaying(false);
    }
  };

  const financeProfile = {
    name: user?.employee_name || 'Finance Officer',
    subTitle: user?.department || 'Finance Dept',
    email: user?.email || '',
    avatarLetter: (user?.employee_name || 'F')[0].toUpperCase(),
  };

  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Fines', badge: unpaidCount > 0 ? `${unpaidCount} Unpaid` : null, badgeColor: 'bg-red-100 text-[#B91C1C]' },
    { name: 'Invoices', badge: null },
    { name: 'Payments', badge: null },
    { name: 'Reports', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <FinanceOverview financeStats={{ collectedFines, paidCount: paidInvoices.length, unpaidFines: unpaidCount, outstandingAmount }} recentTransactions={recentInvoices} alerts={[]} onNavigate={setActiveTab} />;
      case 'Fines':
        return <FinanceFines fines={fines} loading={loading} handleMarkAsPaid={handleMarkAsPaid} />;
      case 'Invoices':
        return <FinanceInvoices invoices={invoices} loading={loading} />;
      case 'Payments':
        return <FinancePayments payments={transactions.filter(t => t.action === 'fine_paid')} loading={loadingTransactions} />;
      case 'Reports':
        return <FinanceReports invoices={invoices} transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout
        roleTitle="Finance"
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={financeProfile}
        pageHeaderTitle={activeTab === 'Dashboard' ? 'FINANCIAL OVERVIEW' : `${activeTab.toUpperCase()} MANAGEMENT`}
        pageHeaderSubtitle={activeTab === 'Dashboard' ? 'Monitor company financial activities.' : `Manage financial ${activeTab.toLowerCase()} records here.`}
      >
        {renderContent()}
      </DashboardLayout>

      <ConfirmModal
        isOpen={isPayConfirmOpen}
        onClose={() => { setIsPayConfirmOpen(false); setPayTarget(null); }}
        onConfirm={confirmMarkAsPaid}
        title="Confirm Payment"
        message={`Has the payment for fine #${payTarget?.id || ''} (Rp ${payTarget?._rawAmount?.toLocaleString('id-ID') || '0'}) been received? This will mark the fine as paid.`}
        confirmLabel="Confirm Payment"
        variant="primary"
        isLoading={isPaying}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default FinanceDashboard;
