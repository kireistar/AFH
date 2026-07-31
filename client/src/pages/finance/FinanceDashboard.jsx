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
import useDashboardRoute from '../../hooks/useDashboardRoute';
import usePageMeta from '../../hooks/usePageMeta';

const FINANCE_TABS = ['Dashboard', 'Fines', 'Invoices', 'Payments', 'Reports'];

const FINANCE_META = {
  Dashboard: { title: 'AFH Finance — Dashboard', description: 'Monitor fines, invoices, and payments.' },
  Fines: { title: 'AFH Finance — Fines', description: 'Manage and collect unpaid asset fines.' },
  Invoices: { title: 'AFH Finance — Invoices', description: 'Review paid invoices.' },
  Payments: { title: 'AFH Finance — Payments', description: 'Payment transaction history.' },
  Reports: { title: 'AFH Finance — Reports', description: 'Financial reports for fines and transactions.' },
};

const FinanceDashboard = () => {
  const { activeTab, setActiveTab } = useDashboardRoute('/finance', FINANCE_TABS);
  const { user } = useAuth();

  usePageMeta(FINANCE_META[activeTab] || FINANCE_META.Dashboard);

  const { invoices, loading, markAsPaid } = useInvoices();

  const fines = useMemo(() => invoices.filter(i => i._status === 'unpaid'), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter(i => i._status === 'paid'), [invoices]);

  const unpaidCount = fines.length;

  const collectedFines = useMemo(() => {
    const total = paidInvoices.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);
    return 'Rp ' + total.toLocaleString('id-ID');
  }, [paidInvoices]);

  const { transactions, loading: loadingTransactions } = useTransactions();

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5).map(trx => ({
      id: trx.id,
      description: `${trx.action} - ${trx.asset}`,
      user: trx.party,
      time: trx.date,
      type: trx._action === 'fine_paid' ? 'Income' : 'Expense',
      amount: trx.amount,
    }));
  }, [transactions]);

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
        return <FinanceOverview financeStats={{ collectedFines, pendingInvoices: unpaidCount, unpaidFines: unpaidCount }} recentTransactions={recentTransactions} alerts={[]} />;
      case 'Fines':
        return <FinanceFines fines={fines} loading={loading} handleMarkAsPaid={handleMarkAsPaid} />;
      case 'Invoices':
        return <FinanceInvoices invoices={paidInvoices} loading={loading} />;
      case 'Payments':
        return <FinancePayments payments={transactions} loading={loadingTransactions} />;
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
