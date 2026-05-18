import React, { useState } from 'react';
import AdminOverview from './AdminOverview';
import AdminAssets from './AdminAssets';
import AdminHandover from './AdminHandover';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- MASTER STATES (MOCKUP DATA RESTORED & TRANSLATED) ---
  const [recentActivities] = useState([
    { id: 1, user: 'Budi Santoso', action: 'Returned', asset: 'Wireless Mouse', time: '10 mins ago', status: 'Success' },
    { id: 2, user: 'AI System', action: 'Approved', asset: 'MacBook Pro M2', time: '45 mins ago', status: 'Auto' },
    { id: 3, user: 'Manager', action: 'Declined', asset: 'iPad Pro', time: '2 hours ago', status: 'Declined' },
    { id: 4, user: 'Siti Aminah', action: 'Borrowed', asset: 'Monitor Dell 27"', time: '3 hours ago', status: 'Success' },
  ]);

  const [systemAlerts] = useState([
    { id: 1, type: 'Overdue', message: 'Epson Projector not returned (2 days late)', urgency: 'High' },
    { id: 2, type: 'Stock', message: 'Mechanical Keyboard stock left: 1 unit', urgency: 'Medium' },
  ]);

  const assetStats = { available: 85, borrowed: 30, maintenance: 9, total: 124 };

  const [handovers, setHandovers] = useState([
    { id: 'HND-001', user: 'Budi Santoso', department: 'IT', asset: 'MacBook Pro M2', approvedBy: 'AI (Low Risk)', status: 'Pending Handover' },
    { id: 'HND-002', user: 'Siti Aminah', department: 'HR', asset: 'Monitor Dell 27"', approvedBy: 'Manager', status: 'Pending Handover' },
    { id: 'HND-003', user: 'Dewi Lestari', department: 'Marketing', asset: 'Wireless Mouse', approvedBy: 'AI (Low Risk)', status: 'Handed Over' }
  ]);

  const [assets] = useState([
    { id: 'AST-101', name: 'MacBook Pro M2', category: 'Laptop', condition: 'Good', status: 'Available' },
    { id: 'AST-102', name: 'Lenovo ThinkPad X1', category: 'Laptop', condition: 'Good', status: 'Borrowed' },
    { id: 'AST-201', name: 'Monitor Dell 27"', category: 'Peripheral', condition: 'Good', status: 'Available' },
    { id: 'AST-202', name: 'Epson Projector', category: 'Presentation', condition: 'Damaged', status: 'Maintenance' },
  ]);

  const [users] = useState([
    { id: 'USR-01', name: 'Budi Santoso', email: 'budi@afh.com', department: 'IT', status: 'Active' },
    { id: 'USR-02', name: 'Diana Manager', email: 'diana@afh.com', department: 'Management', status: 'Active' },
    { id: 'USR-03', name: 'Reza Finance', email: 'reza@afh.com', department: 'Finance', status: 'Active' },
    { id: 'USR-04', name: 'Siti Aminah', email: 'siti@afh.com', department: 'HR', status: 'Offline' },
  ]);

  const [reports] = useState([
    { id: 'REP-001', user: 'Budi Santoso', asset: 'Wireless Mouse', returnDate: '2023-10-28', condition: 'Good', late: 'No', fine: 'Rp 0' },
    { id: 'REP-002', user: 'Agus Pratama', asset: 'Lenovo ThinkPad', returnDate: '2023-10-27', condition: 'Damaged', late: 'Yes', fine: 'Rp 500.000' },
    { id: 'REP-003', user: 'Siti Aminah', asset: 'Mechanical Keyboard', returnDate: '2023-10-25', condition: 'Good', late: 'No', fine: 'Rp 0' },
  ]);

  const pendingHandoverCount = handovers.filter(h => h.status === 'Pending Handover').length;

  const menuCategories = [
    {
      title: 'MAIN MENU',
      items: [
        { name: 'Dashboard', badge: null },
        { name: 'Assets', badge: null },
        { name: 'Handover', badge: pendingHandoverCount > 0 ? `${pendingHandoverCount} Pending` : null, badgeColor: 'bg-blue-100 text-[#1E3A8A]' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Users', badge: null },
        { name: 'Reports', badge: null },
      ]
    }
  ];

  const handleCompleteHandover = (id) => {
    const isConfirmed = window.confirm("Confirm asset handover to user?");
    if (isConfirmed) {
      setHandovers(handovers.map(h => h.id === id ? { ...h, status: 'Handed Over' } : h));
    }
  };

  const handleTabChange = (name) => {
    setActiveTab(name);
    setIsMobileMenuOpen(false); 
  };

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
        
        <nav className="flex-1 px-4 mt-4 md:mt-6 space-y-6 overflow-y-auto mb-4">
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
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
          <div className="flex items-center flex-1">
            <button 
              className="mr-4 md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <input 
              type="text" 
              placeholder="Search assets, users, activities..." 
              className="hidden sm:block w-48 md:w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" 
            />
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative cursor-pointer text-xs md:text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">🔔</span>
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
            
            {/* PROFILE DROPDOWN TRIGGER */}
            <div className="relative">
              <div 
                className="flex items-center space-x-2 md:space-x-3 cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800">Administrator</p>
                  <p className="text-[10px] font-bold text-[#1E3A8A] uppercase">Super Admin</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#1E3A8A] text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-sm md:text-lg border-2 border-white">A</div>
              </div>

              {/* DROPDOWN MENU */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#B91C1C] hover:bg-red-50 transition-colors uppercase tracking-wider">
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {activeTab === 'Dashboard' ? 'SYSTEM OVERVIEW' : `${activeTab.toUpperCase()} MANAGEMENT`}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">
              {activeTab === 'Dashboard' ? 'Monitor company asset operations in real-time.' : `Manage your ${activeTab.toLowerCase()} database.`}
            </p>
          </div>
          
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;