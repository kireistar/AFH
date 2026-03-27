function FinanceDashboard() {

    return(
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
                    Capstone IT
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="block p-3 rounded bg-blue-600 text-white">Dashboard</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Invoice</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Payments</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Fine Verification</a>
                    <a href="#" className="block p-3 rounded hover:bg-slate-800 transition">Reports</a>
                </nav>
                <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
                    Logged in as: <span className="text-white">Finance</span>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* TOP HEADER */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
                    <h1 className="text-xl font-semibold text-gray-700">Finance Dashboard</h1>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
                        Logout
                    </button>
                </header>

                {/* DASHBOARD CONTENT */}
                <section className="p-8 overflow-y-auto">
                    {/* STATISTICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-800">Rp 125.5M</p>
                            <p className="text-xs text-gray-400 mt-2">This Month</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Outstanding</p>
                            <p className="text-3xl font-bold text-gray-800">Rp 18.2M</p>
                            <p className="text-xs text-gray-400 mt-2">Pending Collection</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Processed Fines</p>
                            <p className="text-3xl font-bold text-gray-800">47</p>
                            <p className="text-xs text-gray-400 mt-2">This Month</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                            <p className="text-sm text-gray-500 uppercase font-bold">Pending Verification</p>
                            <p className="text-3xl font-bold text-gray-800">12</p>
                            <p className="text-xs text-gray-400 mt-2">Awaiting Review</p>
                        </div>
                    </div>

                    {/* FINE VERIFICATION QUEUE */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
                            Fine Verification Queue
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Fine Amount</th>
                                    <th className="p-4">Reason</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                                <tr>
                                    <td className="p-4">Alden Sayidina</td>
                                    <td className="p-4">Rp 500.000</td>
                                    <td className="p-4">Late Return (3 Days)</td>
                                    <td className="p-4">2026-03-25</td>
                                    <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Pending</span></td>
                                    <td className="p-4 space-x-2">
                                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Verify</button>
                                        <button className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500">Reject</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-4">Budi Santoso</td>
                                    <td className="p-4">Rp 1.000.000</td>
                                    <td className="p-4">Lost Item</td>
                                    <td className="p-4">2026-03-23</td>
                                    <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Pending</span></td>
                                    <td className="p-4 space-x-2">
                                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Verify</button>
                                        <button className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500">Reject</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* MONTHLY INVOICES */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
                            Monthly Payment Reports
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Invoice ID</th>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Payment Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
                                <tr>
                                    <td className="p-4">INV-2026-001</td>
                                    <td className="p-4">Ahmad Sidiq</td>
                                    <td className="p-4">Rp 500.000</td>
                                    <td className="p-4">2026-03-15</td>
                                    <td className="p-4">2026-03-14</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Paid</span></td>
                                </tr>
                                <tr>
                                    <td className="p-4">INV-2026-002</td>
                                    <td className="p-4">Alden Sayidina</td>
                                    <td className="p-4">Rp 500.000</td>
                                    <td className="p-4">2026-03-20</td>
                                    <td className="p-4">-</td>
                                    <td className="p-4"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Pending</span></td>
                                </tr>
                                <tr>
                                    <td className="p-4">INV-2026-003</td>
                                    <td className="p-4">Rizki Kurniawan</td>
                                    <td className="p-4">Rp 750.000</td>
                                    <td className="p-4">2026-03-18</td>
                                    <td className="p-4">-</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Overdue</span></td>
                                </tr>
                                <tr>
                                    <td className="p-4">INV-2026-004</td>
                                    <td className="p-4">Budi Santoso</td>
                                    <td className="p-4">Rp 1.000.000</td>
                                    <td className="p-4">2026-03-22</td>
                                    <td className="p-4">2026-03-21</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Paid</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default FinanceDashboard;