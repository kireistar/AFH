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

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();

  // Single fetch, semua invoice (split di client)
  const { invoices, loading, markAsPaid } = useInvoices();

  const fines = useMemo(() => invoices.filter(i => i._status === 'unpaid'), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter(i => i._status === 'paid'), [invoices]);
  
  const unpaidCount = fines.length;

  // Hitung total collected fines daripaid invoices
  const collectedFines = useMemo(() => {
    const total = paidInvoices.reduce((sum, inv) => sum + Number(inv._rawAmount || 0), 0);
    return 'Rp ' + total.toLocaleString('id-ID');
  }, [paidInvoices]);

  const { transactions, loading: loadingTransactions } = useTransactions();

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

  const handleMarkAsPaid = async (fine) => {
    if (window.confirm("Confirm payment received for this fine?")) {
      await markAsPaid(fine._id);  // _id = integer id asli
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
  );
};

export default FinanceDashboard;