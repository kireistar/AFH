import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

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
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-[#1E3A8A]">AFH {roleTitle}</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.name
                  ? 'bg-blue-50/80 text-[#1E3A8A] font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
              }`}
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold">
              {userProfile.avatarLetter}
            </div>
            <div className="text-left flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
        
        {/* Konten Halaman (AdminAssets, AdminOverview, dll) */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          {children}
        </div>
      </main>
      
    </div>
  );
};

export default DashboardLayout;