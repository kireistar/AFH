import React, { useState } from 'react';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ... (Keep existing states: recentActivities, systemAlerts, assetStats, handovers, assets, users, reports, pendingHandoverCount) ...
  const pendingHandoverCount = 2; // Mocked for example

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

  const handleTabChange = (name) => {
    setActiveTab(name);
    setIsMobileMenuOpen(false); // Close menu on mobile after selection
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 md:p-8 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span className="text-[#B91C1C]">AFH</span>
            <span className="text-[#1E3A8A]">Admin</span>
          </h1>
          <button className="md:hidden text-slate-500 hover:text-slate-800 p-2" onClick={() => setIsMobileMenuOpen(false)}>
            ✕
          </button>
        </div>
        
        <nav className="flex-1 px-4 mt-4 md:mt-6 space-y-6 overflow-y-auto">
          {menuCategories.map((category) => (
            <div key={category.title}>
              <p className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">{category.title}</p>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <button 
                    key={item.name} 
                    onClick={() => handleTabChange(item.name)} 
                    className={`w-full flex items-center justify-between px-4 py-3 md:py-2.5 transition-all border-l-4 rounded-r-xl ${activeTab === item.name ? 'bg-blue-50/50 border-[#1E3A8A] text-[#1E3A8A] font-semibold' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                  >
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center flex-1">
            <button 
              className="mr-4 md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <input 
              type="text" 
              placeholder="Cari aset..." 
              className="hidden sm:block w-48 md:w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" 
            />
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative cursor-pointer text-xs md:text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">
              <span className="hidden sm:inline">Notifikasi</span>
              <span className="sm:hidden">🔔</span>
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Administrator</p>
                <p className="text-[10px] font-bold text-[#1E3A8A] uppercase">Super Admin</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#1E3A8A] text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-sm md:text-lg border-2 border-white">A</div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{activeTab === 'Dashboard' ? 'RINGKASAN SISTEM' : `MANAJEMEN ${activeTab.toUpperCase()}`}</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">Pantau operasional aset perusahaan secara real-time.</p>
          </div>
          
          {/* Example Overview Layout applied dynamically */}
          <AdminOverviewMockup />
        </section>
      </main>
    </div>
  );
};

// Inline mockup to show responsive grid and table
const AdminOverviewMockup = () => (
  <div className="space-y-6 md:space-y-8">
    {/* RESPONSIVE GRID */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Assets</p>
        <p className="text-2xl md:text-3xl font-black text-slate-800">124</p>
      </div>
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available</p>
        <p className="text-2xl md:text-3xl font-black text-[#1E3A8A]">85</p>
      </div>
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Borrowed</p>
        <p className="text-2xl md:text-3xl font-black text-yellow-600">30</p>
      </div>
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Maintenance</p>
        <p className="text-2xl md:text-3xl font-black text-[#B91C1C]">9</p>
      </div>
    </div>

    {/* RESPONSIVE TABLE */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 font-bold text-slate-800 text-sm md:text-base">
        Aktivitas Terkini
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-slate-50 text-slate-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-3 md:p-4">User</th>
              <th className="p-3 md:p-4">Action</th>
              <th className="p-3 md:p-4">Asset</th>
              <th className="p-3 md:p-4">Time</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 text-xs md:text-sm divide-y divide-slate-50">
            <tr>
              <td className="p-3 md:p-4 font-medium">Budi Santoso</td>
              <td className="p-3 md:p-4 text-green-600 font-semibold">Mengembalikan</td>
              <td className="p-3 md:p-4 font-bold text-[#1E3A8A]">Mouse Wireless</td>
              <td className="p-3 md:p-4 text-slate-400">10 menit lalu</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminDashboard;