import React from 'react';

function AdminDashboard() {

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
                    Capstone IT
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="block p-3 rounded bg-blue-600 text-white">Dashboard</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Assets</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Approval</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Users</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Reports</a>
                </nav>
                <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
                    Logged in as: <span className="text-white">Admin</span>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* TOP HEADER */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
                    <h1 className="text-xl font-semibold text-gray-700">Admin Dashboard</h1>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
                        Logout
                    </button>
                </header>

                {/* DASHBOARD CONTENT */}
                <section className="p-8 overflow-y-auto">
                    {/* STATISTICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Total Assets</p>
                            <p className="text-3xl font-bold text-gray-800">847</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Pending Approvals</p>
                            <p className="text-3xl font-bold text-gray-800">23</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Active Users</p>
                            <p className="text-3xl font-bold text-gray-800">156</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Overdue Items</p>
                            <p className="text-3xl font-bold text-gray-800">12</p>
                        </div>
                    </div>

                    {/* APPROVAL REQUESTS */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
                            Pending Approval Requests
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Asset</th>
                                    <th className="p-4">Request Date</th>
                                    <th className="p-4">Purpose</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                                <tr>
                                    <td className="p-4">Budi Santoso</td>
                                    <td className="p-4">Dell Laptop XPS 15</td>
                                    <td className="p-4">2026-03-04</td>
                                    <td className="p-4">Development</td>
                                    <td className="p-4 space-x-2">
                                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Approve</button>
                                        <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Reject</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-4">Siti Nurhayati</td>
                                    <td className="p-4">Monitor 27</td>
                                    <td className="p-4">2026-03-23</td>
                                    <td className="p-4">Office Use</td>
                                    <td className="p-4 space-x-2">
                                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Approve</button>
                                        <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Reject</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ASSET INVENTORY */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
                            Asset Inventory Management
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Asset ID</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Current User</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                                <tr>
                                    <td className="p-4">AST-001</td>
                                    <td className="p-4">MacBook Pro M3</td>
                                    <td className="p-4">Laptop</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Available</span></td>
                                    <td className="p-4">-</td>
                                </tr>
                                <tr>
                                    <td className="p-4">AST-002</td>
                                    <td className="p-4">Thinkpad</td>
                                    <td className="p-4">Laptop</td>
                                    <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">In Use</span></td>
                                    <td className="p-4">Achmad Aryo</td>
                                </tr>
                                <tr>
                                    <td className="p-4">AST-003</td>
                                    <td className="p-4">Xiaomi Monitor</td>
                                    <td className="p-4">Monitor</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Damaged</span></td>
                                    <td className="p-4">Under Repair</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;