import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import UserAssets from './UserAssets';
import UserRequests from './UserRequests';
import UserIncidents from './UserIncidents';

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
          Capstone IT
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/user')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/user' || currentPath === '/user/' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/user/assets')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/user/assets' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Assets
          </button>
          <button 
            onClick={() => navigate('/user/requests')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/user/requests' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Requests
          </button>
          <button 
            onClick={() => navigate('/user/incidents')}
            className={`w-full text-left p-3 rounded transition ${
              currentPath === '/user/incidents' 
                ? 'bg-blue-600' 
                : 'hover:bg-slate-800'
            }`}
          >
            Incidents
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
          Logged in as: <span className="text-white">User</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
          <h1 className="text-xl font-semibold text-gray-700">
            {currentPath === '/user' || currentPath === '/user/' ? 'Overview' : currentPath === '/user/assets' ? 'My Assets' : currentPath === '/user/requests' ? 'Asset Requests' : currentPath === '/user/incidents' ? 'Incident Reports' : 'Page'}
          </h1>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
            Logout
          </button>
        </header>

        {/* CONTENT ROUTES */}
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/assets" element={<UserAssets />} />
          <Route path="/requests" element={<UserRequests />} />
          <Route path="/incidents" element={<UserIncidents />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardOverview() {
  return (
    <section className="p-8 overflow-y-auto">
      {/* DASHBOARD CARDS */}
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
  );
}

export default UserDashboard;