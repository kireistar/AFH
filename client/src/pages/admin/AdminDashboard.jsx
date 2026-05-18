import React, { useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // --- DATA MOCKUP DASHBOARD ---
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

  const assetStats = {
    available: 85,
    borrowed: 30,
    maintenance: 9,
    total: 124
  };

  // --- DATA MOCKUP TABEL LAINNYA ---
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

  // --- LOGIKA & NAVIGASI ---
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

  // --- RENDER KONTEN ---
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-8">
            {/* Metrik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium">Total Aset</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">{assetStats.total}</p>
                <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold">▲ +12% <span className="text-slate-400 font-normal ml-1">dari bulan lalu</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium">Pending Handovers</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">{pendingHandoverCount}</p>
                <div className="mt-4 text-xs text-slate-400 font-medium">Siap diserahkan fisik</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-500 text-sm font-medium">Insiden Aktif</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">3</p>
                <div className="mt-4 text-xs text-[#B91C1C] font-semibold">▲ +2 <span className="text-slate-400 font-normal ml-1">hari ini</span></div>
              </div>
            </div>

            {/* Akses Cepat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Akses Cepat</h3>
              <div className="flex flex-wrap gap-4">
                <button className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center">
                  Scan QR Handover
                </button>
                <button className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center">
                  Tambah Aset Baru
                </button>
                <button className="flex-1 min-w-37.5 py-3 px-4 bg-slate-50 hover:bg-[#1E3A8A] hover:text-white rounded-xl text-sm font-bold text-[#1E3A8A] border border-blue-50 transition-all text-center">
                  Cetak Laporan
                </button>
              </div>
            </div>

            {/* Detail Log & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Aktivitas Terbaru</h3>
                  <button className="text-xs font-bold text-[#1E3A8A] hover:underline">Lihat Semua</button>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${act.status === 'Declined' ? 'bg-[#B91C1C]' : 'bg-emerald-500'}`}></div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{act.user} <span className="font-normal text-slate-500">{act.action}</span> {act.asset}</p>
                            <p className="text-xs text-slate-400">{act.time}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-slate-400">{act.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4">Status Inventaris</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-emerald-600 uppercase">Tersedia</span>
                        <span>{assetStats.available}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(assetStats.available / assetStats.total) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-[#1E3A8A] uppercase">Dipinjam</span>
                        <span>{assetStats.borrowed}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1E3A8A]" style={{ width: `${(assetStats.borrowed / assetStats.total) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-[#B91C1C] uppercase">Perbaikan</span>
                        <span>{assetStats.maintenance}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#B91C1C]" style={{ width: `${(assetStats.maintenance / assetStats.total) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4">Peringatan Sistem</h3>
                  <div className="space-y-3">
                    {systemAlerts.map(alert => (
                      <div key={alert.id} className={`p-3 rounded-xl border-l-4 ${alert.urgency === 'High' ? 'bg-red-50 border-[#B91C1C]' : 'bg-orange-50 border-orange-500'}`}>
                        <p className="text-xs font-bold text-slate-800">{alert.type}</p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Handover':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Daftar Penyerahan Aset</h3>
              <p className="text-sm text-slate-500 mt-1">Aset di bawah ini telah disetujui dan siap diserahkan kepada peminjam.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Peminjam</th>
                    <th className="p-4 font-semibold">Aset</th>
                    <th className="p-4 font-semibold">Disetujui Oleh</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {handovers.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{h.id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">{h.user}</div>
                        <div className="text-xs text-slate-500">{h.department}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{h.asset}</td>
                      <td className="p-4 text-sm text-slate-500">{h.approvedBy}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          h.status === 'Pending Handover' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>{h.status}</span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        {h.status === 'Pending Handover' ? (
                          <button onClick={() => handleCompleteHandover(h.id)} className="px-4 py-1.5 bg-[#1E3A8A] text-white shadow-sm hover:bg-blue-900 rounded-lg transition-all font-semibold text-xs">
                            Serahkan Aset
                          </button>
                        ) : <span className="text-xs font-medium text-slate-400 mr-2">Selesai</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Assets':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Inventaris Perangkat</h3>
              <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900">+ Tambah Aset</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">ID Aset</th>
                    <th className="p-4 font-semibold">Nama Perangkat</th>
                    <th className="p-4 font-semibold">Kategori</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-semibold text-slate-700">{asset.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{asset.name}</td>
                      <td className="p-4 text-sm text-slate-600">{asset.category}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          asset.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          asset.status === 'Borrowed' ? 'bg-blue-50 text-[#1E3A8A] border-blue-200' : 'bg-red-50 text-[#B91C1C] border-red-200'
                        }`}>{asset.status === 'Available' ? 'Tersedia' : asset.status === 'Borrowed' ? 'Dipinjam' : 'Perbaikan'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Users':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h3 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">Pengguna</th>
                    <th className="p-4 font-semibold">Departemen</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{user.department}</td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center text-slate-600">
                          <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {user.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Reports':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="text-lg font-bold text-slate-800">Evaluasi Pengembalian</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">ID Laporan</th>
                    <th className="p-4 font-semibold">Peminjam</th>
                    <th className="p-4 font-semibold">Kondisi</th>
                    <th className="p-4 font-semibold text-right">Denda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-semibold text-slate-700">{rep.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{rep.user} <span className="text-xs text-slate-400 block">{rep.asset}</span></td>
                      <td className="p-4 text-sm font-bold text-emerald-700">{rep.condition}</td>
                      <td className="p-4 text-sm font-bold text-right text-[#B91C1C]">{rep.fine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default: return null;
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
        <div className="p-4 mt-auto border-t border-slate-100"><button className="w-full text-left px-4 py-3 font-medium text-[#B91C1C] hover:bg-red-50 rounded-xl transition-colors text-sm uppercase tracking-widest">Logout</button></div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <input type="text" placeholder="Cari aset, user, atau aktivitas..." className="w-96 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all" />
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer text-sm font-bold text-slate-400 hover:text-[#1E3A8A] uppercase tracking-tighter transition-colors">Notifikasi <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#B91C1C] rounded-full border border-white"></span></div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden md:block"><p className="text-sm font-bold text-slate-800">Administrator</p><p className="text-[10px] font-bold text-[#1E3A8A] uppercase">Super Admin</p></div>
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