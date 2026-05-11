import React from 'react';

function UserAssets() {
  return (
    <div className="p-8 overflow-y-auto">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">My Assets</h2>

      {/* FILTERS & SEARCH */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>Active</option>
          <option>Returned</option>
          <option>Pending Return</option>
        </select>
      </div>

      {/* ASSETS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Assets Inventory
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Asset Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Serial Number</th>
              <th className="p-4">Borrow Date</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-4 font-semibold">MacBook Pro M3</td>
              <td className="p-4">Laptop</td>
              <td className="p-4">MBP-2024-001</td>
              <td className="p-4">01/05/2026</td>
              <td className="p-4">15/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Active
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Dell Monitor 27"</td>
              <td className="p-4">Monitor</td>
              <td className="p-4">DEL-MON-002</td>
              <td className="p-4">10/04/2026</td>
              <td className="p-4">Returned</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Returned
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Logitech Mouse</td>
              <td className="p-4">Peripheral</td>
              <td className="p-4">LOG-MOUSE-003</td>
              <td className="p-4">28/04/2026</td>
              <td className="p-4">12/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Pending Return
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">USB-C Hub</td>
              <td className="p-4">Accessory</td>
              <td className="p-4">USB-HUB-004</td>
              <td className="p-4">05/05/2026</td>
              <td className="p-4">20/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ASSET CATEGORIES CARDS */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Asset Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Laptops</p>
            <p className="text-2xl font-bold text-gray-800">5</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Monitors</p>
            <p className="text-2xl font-bold text-gray-800">8</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Peripherals</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Accessories</p>
            <p className="text-2xl font-bold text-gray-800">15</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAssets;
