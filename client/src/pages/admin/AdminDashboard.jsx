import React, { useState } from 'react';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // --- MASTER STATES (MOCKUP DATA) ---
  const [recentActivities] = useState([
    { id: 1, user: 'Budi Santoso', action: 'Mengembalikan', asset: 'Mouse Wireless', time: '10 menit yang lalu', status: 'Success' },
    { id: 2, user: 'AI System', action: 'Menyetujui', asset: 'MacBook Pro M2', time: '45 menit yang lalu', status: 'Auto' },
    { id: 3, user: 'Manager', action: 'Menolak', asset: 'iPad Pro', time: '2 jam yang lalu', status: 'Declined' },
    { id: 4, user: 'Siti Aminah', action: 'Meminjam', asset: 'Monitor Dell 27"', time: '3 jam yang lalu', status: 'Success' },
  ]);

  const [systemAlerts] = useState([
    { id: 1, type: 'Overdue', message: 'Projector Epson belum dikembalikan (Terlambat 2 hari)', urgency: 'High' },
    { id: 2, type: 'Stock', message: 'Stok Keyboard Mechanical tersisa 1 unit', urgency: 'Medium' },
  ]);

  const assetStats = { available: 85, borrowed: 30, maintenance: 9, total: 124 };

  const [handovers, setHandovers] = useState([
    { id: 'HND-001', user: 'Budi Santoso', department: 'IT', asset: 'MacBook Pro M2', approvedBy: 'AI (Low Risk)', status: 'Pending Handover' },
    { id: 'HND-002', user: 'Siti Aminah', department: 'HR', asset: 'Monitor Dell 27"', approvedBy: 'Manager', status: 'Pending Handover' },
    { id: 'HND-003', user: 'Dewi Lestari', department: 'Marketing', asset: 'Mouse Wireless', approvedBy: 'AI (Low Risk)', status: 'Handed Over' }
  ]);

  const [assets] = useState([
    { id: 'AST-101', name: 'MacBook Pro M2', category: 'Laptop', condition: 'Good', status: 'Available' },
    { id: 'AST-102', name: 'Lenovo ThinkPad X1', category: 'Laptop', condition: 'Good', status: 'Borrowed' },
    { id: 'AST-201', name: 'Monitor Dell 27"', category: 'Peripheral', condition: 'Good', status: 'Available' },
    { id: 'AST-202', name: 'Projector Epson', category: 'Presentation', condition: 'Damaged', status: 'Maintenance' },
  ]);

  const [users] = useState([
    { id: 'USR-01', name: 'Budi Santoso', email: 'budi@afh.com', department: 'IT', status: 'Active' },
    { id: 'USR-02', name: 'Diana Manager', email: 'diana@afh.com', department: 'Management', status: 'Active' },
    { id: 'USR-03', name: 'Reza Finance', email: 'reza@afh.com', department: 'Finance', status: 'Active' },
    { id: 'USR-04', name: 'Siti Aminah', email: 'siti@afh.com', department: 'HR', status: 'Offline' },
  ]);

  const [reports] = useState([
    { id: 'REP-001', user: 'Budi Santoso', asset: 'Mouse Wireless', returnDate: '2023-10-28', condition: 'Good', late: 'No', fine: 'Rp 0' },
    { id: 'REP-002', user: 'Agus Pratama', asset: 'Lenovo ThinkPad', returnDate: '2023-10-27', condition: 'Damaged', late: 'Yes', fine: 'Rp 500.000' },
    { id: 'REP-003', user: 'Siti Aminah', asset: 'Keyboard Mech', returnDate: '2023-10-25', condition: 'Good', late: 'No', fine: 'Rp 0' },
  ]);

  const pendingHandoverCount = handovers.filter(h => h.status === 'Pending Handover').length;

  const menuCategories = [
    {
      title: 'MENU UTAMA',
      items: [
        { name: 'Dashboard', badge: null },
        { name: 'Assets', badge: null },
        { name: 'Handover', badge: pendingHandoverCount > 0 ? `${pendingHandoverCount} Pending` : null, badgeColor: 'bg-blue-100 text-[#1E3A8A]' },
      ]
    },
    {
      title: 'SISTEM',
      items: [
        { name: 'Users', badge: null },
        { name: 'Reports', badge: null },
      ]
    }
  ];

  const handleCompleteHandover = (id) => {
    const isConfirmed = window.confirm("Konfirmasi penyerahan aset ke pengguna?");
    if (isConfirmed) {
      setHandovers(handovers.map(h => h.id === id ? { ...h, status: 'Handed Over' } : h));
    }
  };

  // Logika Pemilihan Konten Berdasarkan Tab Aktif
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <AdminOverview 
            assetStats={assetStats} 
            pendingHandoverCount={pendingHandoverCount} 
            recentActivities={recentActivities} 
            systemAlerts={systemAlerts} 
          />
        );
      case 'Assets':
        return <AdminAssets assets={assets} />;
      case 'Handover':
        return <AdminHandover handovers={handovers} handleCompleteHandover={handleCompleteHandover} />;
      case 'Users':
        return <AdminUsers users={users} />;
      case 'Reports':
        return <AdminReports reports={reports} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span className="text-[#B91C1C]">AFH</span>
            <span className="text-[#1E3A8A]">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-6 overflow-y-auto">
          {menuCategories.map((category) => (
            <div key={category.title}>
              <p className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">{category.title}</p>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <button key={item.name} onClick={() => setActiveTab(item.name)} className={`w-full flex items-center justify-between px-4 py-2.5 transition-all border-l-4 rounded-r-xl ${activeTab === item.name ? 'bg-blue-50/50 border-[#1E3A8A] text-[#1E3A8A] font-semibold' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
                    <span>{item.name}</span>
                    {item.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-slate-100">
          <button className="w-full text-left px-4 py-3 font-medium text-[#B91C1C] hover:bg-red-50 rounded-xl transition-colors text-sm uppercase tracking-widest font-black">
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <input type="text" placeholder="Cari aset, user, atau aktivitas..." className="w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" />
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">
              Notifikasi <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Administrator</p>
                <p className="text-[10px] font-bold text-[#1E3A8A] uppercase">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-[#1E3A8A] text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-lg border-2 border-white">A</div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{activeTab === 'Dashboard' ? 'RINGKASAN SISTEM' : `MANAJEMEN ${activeTab.toUpperCase()}`}</h2>
            <p className="text-slate-400 text-sm font-medium">{activeTab === 'Dashboard' ? 'Pantau operasional aset perusahaan secara real-time.' : `Kelola database ${activeTab.toLowerCase()} Anda.`}</p>
          </div>
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;