import React, { useState } from 'react';

const DashboardLayout = ({ 
  roleTitle,            // Contoh: "Admin", "Finance", "Manager"
  menuItems,            // Daftar menu khusus untuk masing-masing role
  activeTab,            // State tab aktif saat ini
  setActiveTab,         // Fungsi untuk mengubah tab
  userProfile,          // Data profil user ({ name, subTitle, email, avatarLetter })
  pageHeaderTitle,      // Judul besar halaman kontent
  pageHeaderSubtitle,   // Sub-judul halaman kontent
  children              // Ini adalah slot otomatis untuk menampung isi konten halaman
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* SIDEBAR SHARED TEMPLATE */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-8 pb-6">
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span className="text-[#B91C1C]">AFH</span>
            <span className="text-[#1E3A8A]">{roleTitle}</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 mt-2 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)} 
              className={`w-full flex items-center justify-between px-4 py-3 transition-all border-l-4 rounded-r-xl ${
                activeTab === item.name 
                ? 'bg-blue-50/50 border-[#1E3A8A] text-[#1E3A8A] font-semibold' 
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span>{item.name}</span>
              {item.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA SHARED TEMPLATE */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <input 
            type="text" 
            placeholder={`Search ${roleTitle.toLowerCase()} data...`} 
            className="w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" 
          />
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">
              Notifications 
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span>
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            {/* PROFILE SECTION WITH DROPDOWN */}
            <div className="relative">
              <div 
                className="flex items-center space-x-3 cursor-pointer select-none"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800">{userProfile.name}</p>
                  <p className="text-[10px] font-bold text-[#1E3A8A] uppercase">{userProfile.subTitle}</p>
                </div>
                <div className="w-10 h-10 bg-[#1E3A8A] text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-lg border-2 border-white hover:bg-blue-900 transition-colors">
                  {userProfile.avatarLetter}
                </div>
              </div>

              {/* DROPDOWN MENU */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">{userProfile.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{userProfile.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-xl transition-colors font-medium">
                      Account Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-[#B91C1C] hover:bg-red-50 rounded-xl transition-colors font-bold">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* REUSABLE CONTENT BLOCK */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{pageHeaderTitle}</h2>
            <p className="text-slate-400 text-sm font-medium">{pageHeaderSubtitle}</p>
          </div>
          
          {/* Di sinilah sub-komponen halaman (seperti tabel/overview) akan dimuat secara dinamis */}
          {children}
          
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;