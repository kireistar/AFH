import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import FinanceOverview from './FinanceOverview';
import FinanceFines from './FinanceFines';
import FinanceInvoices from './FinanceInvoices';
import FinancePayments from './FinancePayments';
import FinanceReports from './FinanceReports';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // --- MOCKUP DATA ---
  const financeStats = { collectedFines: 'Rp 2.500.000', pendingInvoices: '4', unpaidFines: '2' };
  
  const recentTransactions = [
    { id: 1, description: 'Fine Payment: Broken Screen', user: 'Agus Pratama', time: '1 hour ago', amount: 'Rp 500.000', type: 'Income' },
    { id: 2, description: 'Asset Purchase: 5 Keyboards', user: 'IT Dept', time: 'Yesterday', amount: 'Rp 2.000.000', type: 'Expense' },
  ];

  const alerts = [
    { id: 1, type: 'Unpaid Fine', message: 'Diana Manager has an unpaid fine of Rp 150.000 (Overdue 5 days)', urgency: 'High' }
  ];

  // UBAH: Menggunakan useState agar tabel denda menjadi interaktif
  const [fines, setFines] = useState([
    { id: 'FIN-001', user: 'Agus Pratama', reason: 'Damaged Laptop Screen', amount: 'Rp 500.000', status: 'Paid' },
    { id: 'FIN-002', user: 'Diana Manager', reason: 'Lost Charger', amount: 'Rp 150.000', status: 'Unpaid' },
  ]);

  const invoices = [
    { id: 'INV-1022', description: 'Procurement: 10 Monitors', date: 'Oct 20, 2023', amount: 'Rp 15.000.000', status: 'Paid' },
    { id: 'INV-1023', description: 'Repair Service: Projector', date: 'Oct 28, 2023', amount: 'Rp 800.000', status: 'Pending' },
  ];

  const payments = [
    { id: 'PAY-881', party: 'Agus Pratama', date: 'Oct 29, 2023', method: 'Bank Transfer', amount: 'Rp 500.000' },
    { id: 'PAY-882', party: 'Tech Vendor Ltd', date: 'Oct 22, 2023', method: 'Corporate Credit', amount: 'Rp 15.000.000' },
  ];

  // TAMBAH: Fungsi untuk mengubah status denda menjadi lunas
  const handleMarkAsPaid = (id) => {
    if (window.confirm("Confirm payment received for this fine?")) {
      setFines(fines.map(fine => fine.id === id ? { ...fine, status: 'Paid' } : fine));
    }
  };

  // Profile configuration for Finance
  const financeProfile = {
    name: 'Finance Officer',
    subTitle: 'Finance Dept',
    email: 'finance@afh.com',
    avatarLetter: 'F'
  };

  // Flat sidebar menu items for Finance
  const menuItems = [
    { name: 'Dashboard', badge: null },
    { name: 'Fines', badge: '1 Unpaid', badgeColor: 'bg-red-100 text-[#B91C1C]' },
    { name: 'Invoices', badge: null },
    { name: 'Payments', badge: null },
    { name: 'Reports', badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <FinanceOverview financeStats={financeStats} recentTransactions={recentTransactions} alerts={alerts} />;
      // UBAH: Meneruskan props fines dan fungsi handleMarkAsPaid
      case 'Fines': return <FinanceFines fines={fines} handleMarkAsPaid={handleMarkAsPaid} />;
      case 'Invoices': return <FinanceInvoices invoices={invoices} />;
      case 'Payments': return <FinancePayments payments={payments} />;
      case 'Reports': return <FinanceReports />;
      default: return null;
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