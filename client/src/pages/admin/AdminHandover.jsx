import React from 'react';

const AdminHandover = ({ handovers, handleCompleteHandover }) => {
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
};

export default AdminHandover;