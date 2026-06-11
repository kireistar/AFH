import React, { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import AddAssetModal from '../../components/AddAssetModal';
import EditAssetModal from '../../components/EditAssetModal';

const AdminAssets = ({ assets = [], loading = false, onRefresh, autoOpenAdd = false, onAddModalClosed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

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

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Device Inventory</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
          >
            + Add Asset
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No assets found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">Asset ID</th>
                  <th className="p-4 font-semibold">Device Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{asset.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">{asset.name}</td>
                    <td className="p-4 text-sm text-slate-600">{asset.category}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        asset.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        asset.status === 'Borrowed' ? 'bg-blue-50 text-[#1E3A8A] border-blue-200' : 
                        asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-[#B91C1C] border-red-200'
                      }`}>{asset.status}</span>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={onRefresh} 
      />

      <EditAssetModal 
        isOpen={!!editingAsset} 
        onClose={() => setEditingAsset(null)} 
        onSuccess={onRefresh} 
        asset={editingAsset}
      />
    </>
  );
};

export default AdminAssets;