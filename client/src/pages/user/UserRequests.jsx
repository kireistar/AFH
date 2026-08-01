import React, { useState } from "react";
import ProduceQRModal from "./ProduceQRModal";
import { useAuth } from "../../hooks/useAuth";

// Helper function placed outside to ensure React purity compliance
const generateCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const UserRequests = ({
  onOpenRequestModal,
  onRefresh,
  requests = [],
  loading = false,
}) => {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(null);

  const handleOpenQR = (req) => {
    setSelectedRequest(req);
    setQrTimestamp(generateCurrentTimestamp());
    setIsQRModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">My Requests</h3>
          <p className="text-sm text-slate-500">
            Track and monitor the evaluation status of your asset applications.
          </p>
        </div>
        <button
          onClick={onOpenRequestModal}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
        >
          + New Request
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No requests found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 font-semibold">Request ID</th>
                <th className="p-4 font-semibold">Asset Requested</th>
                <th className="p-4 font-semibold">Application Date</th>
                <th className="p-4 font-semibold">Risk Level</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                return (
                  <tr
                    key={req.id}
                    className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}
                  >
                    <td className="p-4 text-sm font-semibold text-slate-700">
                      {req.id}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-800">
                      {req.asset}
                    </td>
                    <td className="p-4 text-sm text-slate-500">{req.date}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center font-medium text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${req.urgency === "High" ? "bg-red-500" : "bg-blue-500"}`}
                        ></span>
                        {req.urgency}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          req.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right">
                      {req.status === "Approved" && (
                        <button
                          onClick={() => handleOpenQR(req)}
                          className="px-3 py-1.5 bg-[#1E3A8A] text-white shadow-sm hover:bg-blue-900 rounded-lg transition-all font-semibold text-xs cursor-pointer"
                        >
                          Show QR
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ProduceQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        requestData={selectedRequest}
        user={user}
        timestamp={qrTimestamp}
        onRefreshSuccess={() => {
          if (typeof onRefresh === 'function') onRefresh();
        }}
      />
    </div>
  );
};

export default UserRequests;
