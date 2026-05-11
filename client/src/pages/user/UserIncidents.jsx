import React, { useState } from 'react';
import ReportIncidentModal from './ReportIncidentModal';

function UserIncidents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="p-8 overflow-y-auto">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Incident Reports</h2>

      {/* FILTERS & SEARCH */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search incidents..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Severity</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>Open</option>
          <option>In Review</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
      </div>

      {/* INCIDENTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Incident History
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Incident ID</th>
              <th className="p-4">Asset</th>
              <th className="p-4">Issue Type</th>
              <th className="p-4">Report Date</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            <tr>
              <td className="p-4 font-semibold">#INC-2026-001</td>
              <td className="p-4">MacBook Pro M3</td>
              <td className="p-4">Screen Damage</td>
              <td className="p-4">09/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  High
                </span>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  In Review
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">#INC-2026-002</td>
              <td className="p-4">Dell Monitor 27"</td>
              <td className="p-4">Power Issue</td>
              <td className="p-4">07/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Medium
                </span>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Resolved
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">#INC-2026-003</td>
              <td className="p-4">Logitech Mouse</td>
              <td className="p-4">Battery Not Charging</td>
              <td className="p-4">05/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  Critical
                </span>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Open
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">#INC-2026-004</td>
              <td className="p-4">USB-C Hub</td>
              <td className="p-4">Port Malfunction</td>
              <td className="p-4">01/05/2026</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Low
                </span>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  Closed
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* INCIDENT STATS CARDS */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Incident Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Open</p>
            <p className="text-2xl font-bold text-gray-800">1</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase font-bold">In Review</p>
            <p className="text-2xl font-bold text-gray-800">2</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Resolved</p>
            <p className="text-2xl font-bold text-gray-800">5</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Closed</p>
            <p className="text-2xl font-bold text-gray-800">8</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Critical</p>
            <p className="text-2xl font-bold text-gray-800">1</p>
          </div>
        </div>
      </div>

      {/* REPORT NEW INCIDENT BUTTON */}
      <div className="mt-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + Report Incident
        </button>
      </div>

      {/* REPORT INCIDENT MODAL */}
      <ReportIncidentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default UserIncidents;
