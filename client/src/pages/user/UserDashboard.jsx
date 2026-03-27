import React from 'react';

function UserDashboard() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
          Capstone IT
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="block p-3 rounded bg-blue-600">Dashboard</a>
          <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Assets</a>
          <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Requests</a>
          <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Incidents</a>
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
          Logged in as: <span className="text-white">User</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
          <h1 className="text-xl font-semibold text-gray-700">Overview</h1>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
            Logout
          </button>
        </header>

        {/* DASHBOARD CARDS */}
        <section className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 uppercase font-bold">Total Assets</p>
              <p className="text-3xl font-bold text-gray-800">124</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500 uppercase font-bold">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-800">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
              <p className="text-sm text-gray-500 uppercase font-bold">Active Fines</p>
              <p className="text-3xl font-bold text-gray-800">5</p>
            </div>
          </div>

          {/* TABLE PREVIEW */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
              Recent Return Checks (3 Conditions)
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Damaged?</th>
                  <th className="p-4">Late?</th>
                  <th className="p-4">Lost?</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                <tr>
                  <td className="p-4">Hafidh Bintang</td>
                  <td className="p-4">MacBook Pro M3</td>
                  <td className="p-4 text-green-500">No</td>
                  <td className="p-4 text-red-500">Yes (2 Days)</td>
                  <td className="p-4 text-green-500">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;