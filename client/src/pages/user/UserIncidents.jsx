import React, { useState, useEffect } from 'react';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';

const STATUS_STYLES = {
  open: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  investigating: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-50 text-slate-505 border-slate-200',
};

const UserIncidents = ({ incidents = [], loading = false, onOpenIncidentModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredIncidents = incidents.filter(inc => 
    !searchQuery.trim() || 
    inc.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inc.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inc.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (inc.status && inc.status.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (inc.date && inc.date.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredIncidents.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIncidents = filteredIncidents.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Reported Incidents</h3>
          <p className="text-sm text-slate-500">View logs and real-time status of technical damages you reported.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col gap-1 min-w-[200px] w-full md:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Incidents</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset, issue..."
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
            />
          </div>

          <div className="pt-4 md:pt-0">
            <button
              onClick={onOpenIncidentModal}
              className="px-4 py-2 bg-[#B91C1C] text-white rounded-xl text-sm font-semibold hover:bg-red-800 transition-colors shadow-sm cursor-pointer"
            >
              Report Issue
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No incidents reported yet.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Incident ID</th>
                  <th className="p-4 font-semibold">Asset Name</th>
                  <th className="p-4 font-semibold">Issue Description</th>
                  <th className="p-4 font-semibold">Reported Date</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{inc.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{inc.asset}</td>
                    <td className="p-4 text-sm text-slate-600">{inc.description}</td>
                    <td className="p-4 text-sm text-slate-500">{inc.date}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[inc._status] || STATUS_STYLES.open}`}>
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserIncidents;