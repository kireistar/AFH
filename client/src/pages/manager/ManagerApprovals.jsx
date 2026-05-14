import React, { useState } from 'react';

function ManagerApprovals() {
  const [approvals, setApprovals] = useState([
    {
      id: '#REQ-001',
      requester: 'Rizki Kurniawan',
      asset: 'MacBook Pro M3',
      riskScore: 7.8,
      behaviorHistory: '2 Late Returns, 1 Damaged',
      status: 'pending'
    },
    {
      id: '#REQ-002',
      requester: 'Alden Sayidina',
      asset: 'Thinkpad Pro',
      riskScore: 6.2,
      behaviorHistory: '1 Late Return',
      status: 'pending'
    },
    {
      id: '#REQ-003',
      requester: 'Budi Santoso',
      asset: 'Dell Monitor 27"',
      riskScore: 5.5,
      behaviorHistory: '1 Damaged Item',
      status: 'pending'
    }
  ]);

  const handleApprove = (id) => {
    // TODO: API call to approve request
    setApprovals(approvals.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ));
    console.log('Approved request:', id);
  };

  const handleReject = (id) => {
    // TODO: API call to reject request
    setApprovals(approvals.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
    console.log('Rejected request:', id);
  };

  const getRiskColor = (score) => {
    if (score >= 7) return 'bg-red-100 text-red-800';
    if (score >= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const pendingCount = approvals.filter(req => req.status === 'pending').length;

  return (
    <section className="p-8 overflow-y-auto">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Approved Today</p>
          <p className="text-3xl font-bold text-gray-800">{approvals.filter(req => req.status === 'approved').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Rejected Today</p>
          <p className="text-3xl font-bold text-gray-800">{approvals.filter(req => req.status === 'rejected').length}</p>
        </div>
      </div>

      {/* HIGH RISK APPROVAL QUEUE TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-700">
          High-Risk Requests (Requires Manager Decision)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-4">Request ID</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Behavior History</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
              {approvals.map(approval => (
                <tr key={approval.id} className={approval.status !== 'pending' ? 'bg-gray-50' : ''}>
                  <td className="p-4 font-semibold text-gray-700">{approval.id}</td>
                  <td className="p-4">{approval.requester}</td>
                  <td className="p-4">{approval.asset}</td>
                  <td className="p-4">
                    <span className={`${getRiskColor(approval.riskScore)} px-2 py-1 rounded text-xs font-bold`}>
                      {approval.riskScore}/10
                    </span>
                  </td>
                  <td className="p-4 text-xs">{approval.behaviorHistory}</td>
                  <td className="p-4">
                    <span className={`${getStatusBadge(approval.status)} px-2 py-1 rounded text-xs font-semibold`}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {approval.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleApprove(approval.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(approval.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">Already decided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ManagerApprovals;
