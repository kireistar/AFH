import React, { useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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
  const { logout, userRole } = useAuth(); 
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleLabels = {
    admin: 'Admin',
    manager: 'Manager',
    finance: 'Finance',
  };

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

        {/* User Profile & Dropdown */}
        <div className="p-4 border-t border-slate-100 relative">
          {/* Backdrop for closing dropdown */}
          {dropdownOpen && (
            <div 
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setDropdownOpen(false)}
            />
          )}

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute bottom-20 left-4 right-4 bg-white border border-slate-100 rounded-2xl shadow-xl p-2.5 z-20 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Switch View Button for Admin/Manager/Finance */}
              {userRole && userRole !== 'user' && (
                roleTitle === 'Portal' ? (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(`/${userRole}`);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <span>⚙️</span>
                    <span>Back to {roleLabels[userRole] || userRole}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/user');
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <span>👤</span>
                    <span>Switch to Employee Portal</span>
                  </button>
                )
              )}

              {/* Logout Button */}
              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <FiLogOut size={14} className="text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Clickable Profile Card */}
          <button 
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 w-full px-2 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer text-left focus:outline-none relative z-10"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold shrink-0">
              {userProfile.avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
            </div>
            <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
              ▲
            </span>
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