function ManagerDashboard() {

    return(
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
                    Capstone IT
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="block p-3 rounded bg-blue-600 text-white">Dashboard</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Reports</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Analytics</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Approvals</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Risk Assessment</a>
                </nav>
                <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
                    Logged in as: <span className="text-white">Manager</span>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* TOP HEADER */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
                    <h1 className="text-xl font-semibold text-gray-700">Manager Dashboard</h1>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
                        Logout
                    </button>
                </header>

                {/* DASHBOARD CONTENT */}
                <section className="p-8 overflow-y-auto">
                    {/* STATISTICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Avg Risk Score</p>
                            <p className="text-3xl font-bold text-gray-800">3.2/10</p>
                            <p className="text-xs text-gray-400 mt-2">Lower is Better</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">High Risk Users</p>
                            <p className="text-3xl font-bold text-gray-800">8</p>
                            <p className="text-xs text-gray-400 mt-2">Requires Attention</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Compliant Returns</p>
                            <p className="text-3xl font-bold text-gray-800">92%</p>
                            <p className="text-xs text-gray-400 mt-2">On Time & Undamaged</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Total Fines</p>
                            <p className="text-3xl font-bold text-gray-800">Rp 4.5M</p>
                            <p className="text-xs text-gray-400 mt-2">This Month</p>
                        </div>
                    </div>

                    {/* HIGH RISK APPROVAL QUEUE */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
                            High-Risk Approvals (Requires Manager Decision)
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Requester</th>
                                    <th className="p-4">Asset</th>
                                    <th className="p-4">Risk Score</th>
                                    <th className="p-4">Behavior History</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                                <tr>
                                    <td className="p-4">Rizki Kurniawan</td>
                                    <td className="p-4">MacBook Pro M3</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">7.8/10</span></td>
                                    <td className="p-4">2 Late Returns, 1 Damaged</td>
                                    <td className="p-4 space-x-2">
                                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Approve</button>
                                        <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Deny</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-4">Alden Sayidina</td>
                                    <td className="p-4">Thinkpad Pro</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">6.2/10</span></td>
                                    <td className="p-4">1 Late Return</td>
                                    <td className="p-4 space-x-2">
                                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Approve</button>
                                        <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Deny</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* BEHAVIOR ANALYTICS TABLE */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
                            Employee Behavior Analysis
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Total Requests</th>
                                    <th className="p-4">Late Returns</th>
                                    <th className="p-4">Damaged Items</th>
                                    <th className="p-4">Lost Items</th>
                                    <th className="p-4">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                                <tr>
                                    <td className="p-4">Ahmad Sidiq</td>
                                    <td className="p-4">24</td>
                                    <td className="p-4">0</td>
                                    <td className="p-4">0</td>
                                    <td className="p-4">0</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Low</span></td>
                                </tr>
                                <tr>
                                    <td className="p-4">Budi Santoso</td>
                                    <td className="p-4">18</td>
                                    <td className="p-4">2</td>
                                    <td className="p-4">1</td>
                                    <td className="p-4">0</td>
                                    <td className="p-4"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Medium</span></td>
                                </tr>
                                <tr>
                                    <td className="p-4">Alden Sayidina</td>
                                    <td className="p-4">31</td>
                                    <td className="p-4">5</td>
                                    <td className="p-4">2</td>
                                    <td className="p-4">1</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">High</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

        </div>
    );
}

export default ManagerDashboard;