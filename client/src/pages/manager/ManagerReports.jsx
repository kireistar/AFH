import React, { useState } from 'react';

function ManagerReports() {
  const [reportFilter, setReportFilter] = useState('daily');

  const reportData = {
    daily: [
      { date: '2026-05-12', escalated: 5, approved: 3, rejected: 1, avgRiskScore: 6.8 },
      { date: '2026-05-11', escalated: 3, approved: 2, rejected: 1, avgRiskScore: 5.9 },
      { date: '2026-05-10', escalated: 7, approved: 5, rejected: 2, avgRiskScore: 7.2 },
    ],
    weekly: [
      { week: 'Week 1 (May 5-11)', escalated: 28, approved: 18, rejected: 7, avgRiskScore: 6.5 },
      { week: 'Week 2 (Apr 28-May 4)', escalated: 24, approved: 15, rejected: 6, avgRiskScore: 6.2 },
      { week: 'Week 3 (Apr 21-27)', escalated: 31, approved: 20, rejected: 8, avgRiskScore: 6.9 },
    ],
    monthly: [
      { month: 'May 2026', escalated: 112, approved: 72, rejected: 28, avgRiskScore: 6.6 },
      { month: 'April 2026', escalated: 98, approved: 62, rejected: 24, avgRiskScore: 6.4 },
      { month: 'March 2026', escalated: 105, approved: 68, rejected: 26, avgRiskScore: 6.7 },
    ]
  };

  const approvalRates = [
    { month: 'May', rate: 70 },
    { month: 'April', rate: 63 },
    { month: 'March', rate: 65 },
    { month: 'Feb', rate: 68 },
    { month: 'Jan', rate: 60 },
  ];

  const riskDistribution = [
    { range: 'Low (0-3)', count: 34, percentage: 24 },
    { range: 'Medium (4-6)', count: 62, percentage: 44 },
    { range: 'High (7-10)', count: 48, percentage: 32 },
  ];

  const currentData = reportData[reportFilter];

  return (
    <section className="p-8 overflow-y-auto">
      {/* FILTER TABS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setReportFilter('daily')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            reportFilter === 'daily'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setReportFilter('weekly')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            reportFilter === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setReportFilter('monthly')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            reportFilter === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* ESCALATION STATISTICS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Escalation Statistics ({reportFilter.charAt(0).toUpperCase() + reportFilter.slice(1)})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-4">{reportFilter === 'daily' ? 'Date' : reportFilter === 'weekly' ? 'Week' : 'Month'}</th>
                <th className="p-4">Escalated Requests</th>
                <th className="p-4">Approved</th>
                <th className="p-4">Rejected</th>
                <th className="p-4">Avg Risk Score</th>
                <th className="p-4">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
              {currentData.map((item, idx) => {
                const period = item.date || item.week || item.month;
                const approvalRate = Math.round(((item.approved) / (item.approved + item.rejected)) * 100);
                return (
                  <tr key={idx}>
                    <td className="p-4 font-semibold text-gray-700">{period}</td>
                    <td className="p-4">{item.escalated}</td>
                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{item.approved}</span></td>
                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{item.rejected}</span></td>
                    <td className="p-4"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">{item.avgRiskScore}/10</span></td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{approvalRate}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* APPROVAL RATE TREND */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
            Manager Approval Rate Trend (Monthly)
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <tbody className="space-y-2">
                {approvalRates.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-gray-700 font-semibold">{item.month} 2026</td>
                    <td className="p-2 flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full flex items-center justify-end px-2 text-white text-xs font-bold"
                          style={{ width: `${item.rate}%` }}
                        >
                          {item.rate}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RISK SCORE DISTRIBUTION */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
            Risk Score Distribution (Current Month)
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <tbody className="space-y-4">
                {riskDistribution.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-gray-700 font-semibold">{item.range}</td>
                    <td className="p-2">
                      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full flex items-center justify-end px-2 text-white text-xs font-bold ${
                            idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        >
                          {item.percentage}%
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-right text-gray-600">({item.count})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KEY INSIGHTS */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-8 border border-blue-200">
        <h3 className="font-bold text-gray-800 mb-4">📊 Key Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Approval rate is 70% this month (up from 63% in April)</li>
          <li>✓ Average risk score trending down: 6.6/10 (lower is better)</li>
          <li>✓ High-risk users represent 32% of escalations</li>
          <li>✓ Most rejections are due to pattern of late returns (68% of rejections)</li>
          <li>✓ Recommendation: Consider additional training for medium-risk users (44%)</li>
        </ul>
      </div>
    </section>
  );
}

export default ManagerReports;
