import React, { useState, useEffect } from 'react';
import { verifyLedger } from '../../services/transactionService';
import SortHeader from '../../components/SortHeader';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';

const AdminSecurity = ({ transactions = [], loadingTransactions = false, onRefreshTransactions }) => {
  const [integrityData, setIntegrityData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const runIntegrityCheck = async () => {
    setChecking(true);
    setError(null);
    try {
      const result = await verifyLedger();
      setIntegrityData(result);
    } catch (err) {
      console.error('Failed to run integrity check:', err);
      setError('Failed to run ledger verification. Please check server logs.');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    runIntegrityCheck();
  }, []);

  const formatHash = (hash) => {
    if (!hash) return 'GENESIS (NULL)';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const table = useTable(transactions, {
    accessors: {
      date: (t) => t.occurred_at || t.date,
      action: (t) => t.action || t._action,
      previousHash: (t) => t.previous_hash,
      currentHash: (t) => t.current_hash,
      status: (t) =>
        integrityData?.tampered_transaction_ids?.includes(t.id || t._id) ? 1 : 0,
    },
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Integrity Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <div className={`p-3 md:p-4 rounded-full ${
              checking
                ? 'bg-blue-50 text-blue-600 animate-pulse'
                : integrityData?.valid
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600 animate-bounce'
            }`}>
              {checking ? (
                <svg className="w-6 h-6 md:w-8 md:h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 11 21.75 8.25" />
                </svg>
              ) : integrityData?.valid ? (
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-slate-800 font-bold text-base md:text-lg">Immutable Ledger Verification</h3>
              {checking ? (
                <p className="text-xs md:text-sm text-slate-500 mt-1">Analyzing SHA-256 block hash chains...</p>
              ) : error ? (
                <p className="text-xs md:text-sm text-rose-600 mt-1">{error}</p>
              ) : integrityData?.valid ? (
                <p className="text-xs md:text-sm text-emerald-600 font-semibold mt-1">
                  Ledger secure. No unauthorized database changes detected.
                </p>
              ) : (
                <p className="text-xs md:text-sm text-rose-600 font-semibold mt-1">
                  WARNING: Tampering detected! Ledger chain links are broken.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={runIntegrityCheck}
            disabled={checking}
            className="w-full md:w-auto px-5 py-2.5 bg-[#1E3A8A] text-white font-semibold text-sm rounded-xl hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {checking ? 'Scanning...' : 'Scan Integrity'}
          </button>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-slate-500 text-xs md:text-sm font-medium">Secured Transactions</h3>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1 md:mt-2">
            {checking ? '...' : integrityData?.total_transactions || 0}
          </p>
          <div className="mt-3 md:mt-4 flex items-center text-[10px] md:text-xs text-slate-400 font-semibold">
            <span>SHA-256 chained audit logs</span>
          </div>
        </div>
      </div>

      {/* Transactions Chained Visual Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-800">Chained Hash Ledger Logs</h3>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Verify sequential cryptographically-linked transaction blocks.
            </p>
          </div>
          <button
            onClick={onRefreshTransactions}
            disabled={loadingTransactions}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs md:text-sm rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Refresh Log List
          </button>
        </div>

        {/* Pembungkus agar tabel bisa di-scroll ke samping secara independen */}
        <div className="overflow-x-auto w-full">
          {loadingTransactions || checking ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <svg className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 11 21.75 8.25" />
              </svg>
              Verifying blocks...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No transaction blocks written to the ledger yet.</div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-100">
                  <SortHeader label="Block Code" sortKey="date" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} className="whitespace-nowrap" />
                  <SortHeader label="Action" sortKey="action" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} className="whitespace-nowrap" />
                  <th className="p-3 md:p-4 font-semibold whitespace-nowrap">Payload Snapshot</th>
                  <SortHeader label="Previous Hash" sortKey="previousHash" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} className="whitespace-nowrap" />
                  <SortHeader label="Current Hash" sortKey="currentHash" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} className="whitespace-nowrap" />
                  <SortHeader label="Status" sortKey="status" onSort={table.onSort} activeKey={table.sortKey} sortDir={table.sortDir} className="text-center whitespace-nowrap" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {table.pageItems.map((t, rowIdx) => {
                  const isTampered = integrityData?.tampered_transaction_ids?.includes(t.id || t._id);
                  const rowBgClass = isTampered ? 'bg-rose-50/50' : (rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70');

                  let parsedPayload = {};
                  try {
                    parsedPayload = typeof t.payload === 'string' ? JSON.parse(t.payload) : (t.payload || {});
                  } catch (e) {
                    parsedPayload = { notes: t.payload };
                  }

                  return (
                    <tr
                      key={t.id || t._id}
                      className={`transition-colors border-b border-slate-100/80 ${
                        isTampered
                          ? 'hover:bg-rose-100/60'
                          : `${rowBgClass} hover:bg-blue-50/30`
                      }`}
                    >
                      <td className="p-3 md:p-4 text-xs md:text-sm font-semibold text-slate-800">
                        <div className="flex flex-col">
                          <span className={isTampered ? 'text-rose-800' : 'text-slate-700'}>{t.transaction_code || t.id}</span>
                          <span className="text-[9px] md:text-[10px] text-slate-400 font-normal">
                            {new Date(t.occurred_at || t.date).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] md:text-xs font-semibold whitespace-nowrap ${
                          t.action === 'handover' || t._action === 'handover' ? 'bg-blue-50 text-[#1E3A8A]' :
                          t.action === 'return' || t._action === 'return' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {t.action || t._action}
                        </span>
                      </td>

                      <td className="p-3 md:p-4 text-xs md:text-sm text-slate-500 font-medium">
                        <div className="max-w-[200px] md:max-w-[250px] overflow-x-auto text-[10px] md:text-[11px] bg-slate-50 px-2 py-1.5 rounded border border-slate-100 font-mono whitespace-nowrap scrollbar-hide">
                          {t.action === 'fine_issued' || t._action === 'fine_issued' ? (
                            <span className="text-rose-600 font-semibold">
                              Fine: Rp {parsedPayload.fine_amount ? Number(parsedPayload.fine_amount).toLocaleString('en-US') : '0'}
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              {parsedPayload.notes || JSON.stringify(parsedPayload)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 md:p-4 text-[10px] md:text-xs font-mono text-slate-400">
                        {formatHash(t.previous_hash)}
                      </td>
                      <td className="p-3 md:p-4 text-[10px] md:text-xs font-mono text-slate-500 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className={isTampered ? 'text-rose-600' : 'text-slate-600'}>
                            {formatHash(t.current_hash)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm text-center">
                        {isTampered ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                            Tampered
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap">
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {table.count > 0 && <Pagination {...table} />}
      </div>
    </div>
  );
};

export default AdminSecurity;
