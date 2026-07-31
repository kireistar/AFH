import React, { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile drawer on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selectTab = (name) => {
    setActiveTab(name);
    setSidebarOpen(false);
    setDropdownOpen(false);
  };

  const roleLabels = {
    admin: 'Admin',
    manager: 'Manager',
    finance: 'Finance',
  };

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1E3A8A]">AFH {roleTitle}</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 -mr-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => selectTab(item.name)}
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
                    setSidebarOpen(false);
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
                    setSidebarOpen(false);
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
                setSidebarOpen(false);
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
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex-col transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Dynamic Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-5 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">{pageHeaderTitle}</h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">{pageHeaderSubtitle}</p>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
