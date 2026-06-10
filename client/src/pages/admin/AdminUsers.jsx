import React from 'react';

const AdminUsers = ({ users = [], loading = false }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">User Management</h3>
        <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors">
          + Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
            <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
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
        )}
      </div>
    </div>
  );
};

export default AdminUsers;