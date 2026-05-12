import React from 'react';

function FinanceFines() {
  return (
    <div className="p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Fine Verification</h2>

      {/* FILTERS & SEARCH */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search employees or reasons..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* FINES TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
              <td className="p-4 font-semibold">Alden Sayidina</td>
              <td className="p-4">Rp 500.000</td>
              <td className="p-4">Late Return (3 Days)</td>
              <td className="p-4">2026-03-25</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </td>
              <td className="p-4 space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">Verify</button>
                <button className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500 transition">Reject</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Budi Santoso</td>
              <td className="p-4">Rp 1.000.000</td>
              <td className="p-4">Lost Item</td>
              <td className="p-4">2026-03-23</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </td>
              <td className="p-4 space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">Verify</button>
                <button className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500 transition">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FinanceFines;