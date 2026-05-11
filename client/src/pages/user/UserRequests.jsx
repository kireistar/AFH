import React, { useState } from 'react';
import NewRequestModal from './NewRequestModal';

function UserRequests() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 overflow-y-auto">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Asset Requests</h2>

      {/* FILTERS & SEARCH */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search requests..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Completed</option>
        </select>
      </div>

      {/* REQUESTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          My Requests
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Request ID</th>
              <th className="p-4">Asset Name</th>
              <th className="p-4">Request Date</th>
              <th className="p-4">Requested Duration</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-4 font-semibold">#REQ-2026-001</td>
              <td className="p-4">MacBook Pro M3</td>
              <td className="p-4">08/05/2026</td>
              <td className="p-4">14 Days</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">#REQ-2026-002</td>
              <td className="p-4">Dell Monitor 27"</td>
              <td className="p-4">06/05/2026</td>
              <td className="p-4">7 Days</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Approved
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">#REQ-2026-003</td>
              <td className="p-4">Logitech Keyboard</td>
              <td className="p-4">04/05/2026</td>
              <td className="p-4">30 Days</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Rejected
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">#REQ-2026-004</td>
              <td className="p-4">USB-C Hub</td>
              <td className="p-4">02/05/2026</td>
              <td className="p-4">10 Days</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  Completed
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* REQUEST STATS CARDS */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Request Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Pending</p>
            <p className="text-2xl font-bold text-gray-800">3</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Approved</p>
            <p className="text-2xl font-bold text-gray-800">8</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Rejected</p>
            <p className="text-2xl font-bold text-gray-800">2</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Completed</p>
            <p className="text-2xl font-bold text-gray-800">15</p>
          </div>
        </div>
      </div>

      {/* NEW REQUEST BUTTON */}
      <div className="mt-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + New Request
        </button>
      </div>

      {/* NEW REQUEST MODAL */}
      <NewRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default UserRequests;
