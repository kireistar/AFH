import React, { useState, useEffect } from 'react';
import { FiLogOut, FiBell, FiShield, FiCheck } from 'react-icons/fi';
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
        <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{pageHeaderTitle}</h2>
            <p className="text-sm text-slate-500 mt-1">{pageHeaderSubtitle}</p>
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative">
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
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 p-4 space-y-3 animate-in fade-in duration-150">
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
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
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