import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiUser, FiMonitor, FiSmartphone, FiServer, FiGlobe, FiHardDrive, FiMapPin, FiUpload } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import AddAssetModal from '../../components/AddAssetModal';
import EditAssetModal from '../../components/EditAssetModal';
import BulkImportModal from '../../components/BulkImportModal';
import UserProfileModal from '../../components/UserProfileModal';
import ImageLightboxModal from '../../components/ImageLightboxModal';
import AssetQRModal from '../../components/AssetQRModal';
import { statusBadge } from '../../utils/styles';
import ColumnToggleDropdown from '../../components/ColumnToggleDropdown';
import MultiSelectFilterDropdown from '../../components/MultiSelectFilterDropdown';
import ConfirmModal from '../../components/ConfirmModal';
import Toast, { createToast } from '../../components/Toast';
import SortHeader from '../../components/SortHeader.jsx';
import Pagination from '../../components/Pagination';
import useTable from '../../hooks/useTable';
import { deleteAsset } from '../../services/assetService';

const ALL_COLUMNS = [
  { key: 'image', label: 'Device Image' },
  { key: 'assetId', label: 'Asset ID' },
  { key: 'name', label: 'Asset Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'borrowedBy', label: 'Borrowed By' },
  { key: 'serial', label: 'Serial Number' },
  { key: 'location', label: 'Location' },
  { key: 'cost', label: 'Purchase Cost' },
  { key: 'actions', label: 'Actions' },
];

const AdminAssets = ({ assets = [], loading = false, onRefresh, autoOpenAdd = false, onAddModalClosed }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // Deletion Modal & Toast state
  const [deleteTargetAsset, setDeleteTargetAsset] = useState(null);
  const [isDeletingAsset, setIsDeletingAsset] = useState(false);

  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type) => {
    setToasts(prev => [...prev, createToast(message, type)]);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // User Profile Modal state
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowedAssetContext, setBorrowedAssetContext] = useState(null);

  // Lightbox Modal state for full-res image inspection
  const [lightboxImage, setLightboxImage] = useState({ isOpen: false, src: '', title: '' });

  // QR Modal state for sticker label printing
  const [selectedQRAsset, setSelectedQRAsset] = useState(null);

  // Column Visibility state (persisted in localStorage)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('afh_asset_visible_columns_v3');
      return saved ? JSON.parse(saved) : {
        image: true,
        assetId: true,
        name: true,
        brand: true,
        category: true,
        status: true,
        borrowedBy: true,
        serial: true,
        location: true,
        cost: true,
        actions: true,
      };
    } catch {
      return {
        image: true,
        assetId: true,
        name: true,
        brand: true,
        category: true,
        status: true,
        borrowedBy: true,
        serial: true,
        location: true,
        cost: true,
        actions: true,
      };
    }
  });

  const handleToggleColumn = (key) => {
    setVisibleColumns(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('afh_asset_visible_columns_v2', JSON.stringify(next));
      return next;
    });
  };

  const handleResetColumns = () => {
    const defaultCols = {
      image: true,
      name: true,
      brand: true,
      category: true,
      status: true,
      borrowedBy: true,
      serial: true,
      location: true,
      cost: true,
      actions: true,
    };
    setVisibleColumns(defaultCols);
    localStorage.setItem('afh_asset_visible_columns_v2', JSON.stringify(defaultCols));
  };

  // Multi-Select Filter states (Enforce minimum 1 active filter at all times)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(['Available']);

  const handleCategoriesChange = (newSelected) => {
    if (newSelected.length === 0 && selectedBrands.length === 0 && selectedStatuses.length === 0) {
      addToast('At least 1 filter option must remain active.', 'warning');
      return;
    }
    setSelectedCategories(newSelected);
  };

  const handleBrandsChange = (newSelected) => {
    if (selectedCategories.length === 0 && newSelected.length === 0 && selectedStatuses.length === 0) {
      addToast('At least 1 filter option must remain active.', 'warning');
      return;
    }
    setSelectedBrands(newSelected);
  };

  const handleStatusesChange = (newSelected) => {
    if (selectedCategories.length === 0 && selectedBrands.length === 0 && newSelected.length === 0) {
      addToast('At least 1 filter option must remain active.', 'warning');
      return;
    }
    setSelectedStatuses(newSelected);
  };

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

  // Derived unique options for multi-select filters
  const uniqueCategories = [...new Set(assets.map(a => a.category).filter(Boolean))];
  const uniqueBrands = [...new Set(assets.map(a => a.brand).filter(b => b && b !== '-'))];
  const uniqueStatuses = Array.from(new Set(['Available', 'Borrowed', 'Maintenance', 'Retired', 'Broken', ...assets.map(a => a.status).filter(Boolean)]));

  // Multi-select Filter logic
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(asset.category);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(asset.brand);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(asset.status);
    return matchesCategory && matchesBrand && matchesStatus;
  });

  const table = useTable(filteredAssets, {
    accessors: {
      assetId: (a) => a.id || a._id,
      name: (a) => a.name,
      brand: (a) => a.brand,
      category: (a) => a.category,
      status: (a) => a.status,
      borrowedBy: (a) => a.borrowedBy?.name || '',
      serial: (a) => a.serialNumber,
      location: (a) => a.location,
      cost: (a) => Number(a.purchaseValue || 0),
    },
  });

  const handleOpenUserProfile = (user, asset) => {
    setSelectedBorrower(user);
    setBorrowedAssetContext(asset);
  };

  const confirmDeleteAsset = async () => {
    if (!deleteTargetAsset) return;
    setIsDeletingAsset(true);
    try {
      await deleteAsset(deleteTargetAsset._id);
      setDeleteTargetAsset(null);
      addToast(`${deleteTargetAsset.name} has been deleted successfully.`, "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      setDeleteTargetAsset(null);
      addToast(err.message || `Failed to delete ${deleteTargetAsset.name}.`, "error");
    } finally {
      setIsDeletingAsset(false);
    }
  };

  // Track image load retries and errors to fallback gracefully
  const [failedImages, setFailedImages] = useState({});
  const [imageSrcRetries, setImageSrcRetries] = useState({});

  const handleImageError = (assetKey, currentSrc, rawUrl) => {
    if (!imageSrcRetries[assetKey] && rawUrl && rawUrl.startsWith('/uploads/')) {
      const fallbackSrc = currentSrc.includes('localhost:8000')
        ? currentSrc.replace('localhost:8000', '127.0.0.1:8000')
        : rawUrl;
      setImageSrcRetries(prev => ({ ...prev, [assetKey]: fallbackSrc }));
    } else {
      setFailedImages(prev => ({ ...prev, [assetKey]: true }));
    }
  };

  const renderDeviceThumbnail = (asset) => {
    const rawUrl = asset?._imageUrlRaw || asset?.imageUrl;
    const imageUrl = imageSrcRetries[asset?._id || asset?.id] || asset?.imageUrl;
    const assetKey = asset?._id || asset?.id;

    if (imageUrl && !failedImages[assetKey]) {
      return (
        <button
          type="button"
          onClick={() => setLightboxImage({ isOpen: true, src: imageUrl, title: `${asset.brand} - ${asset.name}` })}
          className="group relative cursor-pointer outline-none focus:ring-2 focus:ring-[#1E3A8A] rounded-2xl transition-all"
          title="Click to view full resolution image"
        >
          <img
            src={imageUrl}
            alt={asset?.name || 'Device Image'}
            onError={() => handleImageError(assetKey, imageUrl, rawUrl)}
            className="max-h-[125px] max-w-[125px] w-auto h-auto rounded-[#10px] shadow-2xs border border-slate-200/80 object-contain group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-200"
          />
        </button>
      );
    }

    return <span className="text-slate-300 font-medium text-xs">-</span>;
  };

  const renderStatusBadge = (status) => {
    let dotColor = 'bg-slate-400';

    if (status === 'Available') {
      dotColor = 'bg-emerald-500';
    } else if (status === 'Borrowed') {
      dotColor = 'bg-[#1E3A8A]';
    } else if (status === 'Maintenance' || status === 'Maintenanced') {
      dotColor = 'bg-amber-500';
    } else if (status === 'Retired' || status === 'Broken' || status === 'Damaged' || status === 'Lost') {
      dotColor = 'bg-rose-500';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge(status)}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        <span>{status}</span>
      </span>
    );
  };

  // Active columns list for dynamic rendering
  const activeVisibleColumns = ALL_COLUMNS.filter(col => visibleColumns[col.key] !== false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Streamlined Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Device Inventory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage and monitor physical hardware assets across departments.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Multi-Select Category Filter */}
            <MultiSelectFilterDropdown
              label="Category"
              options={uniqueCategories}
              selected={selectedCategories}
              onChange={handleCategoriesChange}
              placeholder="All Categories"
            />

            {/* Multi-Select Brand Filter */}
            <MultiSelectFilterDropdown
              label="Brand"
              options={uniqueBrands}
              selected={selectedBrands}
              onChange={handleBrandsChange}
              placeholder="All Brands"
            />

            {/* Multi-Select Status Filter (Matches Columns dropdown style) */}
            <MultiSelectFilterDropdown
              label="Status"
              options={uniqueStatuses}
              selected={selectedStatuses}
              onChange={handleStatusesChange}
              showActions={false}
            />

            {/* Column Customizer Dropdown */}
            <ColumnToggleDropdown
              columns={ALL_COLUMNS}
              visibleColumns={visibleColumns}
              onToggleColumn={handleToggleColumn}
              onResetColumns={handleResetColumns}
            />

            <button 
              onClick={() => setIsBulkImportOpen(true)}
              className="px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <FiUpload size={13} />
              <span>Import CSV</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#1E3A8A] text-[#ffffff] rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer whitespace-nowrap shadow-sm ml-1"
            >
              + Add Asset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading inventory database...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No assets found matching the selected filters.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1150px]">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-100/70">
                  {activeVisibleColumns.map((col) => {
                    if (col.key === 'image') {
                      return (
                        <th key="image" className="p-3.5 font-semibold text-center w-16">
                          Device Image
                        </th>
                      );
                    }

                    if (col.key === 'actions') {
                      return (
                        <th key="actions" className="p-3.5 font-semibold text-right pr-6">
                          Actions
                        </th>
                      );
                    }

                    return (
                      <SortHeader
                        key={col.key}
                        label={col.label}
                        sortKey={col.key === 'cost' ? 'cost' : col.key}
                        onSort={table.onSort}
                        activeKey={table.sortKey}
                        sortDir={table.sortDir}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {table.pageItems.map((asset, rowIdx) => {
                  // Alternating ROW colors (Zebra Striping: Row 1 white, Row 2 light grey, Row 3 white, Row 4 light grey)
                  const rowBgClass = rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

                  return (
                    <tr 
                      key={asset._id || asset.id} 
                      className={`${rowBgClass} hover:bg-blue-50/30 transition-colors border-b border-slate-100/80`}
                    >
                      {activeVisibleColumns.map((col) => {
                        switch (col.key) {
                          case 'image':
                            return (
                              <td key="image" className="p-3.5 text-center align-middle">
                                <div className="flex justify-center items-center">
                                  {renderDeviceThumbnail(asset)}
                                </div>
                              </td>
                            );

                          case 'assetId':
                            return (
                              <td key="assetId" className="p-3.5 text-xs font-mono font-bold text-slate-800 align-middle">
                                <Link 
                                  to={`/admin/assets/view/${asset._id}`} 
                                  className="hover:text-[#1E3A8A] hover:underline cursor-pointer transition-colors"
                                  title="View full asset specifications & details"
                                >
                                  {asset.id || asset._id}
                                </Link>
                              </td>
                            );

                          case 'name':
                            return (
                              <td key="name" className="p-3.5 text-sm font-semibold text-slate-800 align-middle">
                                <Link 
                                  to={`/admin/assets/view/${asset._id}`} 
                                  className="hover:text-[#1E3A8A] hover:underline cursor-pointer transition-colors"
                                  title="View full asset specifications & details"
                                >
                                  {asset.name}
                                </Link>
                              </td>
                            );

                          case 'brand':
                            return (
                              <td key="brand" className="p-3.5 text-sm font-medium text-slate-700 align-middle">
                                {asset.brand}
                              </td>
                            );

                          case 'category':
                            return (
                              <td key="category" className="p-3.5 text-sm text-slate-600 align-middle">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-650 text-xs font-semibold border border-slate-200/50">
                                  {asset.category}
                                </span>
                              </td>
                            );

                          case 'status':
                            return (
                              <td key="status" className="p-3.5 text-sm align-middle">
                                {renderStatusBadge(asset.status)}
                              </td>
                            );

                          case 'borrowedBy':
                            return (
                              <td key="borrowedBy" className="p-3.5 text-sm align-middle">
                                {asset.status === 'Borrowed' && asset.borrowedBy ? (
                                  <button
                                    onClick={() => handleOpenUserProfile(asset.borrowedBy, asset)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 hover:text-blue-900 border border-blue-100 text-xs font-semibold transition-all cursor-pointer"
                                    title="View Borrower Profile"
                                  >
                                    <FiUser size={12} className="text-[#1E3A8A]" />
                                    <span>{asset.borrowedBy.name}</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-400 font-medium text-xs">-</span>
                                )}
                              </td>
                            );

                          case 'serial':
                            return (
                              <td key="serial" className="p-3.5 text-sm font-mono text-xs text-slate-600 align-middle">
                                {asset.serialNumber || '-'}
                              </td>
                            );

                          case 'location':
                            return (
                              <td key="location" className="p-3.5 text-sm text-slate-600 align-middle">
                                <div className="flex items-center gap-1">
                                  <FiMapPin size={12} className="text-slate-400 shrink-0" />
                                  <span>{asset.location || '-'}</span>
                                </div>
                              </td>
                            );

                          case 'cost':
                            return (
                              <td key="cost" className="p-3.5 text-sm font-medium text-slate-700 whitespace-nowrap align-middle">
                                {asset.purchaseValueFormatted}
                              </td>
                            );

                          case 'actions':
                            return (
                              <td key="actions" className="p-3.5 text-sm text-right pr-6 align-middle">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button 
                                    onClick={() => setSelectedQRAsset(asset)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-emerald-100"
                                    title="Generate & Print Asset QR Code Sticker"
                                  >
                                    <BsQrCode size={14} className="text-emerald-600" />
                                    <span>QR</span>
                                  </button>

                                  <button 
                                    onClick={() => navigate(`/admin/assets/view/${asset._id}?edit=true`)}
                                    className="p-1.5 text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-blue-100"
                                    title="View & Edit Asset Specifications"
                                  >
                                    <FiEdit size={14} />
                                    <span>Edit</span>
                                  </button>

                                  {!asset.hasBorrowHistory && (
                                    <button
                                      onClick={() => setDeleteTargetAsset(asset)}
                                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-red-100"
                                      title="Delete Asset (Only available for assets that have never been borrowed)"
                                    >
                                      <FiTrash2 size={14} className="text-red-500" />
                                      <span className="text-red-600">Delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            );

                          default:
                            return null;
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {table.count > 0 && <Pagination {...table} />}
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

      <UserProfileModal
        isOpen={!!selectedBorrower}
        onClose={() => {
          setSelectedBorrower(null);
          setBorrowedAssetContext(null);
        }}
        user={selectedBorrower}
        assetInfo={borrowedAssetContext}
      />

      <ConfirmModal
        isOpen={!!deleteTargetAsset}
        onClose={() => setDeleteTargetAsset(null)}
        onConfirm={confirmDeleteAsset}
        title="Delete Asset"
        message={`Are you sure you want to delete ${deleteTargetAsset?.name || 'this asset'}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeletingAsset}
      />

      <ImageLightboxModal
        isOpen={lightboxImage.isOpen}
        onClose={() => setLightboxImage(prev => ({ ...prev, isOpen: false }))}
        src={lightboxImage.src}
        title={lightboxImage.title}
      />

      <AssetQRModal
        isOpen={!!selectedQRAsset}
        onClose={() => setSelectedQRAsset(null)}
        asset={selectedQRAsset}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        type="assets"
        onSuccess={onRefresh}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default AdminAssets;
