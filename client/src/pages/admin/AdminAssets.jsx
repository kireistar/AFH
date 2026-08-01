import React, { useState, useEffect } from 'react';
import { FiEdit, FiUser } from 'react-icons/fi';
import AddAssetModal from '../../components/AddAssetModal';
import EditAssetModal from '../../components/EditAssetModal';
import UserProfileModal from '../../components/UserProfileModal';

const AdminAssets = ({
  assets = [],
  loading = false,
  onRefresh,
  autoOpenAdd = false,
  onAddModalClosed,
  activeLoans = [],
  users = [],
  transactions = [],
  onNavigateToUsers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (autoOpenAdd) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        if (onAddModalClosed) {
          onAddModalClosed();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoOpenAdd, onAddModalClosed]);

  // Helper to locate borrower info & username
  const getBorrowerInfo = (asset) => {
    // 1. Try finding in active loans (handed_over requests)
    let loan = activeLoans.find(
      l => (l._assetId && String(l._assetId) === String(asset._id)) ||
           (l.asset && (l.asset === asset.id || l.asset === asset.name))
    );

    let borrowerId = loan?._borrowerId;
    let borrowerName = loan?.user;

    // 2. Fallback to latest handover transaction if active loan not linked
    if (!borrowerId && !borrowerName) {
      const handoverTxn = transactions.find(
        t => t.action?.toLowerCase().includes('handover') &&
             (String(t.asset_id) === String(asset._id) || t.asset === asset.name || t.asset === asset.id)
      );
      if (handoverTxn) {
        borrowerId = handoverTxn.borrower_id;
        borrowerName = handoverTxn.party || handoverTxn.borrower;
      }
    }

    // 3. Find full user object from users list
    let userObj = null;
    if (borrowerId) {
      userObj = users.find(u => String(u._id || u.id) === String(borrowerId));
    }
    if (!userObj && borrowerName) {
      userObj = users.find(u => (u.name || u.employee_name) === borrowerName);
    }

    // Determine username string (e.g. budi.santoso)
    let username = '';
    if (userObj?.email) {
      username = userObj.email.split('@')[0];
    } else if (loan?.userEmail) {
      username = loan.userEmail.split('@')[0];
    } else if (userObj?.employee_name || userObj?.name) {
      username = (userObj.employee_name || userObj.name).toLowerCase().replace(/\s+/g, '.');
    } else if (borrowerName) {
      username = borrowerName.toLowerCase().replace(/\s+/g, '.');
    } else {
      username = 'user';
    }

    return {
      username,
      userObj: userObj || { employee_name: borrowerName || 'User', email: `${username}@afh.com` }
    };
  };

  // Derived filter options
  const uniqueCategories = ['All', ...new Set(assets.map(a => a.category).filter(Boolean))];
  const uniqueBrands = ['All', ...new Set(assets.map(a => a.brand).filter(b => b && b !== '-'))];

  // Custom status options for filter
  const statusFilterOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'available', label: 'Ready to Deploy' },
    { value: 'borrowed', label: 'Deployed' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  // Filter logic
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
    const matchesBrand = filterBrand === 'All' || asset.brand === filterBrand;

    const rawStatus = (asset._status || asset.status || '').toLowerCase();
    const matchesStatus = filterStatus === 'All' ||
      rawStatus === filterStatus.toLowerCase() ||
      (filterStatus === 'available' && (rawStatus === 'available' || asset.status === 'Available' || asset.status === 'Ready to Deploy')) ||
      (filterStatus === 'borrowed' && (rawStatus === 'borrowed' || asset.status === 'Borrowed' || asset.status?.startsWith('Deployed')));

    return matchesCategory && matchesBrand && matchesStatus;
  });

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Device Inventory</h3>
            <p className="text-xs text-slate-500 mt-1">Manage and filter physical hardware details.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Category Filter */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer"
              >
                {uniqueCategories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand</span>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer"
              >
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer"
              >
                {statusFilterOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end h-full xl:self-end pt-5 xl:pt-0">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                + Add Asset
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No assets found matching the selected filters.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Asset ID</th>
                  <th className="p-4 font-semibold">Brand</th>
                  <th className="p-4 font-semibold">Device Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Checked Out To</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssets.map(asset => {
                  const rawStatus = (asset._status || asset.status || '').toLowerCase();
                  const isAvailable = rawStatus === 'available' || asset.status === 'Available' || asset.status === 'Ready to Deploy';
                  const isBorrowed = rawStatus === 'borrowed' || asset.status === 'Borrowed' || asset.status?.startsWith('Deployed');
                  const isMaintenance = rawStatus === 'maintenance' || asset.status === 'Maintenance';

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-slate-700">{asset.id}</td>
                      <td className="p-4 text-sm font-semibold text-slate-700">{asset.brand}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">{asset.name}</td>
                      <td className="p-4 text-sm text-slate-600">{asset.category}</td>
                      <td className="p-4 text-sm">
                        {isAvailable ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Ready to Deploy
                          </span>
                        ) : isBorrowed ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-50 text-[#1E3A8A] border-blue-200">
                            Deployed
                          </span>
                        ) : isMaintenance ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                            Maintenance
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-[#B91C1C] border-red-200">
                            {asset.status || 'Retired'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {isBorrowed ? (
                          (() => {
                            const borrowerInfo = getBorrowerInfo(asset);
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserForModal(borrowerInfo.userObj);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1E3A8A] bg-blue-50/80 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                                title="View borrower profile"
                              >
                                <FiUser size={13} className="text-[#1E3A8A]" />
                                <span>@{borrowerInfo.username}</span>
                              </button>
                            );
                          })()
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-right">
                        <button 
                          onClick={() => setEditingAsset(asset)}
                          className="p-1.5 text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-blue-100"
                          title="Edit Asset"
                        >
                          <FiEdit size={14} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={onRefresh} 
        assets={assets}
      />

      <EditAssetModal 
        isOpen={!!editingAsset} 
        onClose={() => setEditingAsset(null)} 
        onSuccess={onRefresh} 
        asset={editingAsset}
        assets={assets}
      />

      <UserProfileModal
        isOpen={!!selectedUserForModal}
        onClose={() => setSelectedUserForModal(null)}
        user={selectedUserForModal}
        onNavigateToUsers={onNavigateToUsers}
      />
    </>
  );
};

export default AdminAssets;