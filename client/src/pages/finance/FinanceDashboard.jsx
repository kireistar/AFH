import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import FinanceOverview from './FinanceOverview';
import FinanceFines from './FinanceFines';
import FinanceInvoices from './FinanceInvoices';
import FinancePayments from './FinancePayments';
import FinanceReports from './FinanceReports';
import { useAuth } from '../../hooks/useAuth';
import useInvoices from '../../hooks/useInvoices';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();

  // Single fetch, semua invoice (split di client)
  const { invoices, loading, markAsPaid } = useInvoices();

  const fines = useMemo(() => invoices.filter(i => i._status === 'unpaid'), [invoices]);
  const paidInvoices = useMemo(() => invoices.filter(i => i._status === 'paid'), [invoices]);
  
  const unpaidCount = fines.length;

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
        return <FinanceOverview financeStats={{ collectedFines: '-', pendingInvoices: unpaidCount, unpaidFines: unpaidCount }} recentTransactions={[]} alerts={[]} />;
      case 'Fines':
        return <FinanceFines fines={fines} loading={loading} handleMarkAsPaid={handleMarkAsPaid} />;
      case 'Invoices':
        return <FinanceInvoices invoices={paidInvoices} loading={loading} />;
      case 'Payments':
        return <FinancePayments payments={[]} />;
      case 'Reports':
        return <FinanceReports />;
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