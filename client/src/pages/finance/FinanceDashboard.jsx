import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import FinanceOverview from './FinanceOverview';
import FinanceFines from './FinanceFines';
import FinanceInvoices from './FinanceInvoices';
import FinancePayments from './FinancePayments';
import FinanceReports from './FinanceReports';
import { useAuth } from '../../hooks/useAuth';
import useInvoices from '../../hooks/useInvoices';
import useTransactions from '../../hooks/useTransactions';
import useUsers from '../../hooks/useUsers';
import NewInvoiceModal from '../../components/NewInvoiceModal';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();
  const toast = useToast();
  const { users } = useUsers();
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    onConfirm: () => {},
  });

  // Single fetch, semua invoice (split di client)
  const { invoices, loading, markAsPaid, refresh: refreshInvoices } = useInvoices();

  const fines = useMemo(() => invoices.filter(i => i._status === 'unpaid'), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter(i => i._status === 'paid'), [invoices]);
  
  const unpaidCount = fines.length;

  // Hitung total collected fines daripaid invoices
  const collectedFines = useMemo(() => {
    const total = paidInvoices.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);
    return 'Rp ' + total.toLocaleString('id-ID');
  }, [paidInvoices]);

  const finesPercentChange = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthFines = paidInvoices.filter(inv => {
      if (!inv.paidAt) return false;
      const d = new Date(inv.paidAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthFines = paidInvoices.filter(inv => {
      if (!inv.paidAt) return false;
      const d = new Date(inv.paidAt);
      const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const thisMonthTotal = thisMonthFines.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);
    const lastMonthTotal = lastMonthFines.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);

    if (lastMonthTotal === 0) return thisMonthTotal > 0 ? 100 : 0;
    return ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }, [paidInvoices]);

  const { transactions, loading: loadingTransactions, refresh: refreshTransactions } = useTransactions();

  // Map 5 transaksi terbaru untuk overview
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

  const handleMarkAsPaid = (fine) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Confirm Payment',
      message: `Confirm that payment of ${fine.amount} from ${fine.user} has been physically received?`,
      confirmText: 'Mark as Paid',
      isDanger: false,
      onConfirm: async () => {
        try {
          await markAsPaid(fine._id);
          toast.success("Payment marked as paid successfully!");
        } catch (err) {
          toast.error("Failed to mark as paid: " + err.message);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
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
        return (
          <FinanceOverview 
            financeStats={{ 
              collectedFines, 
              pendingInvoices: unpaidCount, 
              unpaidFines: unpaidCount, 
              finesPercentChange 
            }} 
            recentTransactions={recentTransactions} 
            alerts={[]} 
            setActiveTab={setActiveTab}
            setIsNewInvoiceModalOpen={setIsNewInvoiceModalOpen}
          />
        );
      case 'Fines':
        return <FinanceFines fines={fines} loading={loading} handleMarkAsPaid={handleMarkAsPaid} />;
      case 'Invoices':
        return <FinanceInvoices invoices={paidInvoices} loading={loading} onOpenNewInvoiceModal={() => setIsNewInvoiceModalOpen(true)} />;
      case 'Payments': {
        const paymentTransactions = transactions.filter(t => t._action === 'fine_issued' || t._action === 'fine_paid');
        return <FinancePayments payments={paymentTransactions} loading={loadingTransactions} />;
      }
      case 'Reports':
        return <FinanceReports invoices={invoices} transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
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
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
      <NewInvoiceModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        onSuccess={() => {
          refreshInvoices();
          refreshTransactions();
        }}
        users={users}
        transactions={transactions}
      />
    </DashboardLayout>
  );
};

export default FinanceDashboard;