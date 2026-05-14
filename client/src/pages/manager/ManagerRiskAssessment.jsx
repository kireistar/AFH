import React, { useState } from 'react';

function ManagerRiskAssessment() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');

  const users = [
    {
      id: 'USER-001',
      name: 'Rizki Kurniawan',
      email: 'rizki.kurniawan@company.com',
      department: 'IT Operations',
      riskScore: 8.2,
      trend: 'up',
      totalRequests: 31,
      lateReturns: 5,
      damageReports: 2,
      lostItems: 1,
      totalFines: 'Rp 2.8M',
      lastIncident: '2026-05-08',
      riskFactors: [
        'Returned assets late 5 times (16% late return rate)',
        'Damaged 2 items in last 6 months',
        'Lost 1 item - MacBook charger',
        'Pattern: Returns on weekends (negligence risk)',
        'Escalated approvals: 3 times in last 3 months'
      ],
      recommendation: 'HIGH RISK - Require escalated approval for all requests. Consider mandatory training on asset care.',
      history: [
        { date: '2026-05-08', action: 'Returned laptop 3 days late', status: 'late' },
        { date: '2026-04-15', action: 'Monitor returned with cracked screen', status: 'damaged' },
        { date: '2026-03-22', action: 'Successfully returned MacBook on time', status: 'clean' },
        { date: '2026-03-01', action: 'Keyboard returned damaged', status: 'damaged' },
      ]
    },
    {
      id: 'USER-002',
      name: 'Alden Sayidina',
      email: 'alden.sayidina@company.com',
      department: 'Finance',
      riskScore: 6.5,
      trend: 'stable',
      totalRequests: 18,
      lateReturns: 2,
      damageReports: 1,
      lostItems: 0,
      totalFines: 'Rp 1.2M',
      lastIncident: '2026-04-20',
      riskFactors: [
        'Returned assets late 2 times (11% late return rate)',
        'Damaged 1 item',
        'Pattern: Occasional carelessness with equipment'
      ],
      recommendation: 'MEDIUM-HIGH RISK - Monitor closely. May require escalated approval for high-value items.',
      history: [
        { date: '2026-04-20', action: 'Returned Monitor with minor scratch', status: 'damaged' },
        { date: '2026-03-15', action: 'Laptop returned 2 days late', status: 'late' },
        { date: '2026-02-10', action: 'Keyboard returned on time', status: 'clean' },
      ]
    },
    {
      id: 'USER-003',
      name: 'Budi Santoso',
      email: 'budi.santoso@company.com',
      department: 'HR',
      riskScore: 5.1,
      trend: 'down',
      totalRequests: 24,
      lateReturns: 1,
      damageReports: 1,
      lostItems: 0,
      totalFines: 'Rp 800K',
      lastIncident: '2026-03-10',
      riskFactors: [
        'Returned assets late 1 time (4% late return rate)',
        'Damaged 1 item 2 months ago',
        'Generally responsible borrower'
      ],
      recommendation: 'MEDIUM RISK - Generally safe. Standard approval process acceptable.',
      history: [
        { date: '2026-03-10', action: 'Keyboard returned with missing keys', status: 'damaged' },
        { date: '2026-02-14', action: 'Monitor returned 1 day late', status: 'late' },
        { date: '2026-01-20', action: 'Successfully returned 3 items on time', status: 'clean' },
      ]
    },
    {
      id: 'USER-004',
      name: 'Ahmad Sidiq',
      email: 'ahmad.sidiq@company.com',
      department: 'Marketing',
      riskScore: 2.3,
      trend: 'down',
      totalRequests: 24,
      lateReturns: 0,
      damageReports: 0,
      lostItems: 0,
      totalFines: 'Rp 0',
      lastIncident: 'None',
      riskFactors: [
        'Excellent return record - 100% on-time',
        'No damage reports',
        'No lost items',
        'Consistent responsible behavior'
      ],
      recommendation: 'LOW RISK - Trusted borrower. Standard approval process is sufficient.',
      history: [
        { date: '2026-04-25', action: 'Successfully returned 2 items on time', status: 'clean' },
        { date: '2026-03-18', action: 'Returned monitor and keyboard in good condition', status: 'clean' },
        { date: '2026-02-12', action: 'Successfully returned laptop on time', status: 'clean' },
      ]
    },
  ];

  const getRiskColor = (score) => {
    if (score >= 7) return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-600' };
    if (score >= 4) return { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-600' };
    return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-600' };
  };

  const getRiskLabel = (score) => {
    if (score >= 7) return 'HIGH RISK';
    if (score >= 4) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return 'Increasing';
    if (trend === 'down') return 'Decreasing';
    return 'Stable';
  };

  const filteredUsers = filterRisk === 'all' 
    ? users 
    : filterRisk === 'high' 
      ? users.filter(u => u.riskScore >= 7)
      : filterRisk === 'medium'
        ? users.filter(u => u.riskScore >= 4 && u.riskScore < 7)
        : users.filter(u => u.riskScore < 4);

  return (
    <section className="p-8 overflow-y-auto">
      {/* FILTER TABS */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setFilterRisk('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filterRisk === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600'
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setFilterRisk('high')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filterRisk === 'high'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-red-600'
          }`}
        >
          High Risk ({users.filter(u => u.riskScore >= 7).length})
        </button>
        <button
          onClick={() => setFilterRisk('medium')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filterRisk === 'medium'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-600'
          }`}
        >
          Medium Risk ({users.filter(u => u.riskScore >= 4 && u.riskScore < 7).length})
        </button>
        <button
          onClick={() => setFilterRisk('low')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            filterRisk === 'low'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-600'
          }`}
        >
          Low Risk ({users.filter(u => u.riskScore < 4).length})
        </button>
      </div>

      {/* USER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {filteredUsers.map(user => {
          const colors = getRiskColor(user.riskScore);
          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.department}</p>
                </div>
                <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                  {getRiskLabel(user.riskScore)}
                </span>
              </div>

              {/* RISK SCORE */}
              <div className={`${colors.bg} ${colors.text} rounded-lg p-4 mb-4`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold opacity-75">AI Risk Score</p>
                    <p className="text-3xl font-bold">{user.riskScore}/10</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Trend</p>
                    <p className="text-sm font-semibold">{getTrendIcon(user.trend)}</p>
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-bold text-gray-800">{user.totalRequests}</p>
                  <p className="text-gray-600">Total Requests</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-bold text-red-600">{user.lateReturns}</p>
                  <p className="text-gray-600">Late Returns</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-bold text-orange-600">{user.damageReports}</p>
                  <p className="text-gray-600">Damages</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-bold text-red-600">{user.lostItems}</p>
                  <p className="text-gray-600">Lost Items</p>
                </div>
              </div>

              {/* EXPAND BUTTON */}
              <button className="w-full text-blue-600 font-semibold text-sm hover:text-blue-800 transition">
                {selectedUser?.id === user.id ? 'Hide Details' : 'View Details'}
              </button>

              {/* DETAILED VIEW */}
              {selectedUser?.id === user.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* RISK FACTORS */}
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-3">Risk Factors</h4>
                    <div className="space-y-2 text-xs text-gray-700">
                      {user.riskFactors.map((factor, idx) => (
                        <div key={idx} className="pl-3 border-l-2 border-gray-300 py-1">
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECOMMENDATION */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-xs font-bold text-blue-900 mb-1">Recommendation</p>
                    <p className="text-xs text-blue-800">{user.recommendation}</p>
                  </div>

                  {/* HISTORY */}
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-3">Recent History</h4>
                    <div className="space-y-2">
                      {user.history.map((event, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                          <span className="text-gray-600 font-semibold">{event.date}</span>
                          <span className={`font-semibold ${
                            event.status === 'clean' ? 'text-green-600' :
                            event.status === 'late' ? 'text-red-600' :
                            'text-orange-600'
                          }`}>
                            {event.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOTAL FINES */}
                  <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm">Total Fines:</span>
                    <span className="text-lg font-bold text-red-600">{user.totalFines}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RISK ASSESSMENT SUMMARY */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          Risk Assessment Summary
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Average Risk Score</p>
              <p className="text-4xl font-bold text-gray-800">
                {(users.reduce((sum, u) => sum + u.riskScore, 0) / users.length).toFixed(1)}
                <span className="text-lg text-gray-500">/10</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Highest Risk User</p>
              <p className="text-lg font-bold text-red-600">{users[0].name}</p>
              <p className="text-2xl font-bold text-gray-800">{users[0].riskScore}/10</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Recommended Action</p>
              <p className="text-sm text-gray-700">
                Requires escalated approval for <span className="font-bold">{users.filter(u => u.riskScore >= 7).length}</span> high-risk users
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManagerRiskAssessment;
