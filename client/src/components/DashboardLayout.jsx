import React, { useState, useEffect } from 'react';
import { FiLogOut, FiBell, FiShield, FiCheck, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AccountSecurityModal from './AccountSecurityModal';
import { fetchUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';

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
  const { logout, userRole, user } = useAuth(); 
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchUserNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      loadNotifications();
    } catch (e) {}
  };

  const roleLabels = {
    admin: 'Admin',
    manager: 'Manager',
    finance: 'Finance',
  };

  return (
    <div className="flex h-dvh bg-slate-50">
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:transition-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#1E3A8A]">AFH {roleTitle}</h1>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setSidebarOpen(false);
              }}
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
              {/* Security Modal Button */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setSecurityModalOpen(true);
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-left"
              >
                <FiShield size={14} className="text-[#1E3A8A]" />
                <span>Account & Security</span>
              </button>

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
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5 shadow-sm z-10 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors shrink-0 cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu size={18} />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{pageHeaderTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">{pageHeaderSubtitle}</p>
            </div>
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors relative cursor-pointer"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setNotifOpen(false)} />
                <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 sm:max-w-sm bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`p-3 rounded-xl text-xs transition-colors cursor-pointer border ${
                            n.is_read ? 'bg-slate-50/50 border-slate-100 text-slate-500' : 'bg-blue-50/60 border-blue-100 text-slate-800 font-medium'
                          }`}
                        >
                          <div className="font-bold flex justify-between items-center">
                            <span>{n.title}</span>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>
        
        {/* Konten Halaman (AdminAssets, AdminOverview, dll) */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50">
          {children}
        </div>
      </main>

      <AccountSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        user={user}
      />
      
    </div>
  );
};

export default DashboardLayout;