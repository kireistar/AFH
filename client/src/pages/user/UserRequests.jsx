import React, { useState } from "react";
import ProduceQRModal from "../../components/ProduceQRModal";
import { useAuth } from "../../hooks/useAuth";
import SortHeader from "../../components/SortHeader";
import Pagination from "../../components/Pagination";
import useTable from "../../hooks/useTable";
import { tierRank, statusBadge } from "../../utils/styles";

// Helper function placed outside to ensure React purity compliance
const generateCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const HISTORY_STATUSES = ["returned", "rejected", "cancelled"];

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

  const tableAccessors = {
    id: (r) => r.request_code || r.id,
    asset: (r) => (typeof r.asset === 'object' ? (r.asset?.asset_name || '') : String(r.asset || '')),
    date: (r) => r.created_at || r.date,
    risk: (r) => tierRank(r.risk_tier_snapshot || r.urgency || 'Low'),
    status: (r) => r.status || r._status,
  };

  const tableOptions = {
    accessors: tableAccessors,
    defaultSortKey: "id",
    defaultSortDir: "desc",
  };

  const activeRequests = requests.filter((r) => {
    const s = (r.status || r._status || "pending_admin").toLowerCase();
    return !HISTORY_STATUSES.includes(s);
  });
  const historyRequests = requests.filter((r) => {
    const s = (r.status || r._status || "").toLowerCase();
    return HISTORY_STATUSES.includes(s);
  });

  const activeTable = useTable(activeRequests, tableOptions);
  const historyTable = useTable(historyRequests, tableOptions);

  const renderRequestTable = (table, showAction) => {
    if (table.count === 0) {
      return (
        <div className="p-8 text-center text-slate-400 text-sm">
          No requests found.
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <SortHeader label="Request ID" sortKey="id" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Asset Requested" sortKey="asset" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Application Date" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Risk Level" sortKey="risk" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} />
                {showAction && <th className="p-4 font-semibold text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.pageItems.map((req, rowIdx) => {
                const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
                const assetName = typeof req.asset === 'object' ? (req.asset?.asset_name || 'Asset') : String(req.asset || '-');
                const reqStatus = req.status || req._status || 'Pending';
                const isApproved = reqStatus.toLowerCase() === 'approved';
                return (
                  <tr
                    key={req.id}
                    className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}
                  >
                    <td className="p-4 text-sm font-semibold text-slate-700">
                      {req.request_code || req.id}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-800">
                      {assetName}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : (req.date || '-')}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center font-medium text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${req.risk_tier_snapshot === "High" || req.urgency === "High" ? "bg-red-500" : "bg-blue-500"}`}
                        ></span>
                        {req.risk_tier_snapshot || req.urgency || "Low"}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusBadge(reqStatus)}`}>
                        {reqStatus}
                      </span>
                    </td>
                    {showAction && (
                      <td className="p-4 text-sm text-right">
                        {isApproved && (
                          <button
                            onClick={() => handleOpenQR(req)}
                            className="px-3 py-1.5 bg-[#1E3A8A] text-white shadow-sm hover:bg-blue-900 rounded-lg transition-all font-semibold text-xs cursor-pointer"
                          >
                            Show QR
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {table.count > 0 && <Pagination {...table} />}
      </>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">My Requests</h3>
            <p className="text-sm text-slate-500">
              Track and monitor the evaluation status of your active asset applications.
            </p>
          </div>
          <button
            onClick={onOpenRequestModal}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
          >
            + New Request
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading...
          </div>
        ) : (
          renderRequestTable(activeTable, true)
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Request History</h3>
          <p className="text-sm text-slate-500 mt-1">
            Your returned, rejected, and cancelled requests.
          </p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading...
          </div>
        ) : (
          renderRequestTable(historyTable, false)
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
