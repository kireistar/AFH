import React from 'react';

function FinanceReports() {
  return (
    <div className="p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Financial Reports</h2>

      {/* FILTERS & SEARCH */}
      <div className="mb-8 flex gap-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>2026</option>
          <option>2025</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Types</option>
          <option>Monthly Revenue</option>
          <option>Fine Collections</option>
          <option>Outstanding Debts</option>
        </select>
      </div>

      {/* REPORTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Generated Reports
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Report Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Period</th>
              <th className="p-4">Generated Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-4 font-semibold">Revenue_Report_March_2026.pdf</td>
              <td className="p-4">Revenue</td>
              <td className="p-4">March 2026</td>
              <td className="p-4">2026-03-31</td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline font-medium text-xs">Download PDF</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Fine_Collection_Q1_2026.xlsx</td>
              <td className="p-4">Fines</td>
              <td className="p-4">Jan - Mar 2026</td>
              <td className="p-4">2026-04-01</td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline font-medium text-xs">Download XLSX</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FinanceReports;