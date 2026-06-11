import React from 'react';
import { 
  FiLogOut, 
  FiHome, 
  FiBox, 
  FiRepeat, 
  FiUsers, 
  FiFileText, 
  FiCheckSquare, 
  FiShield, 
  FiAlertTriangle, 
  FiDollarSign, 
  FiCreditCard 
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

// Helper to map menu name to corresponding Feather icon
const getMenuIcon = (name) => {
  const iconClass = "w-5 h-5 mr-3";
  switch (name.toLowerCase()) {
    case 'dashboard': return <FiHome className={iconClass} />;
    case 'assets': return <FiBox className={iconClass} />;
    case 'handover': return <FiRepeat className={iconClass} />;
    case 'users': return <FiUsers className={iconClass} />;
    case 'reports': return <FiFileText className={iconClass} />;
    case 'approvals': return <FiCheckSquare className={iconClass} />;
    case 'risk assessment': return <FiShield className={iconClass} />;
    case 'fines': return <FiDollarSign className={iconClass} />;
    case 'invoices': return <FiFileText className={iconClass} />;
    case 'payments': return <FiCreditCard className={iconClass} />;
    case 'requests': return <FiFileText className={iconClass} />;
    case 'incidents': return <FiAlertTriangle className={iconClass} />;
    default: return <FiBox className={iconClass} />;
  }
};


const DashboardLayout = ({ 
  roleTitle, 
  menuItems, 
  activeTab, 
  setActiveTab, 
  userProfile, 
  pageHeaderTitle, 
  pageHeaderSubtitle, 
  children 
}) => {
  const { logout } = useAuth(); 

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-66 bg-white border-r border-slate-200 flex flex-col text-slate-800">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-[#1E3A8A] tracking-wider">
            AFH {roleTitle}
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-blue-50/80 text-[#1E3A8A] font-bold border-l-4 border-[#1E3A8A]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center">
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#1E3A8A]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {getMenuIcon(item.name)}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold shadow-xs ${
                    isActive 
                      ? 'bg-[#1E3A8A] text-white'
                      : item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center justify-center font-bold">
              {userProfile.avatarLetter}
            </div>
            <div className="text-left flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dynamic Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800">{pageHeaderTitle}</h2>
          <p className="text-sm text-slate-500 mt-1">{pageHeaderSubtitle}</p>
        </header>
        
        {/* Konten Halaman */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          {children}
        </div>
      </main>
      
    </div>
  );
};

export default DashboardLayout;