import React from 'react';

const UserAssets = () => {
  // Mockup data for currently borrowed items
  const myAssets = [
    { id: 'AST-102', name: 'Lenovo ThinkPad X1', category: 'Laptop', handoverDate: 'Oct 01, 2023', condition: 'Good' },
    { id: 'AST-205', name: 'Wireless Mouse', category: 'Peripheral', handoverDate: 'Oct 15, 2023', condition: 'Good' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">My Borrowed Assets</h3>
        <p className="text-sm text-slate-500">List of devices currently assigned to you for corporate operations.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="p-4 font-semibold">Asset ID</th>
              <th className="p-4 font-semibold">Device Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Handover Date</th>
              <th className="p-4 font-semibold">Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {myAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-semibold text-slate-700">{asset.id}</td>
                <td className="p-4 text-sm font-medium text-slate-800">{asset.name}</td>
                <td className="p-4 text-sm text-slate-600">{asset.category}</td>
                <td className="p-4 text-sm text-slate-500">{asset.handoverDate}</td>
                <td className="p-4 text-sm">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    {asset.condition}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserAssets;