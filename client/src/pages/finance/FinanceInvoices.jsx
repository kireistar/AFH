import React from 'react';

function FinanceInvoices() {
  return (
    <div className="p-8 overflow-y-auto">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Monthly Invoices</h2>

      {/* FILTERS & SEARCH (Konsisten dengan UserAssets) */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search invoices or employees..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Payment Reports
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
            {/* Data diambil dari FinanceDashboard asli */}
            <tr>
              <td className="p-4 font-semibold">INV-2026-001</td>
              <td className="p-4">Ahmad Sidiq</td>
              <td className="p-4">Rp 500.000</td>
              <td className="p-4">2026-03-15</td>
              <td className="p-4">2026-03-14</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Paid
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">INV-2026-002</td>
              <td className="p-4">Alden Sayidina</td>
              <td className="p-4">Rp 500.000</td>
              <td className="p-4">2026-03-20</td>
              <td className="p-4">-</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">INV-2026-003</td>
              <td className="p-4">Rizki Kurniawan</td>
              <td className="p-4">Rp 750.000</td>
              <td className="p-4">2026-03-18</td>
              <td className="p-4">-</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Overdue
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">INV-2026-004</td>
              <td className="p-4">Budi Santoso</td>
              <td className="p-4">Rp 1.000.000</td>
              <td className="p-4">2026-03-22</td>
              <td className="p-4">2026-03-21</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Paid
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FinanceInvoices;